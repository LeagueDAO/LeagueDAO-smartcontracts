// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

contract FantasyLeagueSimpleMock {
    uint256 public week;

    constructor() {
        week = 1;
    }

    function getCurrentWeek() external view returns (uint256) {
        return week;
    }

    function setCurrentWeek(uint256 _week) external {
        week = _week;
    }

    function getNumberOfDivisions() external pure returns (uint256) {
        return 10;
    }
}
