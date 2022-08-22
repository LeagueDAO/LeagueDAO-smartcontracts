# dLEAGCopy
**

**Dev doc**: {ERC20PresetMinterPauserUpgradeable} token whose ownership and minting capabilities are transferred to a specified owner.
{ERC20PermitUpgradeable} enables permit based interactions


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initializeToken(string name, string symbol)` (public) ](#dleagcopy-initializetoken-string-string-)
  - [`setMinterRole(address minter)` (external) ](#dleagcopy-setminterrole-address-)
  - [`setWhitelisted(address _whitelisted, bool _isWhitelisted)` (external) ](#dleagcopy-setwhitelisted-address-bool-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `mapping(address => bool) whitelisted`

## Functions <a name="functions"></a>

### `initializeToken(string name, string symbol)` (public) <a name="dleagcopy-initializetoken-string-string-"></a>

**Dev doc**: Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, `PAUSER_ROLE` to the caller.

### `setMinterRole(address minter)` (external) <a name="dleagcopy-setminterrole-address-"></a>


### `setWhitelisted(address _whitelisted, bool _isWhitelisted)` (external) <a name="dleagcopy-setwhitelisted-address-bool-"></a>


### `_beforeTokenTransfer(address from, address to, uint256 amount)` (internal) <a name="dleagcopy-_beforetokentransfer-address-address-uint256-"></a>


### `_authorizeUpgrade(address newImplementation)` (internal) <a name="dleagcopy-_authorizeupgrade-address-"></a>

## Events <a name="events"></a>
### event `WhiteListedSet(address whitelisted, bool isWhitelisted)` <a name="dleagcopy-whitelistedset-address-bool-"></a>


