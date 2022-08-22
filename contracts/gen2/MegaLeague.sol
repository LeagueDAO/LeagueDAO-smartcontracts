// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "./abstracts/mega-league-parts/DivisionWinnerReader.sol";
import "./abstracts/fantasy-league-parts/CompetitionResultEnum.sol";
import "./abstracts/common-parts/RandomGenerator.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

/**
 * @title Mega League -- the final game stage in the end of a season.
 *
 * @notice Rewards are awarded ....
 *
 * This contract includes the following functionality:
 *  - .
 *
 * @dev Warning. This contract is not intended for inheritance. In case of inheritance, it is recommended to change the
 * access of all storage variables from public to private in order to avoid violating the integrity of the storage. In
 * addition, you will need to add functions for them to get values.
 */
contract MegaLeague is DivisionWinnerReader, RandomGenerator {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // _______________ Structs _______________

    struct MegaLeagueWinner {
        uint256 points;
        address winner;
    }

    // _______________ Constants _______________

    bytes32 public constant FINANCIAL_MANAGER_ROLE = keccak256("FINANCIAL_MANAGER_ROLE");

    // _______________ Storage _______________

    // ____ For the MegaLeague stage ____

    uint256 public megaLeagueWinnerNumber;

    // Season ID => array of Mega League winners
    mapping(uint256 => MegaLeagueWinner[]) public megaLeagueWinners;

    uint256 public megaLeagueNextPossibleWinnerIndex;

    bool public isFirstStageOfMegaLeagueFinding;

    uint256 public megaLeagueLastWinnerPoints;

    // Season ID => buffer of the last Mega League winners
    mapping(uint256 => MegaLeagueWinner[]) public megaLeagueLastWinnersBuffer;

    // ____ For the RewardsCalculation stage ____

    IERC20Upgradeable[] public rewardTokens;

    // Token => reward amount
    mapping(IERC20Upgradeable => bool) public isRewardToken;

    // Season ID => (token => reward amount)
    mapping(uint256 => mapping(IERC20Upgradeable => uint256)) public rewardTokenAmounts;

    // Season ID => (token => (user => rewards))
    mapping(uint256 => mapping(IERC20Upgradeable => mapping(address => uint256))) public megaLeagueWinnerRewards;

    // _______________ Events _______________
    event RewardTokenAdded(IERC20Upgradeable _token);

    event MegaLeagueWinnerNumberSet(uint256 _megaLeagueWinnerNumber);

    event UserMegaLeagueRewardsUpdated(
        address indexed _user,
        address indexed _token,
        uint256 _megaLeagueRewards,
        uint256 _userReward
    );

    event UserMegaLeagueRewardsWithdrawn(
        uint256 _season,
        uint256 indexed _userIndex,
        address indexed _userAddress,
        address indexed _token,
        uint256 _userReward
    );

    // _______________ Modifiers _______________

    // Check that the `_address` is not zero
    modifier nonzeroAddress(address _address) {
        require(_address != address(0), "Zero address");
        _;
    }

    // _______________ Initializer _______________

    function initialize(
        IERC20Upgradeable[] calldata _rewardTokens,
        address _financialManager,
        address _generator
    ) external initializer {
        init_SeasonSync_unchained(_msgSender());
        init_MegaLeagueProgress_unchained();
        init_RandomGenerator_unchained(_generator);

        rewardTokens = _rewardTokens;
        for (uint256 i = 0; i < _rewardTokens.length; ++i) {
            isRewardToken[_rewardTokens[i]] = true;
            emit RewardTokenAdded(_rewardTokens[i]);
        }

        _grantRole(FINANCIAL_MANAGER_ROLE, _financialManager);

        megaLeagueWinnerNumber = 10;
        emit MegaLeagueWinnerNumberSet(10);

        isFirstStageOfMegaLeagueFinding = true;
    }

    // _______________ External functions _______________

    function setMegaLeagueWinnerNumber(uint256 _megaLeagueWinnerNumber) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // Temporary requirement, since in the current form the algorithms do not assume another number
        require(_megaLeagueWinnerNumber == 10, "Number of winners should be equal to 10");

        megaLeagueWinnerNumber = _megaLeagueWinnerNumber;
        emit MegaLeagueWinnerNumberSet(_megaLeagueWinnerNumber);
    }

    /**
     * @dev Sets the random number generator contract.
     *
     * @param _generator An address of the random number generator.
     */
    function setRandGenerator(address _generator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        setRandomGenerator(_generator);
    }

    /**
     * @dev Updates the random number via Chainlink VRFv2.
     *
     * @notice Firstly, need to generate the random number on NomoRNG contract.
     */
    function updateRandNum() external onlyRole(DEFAULT_ADMIN_ROLE) {
        updateRandomNumber();
    }

    /**
     * @dev Finds Mega League winners. The finding process is paced.
     *
     * Requirements:
     * - The caller should be the administrator of the MegaLeague contract.
     * - The FantasyLeague should be at stage MegaLeague (`MegaLeagueStage.MegaLeague`).
     * - A limit of iterations should be greater than zero.
     *
     * @param _iterLimit   A number that allows you to split the function call into multiple transactions to avoid
     * reaching the gas cost limit. Each time the function is called, this number can be anything greater than zero.
     * When the process of finding the Mega League winners is completed, the FantasyLeague moves on to the next stage
     * (update the Mega League rewards -- `MegaLeagueStage.RewardsCalculation`). The sum of the iteration limits will
     * be approximately equal to twice the number of division winners.
     */
    // prettier-ignore
    function stepToFindMegaLeagueWinners(uint256 _iterLimit)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyMegaLeagueStage(MegaLeagueStage.MegaLeague)
    {
        require(_iterLimit != 0, "Iteration limit number should be greater than zero");

        /*
         * Description.
         *
         * This function finds Mega League winners among division winners.
         * The number of Mega League winners is equal to `megaLeagueWinnerNumber` (10 by default). There will be fewer
         * Mega League winners if there are fewer than `megaLeagueWinnerNumber` division winners.
         *
         * Because there can be many division winners, the cost of the transaction in gas can reach a limit. Because of
         * this, this function takes a number of iterations (`_iterLimit`) as input, which means that the function will
         * need to be called over and over again until the process of finding winners is complete. Completion means
         * that the FantasyLeague moves on to the next stage -- update of the Mega League rewards
         * (`MegaLeagueStage.RewardsCalculation`).
         *
         * NOTE. The user in this function means the winner of the division.
         */

        // During the current function call, users from `fromUserIndex` to `toUserIndex` will be processed
        uint256 fromUserIndex;
        uint256 toUserIndex;

        // There are storage pointers for the process
        uint256 season = seasonId;
        address[] storage refDivisionWinners = divisionWinners[season];
        mapping(address => DivisionWinnerStats) storage refDivisionWinnerStats = divisionWinnerStats[season];
        MegaLeagueWinner[] storage refMegaLeagueWinners = megaLeagueWinners[season];

        // Index of the last user in the array of division winners
        uint256 lastUserIndex = refDivisionWinners.length - 1;

        /*
         * By the end of the current transaction, this array will contain the current Mega League winners, which will
         * be written into the storage (`megaLeagueWinners` array).
         */
        MegaLeagueWinner[] memory curWinners;
        // Number of Mega League winners to find
        uint256 winnerNumber = megaLeagueWinnerNumber;

        uint256 i;
        address curUser;
        uint256 curUserPoints;

        /*
         * The first stage. It consists of finding the `megaLeagueWinnerNumber` users with the highest number of points
         * in the array of division winners.
         */
        if (isFirstStageOfMegaLeagueFinding) {
            fromUserIndex = megaLeagueNextPossibleWinnerIndex;
            toUserIndex = fromUserIndex + _iterLimit - 1;

            // Check that the first step is over and saving of the remaining number of iterations
            if (toUserIndex < lastUserIndex) {
                megaLeagueNextPossibleWinnerIndex = toUserIndex + 1;
            } else {
                if (toUserIndex != lastUserIndex)
                    toUserIndex = lastUserIndex;

                // Saving of the rest of iterations
                _iterLimit -= toUserIndex - lastUserIndex;

                megaLeagueNextPossibleWinnerIndex = 0;
                // Going to the next finding stage
                isFirstStageOfMegaLeagueFinding = false;
            }

            // Getting of the current array of winners
            /*
             * If the storage array of Mega League winners (`megaLeagueWinners`) contains few users
             * (< `megaLeagueWinnerNumber`).
             */
            if (fromUserIndex < winnerNumber) {
                curWinners = new MegaLeagueWinner[](winnerNumber);
                // Copying of the current winners
                for (i = 0; i < fromUserIndex; ++i) {
                    curWinners[i].points = refMegaLeagueWinners[i].points;
                    curWinners[i].winner = refMegaLeagueWinners[i].winner;
                }
            } else {
                curWinners = refMegaLeagueWinners;
            }

            // Finding of the winners and descending sort of them
            uint256 k;
            for (i = fromUserIndex; i <= toUserIndex; ++i) {
                curUser = refDivisionWinners[i];
                curUserPoints = refDivisionWinnerStats[curUser].totalPoints;

                for (uint256 j = 0; j < curWinners.length; ++j) {
                    // Shift of the current winners and writing a new one
                    if (curUserPoints > curWinners[j].points) {
                        for (k = curWinners.length - 1; k > j; --k) {
                            curWinners[k].points = curWinners[k - 1].points;
                            curWinners[k].winner = curWinners[k - 1].winner;
                        }
                        curWinners[j].winner = curUser;
                        curWinners[j].points = curUserPoints;
                        break;
                    }
                }
            }

            // Writing of current winners to the storage
            // For the first time
            if (fromUserIndex == 0)
                for (i = 0; i < curWinners.length; ++i)
                    refMegaLeagueWinners.push(curWinners[i]);
            else
                for (i = 0; i < curWinners.length; ++i)
                    if (refMegaLeagueWinners[i].winner != curWinners[i].winner) {
                        refMegaLeagueWinners[i].points = curWinners[i].points;
                        refMegaLeagueWinners[i].winner = curWinners[i].winner;
                    }
        }

        /*
         * The second stage -- completing the finding of Mega League winners.
         *
         * Once `winnerNumber` Mega League winners are found, there is a need to find among all the division winners
         * those with points equal to the last one, and then decide which one of them will really be
         * the `winnerNumber`th winner.
         *
         * If there are less than `winnerNumber` Mega League winners, then there are less than `winnerNumber` division
         * winners, then going straight to the stage of update of the Mega League rewards
         * (`MegaLeagueStage.RewardsCalculation`).
         */
        if (!isFirstStageOfMegaLeagueFinding && _iterLimit != 0) {
            if (lastUserIndex >= winnerNumber) {
                // For the first time
                if (megaLeagueNextPossibleWinnerIndex == 0) {
                    uint256 size = refMegaLeagueWinners.length;
                    // Saving of the last possible winner's points
                    megaLeagueLastWinnerPoints = refMegaLeagueWinners[size - 1].points;

                    // Removal from the current winners those who have points equal to those of the last winner
                    for (i = size; i > 0; --i)
                        if (refMegaLeagueWinners[i - 1].points == megaLeagueLastWinnerPoints)
                            refMegaLeagueWinners.pop();
                        else
                            break;
                }

                fromUserIndex = megaLeagueNextPossibleWinnerIndex;
                toUserIndex = fromUserIndex + _iterLimit - 1;
                // Check that the first step is over and saving of the remaining number of iterations
                if (toUserIndex < lastUserIndex) {
                    megaLeagueNextPossibleWinnerIndex = toUserIndex + 1;
                } else {
                    if (toUserIndex != lastUserIndex)
                        toUserIndex = lastUserIndex;
                    megaLeagueNextPossibleWinnerIndex = 0;
                    // Going to the next stage
                    moveMegaLeagueStageTo(MegaLeagueStage.RewardsCalculation);
                    isFirstStageOfMegaLeagueFinding = true;
                }

                // Finding of the last winners
                MegaLeagueWinner[] storage refLastWinnersBuffer = megaLeagueLastWinnersBuffer[season];
                for (i = fromUserIndex; i <= toUserIndex; ++i) {
                    curUser = refDivisionWinners[i];
                    curUserPoints = refDivisionWinnerStats[curUser].totalPoints;

                    if (curUserPoints == megaLeagueLastWinnerPoints)
                        refLastWinnersBuffer.push(MegaLeagueWinner(curUserPoints, curUser));
                }

                // Selection sort in descending order to identify the real last winners
                if (refLastWinnersBuffer.length > 1) {
                    uint256 max;
                    MegaLeagueWinner memory temp;
                    for (i = 0; i < refLastWinnersBuffer.length - 1; ++i) {
                        max = i;
                        for (uint256 j = i + 1; j < refLastWinnersBuffer.length; ++j)
                            if (isFirstWinner(season, refLastWinnersBuffer[j].winner, refLastWinnersBuffer[max].winner))
                                max = j;

                        if (max != i) {
                            // Swap
                            temp.winner = refLastWinnersBuffer[i].winner;
                            temp.points = refLastWinnersBuffer[i].points;
                            refLastWinnersBuffer[i].winner = refLastWinnersBuffer[max].winner;
                            refLastWinnersBuffer[i].points = refLastWinnersBuffer[max].points;
                            refLastWinnersBuffer[max].winner = temp.winner;
                            refLastWinnersBuffer[max].points = temp.points;
                        }
                    }
                }

                // For the last time. Adding of the real last Mega League winners to the current Mega League winners
                if (megaLeagueNextPossibleWinnerIndex == 0) {
                    uint256 missingNumber = winnerNumber - refMegaLeagueWinners.length;
                    for (i = 0; i < missingNumber; ++i)
                        refMegaLeagueWinners.push(refLastWinnersBuffer[i]);
                }
            } else {
                // Removal of empty users
                uint256 removalNumber = winnerNumber - (lastUserIndex+1);
                for (i = 0; i < removalNumber; ++i)
                    refMegaLeagueWinners.pop();

                // Go to the next stage
                moveMegaLeagueStageTo(MegaLeagueStage.RewardsCalculation);
                isFirstStageOfMegaLeagueFinding = true;
            }
        }
    }

    function setMegaLeagueRewards(IERC20Upgradeable _token, uint256 _rewardAmount)
        external
        onlyRole(FINANCIAL_MANAGER_ROLE)
    {
        require(isRewardToken[_token], "Unknown token");
        require(_rewardAmount > 0, "Zero reward amount");

        rewardTokenAmounts[seasonId][_token] = _rewardAmount;
        require(_token.balanceOf(address(this)) >= _rewardAmount, "The MegaLeague did not receive rewards");
    }

    // prettier-ignore
    function calculateMegaLeagueRewards()
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyMegaLeagueStage(MegaLeagueStage.RewardsCalculation)
    {
        // Calculation
        IERC20Upgradeable[] memory memRewardTokens = rewardTokens;
        uint256 season = seasonId;
        mapping(IERC20Upgradeable => mapping(address => uint256)) storage refMegaLeagueWinnerRewards =
            megaLeagueWinnerRewards[season];
        mapping(IERC20Upgradeable => uint256) storage refRewardTokenAmounts = rewardTokenAmounts[season];
        uint256 rewardAmount;

        MegaLeagueWinner[] storage refMegaLeagueWinners = megaLeagueWinners[season];
        // 35%, 20%, 10%, 5%, ..., 5%
        uint256[10] memory rewardPercentages = [uint256(35), 20, 10, 5, 5, 5, 5, 5, 5, 5];
        uint256 j;
        uint256 divider;
        uint256 userReward;
        for (uint256 i = 0; i < memRewardTokens.length; ++i) {
            mapping(address => uint256) storage refMegaLeagueWinnerTokenRewards =
                refMegaLeagueWinnerRewards[memRewardTokens[i]];
            rewardAmount = refRewardTokenAmounts[memRewardTokens[i]];

            /*
             * Here we calculate the divider. If we have all 10 Mega League winners, then the divider is 100
             * (just like 100%).
             * If we have less than 10 Mega League winners, then the divider is the sum of the first `winners.length`
             * percentages.
             */
            divider = 0;
            for (j = 0; j < refMegaLeagueWinners.length; ++j)
                divider += rewardPercentages[j];
            // Here we calculate the reward for each Mega League winner
            for (j = 0; j < refMegaLeagueWinners.length; ++j) {
                userReward = rewardAmount * rewardPercentages[j] / divider;
                refMegaLeagueWinnerTokenRewards[refMegaLeagueWinners[j].winner] += userReward;
                emit UserMegaLeagueRewardsUpdated(
                    refMegaLeagueWinners[j].winner,
                    address(memRewardTokens[i]),
                    rewardAmount,
                    userReward
                );
            }
        }

        moveMegaLeagueStageTo(MegaLeagueStage.RewardsWithdrawal);
    }

    /**
     * @notice Withdraw rewards for the MegaLeague winner.
     * @dev Msg.sender must be a winner. Where will be separate transfer for each reward token.
     * @param _userIndex Index of the winner in the MegaLeague winners array.
     * @param _season Season number from which user want to withdraw rewards.
     */
    function withdrawRewards(uint256 _userIndex, uint256 _season) external {
        validateMegaLeagueWinner(_season, _userIndex, _msgSender());
        IERC20Upgradeable token;
        uint256 userReward;
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            token = rewardTokens[i];
            userReward = megaLeagueWinnerRewards[_season][token][_msgSender()];
            require(userReward > 0, "User have no rewards in this season");
            require(token.balanceOf(address(this)) >= userReward, "The MegaLeague did not receive rewards");
            delete megaLeagueWinnerRewards[_season][token][_msgSender()];
            token.safeTransfer(msg.sender, userReward);
            emit UserMegaLeagueRewardsWithdrawn(_season, _userIndex, _msgSender(), address(token), userReward);
        }
    }

    /**
     * @notice Add reward token to the rewardTokens array.
     * @dev Only the default admin can add a reward token.
     * @param _token Token to add.
     */
    function addRewardToken(IERC20Upgradeable _token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!isRewardToken[_token], "The token is already in the list");
        rewardTokens.push(_token);
        isRewardToken[_token] = true;
        emit RewardTokenAdded(_token);
    }

    function getMegaLeagueWinners(uint256 _season) external view returns (MegaLeagueWinner[] memory) {
        return megaLeagueWinners[_season];
    }

    // _______________ Private functions _______________

    /*
     * @dev Returns the result of a comparison of users: a win for the first, a win for the second, a tie.
     *
     * @param _season Season ID.
     * @param _firstUser The first user in the comparison.
     * @param _secondUser The second user in the comparison.
     * @return   The result of the comparison of users.
     */
    // prettier-ignore
    function isFirstWinner(
        uint256 _season,
        address _firstUser,
        address _secondUser
    ) private view returns (bool) {
        require(_firstUser != _secondUser, "Comparing of the user to himself");
        require(isDivisionWinner(_season, _firstUser) && isDivisionWinner(_season, _secondUser), "Unknown user");

        mapping(address => DivisionWinnerStats) storage refDivisionWinnerStats = divisionWinnerStats[_season];
        DivisionWinnerStats storage firstDivisionWinnerStats = refDivisionWinnerStats[_firstUser];
        DivisionWinnerStats storage secondDivisionWinnerStats = refDivisionWinnerStats[_secondUser];

        if (firstDivisionWinnerStats.totalPoints > secondDivisionWinnerStats.totalPoints)
            return true;
        if (firstDivisionWinnerStats.totalPoints < secondDivisionWinnerStats.totalPoints)
            return false;

        if (firstDivisionWinnerStats.wins > secondDivisionWinnerStats.wins)
            return true;
        if (firstDivisionWinnerStats.wins < secondDivisionWinnerStats.wins)
            return false;

        if (firstDivisionWinnerStats.ties > secondDivisionWinnerStats.ties)
            return true;
        if (firstDivisionWinnerStats.ties < secondDivisionWinnerStats.ties)
            return false;

        if (randNumber % 2 == 0)
            return true;
        else
            return false;
    }

    /**
     * @dev Reverts if specified user is not a winner.
     * @param _season Season ID.
     * @param _userIndex Winner index in the megaLeagueWinners array.
     * @param _user User address to check.
     */
    function validateMegaLeagueWinner(
        uint256 _season,
        uint256 _userIndex,
        address _user
    ) public view {
        MegaLeagueWinner[] storage refMegaLeagueWinners = megaLeagueWinners[_season];
        require(refMegaLeagueWinners.length > _userIndex, "_userIndex out of range");
        require(refMegaLeagueWinners[_userIndex].winner == _user, "The user is not a winner");
    }

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[40] private gap;
}
