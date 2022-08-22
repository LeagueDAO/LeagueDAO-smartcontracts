// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

interface ITeamManager {
    function setCurrentGameStartTime(uint256 _timestamp) external;

    function setUserDivisionId(address _user, uint256 _divisionId) external;

    function calcTeamScoreForTwoUsers(address _firstUser, address _secondUser) external view returns (uint256, uint256);

    function updateSeasonId() external;
}
