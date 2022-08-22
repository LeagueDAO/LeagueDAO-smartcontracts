# NomoPointsCalculator
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`constructor(contract INomoNFT _nft, uint256 _delay, uint256 _changesWindow)` (public) ](#nomopointscalculator-constructor-contract-inomonft-uint256-uint256-)
  - [`allowParametersSets(uint256 _setId)` (external) ](#nomopointscalculator-allowparameterssets-uint256-)
  - [`disallowParametersSets(uint256 _setId)` (external) ](#nomopointscalculator-disallowparameterssets-uint256-)
  - [`setMultiplier(string _name, int256 _multiplier)` (external) ](#nomopointscalculator-setmultiplier-string-int256-)
  - [`announceChanges()` (external) ](#nomopointscalculator-announcechanges--)
  - [`setDelay(uint256 _delay)` (external) ](#nomopointscalculator-setdelay-uint256-)
  - [`setChangesWindow(uint256 _changesWindow)` (external) ](#nomopointscalculator-setchangeswindow-uint256-)
  - [`setMultipliers(string[] _names, int256[] _multipliers)` (external) ](#nomopointscalculator-setmultipliers-string---int256---)
  - [`calculatePoints(uint256 _tokenId, uint256 _gameStartTime) → uint256 points` (external) ](#nomopointscalculator-calculatepoints-uint256-uint256-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract INomoNFT nft`
- `mapping(uint256 => bool) allowedParametersSets`
- `mapping(string => int256) multipliers`
- `int256 MULTIPLIERS_DIVIDER`
- `int256 parametersDivider`
- `uint256 delay`
- `uint256 changesWindow`
- `uint256 announceTimestamp`

## Functions <a name="functions"></a>

### `constructor(contract INomoNFT _nft, uint256 _delay, uint256 _changesWindow)` (public) <a name="nomopointscalculator-constructor-contract-inomonft-uint256-uint256-"></a>

**Dev doc**: Contract constructor


#### Params
 - `_nft`: Address of the NomoNFT

 - `_delay`: Delay in seconds

 - `_changesWindow`: Duration in seconds

### `allowParametersSets(uint256 _setId)` (external) <a name="nomopointscalculator-allowparameterssets-uint256-"></a>

*Description*: Allow parameters sets


#### Params
 - `_setId`: ID of the set

### `disallowParametersSets(uint256 _setId)` (external) <a name="nomopointscalculator-disallowparameterssets-uint256-"></a>

*Description*: Disallow parameters sets


#### Params
 - `_setId`: ID of the set

### `setMultiplier(string _name, int256 _multiplier)` (external) <a name="nomopointscalculator-setmultiplier-string-int256-"></a>

*Description*: Set multiplier


#### Params
 - `_name`: League name

 - `_multiplier`: Multiplier value

### `announceChanges()` (external) <a name="nomopointscalculator-announcechanges--"></a>

*Description*: Announce changes of params

### `setDelay(uint256 _delay)` (external) <a name="nomopointscalculator-setdelay-uint256-"></a>

*Description*: Set delay


#### Params
 - `_delay`: Delay in seconds

### `setChangesWindow(uint256 _changesWindow)` (external) <a name="nomopointscalculator-setchangeswindow-uint256-"></a>

*Description*: Set changes window, when it possible to update params


#### Params
 - `_changesWindow`: Duration in seconds

### `setMultipliers(string[] _names, int256[] _multipliers)` (external) <a name="nomopointscalculator-setmultipliers-string---int256---"></a>

*Description*: Set multipliers when possible


#### Params
 - `_names`: Array of names

 - `_multipliers`: Array of multipliers

### `calculatePoints(uint256 _tokenId, uint256 _gameStartTime) → uint256 points` (external) <a name="nomopointscalculator-calculatepoints-uint256-uint256-"></a>

*Description*: Calculate points by token ID and game start timestamp


#### Params
 - `_tokenId`: ID of the token

 - `_gameStartTime`: Timestamp when game was started

#### Returns
 - points Game points
## Events <a name="events"></a>
### event `ChangesAnnouncement()` <a name="nomopointscalculator-changesannouncement--"></a>

**Dev doc**: Start point of changes window

### event `ParametersChanged()` <a name="nomopointscalculator-parameterschanged--"></a>

**Dev doc**: When some of parameters was changed

### event `DelayChanged(uint256 newValue)` <a name="nomopointscalculator-delaychanged-uint256-"></a>

**Dev doc**: When delay was changed

### event `WindowChanged(uint256 newValue)` <a name="nomopointscalculator-windowchanged-uint256-"></a>

**Dev doc**: When changes window updated

