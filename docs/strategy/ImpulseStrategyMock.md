# ImpulseStrategyMock
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`constructor(address[4] _underlyings)` (public) ](#impulsestrategymock-constructor-address-4--)
  - [`depositInUnderlying(uint256 _pid, uint256[] _amounts)` (public) ](#impulsestrategymock-depositinunderlying-uint256-uint256---)
  - [`withdrawInOneUnderlying(uint256 _pid, uint256 _wantAmt, address _underlying)` (public) ](#impulsestrategymock-withdrawinoneunderlying-uint256-uint256-address-)
  - [`earn(uint256 _amount)` (public) ](#impulsestrategymock-earn-uint256-)
  - [`userPoolAmount(uint256 _pid, address _user) → uint256` (public) ](#impulsestrategymock-userpoolamount-uint256-address-)
  - [`yieldBalance(uint256 _pid, address _user) → uint256` (external) ](#impulsestrategymock-yieldbalance-uint256-address-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `uint256 wantTotal`
- `uint256 totalSupplyShares`
- `address[4] underlyings`
- `mapping(uint256 => mapping(address => struct ImpulseStrategyMock.UserInfo)) userInfo`

## Functions <a name="functions"></a>

### `constructor(address[4] _underlyings)` (public) <a name="impulsestrategymock-constructor-address-4--"></a>


### `depositInUnderlying(uint256 _pid, uint256[] _amounts)` (public) <a name="impulsestrategymock-depositinunderlying-uint256-uint256---"></a>


### `withdrawInOneUnderlying(uint256 _pid, uint256 _wantAmt, address _underlying)` (public) <a name="impulsestrategymock-withdrawinoneunderlying-uint256-uint256-address-"></a>


### `earn(uint256 _amount)` (public) <a name="impulsestrategymock-earn-uint256-"></a>


### `userPoolAmount(uint256 _pid, address _user) → uint256` (public) <a name="impulsestrategymock-userpoolamount-uint256-address-"></a>


### `yieldBalance(uint256 _pid, address _user) → uint256` (external) <a name="impulsestrategymock-yieldbalance-uint256-address-"></a>

## Events <a name="events"></a>
### event `Deposit(address user, uint256 poolId, uint256 amount)` <a name="impulsestrategymock-deposit-address-uint256-uint256-"></a>


