# ImpulseStakingMulti
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize()` (public) ](#impulsestakingmulti-initialize--)
  - [`addPool(uint256 _pid, address _assetAddress, address[] _rewardsTokens, uint256[] _rewardsPerBlock, address _strategy)` (external) ](#impulsestakingmulti-addpool-uint256-address-address---uint256---address-)
  - [`addRewardToken(uint256 _pid, address _newRewardToken, uint256 _rewardsPerBlock, bool _withUpdate)` (external) ](#impulsestakingmulti-addrewardtoken-uint256-address-uint256-bool-)
  - [`updatePoolSettings(uint256 _pid, uint256[] _rewardsPerBlock, bool _withUpdate)` (external) ](#impulsestakingmulti-updatepoolsettings-uint256-uint256---bool-)
  - [`setOnPause(uint256 _pid, bool _paused)` (external) ](#impulsestakingmulti-setonpause-uint256-bool-)
  - [`setTreasury(address _treasury)` (external) ](#impulsestakingmulti-settreasury-address-)
  - [`setCommission(uint256 _pid, uint256 _commission)` (external) ](#impulsestakingmulti-setcommission-uint256-uint256-)
  - [`updatePool(uint256 _pid)` (public) ](#impulsestakingmulti-updatepool-uint256-)
  - [`depositInWant(uint256 _pid, uint256 _wantAmt)` (public) ](#impulsestakingmulti-depositinwant-uint256-uint256-)
  - [`depositInUnderlying(uint256 _pid, uint256[] _amounts)` (public) ](#impulsestakingmulti-depositinunderlying-uint256-uint256---)
  - [`withdrawInOneUnderlying(uint256 _pid, uint256 _wantAmt, address _underlying)` (public) ](#impulsestakingmulti-withdrawinoneunderlying-uint256-uint256-address-)
  - [`claimRewards(uint256 _pid)` (external) ](#impulsestakingmulti-claimrewards-uint256-)
  - [`rewardToken(uint256 _pid, uint256 _index) → address` (external) ](#impulsestakingmulti-rewardtoken-uint256-uint256-)
  - [`rewardTokenRate(uint256 _pid, uint256 _index) → uint256` (external) ](#impulsestakingmulti-rewardtokenrate-uint256-uint256-)
  - [`rewardTokens(uint256 _pid) → address[]` (external) ](#impulsestakingmulti-rewardtokens-uint256-)
  - [`rewardRates(uint256 _pid) → uint256[]` (external) ](#impulsestakingmulti-rewardrates-uint256-)
  - [`rewardTokensLength(uint256 _pid) → uint256` (external) ](#impulsestakingmulti-rewardtokenslength-uint256-)
  - [`pendingRewards(uint256 _pid, address _user) → uint256[] amounts` (external) ](#impulsestakingmulti-pendingrewards-uint256-address-)
  - [`poolExist(uint256 _pid) → bool` (public) ](#impulsestakingmulti-poolexist-uint256-)
  - [`userPoolAmount(uint256 _pid, address _user) → uint256` (public) ](#impulsestakingmulti-userpoolamount-uint256-address-)
  - [`userPoolAmountInUsd(uint256 _pid, address _user) → uint256` (public) ](#impulsestakingmulti-userpoolamountinusd-uint256-address-)
  - [`userPoolAmountInUnderlying(uint256 _pid, address _user) → uint256[]` (public) ](#impulsestakingmulti-userpoolamountinunderlying-uint256-address-)
  - [`yieldBalance(uint256 _pid, address _user) → uint256` (external) ](#impulsestakingmulti-yieldbalance-uint256-address-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `mapping(uint256 => struct ImpulseStakingMulti.PoolInfo) poolInfo`
- `mapping(uint256 => mapping(address => struct ImpulseStakingMulti.UserInfo)) userInfo`
- `address treasury`
- `mapping(uint256 => uint256) commission`
- `uint256 PERCENT_DIVIDER`

## Functions <a name="functions"></a>

### `initialize()` (public) <a name="impulsestakingmulti-initialize--"></a>


### `addPool(uint256 _pid, address _assetAddress, address[] _rewardsTokens, uint256[] _rewardsPerBlock, address _strategy)` (external) <a name="impulsestakingmulti-addpool-uint256-address-address---uint256---address-"></a>

*Description*: Add staking pool to the chief contract.


#### Params
 - `_pid`: New pool id.

 - `_assetAddress`: Staked tokens.

 - `_rewardsTokens`: Addresses of the reward tokens.

 - `_rewardsPerBlock`: Amount of rewards distributed to the pool every block.

### `addRewardToken(uint256 _pid, address _newRewardToken, uint256 _rewardsPerBlock, bool _withUpdate)` (external) <a name="impulsestakingmulti-addrewardtoken-uint256-address-uint256-bool-"></a>

*Description*: Add reward token to pool's rewards tokens.


#### Params
 - `_pid`: Id to which pool want to add new reward token.

 - `_rewardsPerBlock`: Amount of rewards distributed to the pool every block.

 - `_withUpdate`: Update current rewards before changing rewardsTokens of pool.

### `updatePoolSettings(uint256 _pid, uint256[] _rewardsPerBlock, bool _withUpdate)` (external) <a name="impulsestakingmulti-updatepoolsettings-uint256-uint256---bool-"></a>

*Description*: Update rewards distribution speed.


#### Params
 - `_pid`: New pool id.

 - `_rewardsPerBlock`: Amount of rewards distributed to the pool every block.

 - `_withUpdate`: Update current rewards before changing the coefficients.

### `setOnPause(uint256 _pid, bool _paused)` (external) <a name="impulsestakingmulti-setonpause-uint256-bool-"></a>

*Description*: Pauses/unpauses the pool.


#### Params
 - `_pid`: Pool's id.

 - `_paused`: True to pause, False to unpause.

### `setTreasury(address _treasury)` (external) <a name="impulsestakingmulti-settreasury-address-"></a>

*Description*: Admin method for set treasury address.


#### Params
 - `_treasury`: New treasury address.

### `setCommission(uint256 _pid, uint256 _commission)` (external) <a name="impulsestakingmulti-setcommission-uint256-uint256-"></a>

*Description*: Admin method for set treasury address.


#### Params
 - `_pid`: PID of the pool.

 - `_commission`: New commission, 0 - without commission.

### `updatePool(uint256 _pid)` (public) <a name="impulsestakingmulti-updatepool-uint256-"></a>

*Description*: Update reward variables of the given asset to be up-to-date.


#### Params
 - `_pid`: Pool's id.

### `depositInWant(uint256 _pid, uint256 _wantAmt)` (public) <a name="impulsestakingmulti-depositinwant-uint256-uint256-"></a>

*Description*: Deposit (stake) ASSET tokens


#### Params
 - `_pid`: Pool's id

 - `_wantAmt`: Amount to stake

### `depositInUnderlying(uint256 _pid, uint256[] _amounts)` (public) <a name="impulsestakingmulti-depositinunderlying-uint256-uint256---"></a>

*Description*: Deposit (stake) ASSET tokens.

**Dev doc**: Amounts must be in this order: USDC, USDT, DAI, MAI.

#### Params
 - `_pid`: Pool's id.

 - `_amounts`: Amounts in underlyings to stake.


### `withdrawInOneUnderlying(uint256 _pid, uint256 _wantAmt, address _underlying)` (public) <a name="impulsestakingmulti-withdrawinoneunderlying-uint256-uint256-address-"></a>

*Description*: Withdraw shares amount from staking protocol in one of the underlying tokens.


#### Params
 - `_pid`: PID of the pool.

 - `_wantAmt`: Amount of shares to withdraw.

 - `_underlying`: Token to withdraw in.

### `_withdrawFromStrategy(uint256 _pid, uint256 _wantAmt, address _underlying) → uint256 sharesAmount` (internal) <a name="impulsestakingmulti-_withdrawfromstrategy-uint256-uint256-address-"></a>


### `_transferCommission(uint256 _pid, address _underlying) → uint256 underlyingBalance, uint256 withdrawCommissions` (internal) <a name="impulsestakingmulti-_transfercommission-uint256-address-"></a>

*Description*: Internal function to calculate and withdraw the commission.


#### Params
 - `_pid`: PID of the pool.

 - `_underlying`: Token to calculate comission in.

#### Returns
 - underlyingBalance Initial amount of the token to calculate from.

 - withdrawCommissions Commission amount in the same token.

### `claimRewards(uint256 _pid)` (external) <a name="impulsestakingmulti-claimrewards-uint256-"></a>

*Description*: Update pool and claim pending rewards for the user.


#### Params
 - `_pid`: Pool's id.

### `_updateUserInfo(struct ImpulseStakingMulti.PoolInfo pool, struct ImpulseStakingMulti.UserInfo user, uint256 _tokenNum, uint256 _amount) → uint256 pending` (internal) <a name="impulsestakingmulti-_updateuserinfo-struct-impulsestakingmulti-poolinfo-struct-impulsestakingmulti-userinfo-uint256-uint256-"></a>

*Description*: Transfer pending rewards for the user.

**Dev doc**: Update user's info about rewards.

### `rewardToken(uint256 _pid, uint256 _index) → address` (external) <a name="impulsestakingmulti-rewardtoken-uint256-uint256-"></a>

*Description*: Getter for reward token address.


#### Params
 - `_pid`: Pool's id.

 - `_index`: Index of the reward token.

#### Returns
 - reward token address.

### `rewardTokenRate(uint256 _pid, uint256 _index) → uint256` (external) <a name="impulsestakingmulti-rewardtokenrate-uint256-uint256-"></a>

*Description*: Getter for reward token rate.


#### Params
 - `_pid`: Pool's id.

 - `_index`: Index of the reward token.

#### Returns
 - reward token rate.

### `rewardTokens(uint256 _pid) → address[]` (external) <a name="impulsestakingmulti-rewardtokens-uint256-"></a>

*Description*: Getter for reward tokens addresses.


#### Params
 - `_pid`: Pool's id.

#### Returns
 - reward token addresses.

### `rewardRates(uint256 _pid) → uint256[]` (external) <a name="impulsestakingmulti-rewardrates-uint256-"></a>

*Description*: Getter for reward token rates array.


#### Params
 - `_pid`: Pool's id.

#### Returns
 - reward token rates.

### `rewardTokensLength(uint256 _pid) → uint256` (external) <a name="impulsestakingmulti-rewardtokenslength-uint256-"></a>

*Description*: Getter for reward tokens count in pool.


#### Params
 - `_pid`: Pool's id.

#### Returns
 - reward tokens counts.

### `pendingRewards(uint256 _pid, address _user) → uint256[] amounts` (external) <a name="impulsestakingmulti-pendingrewards-uint256-address-"></a>

*Description*: View function to see pending DHVs on frontend.


#### Params
 - `_pid`: Pool's id

 - `_user`: Address to check

#### Returns
 - amounts Amounts of reward tokens available to claim

### `poolExist(uint256 _pid) → bool` (public) <a name="impulsestakingmulti-poolexist-uint256-"></a>

*Description*: Check if pool exists.


#### Params
 - `_pid`: Pool's id.

#### Returns
 - true if pool exists.

### `userPoolAmount(uint256 _pid, address _user) → uint256` (public) <a name="impulsestakingmulti-userpoolamount-uint256-address-"></a>

*Description*: Check the user's staked amount in the pool.


#### Params
 - `_pid`: Pool's id.

 - `_user`: Address to check.

#### Returns
 - Staked amount in all asset tokens.

### `userPoolAmountInUsd(uint256 _pid, address _user) → uint256` (public) <a name="impulsestakingmulti-userpoolamountinusd-uint256-address-"></a>

*Description*: Check the user's staked amount in the pool in usd.


#### Params
 - `_pid`: Pool's id.

 - `_user`: Address to check.

#### Returns
 - Staked amounts for each asset token in usd.

### `userPoolAmountInUnderlying(uint256 _pid, address _user) → uint256[]` (public) <a name="impulsestakingmulti-userpoolamountinunderlying-uint256-address-"></a>

*Description*: Check the user's staked amount in the pool in underlying.


#### Params
 - `_pid`: Pool's id.

 - `_user`: Address to check.

#### Returns
 - Staked amount.

### `yieldBalance(uint256 _pid, address _user) → uint256` (external) <a name="impulsestakingmulti-yieldbalance-uint256-address-"></a>

*Description*: Returns yield balance for the user in Cluster tokens.


#### Params
 - `_pid`: Cluster staking pool ID.

### `_claimRewards(uint256 _pid, address _user)` (internal) <a name="impulsestakingmulti-_claimrewards-uint256-address-"></a>

## Events <a name="events"></a>
### event `Withdraw(address user, uint256 poolId, uint256 amount, uint256 totalAmount)` <a name="impulsestakingmulti-withdraw-address-uint256-uint256-uint256-"></a>

*Description*: Shows withdraw in shares

### event `WithdrawUnderlying(address user, uint256 poolId, address underlying, uint256 amount)` <a name="impulsestakingmulti-withdrawunderlying-address-uint256-address-uint256-"></a>

*Description*: Shows withdraw in tokens

### event `Deposit(address user, uint256 poolId, uint256 amount)` <a name="impulsestakingmulti-deposit-address-uint256-uint256-"></a>


### event `ClaimRewards(address user, uint256 poolId, address[] tokens, uint256[] amounts)` <a name="impulsestakingmulti-claimrewards-address-uint256-address---uint256---"></a>


### event `UpdateCommission(uint256 pid, uint256 commission)` <a name="impulsestakingmulti-updatecommission-uint256-uint256-"></a>


