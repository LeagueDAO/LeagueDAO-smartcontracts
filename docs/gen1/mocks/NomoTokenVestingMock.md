# NomoTokenVestingMock
**


## Table of contents:
- [Functions:](#functions)


## Functions <a name="functions"></a>

### `_addRound(uint256 _totalSupply, uint256 _price, uint256 _initialReleasePercent, uint256 _cliffPeriod, uint256 _vestingPeriod, uint256 _noOfVestings, uint256 _startTime)` (internal) <a name="nomotokenvestingmock-_addround-uint256-uint256-uint256-uint256-uint256-uint256-uint256-"></a>


#### Params
 - `_totalSupply`: : total supply of nomo token for this round

 - `_price`: : price of nomo token in $

 - `_initialReleasePercent`: : tokens to be released at token generation event

 - `_cliffPeriod`: : time user have to wait after start to get his/her first vesting

 - `_vestingPeriod`: : duration of single vesting (in secs)

 - `_noOfVestings`: : total no of vesting will be given
