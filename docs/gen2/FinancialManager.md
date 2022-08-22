# FinancialManager
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(address _strategy, address _multisigUser, address _fantasyLeague, address[] _tokens)` (external) ](#financialmanager-initialize-address-address-address-address---)
  - [`depositBalance()` (external) ](#financialmanager-depositbalance--)
  - [`yield(address _underlying)` (external) ](#financialmanager-yield-address-)
  - [`supplyRewardsForPlayoffAndMegaLeague()` (external) ](#financialmanager-supplyrewardsforplayoffandmegaleague--)
  - [`setPoolId(uint256 _poolId)` (external) ](#financialmanager-setpoolid-uint256-)
  - [`setStrategy(address _strategy)` (external) ](#financialmanager-setstrategy-address-)
  - [`setMultisigUser(address _multisigUser)` (external) ](#financialmanager-setmultisiguser-address-)
  - [`setFantasyLeague(address _fantasyLeague)` (external) ](#financialmanager-setfantasyleague-address-)
  - [`setMegaLeague(address _megaLeague)` (external) ](#financialmanager-setmegaleague-address-)
  - [`setTokens(address[] _tokens)` (external) ](#financialmanager-settokens-address---)
  - [`setRewardTokenAndAmount(uint256 _amount, address _token)` (external) ](#financialmanager-setrewardtokenandamount-uint256-address-)
  - [`setLastWeekOfPlayoff(uint256 _lastWeekOfPlayoff)` (external) ](#financialmanager-setlastweekofplayoff-uint256-)
  - [`setTreasury(address _address, uint256 _share)` (external) ](#financialmanager-settreasury-address-uint256-)
  - [`getPlayoffRewardTokenNValue() → address token, uint256 amount` (external) ](#financialmanager-getplayoffrewardtokennvalue--)
- [Events:](#events)

## Variables <a name="variables"></a>
- `bytes32 MULTISIG_ROLE`
- `contract IStrategy strategy`
- `address multisigUser`
- `address fantasyLeague`
- `address megaLeague`
- `uint256 poolId`
- `address[] tokens`
- `uint256 lastWeekOfPlayoff`
- `uint256 playoffRewardAmount`
- `address playoffRewardToken`
- `address treasury`
- `uint256 treasuryShare`

## Functions <a name="functions"></a>

### `initialize(address _strategy, address _multisigUser, address _fantasyLeague, address[] _tokens)` (external) <a name="financialmanager-initialize-address-address-address-address---"></a>


### `depositBalance()` (external) <a name="financialmanager-depositbalance--"></a>

*Description*: deposit whole balance of [USDC, USDT, DAI, MAI] from this contract to strategy

### `yield(address _underlying)` (external) <a name="financialmanager-yield-address-"></a>

*Description*: Collect yield from strategy


#### Params
 - `_underlying`: token address

### `supplyRewardsForPlayoffAndMegaLeague()` (external) <a name="financialmanager-supplyrewardsforplayoffandmegaleague--"></a>

*Description*: transfer playoffRewardAmount * division in playoffRewardToken to FantasyLeague and rest of deposit to MegaLeague

### `setPoolId(uint256 _poolId)` (external) <a name="financialmanager-setpoolid-uint256-"></a>


### `setStrategy(address _strategy)` (external) <a name="financialmanager-setstrategy-address-"></a>


### `setMultisigUser(address _multisigUser)` (external) <a name="financialmanager-setmultisiguser-address-"></a>


### `setFantasyLeague(address _fantasyLeague)` (external) <a name="financialmanager-setfantasyleague-address-"></a>


### `setMegaLeague(address _megaLeague)` (external) <a name="financialmanager-setmegaleague-address-"></a>


### `setTokens(address[] _tokens)` (external) <a name="financialmanager-settokens-address---"></a>


### `setRewardTokenAndAmount(uint256 _amount, address _token)` (external) <a name="financialmanager-setrewardtokenandamount-uint256-address-"></a>


### `setLastWeekOfPlayoff(uint256 _lastWeekOfPlayoff)` (external) <a name="financialmanager-setlastweekofplayoff-uint256-"></a>


### `setTreasury(address _address, uint256 _share)` (external) <a name="financialmanager-settreasury-address-uint256-"></a>


### `getPlayoffRewardTokenNValue() → address token, uint256 amount` (external) <a name="financialmanager-getplayoffrewardtokennvalue--"></a>

## Events <a name="events"></a>
### event `YieldCollected(address _token, uint256 _amount)` <a name="financialmanager-yieldcollected-address-uint256-"></a>


### event `RewardsForPlayoffAreSupplied(uint256 _amount)` <a name="financialmanager-rewardsforplayoffaresupplied-uint256-"></a>


### event `RewardsForMegaLeagueAreSupplied(uint256 _amount)` <a name="financialmanager-rewardsformegaleaguearesupplied-uint256-"></a>


