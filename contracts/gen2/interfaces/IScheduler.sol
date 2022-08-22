// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

interface IScheduler {
    function getH2HWeekSchedule(uint256 _week) external pure returns (uint8[12] memory);

    function getPlayoffWeekSchedule(uint256 _week) external pure returns (uint8[4] memory);
}
