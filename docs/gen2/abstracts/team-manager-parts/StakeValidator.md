# StakeValidator
**

*Description*: @dev

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`setGen2PlayerToken(address _gen2PlayerToken)` (external) ](#stakevalidator-setgen2playertoken-address-)
  - [`setTeamsStakingDeadlinesContract(address _teamsStakingDeadlinesContract)` (public) ](#stakevalidator-setteamsstakingdeadlinescontract-address-)
  - [`setPositionNumber(uint256 _position, uint256 _howMany)` (external) ](#stakevalidator-setpositionnumber-uint256-uint256-)
  - [`setFlexPosition(uint256 _position, bool _isFlexPosition)` (external) ](#stakevalidator-setflexposition-uint256-bool-)
  - [`setFlexPositionNumber(uint256 _newFlexPositionNumber)` (external) ](#stakevalidator-setflexpositionnumber-uint256-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract IGen2PlayerToken gen2PlayerToken`
- `contract ITeamsStakingDeadlines teamsStakingDeadlinesContract`
- `mapping(uint256 => mapping(uint256 => uint256)) positionNumber`
- `uint256 FLEX_POSITION`
- `mapping(uint256 => mapping(uint256 => bool)) isFlexPosition`
- `mapping(uint256 => uint256) flexPositionNumber`
- `mapping(uint256 => mapping(uint256 => bool)) isPlayerInFlexPosition`
- `mapping(uint256 => mapping(address => mapping(uint256 => uint256))) userPositionNumber`

## Functions <a name="functions"></a>

### `init_StakeValidator_unchained(address _gen2PlayerToken, address _teamsStakingDeadlinesContract)` (internal) <a name="stakevalidator-init_stakevalidator_unchained-address-address-"></a>


### `setGen2PlayerToken(address _gen2PlayerToken)` (external) <a name="stakevalidator-setgen2playertoken-address-"></a>

*Description*: Change NFT address



#### Params
 - `_gen2PlayerToken`: New NFT address

### `setTeamsStakingDeadlinesContract(address _teamsStakingDeadlinesContract)` (public) <a name="stakevalidator-setteamsstakingdeadlinescontract-address-"></a>

*Description*: Change staking deadlines contract address



#### Params
 - `_teamsStakingDeadlinesContract`: New staking deadlines contract address

### `setPositionNumber(uint256 _position, uint256 _howMany)` (external) <a name="stakevalidator-setpositionnumber-uint256-uint256-"></a>

*Description*: Allows contract owner to set limitations for staking ( see flex limitations setter below)

**Dev doc**: This is only usual limitation, in addition there are positions flex limitation


#### Params
 - `_position`: integer number code that represents specific position; ths value must exist in the Genesis NomoNFT (see NomoNFT contract to find position codes and CardImages functionality). Notice - this function reverts if _position is 0

 - `_howMany`: amount of players with specified position that user can stake. Notice - user can stake some positions over this limit if these positions are included in the flex limitation

### `setFlexPosition(uint256 _position, bool _isFlexPosition)` (external) <a name="stakevalidator-setflexposition-uint256-bool-"></a>

*Description*: Allows contract owner to change positions in flex limitation

**Dev doc**: This is addition to usual limitation


#### Params
 - `_position`: integer number code that represents specific position; ths value must exist in the Genesis NomoNFT (see NomoNFT contract to find position codes and CardImages functionality). Notice - this function reverts if _position is 0

 - `_isFlexPosition`: if true, then position is in the flex, if false, then tokens with this positions can't be staked in flex limitation places

### `setFlexPositionNumber(uint256 _newFlexPositionNumber)` (external) <a name="stakevalidator-setflexpositionnumber-uint256-"></a>

*Description*: Allows contract owner to set number of tokens which can be staked as a part of the flex limitation

**Dev doc**: If new limit is 0, then it means that flex limitation disabled. Note: you can calculate total number of tokens that can be staked by user if you will sum flex limitation amount and all limits for all positions.


#### Params
 - `_newFlexPositionNumber`: number of tokens that can be staked as a part of the positions flex limit

### `validatePosition(uint256 _tokenId, address _user)` (internal) <a name="stakevalidator-validateposition-uint256-address-"></a>

*Description*: Check limitations and fill the position limit with token if there is a free place.

**Dev doc**: Reverts if user reached all limits for token's position


#### Params
 - `_tokenId`: Gen2PlayerToken id user wants to stake

 - `_user`: User's address

### `unstakePosition(uint256 _tokenId, address _user)` (internal) <a name="stakevalidator-unstakeposition-uint256-address-"></a>


### `validateDeadline(uint256 _tokenId)` (internal) <a name="stakevalidator-validatedeadline-uint256-"></a>

*Description*: Check if token's staking deadline is greater than block.timestamp

**Dev doc**: Reverts if token's staking deadline is less than block.timestamp


#### Params
 - `_tokenId`: Gen2PlayerToken id user wants to stake
## Events <a name="events"></a>
### event `Gen2PlayerTokenSet(address _gen2PlayerToken)` <a name="stakevalidator-gen2playertokenset-address-"></a>

*Description*: When staked NFT contract changed

### event `TeamsStakingDeadlinesContractSet(address _teamsStakingDeadlinesContract)` <a name="stakevalidator-teamsstakingdeadlinescontractset-address-"></a>

*Description*: When staking deadlines contract changed

### event `PositionNumberSet(uint256 _season, uint256 _position, uint256 _newStakingLimit)` <a name="stakevalidator-positionnumberset-uint256-uint256-uint256-"></a>

*Description*: When staking limitation updated

### event `FlexPositionSet(uint256 _season, uint256 _position, bool _isFlexPosition)` <a name="stakevalidator-flexpositionset-uint256-uint256-bool-"></a>

*Description*: When positions are added or deleted from flex limitation

### event `FlexPositionNumberSet(uint256 _season, uint256 _newNumber)` <a name="stakevalidator-flexpositionnumberset-uint256-uint256-"></a>

*Description*: When flex limit amount is changed

