// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

contract MegaLeagueSimpleMock {
    address public rewardToken;

    uint256 public meagLeagueRewards;

    bool public megaleague = false;

    function setMegaLeagueRewards(address _playoffRewardToken, uint256 _restOfBalance) external {
        rewardToken = _playoffRewardToken;
        meagLeagueRewards = _restOfBalance;
    }

    function startMegaLeague() external {
        megaleague = true;
    }
}
