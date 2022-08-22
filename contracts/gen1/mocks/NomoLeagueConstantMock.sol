// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

contract NomoLeagueConstantMock {
    uint256 public GAME_DURATION;

    uint256 public STAKING_DURATION;

    function setGAME_DURATION(uint256 value) external {
        GAME_DURATION = value;
    }

    function setSTAKING_DURATION(uint256 value) external {
        STAKING_DURATION = value;
    }
}
