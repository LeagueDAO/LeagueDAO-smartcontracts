# ERC165Upgradeable
**

**Dev doc**: Implementation of the {IERC165} interface.

Contracts that want to implement ERC165 should inherit from this contract and override {supportsInterface} to check
for the additional interface id that will be supported. For example:

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
    return interfaceId == type(MyInterface).interfaceId || super.supportsInterface(interfaceId);
}
```

Alternatively, {ERC165Storage} provides an easier to use but more expensive implementation.

## Table of contents:
- [Functions:](#functions)
  - [`supportsInterface(bytes4 interfaceId) → bool` (public) ](#erc165upgradeable-supportsinterface-bytes4-)


## Functions <a name="functions"></a>

### `__ERC165_init()` (internal) <a name="erc165upgradeable-__erc165_init--"></a>


### `__ERC165_init_unchained()` (internal) <a name="erc165upgradeable-__erc165_init_unchained--"></a>


### `supportsInterface(bytes4 interfaceId) → bool` (public) <a name="erc165upgradeable-supportsinterface-bytes4-"></a>

**Dev doc**: See {IERC165-supportsInterface}.
