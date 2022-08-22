// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "../interfaces/IMintableToken.sol";

contract MockStrategy {
    IMintableToken public wantToken;

    uint256 public rewardPercent;

    constructor(IMintableToken wantToken_, uint256 rewardPercent_) {
        wantToken = wantToken_;
        rewardPercent = rewardPercent_;
    }

    function deposit() external {}

    function withdraw(uint256 _wantAmt) external {
        wantToken.mint(msg.sender, _wantAmt);
    }

    function getReward() external {
        wantToken.mint(msg.sender, (totalWantDeposited() * rewardPercent) / 100);
    }

    function totalWantDeposited() public view returns (uint256) {
        return wantToken.balanceOf(address(this));
    }
}
