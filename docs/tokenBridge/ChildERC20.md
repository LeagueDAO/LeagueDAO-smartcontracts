# ChildERC20
*LeagueDAO Chield Token*

*Description*: Contract used to bridge Leag token form Ethereum network to Polygon

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`constructor(string _name, string _symbol, address _childChainManager)` (public) ](#childerc20-constructor-string-string-address-)
  - [`updateChildChainManager(address _newChildChainManager)` (external) ](#childerc20-updatechildchainmanager-address-)
  - [`deposit(address _user, bytes _depositData)` (external) ](#childerc20-deposit-address-bytes-)
  - [`withdraw(uint256 _amount)` (external) ](#childerc20-withdraw-uint256-)
  - [`snapshot() → uint256` (external) ](#childerc20-snapshot--)
  - [`getCurrentSnapshotId() → uint256` (external) ](#childerc20-getcurrentsnapshotid--)

## Variables <a name="variables"></a>
- `address childChainManager`
- `bytes32 DEPOSITOR_ROLE`

## Functions <a name="functions"></a>

### `constructor(string _name, string _symbol, address _childChainManager)` (public) <a name="childerc20-constructor-string-string-address-"></a>

*Description*: Constructor


#### Params
 - `_name`: Name of the token

 - `_symbol`: Symbol of the token

 - `_childChainManager`: Id of child chain manager

### `updateChildChainManager(address _newChildChainManager)` (external) <a name="childerc20-updatechildchainmanager-address-"></a>

*Description*: Update child chain manager


#### Params
 - `_newChildChainManager`: New child chain manager address

### `deposit(address _user, bytes _depositData)` (external) <a name="childerc20-deposit-address-bytes-"></a>

*Description*: Transfer tokens from Ethereum to Polygon network

**Dev doc**: Only polygon bridge contract can call this function

#### Params
 - `_user`: User address to recive tokens in polygon network

 - `_depositData`: Amount of tokens to recive in polygon network


### `withdraw(uint256 _amount)` (external) <a name="childerc20-withdraw-uint256-"></a>

*Description*: Transfer tokens from Polygon to Ethereum network

**Dev doc**: It is interaction with polygon bridge

#### Params
 - `_amount`: Amount of tokens to withdraw


### `snapshot() → uint256` (external) <a name="childerc20-snapshot--"></a>

*Description*: Take a snapshot of balances

#### Returns
 - Snapshot id

### `getCurrentSnapshotId() → uint256` (external) <a name="childerc20-getcurrentsnapshotid--"></a>

*Description*: Gets current shanpshot id

#### Returns
 - Snapshot id

### `_beforeTokenTransfer(address _from, address _to, uint256 _amount)` (internal) <a name="childerc20-_beforetokentransfer-address-address-uint256-"></a>

**Dev doc**: Method is overwritten to resolve inheritance issue
