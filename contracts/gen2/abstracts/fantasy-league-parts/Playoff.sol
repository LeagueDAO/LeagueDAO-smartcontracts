// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

// Here these contracts is connected to the Fantasy League contract (`FantasyLeague.sol`)
import "./H2HCompetition.sol";
import "../../interfaces/INomoRNG.sol";
import "../../interfaces/IFinancialManager.sol";
import "../mega-league-parts/DivisionWinnerStatsStruct.sol";

// List of errors for this contract
// Reverts when adding of sorted divisions with an incorrect total length to the array for the playoff
error InputLengthMismatch();
// Reverts when the financial manager has the zero address
error IncorrectFinancialManager();
// Reverts when calculation of the playoff rewards for zero division winners
error DivisionWinnersNumberIsZero();
/*
 * Reverts when getting a slice of division winners' addresses or stats with the "from" index that is greater than the
 * "to" index.
 */
error StartIndexIsGreaterThanEndIndex();
/*
 * Reverts when getting a slice of division winners' addresses or stats with the "to" index that is greater than the
 * number of division winners.
 */
error EndIndexIsOutOfDivisionWinnersNumber();
// Reverts when adding of a sorted division with an incorrect length to the array for the playoff
error ArraysLengthMismatch();
// Reverts when adding of a sorted division with other addresses to the array for the playoff
error IncorrectAddressDivisionId();
// Reverts when adding of a sorted division with incorrect sort to the array for the playoff
error IncorrectSorting();
// Reverts when comparing of the user to himself
error UserSelfcomparing(address _address);
// Reverts when check of a sort of a division with an incorrect length
error ArrayLengthIsNotDivisionSize();

/**
 * @title Playoff -- the contract that responsible for playoff competitions and rewards for it (see the description of
 * the `FantasyLeague` contract for details).
 *
 * @dev This contract includes the following functionality:
 *  - Has the back end functions for adding sorted divisions to save top 4 users in each division for playoff
 *    competitions.
 *  - Processes playoff competitions to determine division winners, as well as stores the season and weekly user
 *    statistics (team points and number of wins and losses).
 *  - Sets the financial manager contract (`financialManager`) that transfers rewards for the division winners to the
 *    `FantasyLeague` contract and returns the reward token and value for an update of rewards.
 *  - Updates the rewards for division winners, as well as stores these rewards and accumulates them.
 *  - Returns division winners and their stats (it is used for the Mega League).
 *  - Compares users by seasonal statistics (firstly, it is used for playoff competitions).
 */
abstract contract Playoff is H2HCompetition {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // _______________ Constants _______________

    // Number of competitors from one division who compete in the playoffs
    uint8 public constant PLAYOFF_COMPETITOR_NUM = 4;

    // How many weeks of playoff competitions
    uint8 public constant PLAYOFF_COMPETITION_WEEK_NUM = 2;

    // _______________ Storage _______________

    IFinancialManager public financialManager;

    /*
     * The array of users participating in the playoff competitions.
     *
     * NOTE. The principle of filling in:
     *  1. The top 4 users from each division will be saved here using the function of adding of sorted playoff
     *     divisions (`addSortedPlayoffDivisions()`). The divisions are written in order (same as in the `users` array).
     *  2. During the playoff competitions (`competePlayoffs()`) in the 16th week the first and third places in the
     *     array will be the winners of the first playoff division, the fifth and seventh -- the winners of the second
     *     playoff division and so on.
     *
     * Season ID => playoff competitors array.
     */
    mapping(uint256 => address[]) public playoffCompetitors;

    /*
     * Stores the playoff division winners (after the playoff competitions (`competePlayoffs()`) in the 17th week).
     *
     * NOTE. `divisionsWinners`.length == `getNumberOfDivisions()`.
     *
     * Season ID => array of division winners.
     */
    mapping(uint256 => address[]) public divisionsWinners;

    // _______________ Events _______________

    /**
     * @dev Emitted when the interface address of the financial manager contract (`financialManager`) is changed to an
     * address `_financialManager`.
     *
     * @param _financialManager The address which is set by the current interface address of the financial manager
     * contract.
     */
    event FinancialManagerSet(address _financialManager);

    /**
     * @dev Emitted when top 4 users is selected from a division (`_divisionId`) and added to the playoff competitors
     * array (`playoffCompetitors`) in a season (`_seasonId`).
     *
     * @param _seasonId The season in which the users from the division is selected.
     * @param _divisionId ID of the division from which the users are selected..
     */
    event CompetitorsSelectedFromDivision(uint256 indexed _seasonId, uint256 indexed _divisionId);

    /**
     * @dev Emitted when rewards is calculated for a division winner (`_winner`). `_accumulatedRewards` is his total
     * reward amount in the playoff reward token (stored in the `financialManager` contract).
     *
     * @param _winner The division winner for whom reward amount is calculated.
     * @param _accumulatedRewards The total reward amount that the user (`_winner`) can withdraw at the moment.
     */
    event DivisionWinnerRewardsCalculated(address indexed _winner, uint256 _accumulatedRewards);

    // _______________ Initializer _______________

    /*
     * NOTE. The function init_{ContractName}_unchained found in every upgradeble contract is the initializer function
     * without the calls to parent initializers, and can be used to avoid the double initialization problem.
     */
    function init_Playoff_unchained() internal onlyInitializing {}

    // _______________ Extrenal functions  _______________

    /**
     * @dev Checks that the divisions is correctly sorted and saves the top `PLAYOFF_COMPETITOR_NUM` users for playoff
     * competitions.
     *
     * @param _sortedDivisions An array of divisions, each sorted in descending order. Sorting is done based on user's
     * seasonal statistics (`UserSeasonStats` struct). The length of this array should be a multiple of the division
     * size.
     *
     * @notice This function is made to avoid sorting arrays in the blockchain. The back end sorts them independently
     * and sends them sorted, while the blockchain only performs a sorting check and selects the top 4 users from the
     * division.
     */
    // prettier-ignore
    function addSortedPlayoffDivisions(address[] calldata _sortedDivisions) external {
        if (!(_sortedDivisions.length >= DIVISION_SIZE && _sortedDivisions.length % DIVISION_SIZE == 0))
            revert InputLengthMismatch();

        for (uint256 i = 0; i < _sortedDivisions.length; i += DIVISION_SIZE)
            addSortedPlayoffDivision(_sortedDivisions[i : i + DIVISION_SIZE]);
    }

    /**
     * @notice It is for playoff competitions (see the description of the `FantasyLeague` contract for details).
     *
     * @dev Processes competitions of the 16th and 17th weeks between users for some divisions (`_numberOfDivisions`).
     *
     * This process includes the following:
     *  - Check that the process is over, i.e. all divisions have been processed this week (see the description of the
     *    `_numberOfDivisions` parameter for details).
     *  - Calculation of the user's points (of his team of `Gen2PlayerToken` players) via the team manager contract
     *    (`teamManager`).
     *  - Competitions between users within divisions, where the winners are determined by the user's points and season
     *    stats. The competitions are on a schedule, obtained vie the scheduler contract (`Scheduler`).
     *  - Writing of user's statistics in the storage.
     *
     * Requirements:
     *  - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
     *  - The game stage should be the playoff competitions' stage (`GameStage.PlayoffCompetitions`).
     *  - The number of divisions should not be equal to zero.
     *  - The scheduler and team manager contracts (`scheduler`, `teamManager`) should be set.
     *
     * @notice There are determined the 2 playoff candidates for each division in the 16th week and the division winner
     * in the 17th week.
     *
     * @param _numberOfDivisions A number of divisions to process. It allows you to split the function call into
     * multiple transactions to avoid reaching the gas cost limit. Each time the function is called, this number can be
     * anything greater than zero. When the process of playoff competing is completed, the `FantasyLeague` moves on to
     * the next stage -- `GameStage.PlayoffRewards`.
     *
     * @notice Warning. This algorithm assumes that the playoffs take place in weeks 16 and 17, with 4 users competing
     * in week 16 and 2 winners in week 17. The algorithm is not designed for other values.
     */
    function competePlayoffs(uint256 _numberOfDivisions)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyGameStage(GameStage.PlayoffCompetitions)
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

            // Movement to the next stage when this week's playoff competitions are over
            if (weekTracker.current() == 16) {
                moveGameStageTo(GameStage.WaitingNextGame);
            } else {
                // week == 17
                moveGameStageTo(GameStage.PlayoffRewards);
            }
        }

        // Below are variables for a loop of playoff competitions
        // Array of playoff competitors of the specified season
        address[] storage refPlayoffCompetitors = playoffCompetitors[seasonId.current()];

        // Number of competitors this week
        uint256 competitorNumber;
        /*
         * Schedule for playoff competitions for the sixteenth week of the Fantasy League.
         * The elements of this array are read in pairs (indexes zero and one correspond to the first pair, and so on).
         */
        uint8[PLAYOFF_COMPETITOR_NUM] memory playoffSchedule;

        // Warning. The algorithm is not designed for other values.
        if (weekTracker.current() == 16) {
            competitorNumber = PLAYOFF_COMPETITOR_NUM;
        } else {
            // week == 17
            competitorNumber = PLAYOFF_COMPETITOR_NUM / 2;
        }
        playoffSchedule = scheduler.getPlayoffWeekSchedule(weekTracker.current());

        // Number by which the offset occurs to determine a user index in the array of all playodd competitors
        uint256 offsetInArray;
        // Index of the first user (competitor) in a pair in the current division
        uint256 competitor;

        // A pair of users (competitors)
        address firstUser;
        address secondUser;
        // Total score of users (competitors)
        uint256 firstUserScore;
        uint256 secondUserScore;

        // Total score (points) of competitors in all divisions that is calculated in this batch
        uint256 totalPoints;

        // Start from the first division that will be calculated in this batch
        // prettier-ignore
        for (uint256 division = fromDivision; division <= toDivision; ++division) {
            /*
             * In 16th week, there are 4 users in each division, each competing against one other. In 17th week there
             * are 2 users remaining in each division, who compete. This determines the winner of the division.
             */
            offsetInArray = division * PLAYOFF_COMPETITOR_NUM;
            for (competitor = 0; competitor < competitorNumber; competitor += 2) {
                // Get addresses of the first and second users (competitors)
                firstUser = refPlayoffCompetitors[playoffSchedule[competitor] + offsetInArray];
                secondUser = refPlayoffCompetitors[playoffSchedule[competitor + 1] + offsetInArray];

                // Competing
                (firstUserScore, secondUserScore) = teamManager.calcTeamScoreForTwoUsers(firstUser, secondUser);
                CompetitionResult result = getH2HCompetitionResult(firstUserScore, secondUserScore);
                updateUserStats(firstUser, secondUser, result);
                emit H2HCompetitionResult(firstUser, secondUser, result, weekTracker.current());

                /*
                 * For the playoff. Determines winners if there is a tie. And rewrites the winner before the loser in
                 * a division in the `refPlayoffCompetitors` array.
                 */
                if (weekTracker.current() == 16)
                {
                    /*
                     * ! Hardcoded for playoffSchedule == [0, 3,  1, 2].
                     * NOTE. If the second won or played a tie, but randomly won, then swap the first with the second
                     * so that the winner is on top (hardcoded for playoffSchedule == [0, 2,  0, 0] in week 17).
                     */
                    if (result == CompetitionResult.SecondUserWon) {
                        refPlayoffCompetitors[playoffSchedule[competitor] + offsetInArray] = secondUser;
                        refPlayoffCompetitors[playoffSchedule[competitor + 1] + offsetInArray] = firstUser;
                    }

                    if (result == CompetitionResult.Tie) {
                        // Searching for a winner on previous merits
                        result = compareUsers(seasonId.current(), firstUser, secondUser);
                        if (
                            result == CompetitionResult.SecondUserWon ||
                                (
                                    result == CompetitionResult.Tie &&
                                    randNumber % 2 == 1
                                )
                        ) {
                            refPlayoffCompetitors[playoffSchedule[competitor] + offsetInArray] = secondUser;
                            refPlayoffCompetitors[playoffSchedule[competitor + 1] + offsetInArray] = firstUser;
                        }
                    }
                } else {
                    // week == 17
                    if (result == CompetitionResult.FirstUserWon)
                        divisionsWinners[seasonId.current()].push(firstUser);
                    else if (result == CompetitionResult.SecondUserWon)
                        divisionsWinners[seasonId.current()].push(secondUser);
                    else {
                        // result == CompetitionResult.Tie
                        // Searching for a winner on previous merits
                        result = compareUsers(seasonId.current(), firstUser, secondUser);
                        if (
                            result == CompetitionResult.FirstUserWon ||
                                (
                                    result == CompetitionResult.Tie &&
                                    randNumber  % 2 == 0
                                )
                        ) {
                            divisionsWinners[seasonId.current()].push(firstUser);
                        } else {
                            divisionsWinners[seasonId.current()].push(secondUser);
                        }
                    }
                }

                // Saving of user week score
                userWeeklyStats[firstUser][seasonId.current()][weekTracker.current()].points = firstUserScore;
                userWeeklyStats[secondUser][seasonId.current()][weekTracker.current()].points = secondUserScore;

                // Saving of user total points (for the Mega League stage in the future)
                userSeasonStats[firstUser][seasonId.current()].totalPoints += firstUserScore;
                userSeasonStats[secondUser][seasonId.current()].totalPoints += secondUserScore;

                totalPoints += firstUserScore + secondUserScore;
            }
        }
        gamesStats[seasonId.current()][weekTracker.current()].totalPoints += totalPoints;
    }

    /**
     * @dev Sets an address of the financial manager contract.
     *
     * Requirements:
     *  - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
     *  - A financial manager address (`financialManager`) should not equal to the zero address.
     *
     * @param _financialManager An address of the financial manager contract (`financialManager`).
     */
    function setFinancialManager(address _financialManager)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonzeroAddress(_financialManager)
    {
        financialManager = IFinancialManager(_financialManager);
        emit FinancialManagerSet(_financialManager);
    }

    /**
     * @dev Calculates rewards for division winners in the reward token for the playoff which is stored in the
     * `financialManager` contract.
     *
     * Requirements:
     *  - The game stage should be equal to the stage of playoff rewards (`GameStage.PlayoffRewards`).
     *  - The number of division winner (`_numberOfDivisionWinners`) should not be equal to zero.
     *  - An address of the financial manager contract (`financialManager`) should not be equal to the zero address.
     *
     * @param _numberOfDivisionWinners A number of division winner to process. It allows you to split the function call
     * into multiple transactions to avoid reaching the gas cost limit. Each time the function is called, this number
     * can be anything greater than zero. When the process of calculating is completed, the `FantasyLeague` moves on to
     * the next stage --`GameStage.WaitingNextGame`.
     *
     * @notice The `financialManager` contract should transfer rewards for the division winners to the `FantasyLeague`
     * contract.
     */
    function calculatePlayoffRewards(uint256 _numberOfDivisionWinners)
        external
        onlyGameStage(GameStage.PlayoffRewards)
    {
        if (address(financialManager) == address(0)) revert IncorrectFinancialManager();
        if (_numberOfDivisionWinners == 0) revert DivisionWinnersNumberIsZero();

        uint256 season = seasonId.current();
        address[] storage refDivisionsWinners = divisionsWinners[season];

        // Index of the first division winner for whom the rewards will be calculated in this batch
        uint256 fromWinner = nextUserWithUpdRews;
        // Index of the last division winner for whom the rewards will be calculated in this batch
        uint256 toWinner = nextUserWithUpdRews + _numberOfDivisionWinners - 1;
        /*
         * Check that the process is over, i.e. all division winners have been processed this week. And corrected a
         * number of division winners to process if an overflow.
         */
        uint256 lastWinner = refDivisionsWinners.length - 1;
        if (toWinner < lastWinner) {
            nextUserWithUpdRews = toWinner + 1;
        } else {
            if (toWinner != lastWinner) {
                toWinner = lastWinner;
            }
            nextUserWithUpdRews = 0;
            moveGameStageTo(GameStage.WaitingNextGame);
        }

        // Calculation
        // Variables for loop
        (address tokenAddr, uint256 rewardValue) = financialManager.getPlayoffRewardTokenNValue();
        IERC20Upgradeable token = IERC20Upgradeable(tokenAddr);
        address winner;
        uint256 week = weekTracker.current();
        for (uint256 i = fromWinner; i <= toWinner; ++i) {
            winner = refDivisionsWinners[i];

            // Saving of the reward value to winner statistics
            userWeeklyStats[winner][season][week].rewards[token] = rewardValue;

            mapping(IERC20Upgradeable => uint256) storage refWinnerAccumulatedRewards = accumulatedRewards[winner];
            refWinnerAccumulatedRewards[token] += rewardValue;
            emit DivisionWinnerRewardsCalculated(winner, refWinnerAccumulatedRewards[token]);
        }
    }

    // ____ Getters for the `MegaLeague` contract ____

    /**
     * @dev Returns the slice of the division winners' array (`divisionsWinners`) from the index `_from` to the index
     * `_to` in a season (`season`).
     *
     * @param _season The season ID.
     * @param _from The first index of the slice.
     * @param _to The second index of the slice.
     * @return divisionWinners   A slice of the array of division winners' array (`divisionsWinners`).
     *
     * @notice Up to and including the `_to` index.
     */
    function getSomeDivisionWinners(
        uint256 _season,
        uint256 _from,
        uint256 _to
    ) external view returns (address[] memory divisionWinners) {
        if (_from > _to) revert StartIndexIsGreaterThanEndIndex();
        address[] storage refDivisionsWinners = divisionsWinners[_season];

        if (_to >= refDivisionsWinners.length) revert EndIndexIsOutOfDivisionWinnersNumber();

        divisionWinners = new address[](_to - _from + 1);
        for (uint256 i = _from; i <= _to; ++i) {
            divisionWinners[i] = refDivisionsWinners[i];
        }
        return divisionWinners;
    }

    /**
     * @dev Returns stats of the division winners from the index `_from` to the index `_to` in a season (`season`).
     *
     * @param _season The season ID.
     * @param _from The first index of the slice.
     * @param _to The second index of the slice.
     * @return divisionWinnersStats   Stats of the division winners from the `divisionsWinners` array.
     *
     * @notice Up to and including the `_to` index.
     */
    function getSomeDivisionWinnersStats(
        uint256 _season,
        uint256 _from,
        uint256 _to
    ) external view returns (DivisionWinnerStats[] memory divisionWinnersStats) {
        if (_from > _to) revert StartIndexIsGreaterThanEndIndex();
        address[] storage refDivisionsWinners = divisionsWinners[_season];
        if (_to >= refDivisionsWinners.length) revert EndIndexIsOutOfDivisionWinnersNumber();

        UserSeasonStats memory memUserSeasonStats;
        divisionWinnersStats = new DivisionWinnerStats[](_to - _from + 1);
        for (uint256 i = _from; i <= _to; ++i) {
            memUserSeasonStats = userSeasonStats[refDivisionsWinners[i]][_season];
            divisionWinnersStats[i] = DivisionWinnerStats(
                memUserSeasonStats.totalPoints,
                memUserSeasonStats.wins,
                memUserSeasonStats.ties
            );
        }
        return divisionWinnersStats;
    }

    // _______________ Public functions _______________

    /**
     * @dev Checks that the division is correctly sorted and saves the top `PLAYOFF_COMPETITOR_NUM` users for playoff
     * competitions.
     *
     * @param _sortedDivision An array of users, which is a division sorted in descending order. Sorting is done based
     * on the user's seasonal statistics (`UserSeasonStats` structs).
     */
    // prettier-ignore
    function addSortedPlayoffDivision(address[] memory _sortedDivision)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyGameStage(GameStage.PlayoffCompetitorsSelection)
    {
        if (_sortedDivision.length != DIVISION_SIZE) revert ArraysLengthMismatch();
        /*
         * ID of the division from which the top `PLAYOFF_COMPETITOR_NUM` users will be saved (added to
         * `playoffCompetitors`) during the current transaction, if the `_sortedDivision` array is correctly sorted.
         */
        uint256 currentSortedDivisionId = nextProcessedDivisionId;

        if (nextProcessedDivisionId < getNumberOfDivisions() - 1) {
            nextProcessedDivisionId = currentSortedDivisionId + 1;
        } else {
            nextProcessedDivisionId = 0;
            moveGameStageTo(GameStage.PlayoffCompetitions);
        }

        // Check that the provided `_sortedUsers` array contains the same addresses as the division
        uint256 season = seasonId.current();
        if (!isSameDivisionAddresses(season, currentSortedDivisionId, _sortedDivision))
            revert IncorrectAddressDivisionId();

        // Check that the array is correctly sorted and randomly shuffle users who have a tie
        uint256 i;
        CompetitionResult result;
        address temp;
        for (i = 0; i < DIVISION_SIZE - 1; ++i) {
            result = compareUsers(season, _sortedDivision[i], _sortedDivision[i + 1]);

            if (result == CompetitionResult.SecondUserWon) revert IncorrectSorting();

            // Randomly determine whether to swap users, in case of a tie
            if (
                result == CompetitionResult.Tie &&
                randNumber % 2 == 1
            ) {
                temp = _sortedDivision[i];
                _sortedDivision[i] = _sortedDivision[i + 1];
                _sortedDivision[i + 1] = temp;
            }
        }

        // Writing of playoff competitors to the storage
        address[] storage refPlayoffCompetitors = playoffCompetitors[season];
        for (i = 0; i < PLAYOFF_COMPETITOR_NUM; ++i)
            refPlayoffCompetitors.push(_sortedDivision[i]);

        emit CompetitorsSelectedFromDivision(season, currentSortedDivisionId);
    }

    /**
     * @dev Returns the result of a comparison of users: a win for the first, a win for the second, a tie.
     *
     * @param _season Season ID.
     * @param _firstUser The first user in the comparison.
     * @param _secondUser The second user in the comparison.
     * @return   The result of the comparison of users.
     */
    // prettier-ignore
    function compareUsers(
        uint256 _season,
        address _firstUser,
        address _secondUser
    ) public view returns (CompetitionResult) {
        if (_firstUser == _secondUser) revert UserSelfcomparing(_firstUser);
        if (!(isUser[_season][_firstUser] && isUser[_season][_secondUser])) revert UnknownUser();

        UserSeasonStats storage firstUserSeasonStats = userSeasonStats[_firstUser][_season];
        UserSeasonStats storage secondUserSeasonStats = userSeasonStats[_secondUser][_season];

        if (firstUserSeasonStats.totalPoints > secondUserSeasonStats.totalPoints)
            return CompetitionResult.FirstUserWon;
        if (firstUserSeasonStats.totalPoints < secondUserSeasonStats.totalPoints)
            return CompetitionResult.SecondUserWon;

        if (firstUserSeasonStats.wins > secondUserSeasonStats.wins)
            return CompetitionResult.FirstUserWon;
        if (firstUserSeasonStats.wins < secondUserSeasonStats.wins)
            return CompetitionResult.SecondUserWon;

        if (firstUserSeasonStats.ties > secondUserSeasonStats.ties)
            return CompetitionResult.FirstUserWon;
        if (firstUserSeasonStats.ties < secondUserSeasonStats.ties)
            return CompetitionResult.SecondUserWon;

        return CompetitionResult.Tie;
    }

    // _______________ Internal functions _______________

    /**
     * @dev Check that the array contains the same addresses as the division.
     *
     * @param _season Season ID.
     * @param _divisionId Division number.
     * @param _arr Array with which the division is compared.
     * @return   True, if the array contains the same addresses as the division, false otherwise.
     */
    function isSameDivisionAddresses(
        uint256 _season,
        uint256 _divisionId,
        address[] memory _arr
    ) internal view returns (bool) {
        if (_arr.length != DIVISION_SIZE) revert ArrayLengthIsNotDivisionSize();

        // Array of users of the specified season
        address[] storage refUsers = users[_season];
        uint256 offsetInArray = _divisionId * DIVISION_SIZE;

        uint256 i;
        address current;
        bool isFound;
        uint256 j;
        for (i = 0; i < DIVISION_SIZE; ++i) {
            current = refUsers[i + offsetInArray];
            isFound = false;
            for (j = 0; j < _arr.length; ++j) {
                if (current == _arr[j]) {
                    isFound = true;
                    break;
                }
            }
            if (!isFound) return false;
        }
        return true;
    }

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new variables without shifting
     * down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps.
     */
    uint256[47] private gap;
}
