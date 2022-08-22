# FinancialManagerMock
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(address _strategy, address _multisigUser, address _fantasyLeague, address[] _tokens)` (external) ](#financialmanagermock-initialize-address-address-address-address---)
  - [`depositBalance()` (external) ](#financialmanagermock-depositbalance--)
  - [`yeild(address _underlying)` (external) ](#financialmanagermock-yeild-address-)
  - [`supplyRewardsForPlayoffAndMegaleague()` (external) ](#financialmanagermock-supplyrewardsforplayoffandmegaleague--)
  - [`setPoolId(uint256 _poolId)` (external) ](#financialmanagermock-setpoolid-uint256-)
  - [`setStrategy(address _strategy)` (external) ](#financialmanagermock-setstrategy-address-)
  - [`setMmultisigUser(address _multisigUser)` (external) ](#financialmanagermock-setmmultisiguser-address-)
  - [`setFantasyLeague(address _fantasyLeague)` (external) ](#financialmanagermock-setfantasyleague-address-)
  - [`setMegaleague(address _megaLeague)` (external) ](#financialmanagermock-setmegaleague-address-)
  - [`setTokens(address[] _tokens)` (external) ](#financialmanagermock-settokens-address---)
  - [`setRewardTokenAndAmount(uint256 _amount, address _token)` (external) ](#financialmanagermock-setrewardtokenandamount-uint256-address-)
  - [`setLastWeekOfPlayoff(uint256 _lastWeekOfPlayoff)` (external) ](#financialmanagermock-setlastweekofplayoff-uint256-)
  - [`getPlayoffRewardTokenNValue() → address token, uint256 amount` (external) ](#financialmanagermock-getplayoffrewardtokennvalue--)
- [Events:](#events)

## Variables <a name="variables"></a>
- `bytes32 MULTISIG_ROLE`
- `contract IStrategy strategy`
- `address multisigUser`
- `address fantasyLeague`
- `address megaLeague`
- `uint256 depositAmount`
- `uint256 poolId`
- `address[] tokens`
- `uint256[] tokenBalances`
- `uint256 bodyOfDepositInWant`
- `uint256 bodyOfDepositInUsd`
- `uint256 lastWeekOfPlayoff`
- `uint256 playoffRewardAmount`
- `address playoffRewardToken`

## Functions <a name="functions"></a>

### `initialize(address _strategy, address _multisigUser, address _fantasyLeague, address[] _tokens)` (external) <a name="financialmanagermock-initialize-address-address-address-address---"></a>


### `depositBalance()` (external) <a name="financialmanagermock-depositbalance--"></a>

*Description*: deposit whole balance of [USDC, USDT, DAI, MAI] from this contract to strategy

### `yeild(address _underlying)` (external) <a name="financialmanagermock-yeild-address-"></a>

*Description*: Collect yield from strategy


#### Params
 - `_underlying`: token address

### `supplyRewardsForPlayoffAndMegaleague()` (external) <a name="financialmanagermock-supplyrewardsforplayoffandmegaleague--"></a>

*Description*: transfer playoffRewardAmount * division in playoffRewardToken to FantasyLeague and rest of deposit to MegaLeague

### `setPoolId(uint256 _poolId)` (external) <a name="financialmanagermock-setpoolid-uint256-"></a>


### `setStrategy(address _strategy)` (external) <a name="financialmanagermock-setstrategy-address-"></a>


### `setMmultisigUser(address _multisigUser)` (external) <a name="financialmanagermock-setmmultisiguser-address-"></a>


### `setFantasyLeague(address _fantasyLeague)` (external) <a name="financialmanagermock-setfantasyleague-address-"></a>


### `setMegaleague(address _megaLeague)` (external) <a name="financialmanagermock-setmegaleague-address-"></a>


### `setTokens(address[] _tokens)` (external) <a name="financialmanagermock-settokens-address---"></a>


### `setRewardTokenAndAmount(uint256 _amount, address _token)` (external) <a name="financialmanagermock-setrewardtokenandamount-uint256-address-"></a>


### `setLastWeekOfPlayoff(uint256 _lastWeekOfPlayoff)` (external) <a name="financialmanagermock-setlastweekofplayoff-uint256-"></a>


### `getPlayoffRewardTokenNValue() → address token, uint256 amount` (external) <a name="financialmanagermock-getplayoffrewardtokennvalue--"></a>

## Events <a name="events"></a>
### event `YeildCollected(address _token, uint256 _amount)` <a name="financialmanagermock-yeildcollected-address-uint256-"></a>


### event `RewardsForPlayoffAreSupplied(uint256 _amount)` <a name="financialmanagermock-rewardsforplayoffaresupplied-uint256-"></a>


### event `RewardsForMegaLeagueAreSupplied(uint256 _amount)` <a name="financialmanagermock-rewardsformegaleaguearesupplied-uint256-"></a>


