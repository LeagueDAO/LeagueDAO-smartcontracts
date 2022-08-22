# MegaLeague
*Mega League -- the final game stage in the end of a season.*

*Description*: Rewards are awarded ....

This contract includes the following functionality:
 - .


**Dev doc**: Warning. This contract is not intended for inheritance. In case of inheritance, it is recommended to change the
access of all storage variables from public to private in order to avoid violating the integrity of the storage. In
addition, you will need to add functions for them to get values.

## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(contract IERC20Upgradeable[] _rewardTokens, address _financialManager, address _generator)` (external) ](#megaleague-initialize-contract-ierc20upgradeable---address-address-)
  - [`setMegaLeagueWinnerNumber(uint256 _megaLeagueWinnerNumber)` (external) ](#megaleague-setmegaleaguewinnernumber-uint256-)
  - [`setRandGenerator(address _generator)` (external) ](#megaleague-setrandgenerator-address-)
  - [`updateRandNum()` (external) ](#megaleague-updaterandnum--)
  - [`stepToFindMegaLeagueWinners(uint256 _iterLimit)` (external) ](#megaleague-steptofindmegaleaguewinners-uint256-)
  - [`setMegaLeagueRewards(contract IERC20Upgradeable _token, uint256 _rewardAmount)` (external) ](#megaleague-setmegaleaguerewards-contract-ierc20upgradeable-uint256-)
  - [`calculateMegaLeagueRewards()` (external) ](#megaleague-calculatemegaleaguerewards--)
  - [`withdrawRewards(uint256 _userIndex, uint256 _season)` (external) ](#megaleague-withdrawrewards-uint256-uint256-)
  - [`addRewardToken(contract IERC20Upgradeable _token)` (external) ](#megaleague-addrewardtoken-contract-ierc20upgradeable-)
  - [`getMegaLeagueWinners(uint256 _season) → struct MegaLeague.MegaLeagueWinner[]` (external) ](#megaleague-getmegaleaguewinners-uint256-)
  - [`validateMegaLeagueWinner(uint256 _season, uint256 _userIndex, address _user)` (public) ](#megaleague-validatemegaleaguewinner-uint256-uint256-address-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `bytes32 FINANCIAL_MANAGER_ROLE`
- `uint256 megaLeagueWinnerNumber`
- `mapping(uint256 => struct MegaLeague.MegaLeagueWinner[]) megaLeagueWinners`
- `uint256 megaLeagueNextPossibleWinnerIndex`
- `bool isFirstStageOfMegaLeagueFinding`
- `uint256 megaLeagueLastWinnerPoints`
- `mapping(uint256 => struct MegaLeague.MegaLeagueWinner[]) megaLeagueLastWinnersBuffer`
- `contract IERC20Upgradeable[] rewardTokens`
- `mapping(contract IERC20Upgradeable => bool) isRewardToken`
- `mapping(uint256 => mapping(contract IERC20Upgradeable => uint256)) rewardTokenAmounts`
- `mapping(uint256 => mapping(contract IERC20Upgradeable => mapping(address => uint256))) megaLeagueWinnerRewards`

## Functions <a name="functions"></a>

### `initialize(contract IERC20Upgradeable[] _rewardTokens, address _financialManager, address _generator)` (external) <a name="megaleague-initialize-contract-ierc20upgradeable---address-address-"></a>


### `setMegaLeagueWinnerNumber(uint256 _megaLeagueWinnerNumber)` (external) <a name="megaleague-setmegaleaguewinnernumber-uint256-"></a>


### `setRandGenerator(address _generator)` (external) <a name="megaleague-setrandgenerator-address-"></a>

**Dev doc**: Sets the random number generator contract.



#### Params
 - `_generator`: An address of the random number generator.

### `updateRandNum()` (external) <a name="megaleague-updaterandnum--"></a>

*Description*: Firstly, need to generate the random number on NomoRNG contract.
**Dev doc**: Updates the random number via Chainlink VRFv2.



### `stepToFindMegaLeagueWinners(uint256 _iterLimit)` (external) <a name="megaleague-steptofindmegaleaguewinners-uint256-"></a>

**Dev doc**: Finds Mega League winners. The finding process is paced.

Requirements:
- The caller should be the administrator of the MegaLeague contract.
- The FantasyLeague should be at stage MegaLeague (`MegaLeagueStage.MegaLeague`).
- A limit of iterations should be greater than zero.



#### Params
 - `_iterLimit`:   A number that allows you to split the function call into multiple transactions to avoid
reaching the gas cost limit. Each time the function is called, this number can be anything greater than zero.
When the process of finding the Mega League winners is completed, the FantasyLeague moves on to the next stage
(update the Mega League rewards -- `MegaLeagueStage.RewardsCalculation`). The sum of the iteration limits will
be approximately equal to twice the number of division winners.

### `setMegaLeagueRewards(contract IERC20Upgradeable _token, uint256 _rewardAmount)` (external) <a name="megaleague-setmegaleaguerewards-contract-ierc20upgradeable-uint256-"></a>


### `calculateMegaLeagueRewards()` (external) <a name="megaleague-calculatemegaleaguerewards--"></a>


### `withdrawRewards(uint256 _userIndex, uint256 _season)` (external) <a name="megaleague-withdrawrewards-uint256-uint256-"></a>

*Description*: Withdraw rewards for the MegaLeague winner.

**Dev doc**: Msg.sender must be a winner. Where will be separate transfer for each reward token.


#### Params
 - `_userIndex`: Index of the winner in the MegaLeague winners array.

 - `_season`: Season number from which user want to withdraw rewards.

### `addRewardToken(contract IERC20Upgradeable _token)` (external) <a name="megaleague-addrewardtoken-contract-ierc20upgradeable-"></a>

*Description*: Add reward token to the rewardTokens array.

**Dev doc**: Only the default admin can add a reward token.


#### Params
 - `_token`: Token to add.

### `getMegaLeagueWinners(uint256 _season) → struct MegaLeague.MegaLeagueWinner[]` (external) <a name="megaleague-getmegaleaguewinners-uint256-"></a>


### `validateMegaLeagueWinner(uint256 _season, uint256 _userIndex, address _user)` (public) <a name="megaleague-validatemegaleaguewinner-uint256-uint256-address-"></a>

**Dev doc**: Reverts if specified user is not a winner.


#### Params
 - `_season`: Season ID.

 - `_userIndex`: Winner index in the megaLeagueWinners array.

 - `_user`: User address to check.
## Events <a name="events"></a>
### event `RewardTokenAdded(contract IERC20Upgradeable _token)` <a name="megaleague-rewardtokenadded-contract-ierc20upgradeable-"></a>


### event `MegaLeagueWinnerNumberSet(uint256 _megaLeagueWinnerNumber)` <a name="megaleague-megaleaguewinnernumberset-uint256-"></a>


### event `UserMegaLeagueRewardsUpdated(address _user, address _token, uint256 _megaLeagueRewards, uint256 _userReward)` <a name="megaleague-usermegaleaguerewardsupdated-address-address-uint256-uint256-"></a>


### event `UserMegaLeagueRewardsWithdrawn(uint256 _season, uint256 _userIndex, address _userAddress, address _token, uint256 _userReward)` <a name="megaleague-usermegaleaguerewardswithdrawn-uint256-uint256-address-address-uint256-"></a>


