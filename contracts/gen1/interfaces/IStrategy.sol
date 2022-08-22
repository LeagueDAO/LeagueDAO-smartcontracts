// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

interface IStrategy {
    function deposit() external;

    function withdraw(uint256 _wantAmt) external;

    function emergencyWithdraw(uint256 _amount) external;

    function harvest() external;

    function getReward() external;

    function wantToken() external view returns (address);

    function totalWantDeposited() external view returns (uint256);
}
