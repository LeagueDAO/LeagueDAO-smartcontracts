# GameProgress
*Game Progress -- contract, which is part of the Fantasy League contract (`FantasyLeague.sol`), provides
season and game process advancement functionality for the Fantasy League contract.*

*Description*: All contracts that require a current season ID are oriented to the season ID in this contract
using the season sync contract (`SeasonSync.sol` or `SeasonSyncNonupgradeable.sol`).

It is through this contract that the sequence of function calls is regulated.

This contract connects OpenZeppelin `Initializable.sol` and `CountersUpgradeable.sol` to the Fantasy League contract.


**Dev doc**: This contract includes the following functionality:
 - Stores the list of game stages for the Fantasy League contract and the current game stage, as well as advances it
   to the next.
 - Stores the current season ID and advances it to the next.

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`getSeasonId() → uint256` (external) ](#gameprogress-getseasonid--)
  - [`getGameStage() → enum GameProgress.GameStage` (public) ](#gameprogress-getgamestage--)
- [Events:](#events)

## Variables <a name="variables"></a>
- `enum GameProgress.GameStage gameStage`
- `struct CountersUpgradeable.Counter seasonId`

## Functions <a name="functions"></a>

### `init_GameProgress_unchained()` (internal) <a name="gameprogress-init_gameprogress_unchained--"></a>


### `getSeasonId() → uint256` (external) <a name="gameprogress-getseasonid--"></a>

**Dev doc**: Returns the current value of the season ID (`seasonId`).


#### Returns
 - The current season ID.

### `getGameStage() → enum GameProgress.GameStage` (public) <a name="gameprogress-getgamestage--"></a>

**Dev doc**: Returns the current value of the game stage (`gameStage`).


#### Returns
 - The current game stage.

### `moveGameStageTo(enum GameProgress.GameStage _gs)` (internal) <a name="gameprogress-movegamestageto-enum-gameprogress-gamestage-"></a>


### `closeSeason()` (internal) <a name="gameprogress-closeseason--"></a>

## Events <a name="events"></a>
### event `GameStageMovedTo(enum GameProgress.GameStage _gs)` <a name="gameprogress-gamestagemovedto-enum-gameprogress-gamestage-"></a>

**Dev doc**: Emitted when the game stage (`gameStage`) is moved to the next stage (`_gs`). That is, the `gameStage`
variable is assigned value `_gs`.



#### Params
 - `_gs`: A new game stage value.

### event `SeasonFinished(uint256 _seasonId)` <a name="gameprogress-seasonfinished-uint256-"></a>

**Dev doc**: Emitted when the Fantasy League moves on to the next season (`_seasonId`). That is, the `seasonId` variable
is assigned value `_seasonId`.



#### Params
 - `_seasonId`: A next season ID.

