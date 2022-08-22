// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract TransferNFTS is Ownable {
    IERC721 nft;

    constructor(IERC721 _nft) {
        nft = _nft;
    }

    function setNFTAddress(IERC721 _nft) external onlyOwner {
        nft = _nft;
    }

    function transferNFTs(uint256[] calldata _ids, address _to) external {
        for (uint256 i = 0; i < _ids.length; i++) {
            nft.transferFrom(msg.sender, _to, _ids[i]);
        }
    }

    function transferNFTsRange(
        uint256 _fromId,
        uint256 _toId,
        address _to
    ) external {
        for (uint256 i = _fromId; i < _toId; i++) {
            nft.transferFrom(msg.sender, _to, i);
        }
    }
}
