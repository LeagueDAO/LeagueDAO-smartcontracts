// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

contract Gen2PointsCalculatorMock {
    // _______________ Storage _______________

    mapping(uint256 => uint256) public tokenPoints;

    // _______________ Constructor _______________

    constructor() {}

    // _______________ External functions _______________

    function setPoints(uint256 _tokenID, uint256 _points) external {
        tokenPoints[_tokenID] = _points;
    }

    // Calculate points by token ID
    function calculatePoints(uint256 _tokenID, uint256 _gameStartTime) external view returns (uint256) {
        return tokenPoints[_tokenID];
    }
}
