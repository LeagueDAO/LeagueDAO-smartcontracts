// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "../abstracts/mega-league-parts/DivisionWinnerStatsStruct.sol";

interface IMegaLeague {
    function startMegaLeague() external;

    function finishMegaLeague() external;

    function updateSeasonId() external;

    function setMegaLeagueRewards(address _token, uint256 _rewardAmount) external;
}
