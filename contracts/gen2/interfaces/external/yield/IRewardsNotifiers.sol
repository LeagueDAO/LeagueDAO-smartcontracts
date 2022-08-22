// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

// Interface of Reward Notifier for QuickSwap staking rewards pools. Neccesary for a proper strategy testing.
interface IRewardsNotifiers {
    function update(
        address stakingToken,
        uint256 rewardAmount,
        uint256 rewardsDuration
    ) external;

    function notifyRewardAmounts() external;

    function notifyRewardAmount(address stakingToken) external;
}
