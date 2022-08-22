# Gen2PlayerTokenMock3
*ALOMOST NOT A MOCK (contract witout gen1 NOMO contract)*

**Dev doc**: One division, 1 Gen2PlayerToken derived from genesis NFT image.

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`constructor()` (public) ](#gen2playertokenmock3-constructor--)
  - [`setPositionMintDisabling(uint256 _position, bool _isDisabled)` (external) ](#gen2playertokenmock3-setpositionmintdisabling-uint256-bool-)
  - [`mint(uint256 _playerImageId, uint256 _divisionId, address _user) → uint256 _tokenId` (external) ](#gen2playertokenmock3-mint-uint256-uint256-address-)
  - [`burn(uint256 _tokenId)` (external) ](#gen2playertokenmock3-burn-uint256-)
  - [`setTransferAllowListAddr(address _addr, bool _state)` (public) ](#gen2playertokenmock3-settransferallowlistaddr-address-bool-)
  - [`supportsInterface(bytes4 interfaceId) → bool` (public) ](#gen2playertokenmock3-supportsinterface-bytes4-)
  - [`setTokenPosition(uint256 _tokenId, uint256 _position)` (external) ](#gen2playertokenmock3-settokenposition-uint256-uint256-)
  - [`getTokenPosition(uint256 _tokenId) → uint256 position` (external) ](#gen2playertokenmock3-gettokenposition-uint256-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `mapping(uint256 => uint256[]) imageIdToAllNftIds`
- `mapping(uint256 => mapping(uint256 => uint256)) nftIndexInImageToAllNftIdsPlusOne`
- `mapping(uint256 => uint256) nftIdToDivisionId`
- `mapping(uint256 => uint256) nftIdToImageId`
- `mapping(uint256 => uint256) nftIdToSeasonId`
- `mapping(uint256 => mapping(uint256 => mapping(uint256 => bool))) isImageInDivision`
- `mapping(uint256 => string[]) nftIdToData`
- `mapping(address => bool) transferAllowlist`
- `mapping(uint256 => bool) isDisabledPosition`
- `mapping(uint256 => uint256) tokenPositions`
- `bytes32 MINTER_ROLE`

## Functions <a name="functions"></a>

### `constructor()` (public) <a name="gen2playertokenmock3-constructor--"></a>

*Description*: Contract constructor

### `setPositionMintDisabling(uint256 _position, bool _isDisabled)` (external) <a name="gen2playertokenmock3-setpositionmintdisabling-uint256-bool-"></a>

*Description*: Disables a `_position`, means it is not possible to mint players with such a position.



#### Params
 - `_position`: A position code. See NomoNFT.sol to get better understanding of position codes.

### `mint(uint256 _playerImageId, uint256 _divisionId, address _user) → uint256 _tokenId` (external) <a name="gen2playertokenmock3-mint-uint256-uint256-address-"></a>

*Description*: Mints gen 2 player token


#### Params
 - `_playerImageId`: Id of player image

 - `_divisionId`: Id of division to which NFT belongs to

 - `_user`: Address to which NFT will be minted to

#### Returns
 - _tokenId uint256 Id of minted NFT

### `burn(uint256 _tokenId)` (external) <a name="gen2playertokenmock3-burn-uint256-"></a>

*Description*: Whitelisted addresses allowed to burn tokens


#### Params
 - `_tokenId`: Id of token to burn

### `setTransferAllowListAddr(address _addr, bool _state)` (public) <a name="gen2playertokenmock3-settransferallowlistaddr-address-bool-"></a>

*Description*: Sets address permission to recive and send tokens


#### Params
 - `_addr`: Address

 - `_state`: True - address is allowed to transfer and recive token, false - not allowed

### `supportsInterface(bytes4 interfaceId) → bool` (public) <a name="gen2playertokenmock3-supportsinterface-bytes4-"></a>

**Dev doc**: Method is overwritten to resolve inheritance conflict

### `setTokenPosition(uint256 _tokenId, uint256 _position)` (external) <a name="gen2playertokenmock3-settokenposition-uint256-uint256-"></a>


### `getTokenPosition(uint256 _tokenId) → uint256 position` (external) <a name="gen2playertokenmock3-gettokenposition-uint256-"></a>

## Events <a name="events"></a>
### event `PositionMintDisablingSet(uint256 _position, bool _isDisabled)` <a name="gen2playertokenmock3-positionmintdisablingset-uint256-bool-"></a>


### event `GenesisNFTisSet(address _contract)` <a name="gen2playertokenmock3-genesisnftisset-address-"></a>


### event `FantasyLeagueisSet(address _contract)` <a name="gen2playertokenmock3-fantasyleagueisset-address-"></a>


### event `Gen2PlayerTokenIsMinted(uint256 _season, uint256 _playerImageId, uint256 _divisionId, uint256 _gen2PlayerTokenId, address _user)` <a name="gen2playertokenmock3-gen2playertokenisminted-uint256-uint256-uint256-uint256-address-"></a>


### event `Gen2PlayerTokenIsBurnt(uint256 _season, uint256 _playerImageId, uint256 _divisionId, uint256 _gen2PlayerTokenId, address _user)` <a name="gen2playertokenmock3-gen2playertokenisburnt-uint256-uint256-uint256-uint256-address-"></a>


### event `TransferAllowListAddrStateIsChanged(address _addr, bool _state)` <a name="gen2playertokenmock3-transferallowlistaddrstateischanged-address-bool-"></a>


