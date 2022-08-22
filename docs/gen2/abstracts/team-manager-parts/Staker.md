# Staker
**

*Description*: @dev

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`setUserDivisionId(address _user, uint256 _divisionId)` (external) ](#staker-setuserdivisionid-address-uint256-)
  - [`stakePlayers(uint256[] _tokenIds)` (external) ](#staker-stakeplayers-uint256---)
  - [`stakePlayer(uint256 _tokenId)` (public) ](#staker-stakeplayer-uint256-)
  - [`unstakePlayers(uint256[] _tokenIds)` (external) ](#staker-unstakeplayers-uint256---)
  - [`unstakePlayer(uint256 _tokenId)` (public) ](#staker-unstakeplayer-uint256-)
  - [`getUserDivisionId(uint256 _season, address _user) → uint256` (external) ](#staker-getuserdivisionid-uint256-address-)
  - [`getStakedPlayerIndex(uint256 _season, address _user, uint256 _tokenId) → uint256` (external) ](#staker-getstakedplayerindex-uint256-address-uint256-)
  - [`getStakedPlayersOfUser(uint256 _season, address _user) → uint256[]` (external) ](#staker-getstakedplayersofuser-uint256-address-)
  - [`isUserAdded(uint256 _season, address _user) → bool` (public) ](#staker-isuseradded-uint256-address-)
  - [`isPlayerStaked(uint256 _season, address _user, uint256 _tokenId) → bool` (public) ](#staker-isplayerstaked-uint256-address-uint256-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `mapping(uint256 => mapping(address => uint256[])) stakedPlayers`

## Functions <a name="functions"></a>

### `init_Staker_unchained()` (internal) <a name="staker-init_staker_unchained--"></a>


### `setUserDivisionId(address _user, uint256 _divisionId)` (external) <a name="staker-setuserdivisionid-address-uint256-"></a>

**Dev doc**: Sets a division ID of a user.



#### Params
 - `_user`:   A user address.

 - `_divisionId`:   A user division ID.

### `stakePlayers(uint256[] _tokenIds)` (external) <a name="staker-stakeplayers-uint256---"></a>

*Description*: Adds players to caller's team

**Dev doc**: Uses stakePlayer() function for each tokenId in the passed array. Caller must be registered user and there must be free places to stake (unused limits).


#### Params
 - `_tokenIds`:   An array of token IDs.

### `stakePlayer(uint256 _tokenId)` (public) <a name="staker-stakeplayer-uint256-"></a>

*Description*: Adds player to caller's team

**Dev doc**: Caller must be registered user and there must be free places to stake (unused limits).


#### Params
 - `_tokenId`: Player NFT tokenId

### `unstakePlayers(uint256[] _tokenIds)` (external) <a name="staker-unstakeplayers-uint256---"></a>

*Description*: Removes players from caller's team

**Dev doc**: Uses unstakePlayer() function for each tokenId in the passed array. Caller must be registered user and there must be staked players in the team.


#### Params
 - `_tokenIds`:   An array of token IDs.

### `unstakePlayer(uint256 _tokenId)` (public) <a name="staker-unstakeplayer-uint256-"></a>

*Description*: Remove player from caller's team

**Dev doc**: Caller must be registered user and there must be staked players in the team.


#### Params
 - `_tokenId`: Player NFT tokenId

### `getUserDivisionId(uint256 _season, address _user) → uint256` (external) <a name="staker-getuserdivisionid-uint256-address-"></a>


### `getStakedPlayerIndex(uint256 _season, address _user, uint256 _tokenId) → uint256` (external) <a name="staker-getstakedplayerindex-uint256-address-uint256-"></a>


### `getStakedPlayersOfUser(uint256 _season, address _user) → uint256[]` (external) <a name="staker-getstakedplayersofuser-uint256-address-"></a>

*Description*: Returns an array of token ids staked by the specified user

#### Returns
 - Array of Gen2Player NFTs ids

### `isUserAdded(uint256 _season, address _user) → bool` (public) <a name="staker-isuseradded-uint256-address-"></a>


### `isPlayerStaked(uint256 _season, address _user, uint256 _tokenId) → bool` (public) <a name="staker-isplayerstaked-uint256-address-uint256-"></a>

## Events <a name="events"></a>
### event `UserDivisionIdSet(uint256 _season, address _user, uint256 _divisionId)` <a name="staker-userdivisionidset-uint256-address-uint256-"></a>


### event `PlayerStaked(uint256 _season, address _user, uint256 _tokenId)` <a name="staker-playerstaked-uint256-address-uint256-"></a>

*Description*: When user stakes new token to the team

### event `PlayerUnstaked(uint256 _season, address _user, uint256 _tokenId)` <a name="staker-playerunstaked-uint256-address-uint256-"></a>

*Description*: When user unstakes token from the team

