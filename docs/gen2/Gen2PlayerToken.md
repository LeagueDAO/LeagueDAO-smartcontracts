# Gen2PlayerToken
*Gen2PlayerToken athletes contract.*

**Dev doc**: One division, 1 Gen2PlayerToken derived from genesis NFT image.

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`constructor()` (public) ](#gen2playertoken-constructor--)
  - [`setPositionMintDisabling(uint256 _position, bool _isDisabled)` (external) ](#gen2playertoken-setpositionmintdisabling-uint256-bool-)
  - [`mint(uint256 _playerImageId, uint256 _divisionId, address _user) → uint256 _tokenId` (external) ](#gen2playertoken-mint-uint256-uint256-address-)
  - [`burn(uint256 _tokenId)` (external) ](#gen2playertoken-burn-uint256-)
  - [`setGenesisNFT(contract INomoNFT _contract)` (external) ](#gen2playertoken-setgenesisnft-contract-inomonft-)
  - [`setTransferAllowListAddr(address _addr, bool _state)` (public) ](#gen2playertoken-settransferallowlistaddr-address-bool-)
  - [`getTokenPosition(uint256 _tokenId) → uint256 position` (external) ](#gen2playertoken-gettokenposition-uint256-)
  - [`supportsInterface(bytes4 interfaceId) → bool` (public) ](#gen2playertoken-supportsinterface-bytes4-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract INomoNFT nomoNFT`
- `mapping(uint256 => uint256[]) imageIdToAllNftIds`
- `mapping(uint256 => mapping(uint256 => uint256)) nftIndexInImageToAllNftIdsPlusOne`
- `mapping(uint256 => uint256) nftIdToDivisionId`
- `mapping(uint256 => uint256) nftIdToImageId`
- `mapping(uint256 => uint256) nftIdToSeasonId`
- `mapping(uint256 => mapping(uint256 => mapping(uint256 => bool))) isImageInDivision`
- `mapping(uint256 => string[]) nftIdToData`
- `mapping(address => bool) transferAllowlist`
- `mapping(uint256 => bool) isDisabledPosition`
- `bytes32 MINTER_ROLE`

## Functions <a name="functions"></a>

### `constructor()` (public) <a name="gen2playertoken-constructor--"></a>

*Description*: Contract constructor

### `setPositionMintDisabling(uint256 _position, bool _isDisabled)` (external) <a name="gen2playertoken-setpositionmintdisabling-uint256-bool-"></a>

*Description*: Disables a `_position`, means it is not possible to mint players with such a position.



#### Params
 - `_position`: A position code. See NomoNFT.sol to get better understanding of position codes.

### `mint(uint256 _playerImageId, uint256 _divisionId, address _user) → uint256 _tokenId` (external) <a name="gen2playertoken-mint-uint256-uint256-address-"></a>

*Description*: Mints gen 2 player token


#### Params
 - `_playerImageId`: Id of player image

 - `_divisionId`: Id of division to which NFT belongs to

 - `_user`: Address to which NFT will be minted to

#### Returns
 - _tokenId uint256 Id of minted NFT

### `burn(uint256 _tokenId)` (external) <a name="gen2playertoken-burn-uint256-"></a>

*Description*: Whitelisted addresses allowed to burn tokens


#### Params
 - `_tokenId`: Id of token to burn

### `setGenesisNFT(contract INomoNFT _contract)` (external) <a name="gen2playertoken-setgenesisnft-contract-inomonft-"></a>

*Description*: Sets genesis nft contract address


#### Params
 - `_contract`: Genesis NFT contract

### `setTransferAllowListAddr(address _addr, bool _state)` (public) <a name="gen2playertoken-settransferallowlistaddr-address-bool-"></a>

*Description*: Sets address permission to recive and send tokens


#### Params
 - `_addr`: Address

 - `_state`: True - address is allowed to transfer and recive token, false - not allowed

### `getTokenPosition(uint256 _tokenId) → uint256 position` (external) <a name="gen2playertoken-gettokenposition-uint256-"></a>

*Description*: Returns Gen2 player token's position code

**Dev doc**: Position code taken from the nomoNFT contract


#### Params
 - `_tokenId`: Gen2PlayerToken id which position you need to know

#### Returns
 - position Integer position code (look NomoNFT to get better understanding of position codes and
CardImages)

### `supportsInterface(bytes4 interfaceId) → bool` (public) <a name="gen2playertoken-supportsinterface-bytes4-"></a>

**Dev doc**: Method is overwritten to resolve inheritance conflict

### `_beforeTokenTransfer(address from, address to, uint256 tokenId)` (internal) <a name="gen2playertoken-_beforetokentransfer-address-address-uint256-"></a>

## Events <a name="events"></a>
### event `PositionMintDisablingSet(uint256 _position, bool _isDisabled)` <a name="gen2playertoken-positionmintdisablingset-uint256-bool-"></a>


### event `GenesisNFTisSet(address _contract)` <a name="gen2playertoken-genesisnftisset-address-"></a>


### event `FantasyLeagueisSet(address _contract)` <a name="gen2playertoken-fantasyleagueisset-address-"></a>


### event `Gen2PlayerTokenIsMinted(uint256 _season, uint256 _playerImageId, uint256 _divisionId, uint256 _gen2PlayerTokenId, address _user)` <a name="gen2playertoken-gen2playertokenisminted-uint256-uint256-uint256-uint256-address-"></a>


### event `Gen2PlayerTokenIsBurnt(uint256 _season, uint256 _playerImageId, uint256 _divisionId, uint256 _gen2PlayerTokenId, address _user)` <a name="gen2playertoken-gen2playertokenisburnt-uint256-uint256-uint256-uint256-address-"></a>


### event `TransferAllowListAddrStateIsChanged(address _addr, bool _state)` <a name="gen2playertoken-transferallowlistaddrstateischanged-address-bool-"></a>


