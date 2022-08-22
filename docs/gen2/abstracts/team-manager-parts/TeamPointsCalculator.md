# TeamPointsCalculator
**

*Description*: @title

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`setCalculator(address _calculator)` (external) ](#teampointscalculator-setcalculator-address-)
  - [`setCurrentGameStartTime(uint256 _timestamp)` (external) ](#teampointscalculator-setcurrentgamestarttime-uint256-)
  - [`calcTeamScoreForTwoUsers(address _firstUser, address _secondUser) → uint256, uint256` (external) ](#teampointscalculator-calcteamscorefortwousers-address-address-)
  - [`calculateUserTeamScore(address _user) → uint256 teamScore` (public) ](#teampointscalculator-calculateuserteamscore-address-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract INomoCalculator calculator`
- `uint256 currentGameStartTime`

## Functions <a name="functions"></a>

### `init_TeamPointsCalculator_unchained(address _calculator)` (internal) <a name="teampointscalculator-init_teampointscalculator_unchained-address-"></a>


### `setCalculator(address _calculator)` (external) <a name="teampointscalculator-setcalculator-address-"></a>

**Dev doc**: Sets the calculator of a player points.



#### Params
 - `_calculator`:   A new calculator address.

### `setCurrentGameStartTime(uint256 _timestamp)` (external) <a name="teampointscalculator-setcurrentgamestarttime-uint256-"></a>

**Dev doc**: Sets the timestamp when the current week (of the competitions on the Fantasy League contract) has started.



#### Params
 - `_timestamp`:   A new timestamp.

### `calcTeamScoreForTwoUsers(address _firstUser, address _secondUser) → uint256, uint256` (external) <a name="teampointscalculator-calcteamscorefortwousers-address-address-"></a>

**Dev doc**: Calculates current scores of `_firstUser`'s team and `_secondUser`'s team.



#### Params
 - `_firstUser`:   A first user address.

 - `_secondUser`:   A second user address.

#### Returns
 - Two numbers that represent the current scores of the first and second user teams.

### `calculateUserTeamScore(address _user) → uint256 teamScore` (public) <a name="teampointscalculator-calculateuserteamscore-address-"></a>

**Dev doc**: Calculates a current score of the `_user`'s team.



#### Params
 - `_user`:   A user address.

#### Returns
 - teamScore   Current score of the `_user`'s team.
## Events <a name="events"></a>
### event `CalculatorSet(address _calculator)` <a name="teampointscalculator-calculatorset-address-"></a>


### event `CurrentGameStartTimeSet(uint256 _timestamp)` <a name="teampointscalculator-currentgamestarttimeset-uint256-"></a>


