# NomoLeague
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(contract INomoRouter router_, string name_, uint256 totalGames_, uint256 tokenLimitPerPlayer_)` (external) ](#nomoleague-initialize-contract-inomorouter-string-uint256-uint256-)
  - [`updateRewardTokensList()` (external) ](#nomoleague-updaterewardtokenslist--)
  - [`withdrawReward()` (external) ](#nomoleague-withdrawreward--)
  - [`withdrawRewardForUser(address _user)` (external) ](#nomoleague-withdrawrewardforuser-address-)
  - [`updatePlayer(address account)` (external) ](#nomoleague-updateplayer-address-)
  - [`totalRewardsOf(address account) → uint256[]` (public) ](#nomoleague-totalrewardsof-address-)
  - [`getAccumulatedReward(address account) → uint256[]` (external) ](#nomoleague-getaccumulatedreward-address-)
  - [`getMagnifiedRewardPerPoint(uint256 rewardIndex) → uint256` (public) ](#nomoleague-getmagnifiedrewardperpoint-uint256-)
  - [`getRewardPerPointAfterGame(uint256 rewardIndex, uint256 gameId) → uint256` (public) ](#nomoleague-getrewardperpointaftergame-uint256-uint256-)
  - [`getMagnifiedRewardCorrections(uint256 rewardIndex, address account) → int256` (public) ](#nomoleague-getmagnifiedrewardcorrections-uint256-address-)
  - [`getRewardWithdrawals(uint256 rewardIndex, address account) → uint256` (public) ](#nomoleague-getrewardwithdrawals-uint256-address-)
  - [`nextGame(uint256[] totalRewards)` (external) ](#nomoleague-nextgame-uint256---)
  - [`stakeToken(address account, uint256 tokenId)` (external) ](#nomoleague-staketoken-address-uint256-)
  - [`setTokenLimitPerPlayer(uint256 _newLimit)` (external) ](#nomoleague-settokenlimitperplayer-uint256-)
  - [`setName(string _newName)` (external) ](#nomoleague-setname-string-)
  - [`unstakeToken(address account, uint256 tokenId)` (external) ](#nomoleague-unstaketoken-address-uint256-)
  - [`updatePoints(address account, uint256 tokenId)` (external) ](#nomoleague-updatepoints-address-uint256-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract INomoRouter router`
- `contract INomoNFT nft`
- `contract IERC20Upgradeable rewardToken`
- `string name`
- `uint256 totalGames`
- `uint256 tokenLimitPerPlayer`
- `uint256 GAME_DURATION`
- `uint256 STAKING_DURATION`
- `uint256 lastGameId`
- `uint256 lastGameStart`
- `bool finished`
- `mapping(address => struct NomoLeague.Player) players`
- `uint256 totalActivePoints`
- `uint256 totalPendingPoints`
- `mapping(uint256 => uint256) tokenPoints`
- `mapping(uint256 => uint256) _tokenPendingAtGame`
- `uint256 _magnitude`
- `address[] rewardTokens`
- `mapping(uint256 => uint256) _v2_magnifiedRewardPerPoint`
- `mapping(uint256 => mapping(uint256 => uint256)) _v2_rewardPerPointAfterGame`
- `mapping(uint256 => mapping(address => int256)) _v2_magnifiedRewardCorrections`
- `mapping(uint256 => mapping(address => uint256)) _v2_rewardWithdrawals`
- `uint256 _version`

## Functions <a name="functions"></a>

### `initialize(contract INomoRouter router_, string name_, uint256 totalGames_, uint256 tokenLimitPerPlayer_)` (external) <a name="nomoleague-initialize-contract-inomorouter-string-uint256-uint256-"></a>

*Description*: Acts like constructor for upgradeable contracts


#### Params
 - `router_`: NomoRouter contract

 - `name_`: Name of the league

 - `totalGames_`: Total number of games in the league

 - `tokenLimitPerPlayer_`: Maximal number of tokens one player can stake

### `updateRewardTokensList()` (external) <a name="nomoleague-updaterewardtokenslist--"></a>

*Description*: Function to sync reward tokens list with router

### `withdrawReward()` (external) <a name="nomoleague-withdrawreward--"></a>

*Description*: Function to withdraw accumulated rewards

### `withdrawRewardForUser(address _user)` (external) <a name="nomoleague-withdrawrewardforuser-address-"></a>

*Description*: Function to withdraw accumulated rewards via router


#### Params
 - `_user`: Address of user

### `updatePlayer(address account)` (external) <a name="nomoleague-updateplayer-address-"></a>

*Description*: Auxilary function to update player's pending and active point
account Account address

### `totalRewardsOf(address account) → uint256[]` (public) <a name="nomoleague-totalrewardsof-address-"></a>

*Description*: Function to get total rewards of one account in the league


#### Params
 - `account`: Address to get rewards for

#### Returns
 - Total rewards, in order corresponded rewardTokens

### `getAccumulatedReward(address account) → uint256[]` (external) <a name="nomoleague-getaccumulatedreward-address-"></a>

*Description*: Function to get total accumulated rewards of one account in the league


#### Params
 - `account`: Address to get rewards for

#### Returns
 - Total accumulated rewards, in order corresponded rewardTokens

### `getMagnifiedRewardPerPoint(uint256 rewardIndex) → uint256` (public) <a name="nomoleague-getmagnifiedrewardperpoint-uint256-"></a>

*Description*: Getter for magnifiedRewardPerPoint


#### Params
 - `rewardIndex`: Reward index

#### Returns
 - Reward per one active point, magnified by 2**128 for precision

### `getRewardPerPointAfterGame(uint256 rewardIndex, uint256 gameId) → uint256` (public) <a name="nomoleague-getrewardperpointaftergame-uint256-uint256-"></a>

*Description*: Getter for rewardPerPointAfterGame


#### Params
 - `rewardIndex`: Reward index

 - `gameId`: ID of the game

#### Returns
 - Value of magnifiedRewardPerPoint at their end

### `getMagnifiedRewardCorrections(uint256 rewardIndex, address account) → int256` (public) <a name="nomoleague-getmagnifiedrewardcorrections-uint256-address-"></a>

*Description*: Getter for magnifiedRewardCorrections
Correction of the reward

#### Params
 - `rewardIndex`: Reward index

 - `account`: Account address


### `getRewardWithdrawals(uint256 rewardIndex, address account) → uint256` (public) <a name="nomoleague-getrewardwithdrawals-uint256-address-"></a>

*Description*: Getter for rewardWithdrawals
Withdrawn reward amount

#### Params
 - `rewardIndex`: Reward index

 - `account`: Account address


### `nextGame(uint256[] totalRewards)` (external) <a name="nomoleague-nextgame-uint256---"></a>

*Description*: Function to finish current game (distributing reward) and start a new one, can only be called by owner


#### Params
 - `totalRewards`: Rewards to distribute for current game

### `stakeToken(address account, uint256 tokenId)` (external) <a name="nomoleague-staketoken-address-uint256-"></a>

*Description*: Function to stake token, can't be called directly, staking should go through router


#### Params
 - `account`: Account address

 - `tokenId`: ID og the token

### `setTokenLimitPerPlayer(uint256 _newLimit)` (external) <a name="nomoleague-settokenlimitperplayer-uint256-"></a>

*Description*: Function to update tokens limit per player


#### Params
 - `_newLimit`: New limit value

### `setName(string _newName)` (external) <a name="nomoleague-setname-string-"></a>

*Description*: Function to update league's name


#### Params
 - `_newName`: New name value

### `unstakeToken(address account, uint256 tokenId)` (external) <a name="nomoleague-unstaketoken-address-uint256-"></a>

*Description*: Function to unstake token, can't be called directly, unstaking should go through router


#### Params
 - `account`: Account address

 - `tokenId`: ID og the token

### `updatePoints(address account, uint256 tokenId)` (external) <a name="nomoleague-updatepoints-address-uint256-"></a>

*Description*: Function to update token points, can't be called directly, updating should go through router


#### Params
 - `account`: Account address

 - `tokenId`: ID og the token

### `_moveMagnifiedRewardPerPoint()` (internal) <a name="nomoleague-_movemagnifiedrewardperpoint--"></a>

*Description*: Helper for update magnifiedRewardPerPoint for work with many tokens

### `_moveRewardPerPointAfterGame(uint256 gameId)` (internal) <a name="nomoleague-_moverewardperpointaftergame-uint256-"></a>

*Description*: Helper for update rewardPerPointAfterGame for work with many tokens


#### Params
 - `gameId`: ID of the game

### `_moveMagnifiedRewardCorrections(address account)` (internal) <a name="nomoleague-_movemagnifiedrewardcorrections-address-"></a>

*Description*: Helper for update magnifiedRewardCorrections for work with many tokens


#### Params
 - `account`: Account address

### `_moveRewardWithdrawals(address account)` (internal) <a name="nomoleague-_moverewardwithdrawals-address-"></a>

*Description*: Helper for update rewardWithdrawals for work with many tokens


#### Params
 - `account`: Account address
## Events <a name="events"></a>
### event `RewardsWithdrawn(address account, uint256[] amounts)` <a name="nomoleague-rewardswithdrawn-address-uint256---"></a>

**Dev doc**: Event emitted when user withdraws his reward

### event `NewGameStarted(uint256 index)` <a name="nomoleague-newgamestarted-uint256-"></a>

**Dev doc**: Event emitted when new game starts

### event `TokenStaked(address account, uint256 tokenId)` <a name="nomoleague-tokenstaked-address-uint256-"></a>

**Dev doc**: Event emitted when token is staked to the league

### event `TokenUnstaked(address account, uint256 tokenId)` <a name="nomoleague-tokenunstaked-address-uint256-"></a>

**Dev doc**: Event emitted when token is unstaked from league

### event `ActivePointsChanged(uint256 newPoints)` <a name="nomoleague-activepointschanged-uint256-"></a>

**Dev doc**: Event emitted when user's active points change

### event `UpdatePoints(address account, uint256 tokenId, uint256 lastGameId, uint256 tokenPendingAtGame, uint256 newPoints)` <a name="nomoleague-updatepoints-address-uint256-uint256-uint256-uint256-"></a>

**Dev doc**: Event emitted when token points update

