# H2HCompetition
*Head to head competition -- the contract that responsible for weekly competitions and rewards for it (see the
description of the `FantasyLeague` contract for details).*

**Dev doc**: This contract includes the following functionality:
 - Has the `MULTISIG_ROLE` role for the Multisig that sets total week rewards for head to head competitions.
 - Adds reward tokens for head to head and playoff competitions.
 - Sets the scheduler contract (`Scheduler`) that determines the schedule for head to head and playoff competitions.
 - Processes head to head competitions, as well as stores the season and weekly user statistics (team points and
   number of wins, losses, ties).
 - Stores total week rewards that is set by the Multisig.
 - Caclulates the rate of reward per point. (Points are calculated when head to head competing).
 - Updates the rewards for users in all the reward tokens according to the calculated rate, as well as stores these
   rewards and accumulates them for each user.
 - Allows accumulated rewards to be withdrawn by users at any time.
 - Gives:
  - the number of the current competition week;
  - the list of reward tokens;
  - a rate of reward per point;
  - total week rewards;
  - users' week rewards.

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`addRewardToken(contract IERC20Upgradeable _token)` (external) ](#h2hcompetition-addrewardtoken-contract-ierc20upgradeable-)
  - [`removeRewardToken(contract IERC20Upgradeable _token)` (external) ](#h2hcompetition-removerewardtoken-contract-ierc20upgradeable-)
  - [`setScheduler(address _scheduler)` (external) ](#h2hcompetition-setscheduler-address-)
  - [`competeH2Hs(uint256 _numberOfDivisions)` (external) ](#h2hcompetition-competeh2hs-uint256-)
  - [`setTotalWeekReward(contract IERC20Upgradeable _token, uint256 _amount)` (external) ](#h2hcompetition-settotalweekreward-contract-ierc20upgradeable-uint256-)
  - [`calculateRewardPerPoint()` (external) ](#h2hcompetition-calculaterewardperpoint--)
  - [`updateRewardsForUsers(uint256 _numberOfUsers)` (external) ](#h2hcompetition-updaterewardsforusers-uint256-)
  - [`withdrawRewards()` (external) ](#h2hcompetition-withdrawrewards--)
  - [`getCurrentWeek() → uint256` (external) ](#h2hcompetition-getcurrentweek--)
  - [`getTotalWeekRewards(uint256 _season, uint256 _week, contract IERC20Upgradeable _token) → uint256` (external) ](#h2hcompetition-gettotalweekrewards-uint256-uint256-contract-ierc20upgradeable-)
  - [`getRewardPerPoint(uint256 _season, uint256 _week, contract IERC20Upgradeable _token) → uint256` (external) ](#h2hcompetition-getrewardperpoint-uint256-uint256-contract-ierc20upgradeable-)
  - [`getUserWeekReward(address _user, uint256 _season, uint256 _week, contract IERC20Upgradeable _token) → uint256` (external) ](#h2hcompetition-getuserweekreward-address-uint256-uint256-contract-ierc20upgradeable-)
  - [`getRewardTokens() → contract IERC20Upgradeable[]` (external) ](#h2hcompetition-getrewardtokens--)
- [Events:](#events)

## Variables <a name="variables"></a>
- `bytes32 MULTISIG_ROLE`
- `uint8 H2H_COMPETITION_WEEK_NUM`
- `contract IScheduler scheduler`
- `uint256 nextProcessedDivisionId`
- `uint256 nextUserWithUpdRews`
- `struct CountersUpgradeable.Counter weekTracker`
- `mapping(uint256 => mapping(uint256 => struct H2HCompetition.WeekData)) gamesStats`
- `mapping(address => mapping(uint256 => struct H2HCompetition.UserSeasonStats)) userSeasonStats`
- `mapping(address => mapping(uint256 => mapping(uint256 => struct H2HCompetition.UserWeekStats))) userWeeklyStats`
- `contract IERC20Upgradeable[] rewardTokens`
- `mapping(contract IERC20Upgradeable => bool) isRewardToken`
- `mapping(address => mapping(contract IERC20Upgradeable => uint256)) accumulatedRewards`

## Functions <a name="functions"></a>

### `init_H2HCompetition_unchained(address _scheduler, address _multisig, contract IERC20Upgradeable[] _rewardTokens)` (internal) <a name="h2hcompetition-init_h2hcompetition_unchained-address-address-contract-ierc20upgradeable---"></a>


### `addRewardToken(contract IERC20Upgradeable _token)` (external) <a name="h2hcompetition-addrewardtoken-contract-ierc20upgradeable-"></a>

**Dev doc**: Adds a reward token (`_token`) to the `rewardTokens` array.

Requirements:
 - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
 - A reward token (`_token`) already have been added.



#### Params
 - `_token`: A token which is added.

### `removeRewardToken(contract IERC20Upgradeable _token)` (external) <a name="h2hcompetition-removerewardtoken-contract-ierc20upgradeable-"></a>


### `setScheduler(address _scheduler)` (external) <a name="h2hcompetition-setscheduler-address-"></a>

**Dev doc**: Sets an address of the scheduler contract.

Requirements:
 - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
 - A scheduler address (`_scheduler`) should not equal to the zero address.



#### Params
 - `_scheduler`: A new address of the scheduler contract (`scheduler`).

### `competeH2Hs(uint256 _numberOfDivisions)` (external) <a name="h2hcompetition-competeh2hs-uint256-"></a>

*Description*: It is for weekly competitions (see the description of the `FantasyLeague` contract for details).


**Dev doc**: Processes this week's competitions between users for some divisions (`_numberOfDivisions`).

This process includes the following:
 - Check that the process is over, i.e. all divisions have been processed this week (see the description of the
   `_numberOfDivisions` parameter for details).
 - Calculation of the user's points (of his team of `Gen2PlayerToken` players) via the team manager contract
   (`teamManager`).
 - Competitions between users within divisions, where the winners are determined by the user's points. The
   competitions are on a schedule, obtained vie the scheduler contract (`Scheduler`).
 - Writing of user's statistics in the storage. Including points to calculate user's share of the reward pool.

Requirements:
 - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
 - The game stage should be the H2H competitions' stage (`GameStage.H2HCompetitions`).
 - The number of divisions should not be equal to zero.
 - The scheduler and team manager contracts (`scheduler`, `teamManager`) should be set.



#### Params
 - `_numberOfDivisions`: A number of divisions to process. It allows you to split the function call into
multiple transactions to avoid reaching the gas cost limit. Each time the function is called, this number can be
anything greater than zero. When the process of playoff competing is completed, the `FantasyLeague` moves on to
the next stage -- `GameStage.H2HRewardPerPointCalculation`.

### `setTotalWeekReward(contract IERC20Upgradeable _token, uint256 _amount)` (external) <a name="h2hcompetition-settotalweekreward-contract-ierc20upgradeable-uint256-"></a>

**Dev doc**: Adds total rewards for the current week by the Miltisig. These rewards will be distributed between all
users according to the rewards-to-points ratio that is calculated in the `calculateRewardPerPoint()` function.

Requirements:
 - The caller should have the multisig role (`MULTISIG_ROLE`).
 - The game stage should be equal to the H2H competitions' stage (`GameStage.H2HCompetitions`) or the stage of
   the calculation of the rewards-to-points ratio (`GameStage.H2HRewardPerPointCalculation`).
 - The reward token (`_token`) should have been added.



#### Params
 - `_token`: A token for which rewards are added.

 - `_amount`: Reward amount.

### `calculateRewardPerPoint()` (external) <a name="h2hcompetition-calculaterewardperpoint--"></a>

*Description*: When the process of calculating is completed, the `FantasyLeague` moves on to the next stage --
`GameStage.H2HRewardsUpdate`.
**Dev doc**: Calculates the rewards-to-points ratio which is used to calculate shares of user rewards in the reward
update function (`updateRewardsForUsers()`).

Requirements:
 - The game stage should be equal to the stage of the calculation of the rewards-to-points ratio
   (`GameStage.H2HRewardPerPointCalculation`).



### `updateRewardsForUsers(uint256 _numberOfUsers)` (external) <a name="h2hcompetition-updaterewardsforusers-uint256-"></a>

**Dev doc**: Updates rewards for users in each reward token from the `rewardTokens` array.

Requirements:
 - The game stage should be equal to the stage of reward update (`GameStage.H2HRewardsUpdate`).
 - The number of users (`_numberOfUsers`) should not be equal to zero.



#### Params
 - `_numberOfUsers`: A number of users to process. It allows you to split the function call into multiple
transactions to avoid reaching the gas cost limit. Each time the function is called, this number can be anything
greater than zero. When the process of updating is completed, the `FantasyLeague` moves on to the next stage --
`GameStage.WaitingNextGame`.

### `withdrawRewards()` (external) <a name="h2hcompetition-withdrawrewards--"></a>

*Description*: This function can be called by a user at any time.
**Dev doc**: Transfers all caller's rewards to the caller in each reward token from the `rewardTokens` array.

Requirements:
 - The game stage should be equal to the stage of reward update (`GameStage.H2HRewardsUpdate`).
 - The number of users (`_numberOfUsers`) should not be equal to zero.



### `getCurrentWeek() → uint256` (external) <a name="h2hcompetition-getcurrentweek--"></a>

**Dev doc**: Returns the current week of a season (`seasonId.current()`).


#### Returns
 - The current week.

### `getTotalWeekRewards(uint256 _season, uint256 _week, contract IERC20Upgradeable _token) → uint256` (external) <a name="h2hcompetition-gettotalweekrewards-uint256-uint256-contract-ierc20upgradeable-"></a>

**Dev doc**: Returns total rewards of a token (`_token`) of a week (`_week`) in a season (`_season`).



#### Params
 - `_season`: ID of the season in which a week is required.

 - `_week`: The week in which rewards were set by the Multisig (`MULTISIG_ROLE`).

 - `_token`: A token for which a value is returned.

#### Returns
 - The total week rewards of the token.

### `getRewardPerPoint(uint256 _season, uint256 _week, contract IERC20Upgradeable _token) → uint256` (external) <a name="h2hcompetition-getrewardperpoint-uint256-uint256-contract-ierc20upgradeable-"></a>

**Dev doc**: Returns the rewards-to-points ratio for a token (`_token`) of a week (`_week`) in a season (`_season`).



#### Params
 - `_season`: ID of the season in which a week is required.

 - `_week`: The week in which the ration were calculated.

 - `_token`: A token for which a value is returned.

#### Returns
 - The rewards-to-points ratio of the token.

### `getUserWeekReward(address _user, uint256 _season, uint256 _week, contract IERC20Upgradeable _token) → uint256` (external) <a name="h2hcompetition-getuserweekreward-address-uint256-uint256-contract-ierc20upgradeable-"></a>

**Dev doc**: Returns rewards of a user (`_user`) for a week (`_week`) in a season (`_season`).



#### Params
 - `_user`: A user whose rewards are to be read.

 - `_season`: ID of the season in which a week is required.

 - `_week`: The week in which rewards were updated for the user.

 - `_token`: A token for which a value is returned.

#### Returns
 - The user's week rewards of the token.

### `getRewardTokens() → contract IERC20Upgradeable[]` (external) <a name="h2hcompetition-getrewardtokens--"></a>

**Dev doc**: Returns the current array of reward tokens (`rewardTokens`).


#### Returns
 - The array of reward tokens.

### `getH2HCompetitionResult(uint256 _firstUserScore, uint256 _secondUserScore) → enum CompetitionResult` (internal) <a name="h2hcompetition-geth2hcompetitionresult-uint256-uint256-"></a>


### `updateUserStats(address _firstUser, address _secondUser, enum CompetitionResult _result)` (internal) <a name="h2hcompetition-updateuserstats-address-address-enum-competitionresult-"></a>


### `updateRewardsForUser(address _user)` (internal) <a name="h2hcompetition-updaterewardsforuser-address-"></a>

## Events <a name="events"></a>
### event `SchedulerSet(address _scheduler)` <a name="h2hcompetition-schedulerset-address-"></a>

**Dev doc**: Emitted when the interface address of the scheduler contract (`scheduler`) is changed to an address
`_scheduler`.



#### Params
 - `_scheduler`: The address which is set by the current interface address of the scheduler contract.

### event `RewardTokenAdded(contract IERC20Upgradeable _token)` <a name="h2hcompetition-rewardtokenadded-contract-ierc20upgradeable-"></a>

**Dev doc**: Emitted when a reward token address (`_token`) is added to the array of reward tokens (`rewardTokens`).



#### Params
 - `_token`: The address which is added to the array of reward tokens.

### event `RewardTokenRemoved(contract IERC20Upgradeable _token)` <a name="h2hcompetition-rewardtokenremoved-contract-ierc20upgradeable-"></a>


### event `H2HCompetitionResult(address _firstUser, address _secondUser, enum CompetitionResult _competitionResult, uint256 _week)` <a name="h2hcompetition-h2hcompetitionresult-address-address-enum-competitionresult-uint256-"></a>

**Dev doc**: Emitted when a `_firstUser` user competed against the `_secondUser` user in weekly or playoff competitions
in week `_week` with the `_competitionResult` result.



#### Params
 - `_firstUser`: The address of the first user who competed.

 - `_secondUser`: The address of the second user who competed.

 - `_competitionResult`: The result of the competition: win, lose or tie.

 - `_week`: The week number when competing.

### event `TotalWeekRewardSet(uint256 _season, uint256 _week, address _token, uint256 _amount)` <a name="h2hcompetition-totalweekrewardset-uint256-uint256-address-uint256-"></a>

**Dev doc**: Emitted when a total week reward in the amount of `_amount` is set by the Multisig (`MULTISIG_ROLE`) for
a reward token with an address `_token` in week `_week` in season `_season`.



#### Params
 - `_season`: The season number.

 - `_week`: The week number.

 - `_token`: The address for which is added a total week reward amount.

 - `_amount`: A total week reward amount that is set by the Multisig.

### event `RewardPerPointCalcutated(address _rewardERC20, uint256 _rewardPerPoint)` <a name="h2hcompetition-rewardperpointcalcutated-address-uint256-"></a>

**Dev doc**: Emitted when this week's rewards-to-points ratio (`_rewardPerPoint`) is calculated for a reward token
(`_rewardERC20`).



#### Params
 - `_rewardERC20`: A reward token from the `rewardTokens` array.

 - `_rewardPerPoint`: A ratio of total rewards to total users' points for this week.

### event `UserRewardsUpdated(address _user, address _token, uint256 _weekRewards, uint256 _accumulatedRewards)` <a name="h2hcompetition-userrewardsupdated-address-address-uint256-uint256-"></a>

**Dev doc**: Emitted when rewards (`_weekRewards`) for a user (`_user`) is updated with the rewards-to-points ratio in
the mapping of user week stats (`userWeeklyStats`) for a reward token (`_token`), and the rewards are added to
the user's accumulated rewards in the mapping (`accumulatedRewards`).



#### Params
 - `_user`: A user for whom the rewards are calculated.

 - `_token`: A reward token from the `rewardTokens` array.

 - `_weekRewards`: A value of rewards that is added to user's accumulated rewards.

 - `_accumulatedRewards`: A current value of user's accumulated rewards in the mapping (`accumulatedRewards`).

### event `RewardWithdrawn(address _user, contract IERC20Upgradeable _token, uint256 _amount)` <a name="h2hcompetition-rewardwithdrawn-address-contract-ierc20upgradeable-uint256-"></a>

*Description*: Rewards can be withdrawn at any time.


**Dev doc**: Emitted when a user (`_user`) withdraws rewards in the amount of `_amount` for a reward token (`_token`).


#### Params
 - `_user`: A user who withdraws.

 - `_token`: A reward token from the `rewardTokens` array.

 - `_amount`: Amount of a reward token (`_token`).

