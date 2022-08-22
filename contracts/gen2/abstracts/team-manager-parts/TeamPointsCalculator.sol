// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "./Staker.sol";
import "../../../gen1/interfaces/INomoCalculator.sol";

/**
 * @title
 */
abstract contract TeamPointsCalculator is Staker {
    // _______________ Storage _______________

    // The calculator of a player points
    INomoCalculator public calculator;

    // Timestamp when the current week (of the competitions on the Fantasy League contract) has started
    uint256 public currentGameStartTime;

    // _______________ Events _______________

    event CalculatorSet(address _calculator);

    event CurrentGameStartTimeSet(uint256 _timestamp);

    // _______________ Initializer _______________

    function init_TeamPointsCalculator_unchained(address _calculator) internal onlyInitializing {
        calculator = INomoCalculator(_calculator);
        emit CalculatorSet(_calculator);
    }

    // _______________ External functions _______________

    /**
     * @dev Sets the calculator of a player points.
     *
     * @param _calculator   A new calculator address.
     */
    function setCalculator(address _calculator) external onlyRole(DEFAULT_ADMIN_ROLE) nonzeroAddress(_calculator) {
        calculator = INomoCalculator(_calculator);
        emit CalculatorSet(_calculator);
    }

    /**
     * @dev Sets the timestamp when the current week (of the competitions on the Fantasy League contract) has started.
     *
     * @param _timestamp   A new timestamp.
     */
    function setCurrentGameStartTime(uint256 _timestamp) external onlyFantasyLeague {
        currentGameStartTime = _timestamp;
        emit CurrentGameStartTimeSet(_timestamp);
    }

    /**
     * @dev Calculates current scores of `_firstUser`'s team and `_secondUser`'s team.
     *
     * @param _firstUser   A first user address.
     * @param _secondUser   A second user address.
     * @return   Two numbers that represent the current scores of the first and second user teams.
     */
    function calcTeamScoreForTwoUsers(address _firstUser, address _secondUser)
        external
        view
        returns (uint256, uint256)
    {
        return (calculateUserTeamScore(_firstUser), calculateUserTeamScore(_secondUser));
    }

    // _______________ Public functions _______________

    /**
     * @dev Calculates a current score of the `_user`'s team.
     *
     * @param _user   A user address.
     * @return teamScore   Current score of the `_user`'s team.
     */
    function calculateUserTeamScore(address _user) public view returns (uint256 teamScore) {
        uint256[] storage team = stakedPlayers[seasonId][_user];

        // Calculation of total user's score taking into account the points of each player in a team
        teamScore = 0;
        for (uint256 i = 0; i < team.length; ++i) {
            teamScore += calculator.calculatePoints(team[i], currentGameStartTime);
        }
    }

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[48] private gap;
}
