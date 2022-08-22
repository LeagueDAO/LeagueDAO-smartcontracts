// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

interface IStrategy {
    function depositInUnderlying(uint256 _pid, uint256[] calldata _amounts) external;

    function withdrawInOneUnderlying(
        uint256 _pid,
        uint256 _wantAmt,
        address _underlying
    ) external;

    function userPoolAmountInUsd(uint256 _pid, address _user) external view returns (uint256[] memory);

    function userPoolAmount(uint256 _pid, address _user) external view returns (uint256);

    function yieldBalance(uint256 _pid, address _user) external view returns (uint256);
}
