// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

interface INomoRNG {
    function requestRandomNumber() external returns (uint256 _random);
}
