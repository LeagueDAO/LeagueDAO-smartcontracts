# IERC20
**

**Dev doc**: Interface of the ERC20 standard as defined in the EIP.

## Table of contents:
- [Functions:](#functions)
  - [`totalSupply() → uint256` (external) ](#ierc20-totalsupply--)
  - [`balanceOf(address account) → uint256` (external) ](#ierc20-balanceof-address-)
  - [`transfer(address recipient, uint256 amount) → bool` (external) ](#ierc20-transfer-address-uint256-)
  - [`allowance(address owner, address spender) → uint256` (external) ](#ierc20-allowance-address-address-)
  - [`approve(address spender, uint256 amount) → bool` (external) ](#ierc20-approve-address-uint256-)
  - [`transferFrom(address sender, address recipient, uint256 amount) → bool` (external) ](#ierc20-transferfrom-address-address-uint256-)
- [Events:](#events)


## Functions <a name="functions"></a>

### `totalSupply() → uint256` (external) <a name="ierc20-totalsupply--"></a>

**Dev doc**: Returns the amount of tokens in existence.

### `balanceOf(address account) → uint256` (external) <a name="ierc20-balanceof-address-"></a>

**Dev doc**: Returns the amount of tokens owned by `account`.

### `transfer(address recipient, uint256 amount) → bool` (external) <a name="ierc20-transfer-address-uint256-"></a>

**Dev doc**: Moves `amount` tokens from the caller's account to `recipient`.

Returns a boolean value indicating whether the operation succeeded.

Emits a {Transfer} event.

### `allowance(address owner, address spender) → uint256` (external) <a name="ierc20-allowance-address-address-"></a>

**Dev doc**: Returns the remaining number of tokens that `spender` will be
allowed to spend on behalf of `owner` through {transferFrom}. This is
zero by default.

This value changes when {approve} or {transferFrom} are called.

### `approve(address spender, uint256 amount) → bool` (external) <a name="ierc20-approve-address-uint256-"></a>

**Dev doc**: Sets `amount` as the allowance of `spender` over the caller's tokens.

Returns a boolean value indicating whether the operation succeeded.

IMPORTANT: Beware that changing an allowance with this method brings the risk
that someone may use both the old and the new allowance by unfortunate
transaction ordering. One possible solution to mitigate this race
condition is to first reduce the spender's allowance to 0 and set the
desired value afterwards:
https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729

Emits an {Approval} event.

### `transferFrom(address sender, address recipient, uint256 amount) → bool` (external) <a name="ierc20-transferfrom-address-address-uint256-"></a>

**Dev doc**: Moves `amount` tokens from `sender` to `recipient` using the
allowance mechanism. `amount` is then deducted from the caller's
allowance.

Returns a boolean value indicating whether the operation succeeded.

Emits a {Transfer} event.
## Events <a name="events"></a>
### event `Transfer(address from, address to, uint256 value)` <a name="ierc20-transfer-address-address-uint256-"></a>

**Dev doc**: Emitted when `value` tokens are moved from one account (`from`) to
another (`to`).

Note that `value` may be zero.

### event `Approval(address owner, address spender, uint256 value)` <a name="ierc20-approval-address-address-uint256-"></a>

**Dev doc**: Emitted when the allowance of a `spender` for an `owner` is set by
a call to {approve}. `value` is the new allowance.

