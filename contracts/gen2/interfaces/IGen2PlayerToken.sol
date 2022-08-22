// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

interface IGen2PlayerToken is IERC721Upgradeable {
    function nftIdToDivisionId(uint256) external view returns (uint256);

    function nftIdToImageId(uint256) external view returns (uint256);

    function nftIdToSeasonId(uint256) external view returns (uint256);

    function getTokenPosition(uint256 _tokenId) external view returns (uint256 position);

    function updateSeasonId() external;
}
