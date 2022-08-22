# Playoff
*Playoff -- the contract that responsible for playoff competitions and rewards for it (see the description of
the `FantasyLeague` contract for details).*

**Dev doc**: This contract includes the following functionality:
 - Has the back end functions for adding sorted divisions to save top 4 users in each division for playoff
   competitions.
 - Processes playoff competitions to determine division winners, as well as stores the season and weekly user
   statistics (team points and number of wins and losses).
 - Sets the financial manager contract (`financialManager`) that transfers rewards for the division winners to the
   `FantasyLeague` contract and returns the reward token and value for an update of rewards.
 - Updates the rewards for division winners, as well as stores these rewards and accumulates them.
 - Returns division winners and their stats (it is used for the Mega League).
 - Compares users by seasonal statistics (firstly, it is used for playoff competitions).

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`addSortedPlayoffDivisions(address[] _sortedDivisions)` (external) ](#playoff-addsortedplayoffdivisions-address---)
  - [`competePlayoffs(uint256 _numberOfDivisions)` (external) ](#playoff-competeplayoffs-uint256-)
  - [`setFinancialManager(address _financialManager)` (external) ](#playoff-setfinancialmanager-address-)
  - [`calculatePlayoffRewards(uint256 _numberOfDivisionWinners)` (external) ](#playoff-calculateplayoffrewards-uint256-)
  - [`getSomeDivisionWinners(uint256 _season, uint256 _from, uint256 _to) → address[] divisionWinners` (external) ](#playoff-getsomedivisionwinners-uint256-uint256-uint256-)
  - [`getSomeDivisionWinnersStats(uint256 _season, uint256 _from, uint256 _to) → struct DivisionWinnerStats[] divisionWinnersStats` (external) ](#playoff-getsomedivisionwinnersstats-uint256-uint256-uint256-)
  - [`addSortedPlayoffDivision(address[] _sortedDivision)` (public) ](#playoff-addsortedplayoffdivision-address---)
  - [`compareUsers(uint256 _season, address _firstUser, address _secondUser) → enum CompetitionResult` (public) ](#playoff-compareusers-uint256-address-address-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `uint8 PLAYOFF_COMPETITOR_NUM`
- `uint8 PLAYOFF_COMPETITION_WEEK_NUM`
- `contract IFinancialManager financialManager`
- `mapping(uint256 => address[]) playoffCompetitors`
- `mapping(uint256 => address[]) divisionsWinners`

## Functions <a name="functions"></a>

### `init_Playoff_unchained()` (internal) <a name="playoff-init_playoff_unchained--"></a>


### `addSortedPlayoffDivisions(address[] _sortedDivisions)` (external) <a name="playoff-addsortedplayoffdivisions-address---"></a>

*Description*: This function is made to avoid sorting arrays in the blockchain. The back end sorts them independently
and sends them sorted, while the blockchain only performs a sorting check and selects the top 4 users from the
division.
**Dev doc**: Checks that the divisions is correctly sorted and saves the top `PLAYOFF_COMPETITOR_NUM` users for playoff
competitions.



#### Params
 - `_sortedDivisions`: An array of divisions, each sorted in descending order. Sorting is done based on user's
seasonal statistics (`UserSeasonStats` struct). The length of this array should be a multiple of the division
size.



### `competePlayoffs(uint256 _numberOfDivisions)` (external) <a name="playoff-competeplayoffs-uint256-"></a>

*Description*: It is for playoff competitions (see the description of the `FantasyLeague` contract for details).

There are determined the 2 playoff candidates for each division in the 16th week and the division winner
in the 17th week.

Warning. This algorithm assumes that the playoffs take place in weeks 16 and 17, with 4 users competing
in week 16 and 2 winners in week 17. The algorithm is not designed for other values.
**Dev doc**: Processes competitions of the 16th and 17th weeks between users for some divisions (`_numberOfDivisions`).

This process includes the following:
 - Check that the process is over, i.e. all divisions have been processed this week (see the description of the
   `_numberOfDivisions` parameter for details).
 - Calculation of the user's points (of his team of `Gen2PlayerToken` players) via the team manager contract
   (`teamManager`).
 - Competitions between users within divisions, where the winners are determined by the user's points and season
   stats. The competitions are on a schedule, obtained vie the scheduler contract (`Scheduler`).
 - Writing of user's statistics in the storage.

Requirements:
 - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
 - The game stage should be the playoff competitions' stage (`GameStage.PlayoffCompetitions`).
 - The number of divisions should not be equal to zero.
 - The scheduler and team manager contracts (`scheduler`, `teamManager`) should be set.



#### Params
 - `_numberOfDivisions`: A number of divisions to process. It allows you to split the function call into
multiple transactions to avoid reaching the gas cost limit. Each time the function is called, this number can be
anything greater than zero. When the process of playoff competing is completed, the `FantasyLeague` moves on to
the next stage -- `GameStage.PlayoffRewards`.



### `setFinancialManager(address _financialManager)` (external) <a name="playoff-setfinancialmanager-address-"></a>

**Dev doc**: Sets an address of the financial manager contract.

Requirements:
 - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
 - A financial manager address (`financialManager`) should not equal to the zero address.



#### Params
 - `_financialManager`: An address of the financial manager contract (`financialManager`).

### `calculatePlayoffRewards(uint256 _numberOfDivisionWinners)` (external) <a name="playoff-calculateplayoffrewards-uint256-"></a>

*Description*: The `financialManager` contract should transfer rewards for the division winners to the `FantasyLeague`
contract.
**Dev doc**: Calculates rewards for division winners in the reward token for the playoff which is stored in the
`financialManager` contract.

Requirements:
 - The game stage should be equal to the stage of playoff rewards (`GameStage.PlayoffRewards`).
 - The number of division winner (`_numberOfDivisionWinners`) should not be equal to zero.
 - An address of the financial manager contract (`financialManager`) should not be equal to the zero address.



#### Params
 - `_numberOfDivisionWinners`: A number of division winner to process. It allows you to split the function call
into multiple transactions to avoid reaching the gas cost limit. Each time the function is called, this number
can be anything greater than zero. When the process of calculating is completed, the `FantasyLeague` moves on to
the next stage --`GameStage.WaitingNextGame`.



### `getSomeDivisionWinners(uint256 _season, uint256 _from, uint256 _to) → address[] divisionWinners` (external) <a name="playoff-getsomedivisionwinners-uint256-uint256-uint256-"></a>

*Description*: Up to and including the `_to` index.
**Dev doc**: Returns the slice of the division winners' array (`divisionsWinners`) from the index `_from` to the index
`_to` in a season (`season`).



#### Params
 - `_season`: The season ID.

 - `_from`: The first index of the slice.

 - `_to`: The second index of the slice.

#### Returns
 - divisionWinners   A slice of the array of division winners' array (`divisionsWinners`).



### `getSomeDivisionWinnersStats(uint256 _season, uint256 _from, uint256 _to) → struct DivisionWinnerStats[] divisionWinnersStats` (external) <a name="playoff-getsomedivisionwinnersstats-uint256-uint256-uint256-"></a>

*Description*: Up to and including the `_to` index.
**Dev doc**: Returns stats of the division winners from the index `_from` to the index `_to` in a season (`season`).



#### Params
 - `_season`: The season ID.

 - `_from`: The first index of the slice.

 - `_to`: The second index of the slice.

#### Returns
 - divisionWinnersStats   Stats of the division winners from the `divisionsWinners` array.



### `addSortedPlayoffDivision(address[] _sortedDivision)` (public) <a name="playoff-addsortedplayoffdivision-address---"></a>

**Dev doc**: Checks that the division is correctly sorted and saves the top `PLAYOFF_COMPETITOR_NUM` users for playoff
competitions.



#### Params
 - `_sortedDivision`: An array of users, which is a division sorted in descending order. Sorting is done based
on the user's seasonal statistics (`UserSeasonStats` structs).

### `compareUsers(uint256 _season, address _firstUser, address _secondUser) → enum CompetitionResult` (public) <a name="playoff-compareusers-uint256-address-address-"></a>

**Dev doc**: Returns the result of a comparison of users: a win for the first, a win for the second, a tie.



#### Params
 - `_season`: Season ID.

 - `_firstUser`: The first user in the comparison.

 - `_secondUser`: The second user in the comparison.

#### Returns
 - The result of the comparison of users.

### `isSameDivisionAddresses(uint256 _season, uint256 _divisionId, address[] _arr) → bool` (internal) <a name="playoff-issamedivisionaddresses-uint256-uint256-address---"></a>

**Dev doc**: Check that the array contains the same addresses as the division.



#### Params
 - `_season`: Season ID.

 - `_divisionId`: Division number.

 - `_arr`: Array with which the division is compared.

#### Returns
 - if the array contains the same addresses as the division, false otherwise.
## Events <a name="events"></a>
### event `FinancialManagerSet(address _financialManager)` <a name="playoff-financialmanagerset-address-"></a>

**Dev doc**: Emitted when the interface address of the financial manager contract (`financialManager`) is changed to an
address `_financialManager`.



#### Params
 - `_financialManager`: The address which is set by the current interface address of the financial manager
contract.

### event `CompetitorsSelectedFromDivision(uint256 _seasonId, uint256 _divisionId)` <a name="playoff-competitorsselectedfromdivision-uint256-uint256-"></a>

**Dev doc**: Emitted when top 4 users is selected from a division (`_divisionId`) and added to the playoff competitors
array (`playoffCompetitors`) in a season (`_seasonId`).



#### Params
 - `_seasonId`: The season in which the users from the division is selected.

 - `_divisionId`: ID of the division from which the users are selected..

### event `DivisionWinnerRewardsCalculated(address _winner, uint256 _accumulatedRewards)` <a name="playoff-divisionwinnerrewardscalculated-address-uint256-"></a>

**Dev doc**: Emitted when rewards is calculated for a division winner (`_winner`). `_accumulatedRewards` is his total
reward amount in the playoff reward token (stored in the `financialManager` contract).



#### Params
 - `_winner`: The division winner for whom reward amount is calculated.

 - `_accumulatedRewards`: The total reward amount that the user (`_winner`) can withdraw at the moment.

