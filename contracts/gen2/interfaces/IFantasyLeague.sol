// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "../abstracts/mega-league-parts/DivisionWinnerStatsStruct.sol";

interface IFantasyLeague {
    function getSeasonId() external view returns (uint256);

    function addUser(address _user) external;

    function getNumberOfDivisions() external view returns (uint256);

    function getCurrentWeek() external view returns (uint256);

    /**
     * @notice How many users in the game registered
     *
     * @return Amount of the users
     */
    function getNumberOfUsers() external view returns (uint256);

    /**
     * @dev How many users in one division.
     * @return   Number.
     */
    function DIVISION_SIZE() external view returns (uint256);

    function getSomeDivisionWinners(
        uint256 _season,
        uint256 _from,
        uint256 _to
    ) external view returns (address[] memory divisionWinners);

    function getSomeDivisionWinnersStats(
        uint256 _season,
        uint256 _from,
        uint256 _to
    ) external view returns (DivisionWinnerStats[] memory divisionWinnersStats);
}
