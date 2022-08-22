# FinancialManagerMock2
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(address _strategy, address _multisigUser, address _fantasyLeague, address[] _tokens)` (external) ](#financialmanagermock2-initialize-address-address-address-address---)
  - [`depositBalance()` (external) ](#financialmanagermock2-depositbalance--)
  - [`yield(address _underlying)` (external) ](#financialmanagermock2-yield-address-)
  - [`supplyRewardsForPlayoffAndMegaLeague()` (external) ](#financialmanagermock2-supplyrewardsforplayoffandmegaleague--)
  - [`setPoolId(uint256 _poolId)` (external) ](#financialmanagermock2-setpoolid-uint256-)
  - [`setStrategy(address _strategy)` (external) ](#financialmanagermock2-setstrategy-address-)
  - [`setMultisigUser(address _multisigUser)` (external) ](#financialmanagermock2-setmultisiguser-address-)
  - [`setFantasyLeague(address _fantasyLeague)` (external) ](#financialmanagermock2-setfantasyleague-address-)
  - [`setMegaLeague(address _megaLeague)` (external) ](#financialmanagermock2-setmegaleague-address-)
  - [`setTokens(address[] _tokens)` (external) ](#financialmanagermock2-settokens-address---)
  - [`setRewardTokenAndAmount(uint256 _amount, address _token)` (external) ](#financialmanagermock2-setrewardtokenandamount-uint256-address-)
  - [`setLastWeekOfPlayoff(uint256 _lastWeekOfPlayoff)` (external) ](#financialmanagermock2-setlastweekofplayoff-uint256-)
  - [`setTreasury(address _address, uint256 _share)` (external) ](#financialmanagermock2-settreasury-address-uint256-)
  - [`getPlayoffRewardTokenNValue() → address token, uint256 amount` (external) ](#financialmanagermock2-getplayoffrewardtokennvalue--)
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

### `initialize(address _strategy, address _multisigUser, address _fantasyLeague, address[] _tokens)` (external) <a name="financialmanagermock2-initialize-address-address-address-address---"></a>


### `depositBalance()` (external) <a name="financialmanagermock2-depositbalance--"></a>

*Description*: deposit whole balance of [USDC, USDT, DAI, MAI] from this contract to strategy

### `yield(address _underlying)` (external) <a name="financialmanagermock2-yield-address-"></a>

*Description*: Collect yield from strategy


#### Params
 - `_underlying`: token address

### `supplyRewardsForPlayoffAndMegaLeague()` (external) <a name="financialmanagermock2-supplyrewardsforplayoffandmegaleague--"></a>

*Description*: transfer playoffRewardAmount * division in playoffRewardToken to FantasyLeague and rest of deposit to MegaLeague

### `setPoolId(uint256 _poolId)` (external) <a name="financialmanagermock2-setpoolid-uint256-"></a>


### `setStrategy(address _strategy)` (external) <a name="financialmanagermock2-setstrategy-address-"></a>


### `setMultisigUser(address _multisigUser)` (external) <a name="financialmanagermock2-setmultisiguser-address-"></a>


### `setFantasyLeague(address _fantasyLeague)` (external) <a name="financialmanagermock2-setfantasyleague-address-"></a>


### `setMegaLeague(address _megaLeague)` (external) <a name="financialmanagermock2-setmegaleague-address-"></a>


### `setTokens(address[] _tokens)` (external) <a name="financialmanagermock2-settokens-address---"></a>


### `setRewardTokenAndAmount(uint256 _amount, address _token)` (external) <a name="financialmanagermock2-setrewardtokenandamount-uint256-address-"></a>


### `setLastWeekOfPlayoff(uint256 _lastWeekOfPlayoff)` (external) <a name="financialmanagermock2-setlastweekofplayoff-uint256-"></a>


### `setTreasury(address _address, uint256 _share)` (external) <a name="financialmanagermock2-settreasury-address-uint256-"></a>


### `getPlayoffRewardTokenNValue() → address token, uint256 amount` (external) <a name="financialmanagermock2-getplayoffrewardtokennvalue--"></a>

## Events <a name="events"></a>
### event `YieldCollected(address _token, uint256 _amount)` <a name="financialmanagermock2-yieldcollected-address-uint256-"></a>


### event `RewardsForPlayoffAreSupplied(uint256 _amount)` <a name="financialmanagermock2-rewardsforplayoffaresupplied-uint256-"></a>


### event `RewardsForMegaLeagueAreSupplied(uint256 _amount)` <a name="financialmanagermock2-rewardsformegaleaguearesupplied-uint256-"></a>


