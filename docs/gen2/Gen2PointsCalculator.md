# Gen2PointsCalculator
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`constructor(contract INomoNFT _nft, contract IGen2PlayerToken _gen2PlayerToken, uint256 _delay, uint256 _changesWindow)` (public) ](#gen2pointscalculator-constructor-contract-inomonft-contract-igen2playertoken-uint256-uint256-)
  - [`allowParametersSets(uint256 _setId)` (external) ](#gen2pointscalculator-allowparameterssets-uint256-)
  - [`disallowParametersSets(uint256 _setId)` (external) ](#gen2pointscalculator-disallowparameterssets-uint256-)
  - [`setMultiplier(string _name, int256 _multiplier)` (external) ](#gen2pointscalculator-setmultiplier-string-int256-)
  - [`announceChanges()` (external) ](#gen2pointscalculator-announcechanges--)
  - [`setDelay(uint256 _delay)` (external) ](#gen2pointscalculator-setdelay-uint256-)
  - [`setChangesWindow(uint256 _changesWindow)` (external) ](#gen2pointscalculator-setchangeswindow-uint256-)
  - [`setMultipliers(string[] _names, int256[] _multipliers)` (external) ](#gen2pointscalculator-setmultipliers-string---int256---)
  - [`calculatePoints(uint256 _tokenId, uint256 _gameStartTime) → uint256 points` (external) ](#gen2pointscalculator-calculatepoints-uint256-uint256-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract INomoNFT nft`
- `contract IGen2PlayerToken gen2PlayerToken`
- `mapping(uint256 => bool) allowedParametersSets`
- `mapping(string => int256) multipliers`
- `int256 MULTIPLIERS_DIVIDER`
- `int256 parametersDivider`
- `uint256 delay`
- `uint256 changesWindow`
- `uint256 announceTimestamp`

## Functions <a name="functions"></a>

### `constructor(contract INomoNFT _nft, contract IGen2PlayerToken _gen2PlayerToken, uint256 _delay, uint256 _changesWindow)` (public) <a name="gen2pointscalculator-constructor-contract-inomonft-contract-igen2playertoken-uint256-uint256-"></a>

**Dev doc**: Contract constructor


#### Params
 - `_nft`: Address of the NomoNFT

 - `_delay`: Delay in seconds

 - `_changesWindow`: Duration in seconds

### `allowParametersSets(uint256 _setId)` (external) <a name="gen2pointscalculator-allowparameterssets-uint256-"></a>

*Description*: Allow parameters sets


#### Params
 - `_setId`: ID of the set

### `disallowParametersSets(uint256 _setId)` (external) <a name="gen2pointscalculator-disallowparameterssets-uint256-"></a>

*Description*: Disallow parameters sets


#### Params
 - `_setId`: ID of the set

### `setMultiplier(string _name, int256 _multiplier)` (external) <a name="gen2pointscalculator-setmultiplier-string-int256-"></a>

*Description*: Set multiplier


#### Params
 - `_name`: League name

 - `_multiplier`: Multiplier value

### `announceChanges()` (external) <a name="gen2pointscalculator-announcechanges--"></a>

*Description*: Announce changes of params

### `setDelay(uint256 _delay)` (external) <a name="gen2pointscalculator-setdelay-uint256-"></a>

*Description*: Set delay


#### Params
 - `_delay`: Delay in seconds

### `setChangesWindow(uint256 _changesWindow)` (external) <a name="gen2pointscalculator-setchangeswindow-uint256-"></a>

*Description*: Set changes window, when it possible to update params


#### Params
 - `_changesWindow`: Duration in seconds

### `setMultipliers(string[] _names, int256[] _multipliers)` (external) <a name="gen2pointscalculator-setmultipliers-string---int256---"></a>

*Description*: Set multipliers when possible


#### Params
 - `_names`: Array of names

 - `_multipliers`: Array of multipliers

### `calculatePoints(uint256 _tokenId, uint256 _gameStartTime) → uint256 points` (external) <a name="gen2pointscalculator-calculatepoints-uint256-uint256-"></a>

*Description*: Calculate points by token ID and game start timestamp


#### Params
 - `_tokenId`: ID of the token

 - `_gameStartTime`: Timestamp when game was started

#### Returns
 - points Game points
## Events <a name="events"></a>
### event `ChangesAnnouncement()` <a name="gen2pointscalculator-changesannouncement--"></a>

**Dev doc**: Start point of changes window

### event `ParametersChanged()` <a name="gen2pointscalculator-parameterschanged--"></a>

**Dev doc**: When some of parameters was changed

### event `DelayChanged(uint256 newValue)` <a name="gen2pointscalculator-delaychanged-uint256-"></a>

**Dev doc**: When delay was changed

### event `WindowChanged(uint256 newValue)` <a name="gen2pointscalculator-windowchanged-uint256-"></a>

**Dev doc**: When changes window updated

