# ImpulseQuickSwap3pool
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(address[] _underlyings, address[] _wantTokens, address[] _pools, address _rewardToken, address _router)` (public) ](#impulsequickswap3pool-initialize-address---address---address---address-address-)
  - [`adminWithdraw(address _token)` (external) ](#impulsequickswap3pool-adminwithdraw-address-)
  - [`setRouter(address _router)` (external) ](#impulsequickswap3pool-setrouter-address-)
  - [`setSlippage(uint256 _newSlippagePercent)` (external) ](#impulsequickswap3pool-setslippage-uint256-)
  - [`setRewardRoutes(address[] _path)` (external) ](#impulsequickswap3pool-setrewardroutes-address---)
  - [`setUnderlyingRoutes(address[] _path)` (external) ](#impulsequickswap3pool-setunderlyingroutes-address---)
  - [`depositInUnderlying(uint256[] _amounts) → uint256` (external) ](#impulsequickswap3pool-depositinunderlying-uint256---)
  - [`withdrawInOneUnderlying(uint256 _wantAmount, address _underlying) → uint256` (external) ](#impulsequickswap3pool-withdrawinoneunderlying-uint256-address-)
  - [`wantLockedTotal() → uint256` (external) ](#impulsequickswap3pool-wantlockedtotal--)
  - [`wantLockedTotalForEach() → uint256[]` (external) ](#impulsequickswap3pool-wantlockedtotalforeach--)
  - [`sharesTotal() → uint256` (external) ](#impulsequickswap3pool-sharestotal--)
  - [`listUnderlying() → address[]` (external) ](#impulsequickswap3pool-listunderlying--)
  - [`wantPriceInUsd(uint256[] _wantAmounts) → uint256` (external) ](#impulsequickswap3pool-wantpriceinusd-uint256---)
  - [`wantPriceInUnderlying(uint256 _wantAmt) → uint256[] wantPricesInUnderlying` (external) ](#impulsequickswap3pool-wantpriceinunderlying-uint256-)
  - [`earn()` (external) ](#impulsequickswap3pool-earn--)
- [Events:](#events)

## Variables <a name="variables"></a>
- `bytes32 STRATEGIST_ROLE`
- `bytes32 BACKEND_ROLE`
- `uint256 DUST`
- `uint256 SIX_DECIMAL_DUST`
- `uint256 wantTotal`
- `uint256[] wantTotalForEach`
- `uint256 totalSupplyShares`
- `uint256 slippagePercent`
- `contract IERC20[] underlyings`
- `contract IERC20[] wantTokens`
- `address[] pools`
- `contract IERC20 rewardToken`
- `contract IERC20 quickToken`
- `address router`
- `mapping(address => mapping(address => address[])) swapUnderlyingRoutes`
- `mapping(address => mapping(address => address[])) swapRewardRoutes`

## Functions <a name="functions"></a>

### `initialize(address[] _underlyings, address[] _wantTokens, address[] _pools, address _rewardToken, address _router)` (public) <a name="impulsequickswap3pool-initialize-address---address---address---address-address-"></a>


### `adminWithdraw(address _token)` (external) <a name="impulsequickswap3pool-adminwithdraw-address-"></a>

*Description*: Admin method for withdraw stuck tokens, except want.

### `setRouter(address _router)` (external) <a name="impulsequickswap3pool-setrouter-address-"></a>

*Description*: Sets router address.

**Dev doc**: Can only be called by admin.


#### Params
 - `_router`: Address of swap router.

### `setSlippage(uint256 _newSlippagePercent)` (external) <a name="impulsequickswap3pool-setslippage-uint256-"></a>


### `setRewardRoutes(address[] _path)` (external) <a name="impulsequickswap3pool-setrewardroutes-address---"></a>

*Description*: Add route for swapping reward tokens.


#### Params
 - `_path`: Full path for swap.

### `setUnderlyingRoutes(address[] _path)` (external) <a name="impulsequickswap3pool-setunderlyingroutes-address---"></a>

*Description*: Add route for swapping usd to underlying.


#### Params
 - `_path`: Full path for swap.

### `depositInUnderlying(uint256[] _amounts) → uint256` (external) <a name="impulsequickswap3pool-depositinunderlying-uint256---"></a>

*Description*: Deposit want (lp) tokens through underlyings.


#### Params
 - `_amounts`: Amounts in underlying to stake.

### `withdrawInOneUnderlying(uint256 _wantAmount, address _underlying) → uint256` (external) <a name="impulsequickswap3pool-withdrawinoneunderlying-uint256-address-"></a>

*Description*: Withdraw lp tokens in one of underlyings.


#### Params
 - `_wantAmount`: Amount of lp token to withdraw.

 - `_underlying`: Token to withdraw in.

### `wantLockedTotal() → uint256` (external) <a name="impulsequickswap3pool-wantlockedtotal--"></a>

**Dev doc**: Total want tokens managed by strategy.

### `wantLockedTotalForEach() → uint256[]` (external) <a name="impulsequickswap3pool-wantlockedtotalforeach--"></a>

**Dev doc**: Total want tokens managed by strategy.

### `sharesTotal() → uint256` (external) <a name="impulsequickswap3pool-sharestotal--"></a>

**Dev doc**: Sum of all users shares to wantLockedTotal.

### `listUnderlying() → address[]` (external) <a name="impulsequickswap3pool-listunderlying--"></a>

**Dev doc**: List underlyings managed by strategy.

### `wantPriceInUsd(uint256[] _wantAmounts) → uint256` (external) <a name="impulsequickswap3pool-wantpriceinusd-uint256---"></a>

*Description*: Calculate current price in usd for want (LP tokens of pair).


#### Params
 - `_wantAmounts`: Shares amounts.

#### Returns
 - wantPrices Price of shares in usd (with 18 decimals).

### `wantPriceInUnderlying(uint256 _wantAmt) → uint256[] wantPricesInUnderlying` (external) <a name="impulsequickswap3pool-wantpriceinunderlying-uint256-"></a>

**Dev doc**: Unsupported in this strategy.
Is unnecessary due because will return prices in dollars (due to the features of underlying tokens and want tokens).
But it is here for compatibility with other strategies (contracts).
Return empty array.

### `earn()` (external) <a name="impulsequickswap3pool-earn--"></a>

*Description*: Main want token compound function.

### `_deposit(uint256[] _wantAmounts) → uint256` (internal) <a name="impulsequickswap3pool-_deposit-uint256---"></a>

*Description*: Deposit want tokens to staking contract and calculate shares.


#### Params
 - `_wantAmounts`: Amounts in want (lp tokens) to stake.

#### Returns
 - Amount of shares.

### `_withdraw(uint256[] _wantAmounts, address _receiver)` (internal) <a name="impulsequickswap3pool-_withdraw-uint256---address-"></a>

*Description*: Withdraw lp tokens from staking contract.

**Dev doc**: Has additional checks before withdraw.

### `_depositLpToken(uint256[] _wantAmounts)` (internal) <a name="impulsequickswap3pool-_depositlptoken-uint256---"></a>

*Description*: Deposit want tokens to staking contract.


#### Params
 - `_wantAmounts`: Amounts of want tokens.

### `_withdrawLpToken(uint256[] _wantAmt)` (internal) <a name="impulsequickswap3pool-_withdrawlptoken-uint256---"></a>

*Description*: Withdraw want tokens from staking contract.


#### Params
 - `_wantAmt`: Amounts of want tokens.

### `_getRewards()` (internal) <a name="impulsequickswap3pool-_getrewards--"></a>

*Description*: Get rewards from staking contracts.

### `_validateToken(address _underlying) → bool` (internal) <a name="impulsequickswap3pool-_validatetoken-address-"></a>

*Description*: Check token presence in underlyings.

### `_rebalanceAmounts(uint256[] _amounts) → uint256[] rebalanceAmounts` (internal) <a name="impulsequickswap3pool-_rebalanceamounts-uint256---"></a>

*Description*: Rebalance underlyings amounts to get equal parts.


#### Params
 - `_amounts`: Amounts in underlyings to rebalance.

#### Returns
 - rebalanceAmounts Rebalanced by function amounts.

### `_getTokenDecimalsMultiplier(uint256 _underlyingIndex) → uint256` (internal) <a name="impulsequickswap3pool-_gettokendecimalsmultiplier-uint256-"></a>

*Description*: Get by how much to multiply the amount of tokens to get amount in wei.

**Dev doc**: For usdc and usdt tokens it's 10**12.
For mai and dai tokens it's 10**18.

### `_getTokenDecimals(uint256 _underlyingIndex) → uint256` (internal) <a name="impulsequickswap3pool-_gettokendecimals-uint256-"></a>

*Description*: Get token decimals.

**Dev doc**: For usdc and usdt tokens it's 10**6.
For mai and dai tokens it's 10**18.

### `_getTokenPoolMultiplier(uint256 _underlyingIndex) → uint256` (internal) <a name="impulsequickswap3pool-_gettokenpoolmultiplier-uint256-"></a>

**Dev doc**: For usdt and usdc pool multiplier is 2 because they participate in pools 2 times.

### `_calculateUnderlyingsTotal(uint256[] _amounts, address _usdToken, uint256 _usdIndex) → uint256 underlyingsTotal` (internal) <a name="impulsequickswap3pool-_calculateunderlyingstotal-uint256---address-uint256-"></a>

*Description*: Calculate total amount of underlyings.

#### Returns
 - underlyingsTotal Amount of underlyings calculated in usd token.

### `_calculateRebalanceDivider(address _usdToken, uint256 _usdIndex) → uint256 rebalanceDivider` (internal) <a name="impulsequickswap3pool-_calculaterebalancedivider-address-uint256-"></a>

**Dev doc**: In a simple case, we would divide the underlyingsTotal amount by 6, since we have 6 amounts to buy LP tokens,
but due to the difference in prices, we get the rate of 1 token to one usd token, sum up,
and get a proportionally calculated divider.

#### Returns
 - rebalanceDivider Proportionally calculated divider.

### `_getExcessAndMissingAmounts(address _usdToken, uint256[] _amounts, uint256 usdIndex) → uint256[] excessAmounts, uint256[] missingAmounts` (internal) <a name="impulsequickswap3pool-_getexcessandmissingamounts-address-uint256---uint256-"></a>

*Description*: Get excess and missing amounts of underlyings for swap.

**Dev doc**: We don't calculate these amounts for usd token, its amount is rebalanced after calculations.

### `_getTokenPriceInUsd(uint256 _tokenIndex, uint256 _tokenAmount, address _usdToken) → uint256` (internal) <a name="impulsequickswap3pool-_gettokenpriceinusd-uint256-uint256-address-"></a>

*Description*: Get token to usd token swap rate.

### `_swapAllWantToOneUnderlying(address _underlying, address _receiver)` (internal) <a name="impulsequickswap3pool-_swapallwanttooneunderlying-address-address-"></a>

*Description*: Swap all want tokens to one underlying.

### `_swapTokens(address[] path, uint256 _amount, uint256 slippageTolerance)` (internal) <a name="impulsequickswap3pool-_swaptokens-address---uint256-uint256-"></a>


### `_swapTokensForExact(address[] path, uint256 _amount, uint256 slippageTolerance)` (internal) <a name="impulsequickswap3pool-_swaptokensforexact-address---uint256-uint256-"></a>


### `_swapRewardsToUnderlyings(uint256 _rewardAmount)` (internal) <a name="impulsequickswap3pool-_swaprewardstounderlyings-uint256-"></a>

*Description*: Swap reward tokens to underlyings.


#### Params
 - `_rewardAmount`: Quick reward amount.

### `_swapUnderlyingsToUSDToken(uint256[] _excessAmounts, address usdToken)` (internal) <a name="impulsequickswap3pool-_swapunderlyingstousdtoken-uint256---address-"></a>

*Description*: Swap excess amounts of underlying tokens to one usd token.

### `_swapUSDTokenToUnderlyings(uint256[] _missingAmounts, address usdToken)` (internal) <a name="impulsequickswap3pool-_swapusdtokentounderlyings-uint256---address-"></a>

*Description*: Buy missing amounts of underlying tokens for one usd token.

### `_swapAllUnderlyingsToWant(uint256[] _amounts) → uint256[]` (internal) <a name="impulsequickswap3pool-_swapallunderlyingstowant-uint256---"></a>

*Description*: Swap all underlying tokens to want tokens.

#### Returns
 - Want received amounts.
## Events <a name="events"></a>
### event `Deposit(uint256[] amounts, uint256 shares, uint256 wantTotal, uint256 sharesTotal)` <a name="impulsequickswap3pool-deposit-uint256---uint256-uint256-uint256-"></a>


### event `Withdraw(uint256 amount, uint256 shares, uint256 wantTotal, uint256 sharesTotal)` <a name="impulsequickswap3pool-withdraw-uint256-uint256-uint256-uint256-"></a>


### event `Earning(uint256[] earned, uint256 wantTotal, uint256 sharesTotal)` <a name="impulsequickswap3pool-earning-uint256---uint256-uint256-"></a>


### event `AdminWithdraw(address token, uint256 amount)` <a name="impulsequickswap3pool-adminwithdraw-address-uint256-"></a>


