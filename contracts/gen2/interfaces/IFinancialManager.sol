// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

interface IFinancialManager {
    function getPlayoffRewardTokenNValue() external view returns (address token, uint256 amount);
}
