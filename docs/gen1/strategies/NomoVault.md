# NomoVault
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(contract INomoNFT nft_, contract IStrategy strategy_, contract INomoRouter router_)` (external) ](#nomovault-initialize-contract-inomonft-contract-istrategy-contract-inomorouter-)
  - [`nftSaleCallback(uint256[] tokensIds, uint256[] prices)` (external) ](#nomovault-nftsalecallback-uint256---uint256---)
  - [`distributeReward(address league)` (external) ](#nomovault-distributereward-address-)
  - [`upgradeStrategy(contract IStrategy strategy_)` (external) ](#nomovault-upgradestrategy-contract-istrategy-)
  - [`withdrawAnyToken(address token)` (external) ](#nomovault-withdrawanytoken-address-)
  - [`setSalesRole(address account, bool hasRole)` (external) ](#nomovault-setsalesrole-address-bool-)
  - [`addLeagues(uint256[] newLeagueIds)` (external) ](#nomovault-addleagues-uint256---)
  - [`removeLeagues(uint256[] removedLeagueIds)` (external) ](#nomovault-removeleagues-uint256---)
  - [`want() → contract IERC20Upgradeable` (public) ](#nomovault-want--)
  - [`balance() → uint256` (public) ](#nomovault-balance--)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract INomoNFT nft`
- `contract IStrategy strategy`
- `contract INomoRouter router`
- `mapping(address => bool) hasSalesRole`
- `mapping(uint256 => uint256[]) leagueTokenIds`
- `uint256[] leagueIds`
- `uint256 DUST`

## Functions <a name="functions"></a>

### `initialize(contract INomoNFT nft_, contract IStrategy strategy_, contract INomoRouter router_)` (external) <a name="nomovault-initialize-contract-inomonft-contract-istrategy-contract-inomorouter-"></a>

*Description*: Upgradeable contract constructor


#### Params
 - `nft_`: Address of the NomoNFT contract

 - `strategy_`: Address of the strategy contract

 - `router_`: Address of the NomoRouter contract

### `nftSaleCallback(uint256[] tokensIds, uint256[] prices)` (external) <a name="nomovault-nftsalecallback-uint256---uint256---"></a>

*Description*: Function that is called by sales contract as callback in order to deposit funds to strategy


#### Params
 - `tokensIds`: List of token IDs sold

 - `prices`: Prices of sold tokens respectively (as wei)

### `distributeReward(address league)` (external) <a name="nomovault-distributereward-address-"></a>

*Description*: Function is called by owner to extract and distribute reward between leagues


#### Params
 - `league`: Address of league which you want to distribute rewards for

### `upgradeStrategy(contract IStrategy strategy_)` (external) <a name="nomovault-upgradestrategy-contract-istrategy-"></a>

*Description*: Function is called by owner to upgrade vault to new strategy


#### Params
 - `strategy_`: Address of the new strategy contract

### `withdrawAnyToken(address token)` (external) <a name="nomovault-withdrawanytoken-address-"></a>

*Description*: Function can be used by owner to withdraw any stuck token from the vault


#### Params
 - `token`: address of the token to rescue.

### `setSalesRole(address account, bool hasRole)` (external) <a name="nomovault-setsalesrole-address-bool-"></a>

*Description*: Function is used by owner to grant or revoke sales role for some address


#### Params
 - `account`: Address to set sales role for

 - `hasRole`: True to grant role, false to revoke

### `addLeagues(uint256[] newLeagueIds)` (external) <a name="nomovault-addleagues-uint256---"></a>

*Description*: Function is used by owner to add leagues to the contract


#### Params
 - `newLeagueIds`: List of league IDs added to the contract

### `removeLeagues(uint256[] removedLeagueIds)` (external) <a name="nomovault-removeleagues-uint256---"></a>

*Description*: Function is used by owner to remove leagues from the contract (and clear their rewards)


#### Params
 - `removedLeagueIds`: List of league IDs removed from the contract

### `want() → contract IERC20Upgradeable` (public) <a name="nomovault-want--"></a>

*Description*: View function that returns want token for the used strategy and vault

#### Returns
 - Address of the want token

### `balance() → uint256` (public) <a name="nomovault-balance--"></a>

*Description*: View function that returns total amount of funds operated by the strategy

#### Returns
 - Want equivalent of total funds

### `_earn()` (internal) <a name="nomovault-_earn--"></a>

*Description*: Internal function that deposits vault balance to the strategy
## Events <a name="events"></a>
### event `NftSale(uint256[] tokensIds, uint256[] prices)` <a name="nomovault-nftsale-uint256---uint256---"></a>

*Description*: Event emitted when NFTs sale callback is executed in the vault

### event `RewardDistributed(uint256 reward, address league)` <a name="nomovault-rewarddistributed-uint256-address-"></a>

*Description*: Event emitted when rewards are distributed between leagues

### event `StrategyUpgraded(address newStrategy)` <a name="nomovault-strategyupgraded-address-"></a>

*Description*: Event emitted when new strategy is set for the vault

### event `SalesRoleSet(address account, bool hasRole)` <a name="nomovault-salesroleset-address-bool-"></a>

*Description*: Event emitted when sales role is granted or revoked for some address

### event `LeaguesAdded(uint256[] leagueIds)` <a name="nomovault-leaguesadded-uint256---"></a>

*Description*: Event emitted when new leagues are added to the vault

### event `LeaguesRemoved(uint256[] leagueIds)` <a name="nomovault-leaguesremoved-uint256---"></a>

*Description*: Event emitted when leagues are removed from the vault (and rewards respectively)

