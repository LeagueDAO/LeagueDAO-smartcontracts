// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StrategyMock {
    address[] public underlyings;

    constructor() {}

    function deposit(address _token, uint256 _amount) external {}

    function depositInUnderlying(uint256 _poolId, uint256[] calldata _tokenBalances) external {}

    function setUnderlyings(address[] calldata _underlyings) external {}
}
