// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

// Here these contracts is connected to the Fantasy League contract (`FantasyLeague.sol`)
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "./UsersNDivisions.sol";
import "../../interfaces/IScheduler.sol";
import "./CompetitionResultEnum.sol";

// List of errors for this contract
// Reverts when adding of a reward token that has already been added
error TokenAlreadyInTheList();
error NotARewardToken();
// Reverts when head to head competing of zero divisions
error DivisionNumberIsZero();
// Reverts when setting of a total week reward by the Multisig in the incorrect game stage
error OnlyH2HStage();
// Reverts when setting of a total week reward by the Multisig for a token that has not been added
error UnknownRewardToken();
// Reverts when update of rewards for zero users
error NumberOfUsersIsZero();

/**
 * @title Head to head competition -- the contract that responsible for weekly competitions and rewards for it (see the
 * description of the `FantasyLeague` contract for details).
 *
 * @dev This contract includes the following functionality:
 *  - Has the `MULTISIG_ROLE` role for the Multisig that sets total week rewards for head to head competitions.
 *  - Adds reward tokens for head to head and playoff competitions.
 *  - Sets the scheduler contract (`Scheduler`) that determines the schedule for head to head and playoff competitions.
 *  - Processes head to head competitions, as well as stores the season and weekly user statistics (team points and
 *    number of wins, losses, ties).
 *  - Stores total week rewards that is set by the Multisig.
 *  - Caclulates the rate of reward per point. (Points are calculated when head to head competing).
 *  - Updates the rewards for users in all the reward tokens according to the calculated rate, as well as stores these
 *    rewards and accumulates them for each user.
 *  - Allows accumulated rewards to be withdrawn by users at any time.
 *  - Gives:
 *   - the number of the current competition week;
 *   - the list of reward tokens;
 *   - a rate of reward per point;
 *   - total week rewards;
 *   - users' week rewards.
 */
abstract contract H2HCompetition is UsersNDivisions {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // _______________ Constants _______________

    // ____ For access ____

    // The role for the Multisig that sets total week rewards for head to head competitions
    bytes32 public constant MULTISIG_ROLE = keccak256("MULTISIG_ROLE");

    // ____ For competitions ____

    // Number of weeks of H2H competitions
    uint8 public constant H2H_COMPETITION_WEEK_NUM = 15;

    // _______________ Structs _______________

    // ____ Structs for storing of H2H results, user stats and rewards ____

    // These structures are primarily used for historical data. Such data is used by several contracts and the back end

    // For the aggregation of competition week data
    struct WeekData {
        /*
         * The total points of all users' teams for the week used to calculate the rewards. The winners' points are
         * doubled to increase the rewards compared to the losers, in case of a tie the points are doubled for both.
         */
        uint256 totalPoints;
        /*
         * Number of rewards' tokens that transferred to the `FantasyLeague` contract for this week by Multisig via the
         * `FinancialManager` contract.
         * Reward token => reward value.
         */
        mapping(IERC20Upgradeable => uint256) totalRewards;
        /*
         * The reward rate -- this week's rewards-to-points ratio for each reward token. This is used to calculate user
         * rewards (distributing total rewards to users according to team points).
         * Reward token => rewards-to-points ratio.
         */
        mapping(IERC20Upgradeable => uint256) rewardPerPoint;
    }

    // For the aggregation of the user season statistics for all competitions
    struct UserSeasonStats {
        uint32 wins;
        uint32 losses;
        uint32 ties;
        /*
         * The total team points of a user for all competitions.
         * NOTE. This is used to determine the top 4 users in the division for the playoff competitions and the top 10
         * players in the final stage, the Mega League.
         */
        uint256 totalPoints;
    }

    // For the aggregation of the user weekly statistics for all competitions
    struct UserWeekStats {
        /*
         * Team points ot a user for a week.
         * NOTE. If the user wins or draws, the points are doubled to increase the number of rewards.
         */
        uint256 points;
        /*
         * Number of user rewards in each reward token. Calculated every week after the competition.
         * Reward token => reward value.
         */
        mapping(IERC20Upgradeable => uint256) rewards;
        /*
         * A flag is true if a user wins or draws.
         * NOTE. It is used to determine user's true points for the week, as they are doubled to increase rewards if
         * a user wins or draws.
         */
        bool isWinner;
    }

    // _______________ Storage _______________

    // ____ Variables for calculation of H2H competition ____

    // The contract that returns competition week schedule for the H2H and playoff competitions
    IScheduler public scheduler;

    /*
     * Next division ID to process. It is basically an division pointer to continue the different processes from where
     * it stopped in the last transaction.
     */
    uint256 public nextProcessedDivisionId;

    // Next user ID for whom rewards will be updated
    uint256 public nextUserWithUpdRews;

    /*
     * The current week of competitions.
     * NOTE. It is also used to store data on a weekly basis in mappings.
     */
    CountersUpgradeable.Counter internal weekTracker;

    // ____ Variables for writing history results of H2H competition ____

    /*
     * Stores competition data for weeks.
     * Week => season ID => competition week data.
     */
    mapping(uint256 => mapping(uint256 => WeekData)) public gamesStats;

    /*
     * Stores users' season statistics.
     * User => season ID => user season stats.
     */
    mapping(address => mapping(uint256 => UserSeasonStats)) public userSeasonStats;

    /*
     * Stores users' week statistics.
     * User => season ID => user week stats.
     */
    mapping(address => mapping(uint256 => mapping(uint256 => UserWeekStats))) public userWeeklyStats;

    // ____ Interfaces of external reward token contracts ____

    // The list of reward tokens that is used to reward users for weekly and playoff competitions
    IERC20Upgradeable[] public rewardTokens;

    // Token => is reward token
    mapping(IERC20Upgradeable => bool) public isRewardToken;

    // ____ For withdrawal of rewards by a user ____

    /*
     * Stores total rewards for each user in each reward token in all the time.
     * User => reward token => reward value.
     */
    mapping(address => mapping(IERC20Upgradeable => uint256)) public accumulatedRewards;

    // _______________ Events _______________

    /**
     * @dev Emitted when the interface address of the scheduler contract (`scheduler`) is changed to an address
     * `_scheduler`.
     *
     * @param _scheduler The address which is set by the current interface address of the scheduler contract.
     */
    event SchedulerSet(address _scheduler);

    /**
     * @dev Emitted when a reward token address (`_token`) is added to the array of reward tokens (`rewardTokens`).
     *
     * @param _token The address which is added to the array of reward tokens.
     */
    event RewardTokenAdded(IERC20Upgradeable _token);
    event RewardTokenRemoved(IERC20Upgradeable _token);

    /**
     * @dev Emitted when a `_firstUser` user competed against the `_secondUser` user in weekly or playoff competitions
     * in week `_week` with the `_competitionResult` result.
     *
     * @param _firstUser The address of the first user who competed.
     * @param _secondUser The address of the second user who competed.
     * @param _competitionResult The result of the competition: win, lose or tie.
     * @param _week The week number when competing.
     */
    event H2HCompetitionResult(
        address indexed _firstUser,
        address indexed _secondUser,
        CompetitionResult indexed _competitionResult,
        uint256 _week
    );

    /**
     * @dev Emitted when a total week reward in the amount of `_amount` is set by the Multisig (`MULTISIG_ROLE`) for
     * a reward token with an address `_token` in week `_week` in season `_season`.
     *
     * @param _season The season number.
     * @param _week The week number.
     * @param _token The address for which is added a total week reward amount.
     * @param _amount A total week reward amount that is set by the Multisig.
     */
    event TotalWeekRewardSet(uint256 _season, uint256 _week, address _token, uint256 _amount);

    /**
     * @dev Emitted when this week's rewards-to-points ratio (`_rewardPerPoint`) is calculated for a reward token
     * (`_rewardERC20`).
     *
     * @param _rewardERC20 A reward token from the `rewardTokens` array.
     * @param _rewardPerPoint A ratio of total rewards to total users' points for this week.
     */
    event RewardPerPointCalcutated(address _rewardERC20, uint256 _rewardPerPoint);

    /**
     * @dev Emitted when rewards (`_weekRewards`) for a user (`_user`) is updated with the rewards-to-points ratio in
     * the mapping of user week stats (`userWeeklyStats`) for a reward token (`_token`), and the rewards are added to
     * the user's accumulated rewards in the mapping (`accumulatedRewards`).
     *
     * @param _user A user for whom the rewards are calculated.
     * @param _token A reward token from the `rewardTokens` array.
     * @param _weekRewards A value of rewards that is added to user's accumulated rewards.
     * @param _accumulatedRewards A current value of user's accumulated rewards in the mapping (`accumulatedRewards`).
     */
    event UserRewardsUpdated(
        address indexed _user,
        address indexed _token,
        uint256 _weekRewards,
        uint256 _accumulatedRewards
    );

    /**
     * @dev Emitted when a user (`_user`) withdraws rewards in the amount of `_amount` for a reward token (`_token`).
     * @notice Rewards can be withdrawn at any time.
     *
     * @param _user A user who withdraws.
     * @param _token A reward token from the `rewardTokens` array.
     * @param _amount Amount of a reward token (`_token`).
     */
    event RewardWithdrawn(address indexed _user, IERC20Upgradeable indexed _token, uint256 _amount);

    // _______________ Initializer _______________

    /*
     * Sets the scheduler interface (`scheduler`) to a `_scheduler` address, grants the multisig role (`MULTISIG_ROLE`)
     * to a `_multisig` address, adds an array of reward tokens (`_rewardTokens`) to the `rewardTokens` array.
     *
     * NOTE. The function init_{ContractName}_unchained found in every upgradeble contract is the initializer function
     * without the calls to parent initializers, and can be used to avoid the double initialization problem.
     */
    function init_H2HCompetition_unchained(
        address _scheduler,
        address _multisig,
        IERC20Upgradeable[] calldata _rewardTokens
    ) internal onlyInitializing {
        scheduler = IScheduler(_scheduler);
        emit SchedulerSet(_scheduler);

        _grantRole(MULTISIG_ROLE, _multisig);

        rewardTokens = _rewardTokens;
        for (uint256 i = 0; i < _rewardTokens.length; ++i) {
            isRewardToken[_rewardTokens[i]] = true;
            emit RewardTokenAdded(_rewardTokens[i]);
        }
    }

    // _______________ External functions _______________

    // ____ Management of reward tokens ____

    /**
     * @dev Adds a reward token (`_token`) to the `rewardTokens` array.
     *
     * Requirements:
     *  - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
     *  - A reward token (`_token`) already have been added.
     *
     * @param _token A token which is added.
     */
    function addRewardToken(IERC20Upgradeable _token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (isRewardToken[_token]) revert TokenAlreadyInTheList();
        rewardTokens.push(_token);
        isRewardToken[_token] = true;
        emit RewardTokenAdded(_token);
    }

    function removeRewardToken(IERC20Upgradeable _token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!isRewardToken[_token]) revert NotARewardToken();
        uint256 length = rewardTokens.length;
        uint256 removeIndex = 0;
        for (uint256 i = 0; i < length; i++) {
            if (rewardTokens[i] == _token) {
                removeIndex = i;
            }
        }
        rewardTokens[removeIndex] = rewardTokens[length - 1];
        rewardTokens.pop();
        isRewardToken[_token] = false;
        emit RewardTokenRemoved(_token);
    }

    // ____ For H2H competitions ____

    /**
     * @dev Sets an address of the scheduler contract.
     *
     * Requirements:
     *  - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
     *  - A scheduler address (`_scheduler`) should not equal to the zero address.
     *
     * @param _scheduler A new address of the scheduler contract (`scheduler`).
     */
    function setScheduler(address _scheduler) external onlyRole(DEFAULT_ADMIN_ROLE) nonzeroAddress(_scheduler) {
        scheduler = IScheduler(_scheduler);
        emit SchedulerSet(_scheduler);
    }

    /**
     * @notice It is for weekly competitions (see the description of the `FantasyLeague` contract for details).
     *
     * @dev Processes this week's competitions between users for some divisions (`_numberOfDivisions`).
     *
     * This process includes the following:
     *  - Check that the process is over, i.e. all divisions have been processed this week (see the description of the
     *    `_numberOfDivisions` parameter for details).
     *  - Calculation of the user's points (of his team of `Gen2PlayerToken` players) via the team manager contract
     *    (`teamManager`).
     *  - Competitions between users within divisions, where the winners are determined by the user's points. The
     *    competitions are on a schedule, obtained vie the scheduler contract (`Scheduler`).
     *  - Writing of user's statistics in the storage. Including points to calculate user's share of the reward pool.
     *
     * Requirements:
     *  - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
     *  - The game stage should be the H2H competitions' stage (`GameStage.H2HCompetitions`).
     *  - The number of divisions should not be equal to zero.
     *  - The scheduler and team manager contracts (`scheduler`, `teamManager`) should be set.
     *
     * @param _numberOfDivisions A number of divisions to process. It allows you to split the function call into
     * multiple transactions to avoid reaching the gas cost limit. Each time the function is called, this number can be
     * anything greater than zero. When the process of playoff competing is completed, the `FantasyLeague` moves on to
     * the next stage -- `GameStage.H2HRewardPerPointCalculation`.
     */
    function competeH2Hs(uint256 _numberOfDivisions)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyGameStage(GameStage.H2HCompetitions)
    {
        if (_numberOfDivisions == 0) revert DivisionNumberIsZero();

        // The first division that will be calculated in this batch
        uint256 fromDivision = nextProcessedDivisionId;
        // The last division that will be calculated in this batch
        uint256 toDivision = nextProcessedDivisionId + _numberOfDivisions - 1;
        /*
         * Check that the process is over, i.e. all divisions have been processed this week. And corrected a number of
         * divisions to process if an overflow.
         */
        uint256 lastDivision = getNumberOfDivisions() - 1;
        if (toDivision < lastDivision) {
            nextProcessedDivisionId = toDivision + 1;
        } else {
            if (toDivision != lastDivision) {
                toDivision = lastDivision;
            }
            nextProcessedDivisionId = 0;
            // Movement to the next stage when this week's competitions are over
            moveGameStageTo(GameStage.H2HRewardPerPointCalculation);
        }

        // Below are variables for a loop of competitions
        // Array of users of the specified season
        uint256 season = seasonId.current();
        address[] storage refUsers = users[season];

        uint256 week = weekTracker.current();
        // The elements of this array are read in pairs (indexes zero and one correspond to the first pair, and so on)
        uint8[DIVISION_SIZE] memory wSchedule = scheduler.getH2HWeekSchedule(week);

        // Number by which the offset occurs to determine a user index in the array of all users (`refUsers`)
        uint256 offsetInArray;
        // Index of the first user (competitor) in a pair in the current division
        uint256 competitor;
        // A pair of users (competitors)
        address firstUser;
        address secondUser;
        // Total score (points) of users (competitors)
        uint256 firstUserScore;
        uint256 secondUserScore;

        // Total score (points) of competitors in all divisions that is calculated in this batch
        uint256 totalPoints;

        // Start from the first division that will be calculated in this batch
        // prettier-ignore
        for (uint256 division = fromDivision; division <= toDivision; ++division) {
            /*
             * In each division, each user competes against one another. That is, one division has 6 competitions,
             * because it consists of 12 users. 
             */
            offsetInArray = division * DIVISION_SIZE;
            for (competitor = 0; competitor < DIVISION_SIZE; competitor += 2) {
                // Get addresses of the first and second users (competitors)
                firstUser = refUsers[wSchedule[competitor] + offsetInArray];
                secondUser = refUsers[wSchedule[competitor + 1] + offsetInArray];

                // Competing
                (firstUserScore, secondUserScore) = teamManager.calcTeamScoreForTwoUsers(firstUser, secondUser);
                CompetitionResult result = getH2HCompetitionResult(firstUserScore, secondUserScore);
                updateUserStats(firstUser, secondUser, result);
                emit H2HCompetitionResult(firstUser, secondUser, result, weekTracker.current());

                // Saving of user total points (for the Playoff and Mega League stages in the future)
                userSeasonStats[firstUser][season].totalPoints += firstUserScore;
                userSeasonStats[secondUser][season].totalPoints += secondUserScore;

                // Increasing of winner's score to increase his rewards. Tie means both are winners
                if (result == CompetitionResult.FirstUserWon) {
                    firstUserScore *= 2;
                } else if (result == CompetitionResult.SecondUserWon) {
                    secondUserScore *= 2;
                } else {
                    // Tie
                    firstUserScore *= 2;
                    secondUserScore *= 2;
                }
                // Saving of user week score for reward calculation
                userWeeklyStats[firstUser][season][week].points = firstUserScore;
                userWeeklyStats[secondUser][season][week].points = secondUserScore;

                totalPoints += firstUserScore + secondUserScore;
            }
        }
        // Need to calculate the rewards-to-points ratio
        gamesStats[season][week].totalPoints += totalPoints;
    }

    // ____ For receiving of rewards ____

    /**
     * @dev Adds total rewards for the current week by the Miltisig. These rewards will be distributed between all
     * users according to the rewards-to-points ratio that is calculated in the `calculateRewardPerPoint()` function.
     *
     * Requirements:
     *  - The caller should have the multisig role (`MULTISIG_ROLE`).
     *  - The game stage should be equal to the H2H competitions' stage (`GameStage.H2HCompetitions`) or the stage of
     *    the calculation of the rewards-to-points ratio (`GameStage.H2HRewardPerPointCalculation`).
     *  - The reward token (`_token`) should have been added.
     *
     * @param _token A token for which rewards are added.
     * @param _amount Reward amount.
     */
    function setTotalWeekReward(IERC20Upgradeable _token, uint256 _amount) external onlyRole(MULTISIG_ROLE) {
        GameStage gs = getGameStage();

        if (!(gs == GameStage.H2HCompetitions || gs == GameStage.H2HRewardPerPointCalculation)) revert OnlyH2HStage();
        if (!isRewardToken[_token]) revert UnknownRewardToken();

        // Setting
        uint256 season = seasonId.current();
        uint256 week = weekTracker.current();
        gamesStats[season][week].totalRewards[_token] = _amount;
        emit TotalWeekRewardSet(season, week, address(_token), _amount);

        _token.safeTransferFrom(_msgSender(), address(this), _amount);
    }

    // ____ For weekly calculation of rewards ____

    /**
     * @dev Calculates the rewards-to-points ratio which is used to calculate shares of user rewards in the reward
     * update function (`updateRewardsForUsers()`).
     *
     * Requirements:
     *  - The game stage should be equal to the stage of the calculation of the rewards-to-points ratio
     *    (`GameStage.H2HRewardPerPointCalculation`).
     *
     * @notice When the process of calculating is completed, the `FantasyLeague` moves on to the next stage --
     * `GameStage.H2HRewardsUpdate`.
     */
    function calculateRewardPerPoint() external onlyGameStage(GameStage.H2HRewardPerPointCalculation) {
        IERC20Upgradeable token;
        uint256 rewardPerPoint;
        WeekData storage weekData = gamesStats[seasonId.current()][weekTracker.current()];
        for (uint256 i = 0; i < rewardTokens.length; ++i) {
            token = rewardTokens[i];
            if (weekData.totalPoints != 0) {
                rewardPerPoint = weekData.totalRewards[token] / weekData.totalPoints;
                weekData.rewardPerPoint[token] = rewardPerPoint;
            } else {
                weekData.rewardPerPoint[token] = 0;
            }

            emit RewardPerPointCalcutated(address(token), rewardPerPoint);
        }

        moveGameStageTo(GameStage.H2HRewardsUpdate);
    }

    /**
     * @dev Updates rewards for users in each reward token from the `rewardTokens` array.
     *
     * Requirements:
     *  - The game stage should be equal to the stage of reward update (`GameStage.H2HRewardsUpdate`).
     *  - The number of users (`_numberOfUsers`) should not be equal to zero.
     *
     * @param _numberOfUsers A number of users to process. It allows you to split the function call into multiple
     * transactions to avoid reaching the gas cost limit. Each time the function is called, this number can be anything
     * greater than zero. When the process of updating is completed, the `FantasyLeague` moves on to the next stage --
     * `GameStage.WaitingNextGame`.
     */
    function updateRewardsForUsers(uint256 _numberOfUsers) external onlyGameStage(GameStage.H2HRewardsUpdate) {
        if (_numberOfUsers == 0) revert NumberOfUsersIsZero();

        // Index of the first user that will be updated in this batch
        uint256 fromUser = nextUserWithUpdRews;
        // Index of the last user that will be updated in this batch
        uint256 toUser = nextUserWithUpdRews + _numberOfUsers - 1;
        /*
         * Check that the process is over, i.e. all users have been processed this week. And corrected a number of
         * users to process if an overflow.
         */
        uint256 lastUser = getNumberOfUsers() - 1;
        if (toUser < lastUser) {
            nextUserWithUpdRews = toUser + 1;
        } else {
            if (toUser != lastUser) {
                toUser = lastUser;
            }
            nextUserWithUpdRews = 0;
            moveGameStageTo(GameStage.WaitingNextGame);
        }

        address[] storage refUsers = users[seasonId.current()];
        for (uint256 i = fromUser; i <= toUser; ++i) {
            updateRewardsForUser(refUsers[i]);
        }
    }

    // ____ For withdrawal of rewards ____

    /**
     * @dev Transfers all caller's rewards to the caller in each reward token from the `rewardTokens` array.
     *
     * Requirements:
     *  - The game stage should be equal to the stage of reward update (`GameStage.H2HRewardsUpdate`).
     *  - The number of users (`_numberOfUsers`) should not be equal to zero.
     *
     * @notice This function can be called by a user at any time.
     */
    function withdrawRewards() external {
        // Check that the caller is an added user
        uint256 season = seasonId.current();
        uint256 i;
        bool isAddedUser = false;
        for (i = 0; i <= season; ++i) {
            if (isUser[i][_msgSender()]) {
                isAddedUser = true;
            }
        }
        if (!isAddedUser) revert UnknownUser();

        // Transfers
        IERC20Upgradeable token;
        uint256 amount;
        mapping(IERC20Upgradeable => uint256) storage refSenderAccumulatedRewards = accumulatedRewards[_msgSender()];
        for (i = 0; i < rewardTokens.length; ++i) {
            token = rewardTokens[i];

            amount = refSenderAccumulatedRewards[token];
            delete refSenderAccumulatedRewards[token];
            token.safeTransfer(_msgSender(), amount);

            emit RewardWithdrawn(_msgSender(), token, amount);
        }
    }

    //  ____ Extra view functionality for back end ____

    /**
     * @dev Returns the current week of a season (`seasonId.current()`).
     *
     * @return   The current week.
     */
    function getCurrentWeek() external view returns (uint256) {
        return weekTracker.current();
    }

    /**
     * @dev Returns total rewards of a token (`_token`) of a week (`_week`) in a season (`_season`).
     *
     * @param _season ID of the season in which a week is required.
     * @param _week The week in which rewards were set by the Multisig (`MULTISIG_ROLE`).
     * @param _token A token for which a value is returned.
     * @return   The total week rewards of the token.
     */
    function getTotalWeekRewards(
        uint256 _season,
        uint256 _week,
        IERC20Upgradeable _token
    ) external view returns (uint256) {
        return gamesStats[_season][_week].totalRewards[_token];
    }

    /**
     * @dev Returns the rewards-to-points ratio for a token (`_token`) of a week (`_week`) in a season (`_season`).
     *
     * @param _season ID of the season in which a week is required.
     * @param _week The week in which the ration were calculated.
     * @param _token A token for which a value is returned.
     * @return   The rewards-to-points ratio of the token.
     */
    function getRewardPerPoint(
        uint256 _season,
        uint256 _week,
        IERC20Upgradeable _token
    ) external view returns (uint256) {
        return gamesStats[_season][_week].rewardPerPoint[_token];
    }

    /**
     * @dev Returns rewards of a user (`_user`) for a week (`_week`) in a season (`_season`).
     *
     * @param _user A user whose rewards are to be read.
     * @param _season ID of the season in which a week is required.
     * @param _week The week in which rewards were updated for the user.
     * @param _token A token for which a value is returned.
     * @return   The user's week rewards of the token.
     */
    function getUserWeekReward(
        address _user,
        uint256 _season,
        uint256 _week,
        IERC20Upgradeable _token
    ) external view returns (uint256) {
        return userWeeklyStats[_user][_season][_week].rewards[_token];
    }

    /**
     * @dev Returns the current array of reward tokens (`rewardTokens`).
     *
     * @return   The array of reward tokens.
     */
    function getRewardTokens() external view returns (IERC20Upgradeable[] memory) {
        return rewardTokens;
    }

    // _______________ Internal functions _______________

    // ____ For H2H competitions ____

    /*
     * Returns the result of a competition between 2 users based on their points (`_firstUserScore`,
     * `_secondUserScore`).
     */
    // prettier-ignore
    function getH2HCompetitionResult(uint256 _firstUserScore, uint256 _secondUserScore)
        internal
        pure
        returns (CompetitionResult)
    {
        if (_firstUserScore > _secondUserScore)
            return CompetitionResult.FirstUserWon;
        if (_firstUserScore < _secondUserScore)
            return CompetitionResult.SecondUserWon;
        // A tie means both are winners
        return CompetitionResult.Tie;
    }

    /*
     * Writes season and week stats (wins, losses, ties) of 2 users (`_firstUser`, `_secondUser`) based on their
     * competition result (`_result`) to the storage.
     */
    function updateUserStats(
        address _firstUser,
        address _secondUser,
        CompetitionResult _result
    ) internal {
        uint256 season = seasonId.current();
        uint256 week = weekTracker.current();
        if (_result == CompetitionResult.FirstUserWon) {
            userSeasonStats[_firstUser][season].wins += 1;
            userWeeklyStats[_firstUser][season][week].isWinner = true;

            userSeasonStats[_secondUser][season].losses += 1;
            userWeeklyStats[_secondUser][season][week].isWinner = false;
        } else if (_result == CompetitionResult.SecondUserWon) {
            userSeasonStats[_firstUser][season].losses += 1;
            userWeeklyStats[_firstUser][season][week].isWinner = false;

            userSeasonStats[_secondUser][season].wins += 1;
            userWeeklyStats[_secondUser][season][week].isWinner = true;
        } else {
            // Tie
            userSeasonStats[_firstUser][season].ties += 1;
            userWeeklyStats[_firstUser][season][week].isWinner = true;

            userSeasonStats[_secondUser][season].ties += 1;
            userWeeklyStats[_secondUser][season][week].isWinner = true;
        }
    }

    // ____ For weekly calculation of rewards ____

    // Updates rewards for a specified user (`_user`) in each reward token from the `rewardTokens` array
    function updateRewardsForUser(address _user) internal {
        IERC20Upgradeable token;

        uint256 season = seasonId.current();
        uint256 week = weekTracker.current();
        UserWeekStats storage refUserWeekStats = userWeeklyStats[_user][season][week];

        uint256 rewardPerPoint;
        WeekData storage weekData = gamesStats[season][week];
        uint256 userPoints;
        uint256 weekRewards;

        mapping(IERC20Upgradeable => uint256) storage refUserAccumulatedRewards = accumulatedRewards[_user];
        for (uint256 i = 0; i < rewardTokens.length; ++i) {
            token = rewardTokens[i];

            rewardPerPoint = weekData.rewardPerPoint[token];
            userPoints = refUserWeekStats.points;
            weekRewards = rewardPerPoint * userPoints;
            refUserWeekStats.rewards[token] = weekRewards;

            refUserAccumulatedRewards[token] += weekRewards;
            emit UserRewardsUpdated(_user, address(token), weekRewards, refUserAccumulatedRewards[token]);
        }
    }

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new variables without shifting
     * down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps.
     */
    uint256[40] private gap;
}
