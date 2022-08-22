# NomoRNG
*Nomo random number generator*


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`constructor(address _vrfCoordinator, bytes32 _keyHash, uint64 _subscriptionId)` (public) ](#nomorng-constructor-address-bytes32-uint64-)
  - [`requestRandomNumber() → uint256 _random` (external) ](#nomorng-requestrandomnumber--)
  - [`setRequester(address _requester, bool _isAllowed)` (external) ](#nomorng-setrequester-address-bool-)
  - [`generateRandom()` (external) ](#nomorng-generaterandom--)
- [Events:](#events)

## Variables <a name="variables"></a>
- `uint256 requestId`
- `uint256 randomNumber`
- `mapping(address => bool) requesters`

## Functions <a name="functions"></a>

### `constructor(address _vrfCoordinator, bytes32 _keyHash, uint64 _subscriptionId)` (public) <a name="nomorng-constructor-address-bytes32-uint64-"></a>


### `requestRandomNumber() → uint256 _random` (external) <a name="nomorng-requestrandomnumber--"></a>

*Description*: Send random to requester contract

**Dev doc**: After external contract gets a number, set random to zero

#### Returns
 - _random Random number

### `setRequester(address _requester, bool _isAllowed)` (external) <a name="nomorng-setrequester-address-bool-"></a>

*Description*: Set requester contract

### `generateRandom()` (external) <a name="nomorng-generaterandom--"></a>

*Description*: Generate random number

### `fulfillRandomWords(uint256 requestId, uint256[] randomWords)` (internal) <a name="nomorng-fulfillrandomwords-uint256-uint256---"></a>

*Description*: Callback function used by VRF Coordinator


#### Params
 - `requestId`: - id of the request

 - `randomWords`: - array of random results from VRF Coordinator
## Events <a name="events"></a>
### event `RandomGenerated(uint256 random)` <a name="nomorng-randomgenerated-uint256-"></a>

**Dev doc**: When random number generated

