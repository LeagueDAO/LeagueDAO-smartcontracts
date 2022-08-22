# NomoLeagueV1
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(contract INomoRouterV1 router_, string name_, uint256 totalGames_, uint256 tokenLimitPerPlayer_)` (external) ](#nomoleaguev1-initialize-contract-inomorouterv1-string-uint256-uint256-)
  - [`withdrawReward()` (external) ](#nomoleaguev1-withdrawreward--)
  - [`updatePlayer(address account)` (external) ](#nomoleaguev1-updateplayer-address-)
  - [`totalRewardOf(address account) → uint256` (public) ](#nomoleaguev1-totalrewardof-address-)
  - [`nextGame(uint256 totalReward)` (external) ](#nomoleaguev1-nextgame-uint256-)
  - [`stakeToken(address account, uint256 tokenId)` (external) ](#nomoleaguev1-staketoken-address-uint256-)
  - [`setTokenLimitPerPlayer(uint256 _newLimit)` (external) ](#nomoleaguev1-settokenlimitperplayer-uint256-)
  - [`setName(string _newName)` (external) ](#nomoleaguev1-setname-string-)
  - [`unstakeToken(address account, uint256 tokenId)` (external) ](#nomoleaguev1-unstaketoken-address-uint256-)
  - [`updatePoints(address account, uint256 tokenId)` (external) ](#nomoleaguev1-updatepoints-address-uint256-)
- [Events:](#events)

## Variables <a name="variables"></a>
- `contract INomoRouterV1 router`
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
- `mapping(address => struct NomoLeagueV1.Player) players`
- `uint256 totalActivePoints`
- `uint256 totalPendingPoints`
- `mapping(uint256 => uint256) tokenPoints`
- `mapping(uint256 => uint256) _tokenPendingAtGame`
- `uint256 _magnifiedRewardPerPoint`
- `mapping(uint256 => uint256) _rewardPerPointAfterGame`
- `mapping(address => int256) _magnifiedRewardCorrections`
- `mapping(address => uint256) _rewardWithdrawals`
- `uint256 _magnitude`

## Functions <a name="functions"></a>

### `initialize(contract INomoRouterV1 router_, string name_, uint256 totalGames_, uint256 tokenLimitPerPlayer_)` (external) <a name="nomoleaguev1-initialize-contract-inomorouterv1-string-uint256-uint256-"></a>


### `withdrawReward()` (external) <a name="nomoleaguev1-withdrawreward--"></a>

*Description*: Function to withdraw accumulated reward

### `updatePlayer(address account)` (external) <a name="nomoleaguev1-updateplayer-address-"></a>

*Description*: Auxilary function to update player's pending and active point

### `totalRewardOf(address account) → uint256` (public) <a name="nomoleaguev1-totalrewardof-address-"></a>

*Description*: Function to get total reward of one account in the league


#### Params
 - `account`: Address to get reward for

#### Returns
 - Total reward

### `nextGame(uint256 totalReward)` (external) <a name="nomoleaguev1-nextgame-uint256-"></a>

*Description*: Function to finish current game (distributing reward) and start a new one, can only be called by owner


#### Params
 - `totalReward`: Reward to distribute for current game

### `stakeToken(address account, uint256 tokenId)` (external) <a name="nomoleaguev1-staketoken-address-uint256-"></a>

*Description*: Function to stake token, can't be called directly, staking should go through router

### `setTokenLimitPerPlayer(uint256 _newLimit)` (external) <a name="nomoleaguev1-settokenlimitperplayer-uint256-"></a>

*Description*: Function to update tokens limit per player

### `setName(string _newName)` (external) <a name="nomoleaguev1-setname-string-"></a>

*Description*: Function to update league's name

### `unstakeToken(address account, uint256 tokenId)` (external) <a name="nomoleaguev1-unstaketoken-address-uint256-"></a>

*Description*: Function to unstake token, can't be called directly, unstaking should go through router

### `updatePoints(address account, uint256 tokenId)` (external) <a name="nomoleaguev1-updatepoints-address-uint256-"></a>

*Description*: Function to update token points, can't be called directly, updating should go through router
## Events <a name="events"></a>
### event `RewardWithdrawn(address account, uint256 amount)` <a name="nomoleaguev1-rewardwithdrawn-address-uint256-"></a>

*Description*: Event emitted when user withdraws his reward

### event `NewGameStarted(uint256 index)` <a name="nomoleaguev1-newgamestarted-uint256-"></a>

*Description*: Event emitted when new game starts

### event `TokenStaked(address account, uint256 tokenId)` <a name="nomoleaguev1-tokenstaked-address-uint256-"></a>

*Description*: Event emitted when token is staked to the league

### event `TokenUnstaked(address account, uint256 tokenId)` <a name="nomoleaguev1-tokenunstaked-address-uint256-"></a>

*Description*: Event emitted when token is unstaked from league

### event `ActivePointsChanged(uint256 newPoints)` <a name="nomoleaguev1-activepointschanged-uint256-"></a>

*Description*: Event emitted when user's active points change

### event `UpdatePoints(address account, uint256 tokenId, uint256 lastGameId, uint256 tokenPendingAtGame, uint256 newPoints)` <a name="nomoleaguev1-updatepoints-address-uint256-uint256-uint256-uint256-"></a>

*Description*: Event emitted when token points update

