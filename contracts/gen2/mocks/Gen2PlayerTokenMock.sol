// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract Gen2PlayerTokenMock is ERC721PresetMinterPauserAutoId {
    // _______________ Storage _______________

    mapping(uint256 => uint256) public tokenPositions;

    // Token ID => division ID
    mapping(uint256 => uint256) public nftIdToDivisionId;

    mapping(uint256 => uint256) public nftIdToSeasonId;

    uint256 season = 0;

    // _______________ Constructor _______________

    constructor() ERC721PresetMinterPauserAutoId("Gen2PlayerTokenMock", "G2PTM", "") {}

    // _______________ External functions _______________

    function setTokenPosition(uint256 _tokenId, uint256 _position) external {
        tokenPositions[_tokenId] = _position;
    }

    // Returns Gen2 player token's position code
    function getTokenPosition(uint256 _tokenId) external view returns (uint256) {
        return tokenPositions[_tokenId];
    }

    function setNftIdToDivisionId(uint256 _tokenId, uint256 _divisionId) external {
        nftIdToDivisionId[_tokenId] = _divisionId;
    }

    function nftIdToImageId(uint256 _tokenId) external view returns (uint256) {
        return _tokenId;
    }

    function updateSeasonId() external {
        season++;
    }
}
