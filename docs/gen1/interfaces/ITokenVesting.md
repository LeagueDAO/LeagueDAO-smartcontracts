# ITokenVesting
**


## Table of contents:
- [Functions:](#functions)
  - [`updateStartTime(uint256 _startAfter)` (external) ](#itokenvesting-updatestarttime-uint256-)
  - [`addOrUpdateInvestor(address _investor, uint256 _amount)` (external) ](#itokenvesting-addorupdateinvestor-address-uint256-)
  - [`addOrUpdateInvestors(address[] _investor, uint256[] _amount)` (external) ](#itokenvesting-addorupdateinvestors-address---uint256---)
  - [`recoverToken(address _token, uint256 amount)` (external) ](#itokenvesting-recovertoken-address-uint256-)
  - [`claimInvestorUnlockedTokens()` (external) ](#itokenvesting-claiminvestorunlockedtokens--)
  - [`getInvestorClaimableTokens(address _investor) → uint256` (external) ](#itokenvesting-getinvestorclaimabletokens-address-)
- [Events:](#events)


## Functions <a name="functions"></a>

### `updateStartTime(uint256 _startAfter)` (external) <a name="itokenvesting-updatestarttime-uint256-"></a>


### `addOrUpdateInvestor(address _investor, uint256 _amount)` (external) <a name="itokenvesting-addorupdateinvestor-address-uint256-"></a>


### `addOrUpdateInvestors(address[] _investor, uint256[] _amount)` (external) <a name="itokenvesting-addorupdateinvestors-address---uint256---"></a>


### `recoverToken(address _token, uint256 amount)` (external) <a name="itokenvesting-recovertoken-address-uint256-"></a>


### `claimInvestorUnlockedTokens()` (external) <a name="itokenvesting-claiminvestorunlockedtokens--"></a>


### `getInvestorClaimableTokens(address _investor) → uint256` (external) <a name="itokenvesting-getinvestorclaimabletokens-address-"></a>

## Events <a name="events"></a>
### event `InvestorsAdded(address[] investors, uint256[] amount)` <a name="itokenvesting-investorsadded-address---uint256---"></a>


### event `InvestorAdded(address investors, uint256 amount)` <a name="itokenvesting-investoradded-address-uint256-"></a>


### event `InvestorTokensClaimed(address investor, uint256 amount)` <a name="itokenvesting-investortokensclaimed-address-uint256-"></a>


### event `RecoverToken(address token, uint256 amount)` <a name="itokenvesting-recovertoken-address-uint256-"></a>


