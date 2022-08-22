// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

interface INomoCalculator {
    function calculatePoints(uint256 _tokenId, uint256 _gameStartTime) external view returns (uint256 points);
}
