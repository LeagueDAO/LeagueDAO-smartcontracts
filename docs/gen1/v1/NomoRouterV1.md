# NomoRouterV1
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(contract INomoNFT nft_, contract IERC20 rewardToken_, address updater_)` (external) ](#nomorouterv1-initialize-contract-inomonft-contract-ierc20-address-)
  - [`stakeTokens(uint256[] tokenIds)` (external) ](#nomorouterv1-staketokens-uint256---)
  - [`unstakeTokens(uint256[] tokenIds)` (external) ](#nomorouterv1-unstaketokens-uint256---)
  - [`stakeToken(uint256 tokenId)` (public) ](#nomorouterv1-staketoken-uint256-)
  - [`unstakeToken(uint256 tokenId)` (public) ](#nomorouterv1-unstaketoken-uint256-)
  - [`addLeague(contract INomoLeagueV1 league, uint256 leagueId)` (external) ](#nomorouterv1-addleague-contract-inomoleaguev1-uint256-)
  - [`removeLeague(uint256 leagueId)` (external) ](#nomorouterv1-removeleague-uint256-)
  - [`updatePoints(uint256 tokenId)` (public) ](#nomorouterv1-updatepoints-uint256-)
  - [`updatePointsBatch(uint256[] tokenIds)` (external) ](#nomorouterv1-updatepointsbatch-uint256---)
  - [`setUpdater(address updater_)` (external) ](#nomorouterv1-setupdater-address-)
  - [`setCalculator(uint256 setId, address newCalculator)` (external) ](#nomorouterv1-setcalculator-uint256-address-)
  - [`totalRewardOf(address account) → uint256` (external) ](#nomorouterv1-totalrewardof-address-)
  - [`leagueIds() → uint256[]` (external) ](#nomorouterv1-leagueids--)
  - [`calculator(uint256 setId) → address` (external) ](#nomorouterv1-calculator-uint256-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract INomoNFT nft`
- `contract IERC20 rewardToken`
- `address updater`
- `mapping(uint256 => address) stakers`
- `mapping(uint256 => contract INomoLeagueV1) stakedAt`
- `mapping(uint256 => contract INomoLeagueV1) leagues`
- `mapping(address => uint256[]) stakedTokenIds`

## Functions <a name="functions"></a>

### `initialize(contract INomoNFT nft_, contract IERC20 rewardToken_, address updater_)` (external) <a name="nomorouterv1-initialize-contract-inomonft-contract-ierc20-address-"></a>


### `stakeTokens(uint256[] tokenIds)` (external) <a name="nomorouterv1-staketokens-uint256---"></a>

*Description*: Function to stake multiple tokens


#### Params
 - `tokenIds`: List of token IDs

### `unstakeTokens(uint256[] tokenIds)` (external) <a name="nomorouterv1-unstaketokens-uint256---"></a>

*Description*: Function to unstake multiple tokens


#### Params
 - `tokenIds`: List of token IDs

### `stakeToken(uint256 tokenId)` (public) <a name="nomorouterv1-staketoken-uint256-"></a>

*Description*: Function to stake single token


#### Params
 - `tokenId`: ID of the token to stake

### `unstakeToken(uint256 tokenId)` (public) <a name="nomorouterv1-unstaketoken-uint256-"></a>

*Description*: Function to unstake single token


#### Params
 - `tokenId`: ID of the token to unstake

### `addLeague(contract INomoLeagueV1 league, uint256 leagueId)` (external) <a name="nomorouterv1-addleague-contract-inomoleaguev1-uint256-"></a>

*Description*: Function to add league, can only be called by owner


#### Params
 - `league`: Address of the league contract

 - `leagueId`: ID that should be assigned to this league

### `removeLeague(uint256 leagueId)` (external) <a name="nomorouterv1-removeleague-uint256-"></a>

*Description*: Function to remove league, can only be called by owner


#### Params
 - `leagueId`: ID of the league to remove

### `updatePoints(uint256 tokenId)` (public) <a name="nomorouterv1-updatepoints-uint256-"></a>

*Description*: Function to update token's points in league, can only be called by updater


#### Params
 - `tokenId`: ID of the token to update

### `updatePointsBatch(uint256[] tokenIds)` (external) <a name="nomorouterv1-updatepointsbatch-uint256---"></a>

*Description*: Function to mass update token points in league, can only be called by updater


#### Params
 - `tokenIds`: IDs of tokens to update

### `setUpdater(address updater_)` (external) <a name="nomorouterv1-setupdater-address-"></a>

*Description*: Function to set new updater, can only be called by owner


#### Params
 - `updater_`: New updater address

### `setCalculator(uint256 setId, address newCalculator)` (external) <a name="nomorouterv1-setcalculator-uint256-address-"></a>

*Description*: Function to set new calculator contract address for parameters set


#### Params
 - `setId`: ID of the NFT parameters set to update calculator for

 - `newCalculator`: Address of the calculator contract

### `totalRewardOf(address account) → uint256` (external) <a name="nomorouterv1-totalrewardof-address-"></a>

*Description*: Function to get total reward of some account in all leagues


#### Params
 - `account`: Address to get rewards for

#### Returns
 - Total reward

### `leagueIds() → uint256[]` (external) <a name="nomorouterv1-leagueids--"></a>

*Description*: Function to get all league IDs

### `calculator(uint256 setId) → address` (external) <a name="nomorouterv1-calculator-uint256-"></a>

*Description*: Function to get calculator address by parameters set id
## Events <a name="events"></a>
### event `TokenStaked(address account, uint256 tokenId, uint256 leagueId)` <a name="nomorouterv1-tokenstaked-address-uint256-uint256-"></a>

*Description*: Event emitted when token is staked to some league

### event `TokenUnstaked(address account, uint256 tokenId, uint256 leagueId)` <a name="nomorouterv1-tokenunstaked-address-uint256-uint256-"></a>

*Description*: Event emitted when token is unstaked from some league

### event `LeagueAdded(address league, uint256 leagueId)` <a name="nomorouterv1-leagueadded-address-uint256-"></a>

*Description*: Event emitted when new league is added

### event `LeagueRemoved(address league, uint256 leagueId)` <a name="nomorouterv1-leagueremoved-address-uint256-"></a>

*Description*: Event emitted when some existing league is removed

### event `CalculatorUpdated(uint256 setId, address newCalculator)` <a name="nomorouterv1-calculatorupdated-uint256-address-"></a>

*Description*: Event emitted when new calculator is set

### event `UpdaterUpdated(address newUpdater)` <a name="nomorouterv1-updaterupdated-address-"></a>

*Description*: Event emitted when new updater is set

### event `PointsUpdated(uint256 tokenId)` <a name="nomorouterv1-pointsupdated-uint256-"></a>

*Description*: Event emitted when points are updated for some token

