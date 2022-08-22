// contracts/Cards.sol
// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Stores athletes NFT’s data on blockchain
/// @notice This contract is the NFT's cards for NOMO fantasy sport.
/// @dev Each token ID refers to the one card image
contract LeagueTokenMock is ERC20 {
    constructor(address _receiver) ERC20("LeagueDAO Governance Token", "LEAG") {
        // 10mln tokens
        uint256 initialMint = 1_000_000_000 ether;
        _mint(_receiver, initialMint);
    }
}
