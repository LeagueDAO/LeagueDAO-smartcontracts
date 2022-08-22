# IGenesisERC721
**


## Table of contents:
- [Functions:](#functions)
  - [`cardImageToExistence(uint256 cardID) → bool exists` (external) ](#igenesiserc721-cardimagetoexistence-uint256-)
  - [`cardToCardImageID(uint256 tokenID) → uint256 cardID` (external) ](#igenesiserc721-cardtocardimageid-uint256-)
  - [`ownerOf(uint256 tokenID) → address owner` (external) ](#igenesiserc721-ownerof-uint256-)


## Functions <a name="functions"></a>

### `cardImageToExistence(uint256 cardID) → bool exists` (external) <a name="igenesiserc721-cardimagetoexistence-uint256-"></a>

**Dev doc**: Returns "true" if `cardID` exists, otherwise "false"

### `cardToCardImageID(uint256 tokenID) → uint256 cardID` (external) <a name="igenesiserc721-cardtocardimageid-uint256-"></a>

**Dev doc**: Returns `cardID` that corresponds to `tokenID`

### `ownerOf(uint256 tokenID) → address owner` (external) <a name="igenesiserc721-ownerof-uint256-"></a>

**Dev doc**: Returns `owner` of `tokenID` token.

Requirements:
- `tokenID` should exist.
