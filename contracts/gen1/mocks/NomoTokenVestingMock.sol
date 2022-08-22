// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "../LeagueTokenVesting.sol";

contract NomoTokenVestingMock is LeagueTokenVesting {
    uint256 private constant SUPPLY_PERCENT = 10000;
    uint256 private constant PRICE = 1e18;
    uint256 private constant INITIAL_RELEASE_PERCENT = 0;
    uint256 private constant CLIFF_PERIOD = 5;
    uint256 private constant VESTING_PERIOD = 5;
    uint256 private constant NO_OF_VESTINGS = 6;

    /* ========== PRIVATE FUNCTIONS ========== */
    /**
     * @param _totalSupply : total supply of nomo token for this round
     * @param _price : price of nomo token in $
     * @param _initialReleasePercent : tokens to be released at token generation event
     * @param _cliffPeriod : time user have to wait after start to get his/her first vesting
     * @param _vestingPeriod : duration of single vesting (in secs)
     * @param _noOfVestings : total no of vesting will be given
     */
    function _addRound(
        uint256 _totalSupply,
        uint256 _price,
        uint256 _initialReleasePercent,
        uint256 _cliffPeriod,
        uint256 _vestingPeriod,
        uint256 _noOfVestings,
        uint256 _startTime
    ) internal override {
        RoundInfo storage newRoundInfo = roundInfo;
        _price = PRICE;
        _initialReleasePercent = INITIAL_RELEASE_PERCENT;
        _cliffPeriod = CLIFF_PERIOD;
        _vestingPeriod = VESTING_PERIOD;
        _noOfVestings = NO_OF_VESTINGS;
        newRoundInfo.price = _price;
        newRoundInfo.totalSupply = _totalSupply;
        newRoundInfo.supplyLeft = _totalSupply;
        newRoundInfo.initialReleasePercent = _initialReleasePercent;
        newRoundInfo.cliffPeriod = _cliffPeriod;
        newRoundInfo.vestingPeriod = _vestingPeriod;
        newRoundInfo.noOfVestings = _noOfVestings;
        newRoundInfo.cliffEndTime = _startTime + _cliffPeriod;
    }
}
