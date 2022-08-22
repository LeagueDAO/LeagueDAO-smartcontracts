# IGenesisNFTFarming
**

**Dev doc**: Required interface of an GenesisNFTFarming compliant contract

## Table of contents:
- [Functions:](#functions)
  - [`deadline() → uint256` (external) ](#igenesisnftfarming-deadline--)
  - [`extendDeadlineTo(uint256 newDeadline)` (external) ](#igenesisnftfarming-extenddeadlineto-uint256-)
  - [`dust() → uint256` (external) ](#igenesisnftfarming-dust--)
  - [`setDust(uint256 newDust)` (external) ](#igenesisnftfarming-setdust-uint256-)
  - [`initialize()` (external) ](#igenesisnftfarming-initialize--)
  - [`addReward(uint256 cardID, address token, uint256 value)` (external) ](#igenesisnftfarming-addreward-uint256-address-uint256-)
  - [`rewardValue(uint256 cardID, address token) → uint256 value` (external) ](#igenesisnftfarming-rewardvalue-uint256-address-)
  - [`rewards(uint256 cardID, address token) → uint256 value` (external) ](#igenesisnftfarming-rewards-uint256-address-)
  - [`withdrawRewards(uint256 tokenID)` (external) ](#igenesisnftfarming-withdrawrewards-uint256-)
  - [`withdrawReward(uint256 tokenID, address token)` (external) ](#igenesisnftfarming-withdrawreward-uint256-address-)
  - [`withdrawRewardsFor(uint256 tokenID, address recipient)` (external) ](#igenesisnftfarming-withdrawrewardsfor-uint256-address-)
  - [`withdrawRewardFor(uint256 tokenID, address recipient, address token)` (external) ](#igenesisnftfarming-withdrawrewardfor-uint256-address-address-)
  - [`withdrawBalances(address recipient)` (external) ](#igenesisnftfarming-withdrawbalances-address-)
  - [`withdrawBalance(address recipient, address token)` (external) ](#igenesisnftfarming-withdrawbalance-address-address-)
  - [`allowToken(address token)` (external) ](#igenesisnftfarming-allowtoken-address-)
  - [`disallowToken(address token)` (external) ](#igenesisnftfarming-disallowtoken-address-)
  - [`isAllowedToken(address token) → bool` (external) ](#igenesisnftfarming-isallowedtoken-address-)
  - [`getAllowedTokens() → address[] tokens` (external) ](#igenesisnftfarming-getallowedtokens--)
  - [`allowedTokens(uint256 index) → address token` (external) ](#igenesisnftfarming-allowedtokens-uint256-)


## Functions <a name="functions"></a>

### `deadline() → uint256` (external) <a name="igenesisnftfarming-deadline--"></a>


### `extendDeadlineTo(uint256 newDeadline)` (external) <a name="igenesisnftfarming-extenddeadlineto-uint256-"></a>


### `dust() → uint256` (external) <a name="igenesisnftfarming-dust--"></a>


### `setDust(uint256 newDust)` (external) <a name="igenesisnftfarming-setdust-uint256-"></a>


### `initialize()` (external) <a name="igenesisnftfarming-initialize--"></a>


### `addReward(uint256 cardID, address token, uint256 value)` (external) <a name="igenesisnftfarming-addreward-uint256-address-uint256-"></a>


### `rewardValue(uint256 cardID, address token) → uint256 value` (external) <a name="igenesisnftfarming-rewardvalue-uint256-address-"></a>


### `rewards(uint256 cardID, address token) → uint256 value` (external) <a name="igenesisnftfarming-rewards-uint256-address-"></a>


### `withdrawRewards(uint256 tokenID)` (external) <a name="igenesisnftfarming-withdrawrewards-uint256-"></a>


### `withdrawReward(uint256 tokenID, address token)` (external) <a name="igenesisnftfarming-withdrawreward-uint256-address-"></a>


### `withdrawRewardsFor(uint256 tokenID, address recipient)` (external) <a name="igenesisnftfarming-withdrawrewardsfor-uint256-address-"></a>


### `withdrawRewardFor(uint256 tokenID, address recipient, address token)` (external) <a name="igenesisnftfarming-withdrawrewardfor-uint256-address-address-"></a>


### `withdrawBalances(address recipient)` (external) <a name="igenesisnftfarming-withdrawbalances-address-"></a>


### `withdrawBalance(address recipient, address token)` (external) <a name="igenesisnftfarming-withdrawbalance-address-address-"></a>


### `allowToken(address token)` (external) <a name="igenesisnftfarming-allowtoken-address-"></a>


### `disallowToken(address token)` (external) <a name="igenesisnftfarming-disallowtoken-address-"></a>


### `isAllowedToken(address token) → bool` (external) <a name="igenesisnftfarming-isallowedtoken-address-"></a>


### `getAllowedTokens() → address[] tokens` (external) <a name="igenesisnftfarming-getallowedtokens--"></a>


### `allowedTokens(uint256 index) → address token` (external) <a name="igenesisnftfarming-allowedtokens-uint256-"></a>

