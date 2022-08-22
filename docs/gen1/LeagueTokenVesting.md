# LeagueTokenVesting
**


## Table of contents:
- [Variables](#variables)
- [Functions:](#functions)
  - [`initialize(contract IERC20Upgradeable _leagueToken, uint256 _startAfter)` (public) ](#leaguetokenvesting-initialize-contract-ierc20upgradeable-uint256-)
  - [`addVester(address _newVester)` (external) ](#leaguetokenvesting-addvester-address-)
  - [`removeVester(address _vesterToRemove)` (external) ](#leaguetokenvesting-removevester-address-)
  - [`updateStartTime(uint256 _startAfter)` (external) ](#leaguetokenvesting-updatestarttime-uint256-)
  - [`recoverToken(address _token, uint256 _amount)` (external) ](#leaguetokenvesting-recovertoken-address-uint256-)
  - [`addOrUpdateInvestor(address _investor, uint256 _amount)` (external) ](#leaguetokenvesting-addorupdateinvestor-address-uint256-)
  - [`addOrUpdateInvestors(address[] _investors, uint256[] _amounts)` (external) ](#leaguetokenvesting-addorupdateinvestors-address---uint256---)
  - [`claimInvestorUnlockedTokens()` (external) ](#leaguetokenvesting-claiminvestorunlockedtokens--)
  - [`getInvestorClaimableTokens(address _investor) → uint256` (external) ](#leaguetokenvesting-getinvestorclaimabletokens-address-)
  - [`getInvestorTotalAssigned(address _investor) → uint256` (external) ](#leaguetokenvesting-getinvestortotalassigned-address-)
  - [`getInvestorVestingTokens(address _investor) → uint256` (external) ](#leaguetokenvesting-getinvestorvestingtokens-address-)
  - [`getInvestorVestingsClaimed(address _investor) → uint256` (external) ](#leaguetokenvesting-getinvestorvestingsclaimed-address-)
  - [`getInvestorTokensInContract(address _investor) → uint256` (external) ](#leaguetokenvesting-getinvestortokensincontract-address-)

## Variables <a name="variables"></a>
- `struct LeagueTokenVesting.RoundInfo roundInfo`
- `mapping(address => struct LeagueTokenVesting.Investor) investorInfo`
- `address[] investors`
- `uint256 startTime`
- `contract IERC20Upgradeable leagueToken`
- `bytes32 VESTER_ROLE`

## Functions <a name="functions"></a>

### `initialize(contract IERC20Upgradeable _leagueToken, uint256 _startAfter)` (public) <a name="leaguetokenvesting-initialize-contract-ierc20upgradeable-uint256-"></a>

**Dev doc**: all the details are hard coded


#### Params
 - `_leagueToken`: - League token address

 - `_startAfter`: - Delay before start

### `addVester(address _newVester)` (external) <a name="leaguetokenvesting-addvester-address-"></a>

**Dev doc**: Add new vester address


#### Params
 - `_newVester`: - Address of new vester

### `removeVester(address _vesterToRemove)` (external) <a name="leaguetokenvesting-removevester-address-"></a>

**Dev doc**: Remove vester


#### Params
 - `_vesterToRemove`: - Address of new vester

### `updateStartTime(uint256 _startAfter)` (external) <a name="leaguetokenvesting-updatestarttime-uint256-"></a>

*Description*: Update start time

**Dev doc**: Can only be updated before the start

#### Params
 - `_startAfter`: - Time after which u want to start (cant be 0);


### `recoverToken(address _token, uint256 _amount)` (external) <a name="leaguetokenvesting-recovertoken-address-uint256-"></a>

*Description*: Recover any erc20 token

**Dev doc**: All tokens goes to the admin wallet first

#### Params
 - `_token`: - ERC20 token address

 - `_amount`: - Amount to recover


### `addOrUpdateInvestor(address _investor, uint256 _amount)` (external) <a name="leaguetokenvesting-addorupdateinvestor-address-uint256-"></a>

*Description*: Add, update or remove single investor

**Dev doc**: To remove make amount 0 before it starts
You can add, updated and remove any time

#### Params
 - `_investor`: - Address of investor

 - `_amount`: - For how much amount (in $) has investor invested. ex  100$ = 100 * 100 = 100,00


### `addOrUpdateInvestors(address[] _investors, uint256[] _amounts)` (external) <a name="leaguetokenvesting-addorupdateinvestors-address---uint256---"></a>

*Description*: Add, update or remove batch of investors


#### Params
 - `_investors`: - Array of address of investors

 - `_amounts`: - Array of investors amounts

### `claimInvestorUnlockedTokens()` (external) <a name="leaguetokenvesting-claiminvestorunlockedtokens--"></a>

*Description*: claim unlocked tokens (only investor)

### `_addRound(uint256 _totalSupply, uint256 _price, uint256 _initialReleasePercent, uint256 _cliffPeriod, uint256 _vestingPeriod, uint256 _noOfVestings, uint256 _startTime)` (internal) <a name="leaguetokenvesting-_addround-uint256-uint256-uint256-uint256-uint256-uint256-uint256-"></a>

**Dev doc**: Add new round


#### Params
 - `_totalSupply`: - Total supply of NOMO token for this round

 - `_price`: - Price of NOMO token in $

 - `_initialReleasePercent`: - Tokens to be released at token generation event

 - `_cliffPeriod`: - Time user have to wait after start to get his/her first vesting

 - `_vestingPeriod`: - Duration of single vesting (in secs)

 - `_noOfVestings`: - Total no of vesting will be given

 - `_startTime`: - Vesting started at

### `getInvestorClaimableTokens(address _investor) → uint256` (external) <a name="leaguetokenvesting-getinvestorclaimabletokens-address-"></a>

#### Returns
 - amount of unlockToken which are currently unclaimed for a investor

### `getInvestorTotalAssigned(address _investor) → uint256` (external) <a name="leaguetokenvesting-getinvestortotalassigned-address-"></a>


### `getInvestorVestingTokens(address _investor) → uint256` (external) <a name="leaguetokenvesting-getinvestorvestingtokens-address-"></a>


### `getInvestorVestingsClaimed(address _investor) → uint256` (external) <a name="leaguetokenvesting-getinvestorvestingsclaimed-address-"></a>


### `getInvestorTokensInContract(address _investor) → uint256` (external) <a name="leaguetokenvesting-getinvestortokensincontract-address-"></a>

