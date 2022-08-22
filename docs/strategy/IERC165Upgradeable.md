# IERC165Upgradeable
**

**Dev doc**: Interface of the ERC165 standard, as defined in the
https://eips.ethereum.org/EIPS/eip-165[EIP].

Implementers can declare support of contract interfaces, which can then be
queried by others ({ERC165Checker}).

For an implementation, see {ERC165}.

## Table of contents:
- [Functions:](#functions)
  - [`supportsInterface(bytes4 interfaceId) → bool` (external) ](#ierc165upgradeable-supportsinterface-bytes4-)


## Functions <a name="functions"></a>

### `supportsInterface(bytes4 interfaceId) → bool` (external) <a name="ierc165upgradeable-supportsinterface-bytes4-"></a>

**Dev doc**: Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas.
