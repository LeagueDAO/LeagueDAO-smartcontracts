// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

/**
 * @title Nomo NFT mock
 * @dev Mocks cardImageToExistence function of INomoNFT interface.
 */
contract NomoNFTMock {
    // cardImage => existence
    mapping(uint256 => bool) public cardImageToExistence;

    /**
     * @dev Sets cardImageToExistence.
     * @param _cardImageId Card image id.
     * @param _existence Existence of card image.
     */
    function setCardImageToExistence(uint256 _cardImageId, bool _existence) public {
        cardImageToExistence[_cardImageId] = _existence;
    }
}
