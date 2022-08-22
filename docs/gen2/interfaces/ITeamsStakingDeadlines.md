# ITeamsStakingDeadlines
*Contract which stores staking deadlines for teams and binds CardImages to teams.*


## Table of contents:
- [Functions:](#functions)
  - [`cardImageToTeam(uint256 _cardImageId) → uint256 _teamId` (external) ](#iteamsstakingdeadlines-cardimagetoteam-uint256-)
  - [`teamDeadline(uint256 _teamId) → uint256 _deadline` (external) ](#iteamsstakingdeadlines-teamdeadline-uint256-)
  - [`teamName(uint256 _teamId) → string _name` (external) ](#iteamsstakingdeadlines-teamname-uint256-)
  - [`getCardImageTeamDeadline(uint256 _cardImageId) → uint256` (external) ](#iteamsstakingdeadlines-getcardimageteamdeadline-uint256-)
  - [`getCardImageTeamName(uint256 _cardImageId) → string` (external) ](#iteamsstakingdeadlines-getcardimageteamname-uint256-)


## Functions <a name="functions"></a>

### `cardImageToTeam(uint256 _cardImageId) → uint256 _teamId` (external) <a name="iteamsstakingdeadlines-cardimagetoteam-uint256-"></a>

*Description*: Get team id for a card image.


#### Params
 - `_cardImageId`: card image id.

#### Returns
 - _teamId team id

### `teamDeadline(uint256 _teamId) → uint256 _deadline` (external) <a name="iteamsstakingdeadlines-teamdeadline-uint256-"></a>

*Description*: Get staking deadline for a team.


#### Params
 - `_teamId`: team id.

#### Returns
 - _deadline staking deadline

### `teamName(uint256 _teamId) → string _name` (external) <a name="iteamsstakingdeadlines-teamname-uint256-"></a>

*Description*: Get team name for a team.


#### Params
 - `_teamId`: team id.

#### Returns
 - _name team name

### `getCardImageTeamDeadline(uint256 _cardImageId) → uint256` (external) <a name="iteamsstakingdeadlines-getcardimageteamdeadline-uint256-"></a>

*Description*: Get CardImage's team deadline.


#### Params
 - `_cardImageId`: Card image id.

#### Returns
 - Team deadline.

### `getCardImageTeamName(uint256 _cardImageId) → string` (external) <a name="iteamsstakingdeadlines-getcardimageteamname-uint256-"></a>

*Description*: Get CardImage's team name.


#### Params
 - `_cardImageId`: Card image id.

#### Returns
 - Team name.
