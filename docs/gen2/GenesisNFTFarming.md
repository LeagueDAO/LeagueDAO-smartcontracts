# GenesisNFTFarming
*Genesis NFT Farming -- Contract that provides rewards for Genesis Player NFT owners.*

*Description*: Rewards are awarded due to the use of player tokens by users during the draft for the Divisions and the
Genesis free agent purchase.

This contract includes the following functionality:
 - Adding of rewards in ERC20 tokens for users via Genesis NF token card ID before the deadline.
 - Withdrawal of their rewards by the users via Genesis NF token ID before the deadline.
 - Withdrawal of all the balances by the owner of this contract after the deadline.
 - ERC20 reward token whitelist functionality.


**Dev doc**: Warning. This contract is not intended for inheritance. In case of inheritance, it is recommended to change the
access of all storage variables from public to private in order to avoid violating the integrity of the storage. In
addition, you will need to add functions for them to get values.

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(address erc721_, uint256 deadline_)` (external) ](#genesisnftfarming-initialize-address-uint256-)
  - [`addReward(uint256 cardID, address token, uint256 value)` (external) ](#genesisnftfarming-addreward-uint256-address-uint256-)
  - [`withdrawRewards(uint256 tokenID)` (external) ](#genesisnftfarming-withdrawrewards-uint256-)
  - [`withdrawReward(uint256 tokenID, address token)` (external) ](#genesisnftfarming-withdrawreward-uint256-address-)
  - [`withdrawRewardsFor(uint256 tokenID, address recipient)` (external) ](#genesisnftfarming-withdrawrewardsfor-uint256-address-)
  - [`withdrawRewardFor(uint256 tokenID, address recipient, address token)` (external) ](#genesisnftfarming-withdrawrewardfor-uint256-address-address-)
  - [`withdrawBalances(address recipient)` (external) ](#genesisnftfarming-withdrawbalances-address-)
  - [`withdrawBalance(address recipient, address token)` (external) ](#genesisnftfarming-withdrawbalance-address-address-)
  - [`allowToken(address token)` (external) ](#genesisnftfarming-allowtoken-address-)
  - [`disallowToken(address token)` (external) ](#genesisnftfarming-disallowtoken-address-)
  - [`setDust(uint256 newDust)` (external) ](#genesisnftfarming-setdust-uint256-)
  - [`rewardValue(uint256 cardID, address token) → uint256` (external) ](#genesisnftfarming-rewardvalue-uint256-address-)
  - [`getAllowedTokens() → address[]` (external) ](#genesisnftfarming-getallowedtokens--)
  - [`extendDeadlineTo(uint256 newDeadline)` (public) ](#genesisnftfarming-extenddeadlineto-uint256-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `uint256 deadline`
- `uint256 dust`
- `contract IGenesisERC721 erc721`
- `mapping(uint256 => mapping(address => uint256)) rewards`
- `mapping(address => bool) isAllowedToken`
- `address[] allowedTokens`

## Functions <a name="functions"></a>

### `initialize(address erc721_, uint256 deadline_)` (external) <a name="genesisnftfarming-initialize-address-uint256-"></a>

**Dev doc**: Initializes the contract by setting the deployer as the initial owner, the dust, deadline and Genesis
ERC721 contract address values. It is used as the constructor for upgradeable contracts.



#### Params
 - `erc721_`: Address of the Genesis ERC721 contract.

 - `deadline_`: Time (in seconds) after which the user can no longer pick up rewards.

### `addReward(uint256 cardID, address token, uint256 value)` (external) <a name="genesisnftfarming-addreward-uint256-address-uint256-"></a>

**Dev doc**: Adds a reward for a Genesis NFT card ID.

Requirements:
- The token should be allowed.
- The Genesis NFT card ID should exist.
- The caller should approve `value` tokens of `token` for the contract.



#### Params
 - `cardID`: Identifier of a Genesis NFT card.

 - `token`: Address of an allowed ERC20 token in which the reward will be.

 - `value`: Amount of reward.

### `withdrawRewards(uint256 tokenID)` (external) <a name="genesisnftfarming-withdrawrewards-uint256-"></a>

**Dev doc**: Transfers rewards for `tokenID` to the caller.

Requirements:
- A user should call it before the deadline.
- The caller should be the owner of `tokenID`.



#### Params
 - `tokenID`: The Genesis NF token ID.

### `withdrawReward(uint256 tokenID, address token)` (external) <a name="genesisnftfarming-withdrawreward-uint256-address-"></a>

**Dev doc**: Transfers the reward in tokens of the specified `token` for `tokenID` to the caller.

Requirements:
- A user should call it before the deadline.
- `token` should be allowed.
- The caller should be the owner of `tokenID`.



#### Params
 - `tokenID`: The Genesis NF token ID.

 - `token`: Allowed ERC20 token that is desired for reward withdrawal.

### `withdrawRewardsFor(uint256 tokenID, address recipient)` (external) <a name="genesisnftfarming-withdrawrewardsfor-uint256-address-"></a>

**Dev doc**: Transfers rewards for `tokenID` to `recipient`.

Requirements:
- The caller should be the owner of this contract.
- `recipient` should be the owner of `tokenID`.



#### Params
 - `tokenID`: The Genesis NF token ID.

 - `recipient`: The owner of the `tokenID`.

### `withdrawRewardFor(uint256 tokenID, address recipient, address token)` (external) <a name="genesisnftfarming-withdrawrewardfor-uint256-address-address-"></a>

**Dev doc**: Transfers the reward in tokens of the specified `token` for `tokenID` to `recipient`.

Requirements:
- The caller should be the owner of this contract.
- `token` should be allowed.
- `recipient` should be the owner of `tokenID`.



#### Params
 - `tokenID`: The Genesis NF token ID.

 - `recipient`: The owner of the `tokenID`.

 - `token`: Allowed ERC20 token that is desired for reward withdrawal.

### `withdrawBalances(address recipient)` (external) <a name="genesisnftfarming-withdrawbalances-address-"></a>

**Dev doc**: Transfers all the reward token balances of the contract to `recipient`.

Requirements:
 - The caller should be the owner of this contract.
 - The deadline should be reached.



#### Params
 - `recipient`: Account to which balances are transferred.

Warning. This function, when called, violates the contract storage because it does not clear the mapping of
rewards. This is not implemented due to the absence of such a need. This function should be used only after all
interested users withdraw their rewards, and the use of the contract stops. It is still possible to restore
functionality by sending all tokens removed using this function or more to this contract.

### `withdrawBalance(address recipient, address token)` (external) <a name="genesisnftfarming-withdrawbalance-address-address-"></a>

**Dev doc**: Transfers the balance of the specified `token` to `recipient`. Owner can withdraw any token using this function after the deadline, so we can ensure that no tokens are locked in this contract.

Requirements:
 - The caller should be the owner of this contract.
 - The deadline should be reached.



#### Params
 - `recipient`: Account to which balances are transferred.

Warning. This function, when called, violates the contract storage. See `withdrawBalances()` description for
details.

### `allowToken(address token)` (external) <a name="genesisnftfarming-allowtoken-address-"></a>

**Dev doc**: Allows `token` for reward adding.

Requirements:
- The caller should be the owner of this contract.
- The token should be not allowed.



#### Params
 - `token`: Address of a ERC20 token.

### `disallowToken(address token)` (external) <a name="genesisnftfarming-disallowtoken-address-"></a>

**Dev doc**: Disallows `token`.

Requirements:
- The caller should be the owner of this contract.
- The token should be allowed.
- The balance of the token should be greater than the dust.



#### Params
 - `token`: Address of an allowed ERC20 token.

### `setDust(uint256 newDust)` (external) <a name="genesisnftfarming-setdust-uint256-"></a>

**Dev doc**: Sets the dust value to `newDust`.

Requirements:
- The caller should be the owner of this contract.
- `newDust` should be less than 1e17.



#### Params
 - `newDust`: The number of tokens in wei that are considered not significant.

### `rewardValue(uint256 cardID, address token) → uint256` (external) <a name="genesisnftfarming-rewardvalue-uint256-address-"></a>

**Dev doc**: Returns the reward value in tokens of the specified `token` for `cardID` if it is greater than the dust,
otherwise zero.



#### Params
 - `cardID`: Identifier of a Genesis NFT card.

 - `token`: Address of a ERC20 token.

### `getAllowedTokens() → address[]` (external) <a name="genesisnftfarming-getallowedtokens--"></a>


### `extendDeadlineTo(uint256 newDeadline)` (public) <a name="genesisnftfarming-extenddeadlineto-uint256-"></a>

**Dev doc**: Extends the deadline value to `newDeadline`.

Requirements:
- The caller should be the owner of this contract.
- `newDeadline` should be greater than the current block timestamp and less than or equal to
  (the_current_block_timestamp + 86400 * 28).
- `newDeadline` should be greater than the current deadline.



#### Params
 - `newDeadline`: The time in seconds after which the user can no longer pick up rewards.
## Events <a name="events"></a>
### event `RewardAdding(uint256 cardID, address token, uint256 value)` <a name="genesisnftfarming-rewardadding-uint256-address-uint256-"></a>

**Dev doc**: Emitted when `value` tokens of `token` are added to the reward for `cardID` and moved from the caller to
the contract.

### event `RewardWithdrawal(uint256 cardID, address recipient, address token, uint256 value)` <a name="genesisnftfarming-rewardwithdrawal-uint256-address-address-uint256-"></a>

**Dev doc**: Emitted when `value` tokens of `token` are withdrawn for `cardID` and moved from the contract to
`recipient`.

### event `BalanceWithdrawal(address recipient, address token, uint256 value)` <a name="genesisnftfarming-balancewithdrawal-address-address-uint256-"></a>

**Dev doc**: Emitted when `value` tokens of `token` are moved from the contract to `recipient`

### event `TokenAllowing(address token)` <a name="genesisnftfarming-tokenallowing-address-"></a>

**Dev doc**: Emitted when `token` is allowed

### event `TokenDisallowing(address token)` <a name="genesisnftfarming-tokendisallowing-address-"></a>

**Dev doc**: Emitted when `token` is disallowed

### event `DustSetting(uint256 dust)` <a name="genesisnftfarming-dustsetting-uint256-"></a>

**Dev doc**: Emitted when the dust is set to `dust`

### event `ERC721Setting(address erc721)` <a name="genesisnftfarming-erc721setting-address-"></a>

**Dev doc**: Emitted when the Genesis ERC721 contract is set to `erc721`

### event `DeadlineExtensionTo(uint256 deadline)` <a name="genesisnftfarming-deadlineextensionto-uint256-"></a>

**Dev doc**: Emitted when the deadline is extended to `deadline`

