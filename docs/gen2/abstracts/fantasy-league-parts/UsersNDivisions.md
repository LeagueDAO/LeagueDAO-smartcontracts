# UsersNDivisions
*Users and divisions -- contract, which is part of the Fantasy League contract (`FantasyLeague.sol`), provides
storing of all users and assigment of them to divisions.*

*Description*: This contract connects `GameProgress.sol`, `ILeaguePassNFT.sol`, `ITeamManager.sol`, `RandomGenerator.sol`
and OpenZeppelin `AccessControlUpgradeable.sol` to the Fantasy League contract.

Assigment of users to divisions is implemented by shuffling the user array randomly using `RandomGenerator.sol`
which is linked to `NomoRNG.sol`. Storing of divisions is implemented by offset in the user array.


**Dev doc**: This contract includes the following functionality:
 - Sets the entry pass and team manager contracts (`LeaguePassNFT.sol` and `TeamManager.sol`).
 - Adds and stores all users.
 - Sets the `RandonGenerator` contract and updates the random number.
 - Shuffles users to assign them to divisions.
 - Gives divisions, user division IDs and the number of users and divisions.

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`setLeaguePassNFT(address _leaguePassNFT)` (external) ](#usersndivisions-setleaguepassnft-address-)
  - [`addUser(address _user)` (external) ](#usersndivisions-adduser-address-)
  - [`setRandGenerator(address _generator)` (external) ](#usersndivisions-setrandgenerator-address-)
  - [`updateRandNum()` (external) ](#usersndivisions-updaterandnum--)
  - [`setTeamManager(address _teamManager)` (external) ](#usersndivisions-setteammanager-address-)
  - [`shuffleUsers(uint256 _numberToShuffle)` (external) ](#usersndivisions-shuffleusers-uint256-)
  - [`getUserDivisionId(uint256 _season, address _user) → uint256` (external) ](#usersndivisions-getuserdivisionid-uint256-address-)
  - [`getDivisionUsers(uint256 _season, uint256 _divisionId) → address[] division` (external) ](#usersndivisions-getdivisionusers-uint256-uint256-)
  - [`getNumberOfUsers() → uint256` (public) ](#usersndivisions-getnumberofusers--)
  - [`getNumberOfDivisions() → uint256` (public) ](#usersndivisions-getnumberofdivisions--)
- [Events:](#events)

## Variables <a name="variables"></a>
- `uint256 DIVISION_SIZE`
- `contract ILeaguePassNFT leaguePassNFT`
- `mapping(uint256 => address[]) users`
- `mapping(uint256 => mapping(address => bool)) isUser`
- `contract ITeamManager teamManager`
- `uint256 shuffledUserNum`

## Functions <a name="functions"></a>

### `init_UsersNDivisions_unchained(address _generator)` (internal) <a name="usersndivisions-init_usersndivisions_unchained-address-"></a>


### `setLeaguePassNFT(address _leaguePassNFT)` (external) <a name="usersndivisions-setleaguepassnft-address-"></a>

**Dev doc**: Sets the entry pass contract (`leaguePassNFT`) as `_leaguePassNFT`, syncs the current season ID of
the passed entry pass with that in this contract.

Requirements:
 - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
 - An entry pass address (`_leaguePassNFT`) should not equal to the zero address.



#### Params
 - `_leaguePassNFT`: An address of the LeagueDAO entry pass contract -- `LeaguePassNFT` that adds users to this
contract.

### `addUser(address _user)` (external) <a name="usersndivisions-adduser-address-"></a>

**Dev doc**: Adds a new user to the game (to this contract) in the current season `seasonId`.

Requirements:
 - The caller should be the entry pass contract (`leaguePassNFT`).
 - A user address (`_user`) should not equal to the zero address.
 - This function should only be called in the game stage of user adding (`GameStage.UserAdding`). (This is the
   first stage in which the Fantasy League (`FantasyLeague`) stays at the start of the season).
 - A user address (`_user`) should not already have been added.



#### Params
 - `_user`: An address of a user.

### `setRandGenerator(address _generator)` (external) <a name="usersndivisions-setrandgenerator-address-"></a>

**Dev doc**: Sets the random number generator contract (`generator`) as `_generator`. (`NomoRNG` is the random generator
contract).

Requirements:
 - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
 - A random generator address (`_generator`) should not equal to the zero address.



#### Params
 - `_generator`: An address of the random generator that updates the random number (`randNumber`).

### `updateRandNum()` (external) <a name="usersndivisions-updaterandnum--"></a>

*Description*: Firstly, need to generate the random number on the `NomoRNG` contract.
**Dev doc**: Updates the random number (`randNumber`) via Chainlink VRFv2.

Requirements:
 - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
 - The random generator address (`generator`) should not equal to the zero address.



### `setTeamManager(address _teamManager)` (external) <a name="usersndivisions-setteammanager-address-"></a>

**Dev doc**: Sets the team manager contract (`teamManager`) as `_teamManager`, syncs the current season ID of the passed
team manager with that in this contract.

Requirements:
 - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
 - A team manager address (`_teamManager`) should not equal to the zero address.



#### Params
 - `_teamManager`:   An address of the Team Manager contract (`TeamManager`) that calculates scores and stakes
user players.

### `shuffleUsers(uint256 _numberToShuffle)` (external) <a name="usersndivisions-shuffleusers-uint256-"></a>

**Dev doc**: This function does the following:
 - Shuffles the array of all users to randomly divides users into divisions of 12 users.
 - Sets a user division ID in this and `TeamManager` contracts (`teamManager`).
 - Moves the game stage to the stage of waiting of the next game function (`GameStage.WaitingNextGame`) when the
   shuffling is completed.

Requirements:
 - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
 - The random number (`randNumber`) should not equal to the zero.
 - The number of users to shuffle (`_numberToShuffle`) should not equal to the zero.
 - After the first call of this function (see below the `_numberToShuffle` param description), it should only be
   called in the game stage of user shuffle (`GameStage.UserShuffle`).
 - The team manager contract (`teamManager`) should be set.



#### Params
 - `_numberToShuffle`: A number of users to shuffle. It allows you to split the function call into multiple
transactions to avoid reaching the gas cost limit. Each time the function is called, this number can be anything
greater than zero. When the process of shuffle is completed, the `FantasyLeague` moves on to the next stage
(`GameStage.WaitingNextGame`).

### `getUserDivisionId(uint256 _season, address _user) → uint256` (external) <a name="usersndivisions-getuserdivisionid-uint256-address-"></a>

**Dev doc**: Returns a division ID of a user (`_user`) in a season (`_season`).

Requirements:
 - A user (`_user`) should be added in a season (`_season`).


#### Returns
 - A user division ID.

### `getDivisionUsers(uint256 _season, uint256 _divisionId) → address[] division` (external) <a name="usersndivisions-getdivisionusers-uint256-uint256-"></a>

**Dev doc**: Returns a division of 12 users by the specified division ID (`_divisionId`) and season (`_season`).


#### Returns
 - division   A division -- an array of 12 users.

### `getNumberOfUsers() → uint256` (public) <a name="usersndivisions-getnumberofusers--"></a>

**Dev doc**: Returns the number of users who is added (joined) to the Fantasy League.


#### Returns
 - The number of users who is added (joined) to the Fantasy League.

### `getNumberOfDivisions() → uint256` (public) <a name="usersndivisions-getnumberofdivisions--"></a>

**Dev doc**: Returns the total number of divisions in the Fantasy League.


#### Returns
 - The total number of divisions.
## Events <a name="events"></a>
### event `LeaguePassNFTSet(address _leaguePassNFT)` <a name="usersndivisions-leaguepassnftset-address-"></a>

**Dev doc**: Emitted when the interface address of the entry pass contract (`leaguePassNFT`) is changed to an address
`_leaguePassNFT`.



#### Params
 - `_leaguePassNFT`: The address which is set by the current interface address of the entry pass contract.

### event `TeamManagerSet(address _teamManager)` <a name="usersndivisions-teammanagerset-address-"></a>

**Dev doc**: Emitted when the interface address of the team manager contract (`teamManager`) is changed to an address
`_teamManager`.



#### Params
 - `_teamManager`: The address which is set by the current interface address of the team manager contract.

### event `UserAdded(uint256 _seasonId, address _user)` <a name="usersndivisions-useradded-uint256-address-"></a>

**Dev doc**: Emitted when a new user (`_user`) is added (joined) to the game (the Fantasy League) in the specified season
(`_seasonId`).



#### Params
 - `_seasonId`: The season in which the user was added.

 - `_user`: An added user.

