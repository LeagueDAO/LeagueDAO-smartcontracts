# TeamsStakingDeadlines
*Contract which stores staking deadlines for teams and binds CardImages to teams.*

*Description*: There are two separate functionalities in this contract: deadlines and teams names. You don't need to set teams names for deadlines to work and vice versa.

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(contract INomoNFT _nomoNFT)` (external) ](#teamsstakingdeadlines-initialize-contract-inomonft-)
  - [`setCardImageToTeam(uint256 _cardImageId, uint256 _teamId)` (public) ](#teamsstakingdeadlines-setcardimagetoteam-uint256-uint256-)
  - [`setCardImagesToTeam(uint256[] _cardImageIds, uint256 _teamId)` (external) ](#teamsstakingdeadlines-setcardimagestoteam-uint256---uint256-)
  - [`setTeamDeadline(uint256 _teamId, uint256 _deadline)` (public) ](#teamsstakingdeadlines-setteamdeadline-uint256-uint256-)
  - [`setTeamsDeadlines(uint256[] _teamIds, uint256[] _deadlines)` (external) ](#teamsstakingdeadlines-setteamsdeadlines-uint256---uint256---)
  - [`setTeamName(uint256 _teamId, string _name)` (public) ](#teamsstakingdeadlines-setteamname-uint256-string-)
  - [`setTeamsNames(uint256[] _teamIds, string[] _names)` (external) ](#teamsstakingdeadlines-setteamsnames-uint256---string---)
  - [`getCardImageTeamDeadline(uint256 _cardImageId) → uint256` (external) ](#teamsstakingdeadlines-getcardimageteamdeadline-uint256-)
  - [`getCardImageTeamName(uint256 _cardImageId) → string` (external) ](#teamsstakingdeadlines-getcardimageteamname-uint256-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract INomoNFT nomoNFT`
- `mapping(uint256 => uint256) cardImageToTeam`
- `mapping(uint256 => uint256) teamDeadline`
- `mapping(uint256 => string) teamName`

## Functions <a name="functions"></a>

### `initialize(contract INomoNFT _nomoNFT)` (external) <a name="teamsstakingdeadlines-initialize-contract-inomonft-"></a>

*Description*: Initializer for the contract.


#### Params
 - `_nomoNFT`: NomoNFT contract

### `setCardImageToTeam(uint256 _cardImageId, uint256 _teamId)` (public) <a name="teamsstakingdeadlines-setcardimagetoteam-uint256-uint256-"></a>

*Description*: Set cardImage's team id. Only owner (back-end) can call this function. Team id can't be 0.


#### Params
 - `_cardImageId`: card image id

 - `_teamId`: team id

### `setCardImagesToTeam(uint256[] _cardImageIds, uint256 _teamId)` (external) <a name="teamsstakingdeadlines-setcardimagestoteam-uint256---uint256-"></a>

*Description*: Set array of cardImages to team id. Only owner (back-end) can call this function. Team id can't be 0.


#### Params
 - `_cardImageIds`: array of card image ids

 - `_teamId`: team id

### `setTeamDeadline(uint256 _teamId, uint256 _deadline)` (public) <a name="teamsstakingdeadlines-setteamdeadline-uint256-uint256-"></a>

*Description*: Set staking deadline for a team. Only owner (back-end) can call this function.


#### Params
 - `_teamId`: Team id.

 - `_deadline`: Staking deadline.

### `setTeamsDeadlines(uint256[] _teamIds, uint256[] _deadlines)` (external) <a name="teamsstakingdeadlines-setteamsdeadlines-uint256---uint256---"></a>

*Description*: Set staking deadline for several teams. Only owner (back-end) can call this function.


#### Params
 - `_teamIds`: Team ids.

 - `_deadlines`: Staking deadlines.

### `setTeamName(uint256 _teamId, string _name)` (public) <a name="teamsstakingdeadlines-setteamname-uint256-string-"></a>

*Description*: Set team name. Only owner (back-end) can call this function. Team names aren't used for team deadlines.


#### Params
 - `_teamId`: Team id.

 - `_name`: Team name.

### `setTeamsNames(uint256[] _teamIds, string[] _names)` (external) <a name="teamsstakingdeadlines-setteamsnames-uint256---string---"></a>

*Description*: Set team names for several teams. Only owner (back-end) can call this function. Team names aren't used for team deadlines.


#### Params
 - `_teamIds`: Team ids.

 - `_names`: Team names.

### `getCardImageTeamDeadline(uint256 _cardImageId) → uint256` (external) <a name="teamsstakingdeadlines-getcardimageteamdeadline-uint256-"></a>

*Description*: Get CardImage's team deadline.


#### Params
 - `_cardImageId`: Card image id.

#### Returns
 - Team deadline.

### `getCardImageTeamName(uint256 _cardImageId) → string` (external) <a name="teamsstakingdeadlines-getcardimageteamname-uint256-"></a>

*Description*: Get CardImage's team name.


#### Params
 - `_cardImageId`: Card image id.

#### Returns
 - Team name.
## Events <a name="events"></a>
### event `UpdatedCardImageToTeam(uint256 _cardImageId, uint256 _teamId)` <a name="teamsstakingdeadlines-updatedcardimagetoteam-uint256-uint256-"></a>


### event `UpdatedTeamToDeadline(uint256 _teamId, uint256 _deadline)` <a name="teamsstakingdeadlines-updatedteamtodeadline-uint256-uint256-"></a>


### event `UpdatedTeamToName(uint256 _teamId, string _name)` <a name="teamsstakingdeadlines-updatedteamtoname-uint256-string-"></a>


