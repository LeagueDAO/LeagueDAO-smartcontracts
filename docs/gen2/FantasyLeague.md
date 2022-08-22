# FantasyLeague
*LeagueDAO Fantasy League -- the main contract on the protocol, which is responsible for the main games
process.*

*Description*: Game process. There are three stages of competitions for users in the Fantasy League game:
 1. Weekly competitions lasting 15 weeks. All users take part in them. Each week the user only competes against one
    other within their division with the help of their team of staked `Gen2PlayerToken` players. That is, users from
    different divisions do not interact.
    Users receive special tokens for each week. Winners get more, losers get less. With these tokens, users can buy
    new `Gen2PlayerToken` players from the marketplace for replacements in their team. The marketplace is developed
    by a different team in a different repository.
 2. Then there are the playoff competitions. In 16th week the top 4 users in each division are determined by sorting
    them according to their stats for the weekly competitions. In the same week these 4 users compete, each against
    one other. In the end there are 2 users left who win. In the 17th week the 2 remaining users in each division
    compete and the division winner is determined. Each division winner will receive an equal reward worth several
    entry passes (`LeaguePassNFT`) from the reward pool.
 3. All division winners participate in the final stage, the Mega League. The number of division winners is equal to
    the number of divisions, i.e. one for each division. Immediately after the playoff in the same 17th week, they
    will be sorted according to their season stats. The first 10 of them will become the winners of the Mega League.
    The reward pool (what is left after the division winners have been rewarded) is distributed between them
    according to a set rule.

For details and the rest of the functionality, read the abstract contracts comments.

Most functions in abstract contracts are placed according to the order in which they are called.

The `FantasyLeague` is best read from the bottom, i.e. in the following order: `GameProgress`, `UsersNDivisions`,
`RandomGenerator`, `H2HCompetition`, `Scheduler`, `Playoff`, `FantasyLeague`. After reading these contracts or while
 reading `H2HCompetition` it is worth getting to know `TeamManager`.


**Dev doc**: The following functionality is implemented directly in this part of the file:
 - Initialization of the `FantasyLeague` contract.
 - Setting of the `MegaLeague` contract to go to the final stage, the Mega League, at the end of season, as well as
   to update its season ID at the setting of it and closing of a season.
 - Setting of the `Gen2PlayerToken` contract to update its season ID at the setting of it and closing of a season.
 - The function that unifies the game continuation functionality. Calling it back end performs the going to the next
   week of the weekly competitions, the going to the playoff and to the Mega League, as well as the closing of the
   season and the going to the next one.

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(address _generator, address _scheduler, address _multisig, contract IERC20Upgradeable[] _rewardTokens)` (external) ](#fantasyleague-initialize-address-address-address-contract-ierc20upgradeable---)
  - [`setMegaLeague(address _megaLeague)` (external) ](#fantasyleague-setmegaleague-address-)
  - [`setGen2PlayerToken(address _gen2PlayerToken)` (external) ](#fantasyleague-setgen2playertoken-address-)
  - [`nextGame()` (external) ](#fantasyleague-nextgame--)
  - [`startNewSeason()` (external) ](#fantasyleague-startnewseason--)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract IMegaLeague megaLeague`
- `contract IGen2PlayerToken gen2PlayerToken`

## Functions <a name="functions"></a>

### `initialize(address _generator, address _scheduler, address _multisig, contract IERC20Upgradeable[] _rewardTokens)` (external) <a name="fantasyleague-initialize-address-address-address-contract-ierc20upgradeable---"></a>

*Description*: It is used as the constructor for upgradeable contracts.
**Dev doc**: Initializes this contract by setting the following:
- the game stage as `GameStage.UserAdding`;
- the deployer as the initial administrator that has the `DEFAULT_ADMIN_ROLE` role.
As well as the following parameters:


#### Params
 - `_generator`: An address of the random number generator contract (`NomoRNG`).

 - `_scheduler`: An address of the scheduler contract (`Scheduler`).

 - `_multisig`: An address that is granted the multisig role (`MILTISIG_ROLE`).

 - `_rewardTokens`: An addresses of the reward tokens.



### `setMegaLeague(address _megaLeague)` (external) <a name="fantasyleague-setmegaleague-address-"></a>

**Dev doc**: Sets the Mega League contract (`megaLeague`) as `_megaLeague`, syncs the current season ID of the passed
Mega League with that in this contract.

Requirements:
 - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
 - The Mega League address (`_megaLeague`) should not equal to the zero address.



#### Params
 - `_megaLeague`: An address of the Mega League contract that is responsible for the final game stage.

### `setGen2PlayerToken(address _gen2PlayerToken)` (external) <a name="fantasyleague-setgen2playertoken-address-"></a>

**Dev doc**: Sets the Gen 2 Player Token contract (`gen2PlayerToken`) as `_gen2PlayerToken`, syncs the current season ID
of the Gen 2 Player Token with that in this contract.

Requirements:
 - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
 - An Gen 2 Player Token address (`_gen2PlayerToken`) should not equal to the zero address.



#### Params
 - `_gen2PlayerToken`: An address of the Gen 2 Player Token contract is responsible for players which users use
to form a team.

### `nextGame()` (external) <a name="fantasyleague-nextgame--"></a>

*Description*: This function unifies the game continuation functionality. Calling it back end performs the going to the
next week of the weekly competitions, the going to the playoff and to the Mega League, as well as the closing of
the season and the going to the next one.
**Dev doc**: Opens each week of weekly games for the first 15 weeks inclusive. Opens the first week of the playoff
competitions in the 16th week and the second (last) week of the playoff competitions in the 17th week. At the
end of the 17th week after the playoff, move the Fantasy League to the final stage, the Mega League. After
that, closes the current season and moves on to the next ones.

Requirements:
 - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
 - The game stage should be the stage of waiting a next game (`GameStage.WaitingNextGame`).



### `startNewSeason()` (external) <a name="fantasyleague-startnewseason--"></a>

## Events <a name="events"></a>
### event `MegaLeagueSet(address _megaLeague)` <a name="fantasyleague-megaleagueset-address-"></a>

**Dev doc**: Emitted when the interface address of the Mega League contract (`megaLeague`) is changed to an address
`_megaLeague`.



#### Params
 - `_megaLeague`: The address which is set by the current interface address of the Mega League contract.

### event `Gen2PlayerTokenSet(address _gen2PlayerToken)` <a name="fantasyleague-gen2playertokenset-address-"></a>

**Dev doc**: Emitted when the interface address of the Gen 2 Player Token contract (`gen2PlayerToken`) is changed to an
address `_gen2PlayerToken`.



#### Params
 - `_gen2PlayerToken`: The address which is set by the current interface address of the Gen 2 Player Token
contract.

### event `H2HCompetitionWeekStarted(uint256 _week)` <a name="fantasyleague-h2hcompetitionweekstarted-uint256-"></a>

**Dev doc**: Emitted when a new week (`_week`) of the weekly H2H competitions is started.



#### Params
 - `_week`: A new week of the weekly H2H competitions.

### event `PlayoffCompetitionWeekStarted(uint256 _week)` <a name="fantasyleague-playoffcompetitionweekstarted-uint256-"></a>

**Dev doc**: Emitted when a new week (`_week`) of the playoff competitions is started.



#### Params
 - `_week`: A new week of the playoff competitions.

