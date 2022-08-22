// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../abstracts/common-parts/SeasonSyncNonupgradeable.sol";

contract Gen2PlayerTokenMock2 is ERC721, SeasonSyncNonupgradeable {
    using Counters for Counters.Counter;

    // _______________ Storage _______________

    mapping(uint256 => uint256) public tokenPositions;

    // Token ID => division ID
    mapping(uint256 => uint256) public nftIdToDivisionId;

    mapping(uint256 => uint256) public nftIdToSeasonId;

    mapping(uint256 => bool) public cardImageToExistence;

    Counters.Counter private _tokenIdTracker;

    // _______________ Constructor _______________

    constructor() ERC721("LeagueDAO: Nomo Gen2 Player Token", "Gen2") SeasonSyncNonupgradeable(_msgSender()) {}

    // _______________ External functions _______________
    function mint(address to) public {
        // We cannot just use balanceOf to create the new tokenId because tokens
        // can be burned (destroyed), so we need a separate counter.
        _tokenIdTracker.increment();
        _mint(to, _tokenIdTracker.current());
        cardImageToExistence[_tokenIdTracker.current()] = true;
    }

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

    // _______________ Public functions _______________

    /// @dev Method is overwritten to resolve inheritance conflict
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return ERC721.supportsInterface(interfaceId) || AccessControl.supportsInterface(interfaceId);
    }
}
