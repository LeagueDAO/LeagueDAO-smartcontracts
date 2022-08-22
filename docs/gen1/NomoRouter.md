# NomoRouter
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(contract INomoNFT nft_, address[] rewardTokens_, address updater_)` (external) ](#nomorouter-initialize-contract-inomonft-address---address-)
  - [`stakeTokens(uint256[] tokenIds)` (external) ](#nomorouter-staketokens-uint256---)
  - [`unstakeTokens(uint256[] tokenIds)` (external) ](#nomorouter-unstaketokens-uint256---)
  - [`stakeToken(uint256 tokenId)` (public) ](#nomorouter-staketoken-uint256-)
  - [`unstakeToken(uint256 tokenId)` (public) ](#nomorouter-unstaketoken-uint256-)
  - [`withdrawRewards()` (external) ](#nomorouter-withdrawrewards--)
  - [`addRewardTokens(address[] tokens)` (external) ](#nomorouter-addrewardtokens-address---)
  - [`addLeague(contract INomoLeague league, uint256 leagueId)` (external) ](#nomorouter-addleague-contract-inomoleague-uint256-)
  - [`removeLeague(uint256 leagueId)` (external) ](#nomorouter-removeleague-uint256-)
  - [`updatePoints(uint256 tokenId)` (public) ](#nomorouter-updatepoints-uint256-)
  - [`updatePointsBatch(uint256[] tokenIds)` (external) ](#nomorouter-updatepointsbatch-uint256---)
  - [`setUpdater(address _updater, bool _isUpdater)` (public) ](#nomorouter-setupdater-address-bool-)
  - [`setCalculator(uint256 setId, address newCalculator)` (external) ](#nomorouter-setcalculator-uint256-address-)
  - [`totalRewardsOf(address account) → uint256[]` (external) ](#nomorouter-totalrewardsof-address-)
  - [`leagueIds() → uint256[]` (external) ](#nomorouter-leagueids--)
  - [`calculator(uint256 setId) → address` (external) ](#nomorouter-calculator-uint256-)
  - [`rewardTokensLength() → uint256` (external) ](#nomorouter-rewardtokenslength--)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract INomoNFT nft`
- `contract IERC20 rewardToken`
- `address updater`
- `mapping(uint256 => address) stakers`
- `mapping(uint256 => contract INomoLeague) stakedAt`
- `mapping(uint256 => contract INomoLeague) leagues`
- `mapping(address => uint256[]) stakedTokenIds`
- `address[] rewardTokens`
- `mapping(address => bool) updaters`

## Functions <a name="functions"></a>

### `initialize(contract INomoNFT nft_, address[] rewardTokens_, address updater_)` (external) <a name="nomorouter-initialize-contract-inomonft-address---address-"></a>

*Description*: Acts like constructor for upgradeable contracts


#### Params
 - `nft_`: NomoNFT token address

 - `rewardTokens_`: Array of reward tokens

 - `updater_`: Address for updater role

### `stakeTokens(uint256[] tokenIds)` (external) <a name="nomorouter-staketokens-uint256---"></a>

*Description*: Function to stake multiple tokens


#### Params
 - `tokenIds`: List of token IDs

### `unstakeTokens(uint256[] tokenIds)` (external) <a name="nomorouter-unstaketokens-uint256---"></a>

*Description*: Function to unstake multiple tokens


#### Params
 - `tokenIds`: List of token IDs

### `stakeToken(uint256 tokenId)` (public) <a name="nomorouter-staketoken-uint256-"></a>

*Description*: Function to stake single token


#### Params
 - `tokenId`: ID of the token to stake

### `unstakeToken(uint256 tokenId)` (public) <a name="nomorouter-unstaketoken-uint256-"></a>

*Description*: Function to unstake single token


#### Params
 - `tokenId`: ID of the token to unstake

### `withdrawRewards()` (external) <a name="nomorouter-withdrawrewards--"></a>

*Description*: Withdraw your rewards

### `addRewardTokens(address[] tokens)` (external) <a name="nomorouter-addrewardtokens-address---"></a>

*Description*: Function add reward tokens


#### Params
 - `tokens`: list of reward tokens

### `addLeague(contract INomoLeague league, uint256 leagueId)` (external) <a name="nomorouter-addleague-contract-inomoleague-uint256-"></a>

*Description*: Function to add league, can only be called by owner


#### Params
 - `league`: Address of the league contract

 - `leagueId`: ID that should be assigned to this league

### `removeLeague(uint256 leagueId)` (external) <a name="nomorouter-removeleague-uint256-"></a>

*Description*: Function to remove league, can only be called by owner


#### Params
 - `leagueId`: ID of the league to remove

### `updatePoints(uint256 tokenId)` (public) <a name="nomorouter-updatepoints-uint256-"></a>

*Description*: Function to update token's points in league, can only be called by updater


#### Params
 - `tokenId`: ID of the token to update

### `updatePointsBatch(uint256[] tokenIds)` (external) <a name="nomorouter-updatepointsbatch-uint256---"></a>

*Description*: Function to mass update token points in league, can only be called by updater


#### Params
 - `tokenIds`: IDs of tokens to update

### `setUpdater(address _updater, bool _isUpdater)` (public) <a name="nomorouter-setupdater-address-bool-"></a>

*Description*: Function to set new updater, can only be called by owner


#### Params
 - `_updater`: New updater address

 - `_isUpdater`: New updater address

### `setCalculator(uint256 setId, address newCalculator)` (external) <a name="nomorouter-setcalculator-uint256-address-"></a>

*Description*: Function to set new calculator contract address for parameters set


#### Params
 - `setId`: ID of the NFT parameters set to update calculator for

 - `newCalculator`: Address of the calculator contract

### `totalRewardsOf(address account) → uint256[]` (external) <a name="nomorouter-totalrewardsof-address-"></a>

*Description*: Function to get total rewards of some account in all leagues


#### Params
 - `account`: Address to get rewards for

#### Returns
 - Total rewards

### `leagueIds() → uint256[]` (external) <a name="nomorouter-leagueids--"></a>

*Description*: Function to get all league IDs

#### Returns
 - Array of league IDs

### `calculator(uint256 setId) → address` (external) <a name="nomorouter-calculator-uint256-"></a>

*Description*: Function to get calculator address by parameters set id


#### Params
 - `setId`: Id of the set

#### Returns
 - Address of calculator

### `rewardTokensLength() → uint256` (external) <a name="nomorouter-rewardtokenslength--"></a>

*Description*: Function to get length of address with reward tokens

#### Returns
 - Length of array
## Events <a name="events"></a>
### event `TokenStaked(address account, uint256 tokenId, uint256 leagueId)` <a name="nomorouter-tokenstaked-address-uint256-uint256-"></a>

**Dev doc**: Event emitted when token is staked to some league

### event `TokenUnstaked(address account, uint256 tokenId, uint256 leagueId)` <a name="nomorouter-tokenunstaked-address-uint256-uint256-"></a>

**Dev doc**: Event emitted when token is unstaked from some league

### event `LeagueAdded(address league, uint256 leagueId)` <a name="nomorouter-leagueadded-address-uint256-"></a>

**Dev doc**: Event emitted when new league is added

### event `LeagueRemoved(address league, uint256 leagueId)` <a name="nomorouter-leagueremoved-address-uint256-"></a>

**Dev doc**: Event emitted when some existing league is removed

### event `CalculatorUpdated(uint256 setId, address newCalculator)` <a name="nomorouter-calculatorupdated-uint256-address-"></a>

**Dev doc**: Event emitted when new calculator is set

### event `UpdaterUpdated(address newUpdater, bool isUpdater)` <a name="nomorouter-updaterupdated-address-bool-"></a>

**Dev doc**: Event emitted when new updater is set

### event `PointsUpdated(uint256 tokenId)` <a name="nomorouter-pointsupdated-uint256-"></a>

**Dev doc**: Event emitted when points are updated for some token

