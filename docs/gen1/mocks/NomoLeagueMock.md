# NomoLeagueMock
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(contract INomoRouter router_, string name_, uint256 totalGames_, uint256 tokenLimitPerPlayer_)` (external) ](#nomoleaguemock-initialize-contract-inomorouter-string-uint256-uint256-)
  - [`updateRewardTokensList()` (external) ](#nomoleaguemock-updaterewardtokenslist--)
  - [`withdrawReward()` (external) ](#nomoleaguemock-withdrawreward--)
  - [`withdrawRewardForUser(address _user)` (external) ](#nomoleaguemock-withdrawrewardforuser-address-)
  - [`updatePlayer(address account)` (external) ](#nomoleaguemock-updateplayer-address-)
  - [`totalRewardsOf(address account) → uint256[]` (public) ](#nomoleaguemock-totalrewardsof-address-)
  - [`getAccumulatedReward(address account) → uint256[]` (public) ](#nomoleaguemock-getaccumulatedreward-address-)
  - [`getMagnifiedRewardPerPoint(uint256 rewardIndex) → uint256` (public) ](#nomoleaguemock-getmagnifiedrewardperpoint-uint256-)
  - [`getRewardPerPointAfterGame(uint256 rewardIndex, uint256 gameId) → uint256` (public) ](#nomoleaguemock-getrewardperpointaftergame-uint256-uint256-)
  - [`getMagnifiedRewardCorrections(uint256 rewardIndex, address account) → int256` (public) ](#nomoleaguemock-getmagnifiedrewardcorrections-uint256-address-)
  - [`getRewardWithdrawals(uint256 rewardIndex, address account) → uint256` (public) ](#nomoleaguemock-getrewardwithdrawals-uint256-address-)
  - [`nextGame(uint256[] totalRewards)` (external) ](#nomoleaguemock-nextgame-uint256---)
  - [`stakeToken(address account, uint256 tokenId)` (external) ](#nomoleaguemock-staketoken-address-uint256-)
  - [`setTokenLimitPerPlayer(uint256 _newLimit)` (external) ](#nomoleaguemock-settokenlimitperplayer-uint256-)
  - [`setName(string _newName)` (external) ](#nomoleaguemock-setname-string-)
  - [`unstakeToken(address account, uint256 tokenId)` (external) ](#nomoleaguemock-unstaketoken-address-uint256-)
  - [`updatePoints(address account, uint256 tokenId)` (external) ](#nomoleaguemock-updatepoints-address-uint256-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract INomoRouter router`
- `contract INomoNFT nft`
- `contract IERC20Upgradeable rewardToken`
- `string name`
- `uint256 totalGames`
- `uint256 tokenLimitPerPlayer`
- `uint256 lastGameId`
- `uint256 lastGameStart`
- `bool finished`
- `mapping(address => struct NomoLeagueMock.Player) players`
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

### `initialize(contract INomoRouter router_, string name_, uint256 totalGames_, uint256 tokenLimitPerPlayer_)` (external) <a name="nomoleaguemock-initialize-contract-inomorouter-string-uint256-uint256-"></a>


### `updateRewardTokensList()` (external) <a name="nomoleaguemock-updaterewardtokenslist--"></a>

*Description*: Function to sync reward tokens list with router

### `withdrawReward()` (external) <a name="nomoleaguemock-withdrawreward--"></a>

*Description*: Function to withdraw accumulated rewards

### `withdrawRewardForUser(address _user)` (external) <a name="nomoleaguemock-withdrawrewardforuser-address-"></a>

*Description*: Function to withdraw accumulated rewards via router

### `updatePlayer(address account)` (external) <a name="nomoleaguemock-updateplayer-address-"></a>

*Description*: Auxilary function to update player's pending and active point

### `totalRewardsOf(address account) → uint256[]` (public) <a name="nomoleaguemock-totalrewardsof-address-"></a>

*Description*: Function to get total rewards of one account in the league


#### Params
 - `account`: Address to get rewards for

#### Returns
 - Total rewards, in order corresponded rewardTokens

### `getAccumulatedReward(address account) → uint256[]` (public) <a name="nomoleaguemock-getaccumulatedreward-address-"></a>

*Description*: Function to get total accumulated rewards of one account in the league


#### Params
 - `account`: Address to get rewards for

#### Returns
 - Total accumulated rewards, in order corresponded rewardTokens

### `getMagnifiedRewardPerPoint(uint256 rewardIndex) → uint256` (public) <a name="nomoleaguemock-getmagnifiedrewardperpoint-uint256-"></a>

*Description*: Getter for magnifiedRewardPerPoint

### `getRewardPerPointAfterGame(uint256 rewardIndex, uint256 gameId) → uint256` (public) <a name="nomoleaguemock-getrewardperpointaftergame-uint256-uint256-"></a>

*Description*: Getter for rewardPerPointAfterGame

### `getMagnifiedRewardCorrections(uint256 rewardIndex, address account) → int256` (public) <a name="nomoleaguemock-getmagnifiedrewardcorrections-uint256-address-"></a>

*Description*: Getter for magnifiedRewardCorrections

### `getRewardWithdrawals(uint256 rewardIndex, address account) → uint256` (public) <a name="nomoleaguemock-getrewardwithdrawals-uint256-address-"></a>

*Description*: Getter for rewardWithdrawals

### `nextGame(uint256[] totalRewards)` (external) <a name="nomoleaguemock-nextgame-uint256---"></a>

*Description*: Function to finish current game (distributing reward) and start a new one, can only be called by owner


#### Params
 - `totalRewards`: Rewards to distribute for current game

### `stakeToken(address account, uint256 tokenId)` (external) <a name="nomoleaguemock-staketoken-address-uint256-"></a>

*Description*: Function to stake token, can't be called directly, staking should go through router

### `setTokenLimitPerPlayer(uint256 _newLimit)` (external) <a name="nomoleaguemock-settokenlimitperplayer-uint256-"></a>

*Description*: Function to update tokens limit per player

### `setName(string _newName)` (external) <a name="nomoleaguemock-setname-string-"></a>

*Description*: Function to update league's name

### `unstakeToken(address account, uint256 tokenId)` (external) <a name="nomoleaguemock-unstaketoken-address-uint256-"></a>

*Description*: Function to unstake token, can't be called directly, unstaking should go through router

### `updatePoints(address account, uint256 tokenId)` (external) <a name="nomoleaguemock-updatepoints-address-uint256-"></a>

*Description*: Function to update token points, can't be called directly, updating should go through router

### `_moveMagnifiedRewardPerPoint()` (internal) <a name="nomoleaguemock-_movemagnifiedrewardperpoint--"></a>

*Description*: Helper for update magnifiedRewardPerPoint for work with many tokens

### `_moveRewardPerPointAfterGame(uint256 gameId)` (internal) <a name="nomoleaguemock-_moverewardperpointaftergame-uint256-"></a>

*Description*: Helper for update rewardPerPointAfterGame for work with many tokens

### `_moveMagnifiedRewardCorrections(address account)` (internal) <a name="nomoleaguemock-_movemagnifiedrewardcorrections-address-"></a>

*Description*: Helper for update magnifiedRewardCorrections for work with many tokens

### `_moveRewardWithdrawals(address account)` (internal) <a name="nomoleaguemock-_moverewardwithdrawals-address-"></a>

*Description*: Helper for update rewardWithdrawals for work with many tokens
## Events <a name="events"></a>
### event `RewardsWithdrawn(address account, uint256[] amounts)` <a name="nomoleaguemock-rewardswithdrawn-address-uint256---"></a>

*Description*: Event emitted when user withdraws his reward

### event `NewGameStarted(uint256 index)` <a name="nomoleaguemock-newgamestarted-uint256-"></a>

*Description*: Event emitted when new game starts

### event `TokenStaked(address account, uint256 tokenId)` <a name="nomoleaguemock-tokenstaked-address-uint256-"></a>

*Description*: Event emitted when token is staked to the league

### event `TokenUnstaked(address account, uint256 tokenId)` <a name="nomoleaguemock-tokenunstaked-address-uint256-"></a>

*Description*: Event emitted when token is unstaked from league

### event `ActivePointsChanged(uint256 newPoints)` <a name="nomoleaguemock-activepointschanged-uint256-"></a>

*Description*: Event emitted when user's active points change

### event `UpdatePoints(address account, uint256 tokenId, uint256 lastGameId, uint256 tokenPendingAtGame, uint256 newPoints)` <a name="nomoleaguemock-updatepoints-address-uint256-uint256-uint256-uint256-"></a>

*Description*: Event emitted when token points update

