# SafeERC20
*SafeERC20*

**Dev doc**: Wrappers around ERC20 operations that throw on failure (when the token
contract returns false). Tokens that return no value (and instead revert or
throw on failure) are also supported, non-reverting calls are assumed to be
successful.
To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
which allows you to call the safe operations as `token.safeTransfer(...)`, etc.

## Table of contents:
- [Functions:](#functions)


## Functions <a name="functions"></a>

### `safeTransfer(contract IERC20 token, address to, uint256 value)` (internal) <a name="safeerc20-safetransfer-contract-ierc20-address-uint256-"></a>


### `safeTransferFrom(contract IERC20 token, address from, address to, uint256 value)` (internal) <a name="safeerc20-safetransferfrom-contract-ierc20-address-address-uint256-"></a>


### `safeApprove(contract IERC20 token, address spender, uint256 value)` (internal) <a name="safeerc20-safeapprove-contract-ierc20-address-uint256-"></a>

**Dev doc**: Deprecated. This function has issues similar to the ones found in
{IERC20-approve}, and its usage is discouraged.

Whenever possible, use {safeIncreaseAllowance} and
{safeDecreaseAllowance} instead.

### `safeIncreaseAllowance(contract IERC20 token, address spender, uint256 value)` (internal) <a name="safeerc20-safeincreaseallowance-contract-ierc20-address-uint256-"></a>


### `safeDecreaseAllowance(contract IERC20 token, address spender, uint256 value)` (internal) <a name="safeerc20-safedecreaseallowance-contract-ierc20-address-uint256-"></a>

