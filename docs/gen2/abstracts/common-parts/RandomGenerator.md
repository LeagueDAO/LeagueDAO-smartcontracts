# RandomGenerator
*Random generator -- contract, which is common part of several contracts in `contracts/gen2/*`, provides the
random numbers.*

**Dev doc**: This contract includes the following functionality:
 - Sets the `NomoRNG` random generator contract which is connected with the Chainlink VRFv2.
 - Stores and updates the random number.

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract INomoRNG generator`
- `uint256 randNumber`

## Functions <a name="functions"></a>

### `init_RandomGenerator_unchained(address _generator)` (internal) <a name="randomgenerator-init_randomgenerator_unchained-address-"></a>


### `setRandomGenerator(address _generator)` (internal) <a name="randomgenerator-setrandomgenerator-address-"></a>


### `updateRandomNumber()` (internal) <a name="randomgenerator-updaterandomnumber--"></a>

## Events <a name="events"></a>
### event `RandomGeneratorSet(address _generator)` <a name="randomgenerator-randomgeneratorset-address-"></a>

**Dev doc**: Emitted when the interface address of the `NomoRNG` random generator contract (`generator`) is changed to an
address `_generator`.



#### Params
 - `_generator`: The address which is set by the current interface address of the random generator contract.

### event `RandNumberUpdated(uint256 _randomNumber)` <a name="randomgenerator-randnumberupdated-uint256-"></a>

**Dev doc**: Emitted when the random number (`randNumber`) has been updated to a number (`_randomNumber`).



#### Params
 - `_randomNumber`: The number which is set by the current random number (`randNumber`).

