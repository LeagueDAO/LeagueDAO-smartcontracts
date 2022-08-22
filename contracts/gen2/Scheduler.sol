// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title Scheduler -- competition schedule getter.
 *
 * @dev This contract includes the following functionality:
 *  - Getting of week schedule for the head to head competitions in the Fantasy League.
 *  - Getting of schedule for the 16th and 17th weeks of the head to head competitions. It is playoff in the Fantasy
 *    League.
 */
contract Scheduler is Initializable {
    // _______________ Initializer _______________

    function initialize() external initializer {}

    // _______________ External functions _______________

    /**
     * @dev Returns the week schedule for the head to head competitions in the Fantasy League.
     *
     * @param _week Competition week number.
     * @return   Teams' order.
     *
     * @notice The elements of the array are read in pairs, that is, elements with indexes zero and one correspond to the
     * first pair, and so on. Each value is the index of the user (is equals to team) in the division.
     *
     * The number "12" (the array size) here means the size of the division.
     */
    // prettier-ignore
    function getH2HWeekSchedule(uint256 _week) external pure returns (uint8[12] memory) {
        /*
         * Schedule for H2H competitions. For the first week it is
         * the first team vs the twelfth team (0 vs 11), the second vs the eleventh, etc.
         */
        if (_week == 1)  return [ 0, 11,   1,  10,   2,  9,    3,  8,    4,  7,    5,  6  ];

        if (_week == 2)  return [ 0, 10,   11, 9,    1,  8,    2,  7,    3,  6,    4,  5  ];

        if (_week == 3)  return [ 0, 9,    10, 8,    11, 7,    1,  6,    2,  5,    3,  4  ];

        if (_week == 4)  return [ 0, 8,    9,  7,    10, 6,    11, 5,    1,  4,    2,  3  ];

        if (_week == 5)  return [ 0, 7,    8,  6,    9,  5,    10, 4,    11, 3,    1,  2  ];

        if (_week == 6)  return [ 0, 6,    7,  5,    8,  4,    9,  3,    10, 2,    11, 1  ];

        if (_week == 7)  return [ 0, 5,    6,  4,    7,  3,    8,  2,    9,  1,    10, 11 ];

        if (_week == 8)  return [ 0, 4,    5,  3,    6,  2,    7,  1,    8,  11,   9,  10 ];

        if (_week == 9)  return [ 0, 3,    4,  2,    5,  1,    6,  11,   7,  10,   8,  9  ];

        if (_week == 10) return [ 0, 2,    3,  1,    4,  11,   5,  10,   6,  9,    7,  8  ];

        if (_week == 11) return [ 0, 1,    2,  11,   3,  10,   4,  9,    5,  8,    6,  7  ];

        if (_week == 12) return [ 0, 11,   1,  10,   2,  9,    3,  8,    4,  7,    5,  6  ];

        if (_week == 13) return [ 0, 10,   11, 9,    1,  8,    2,  7,    3,  6,    4,  5  ];

        if (_week == 14) return [ 0, 9,    10, 8,    11, 7,    1,  6,    2,  5,    3,  4  ];

        if (_week == 15) return [ 0, 8,    9,  7,    10, 6,    11, 5,    1,  4,    2,  3  ];

        revert("Schedule does not contain a week with the specified number");
    }

    /**
     * @dev Returns the schedule for playoff competitions for the 16th and 17th weeks of the Fantasy League.
     *
     * @param _week Competition week number.
     * @return   Teams' order.
     *
     * @notice The number "4" (the array size) here means the number of playoff competitors.
     */
    // prettier-ignore
    function getPlayoffWeekSchedule(uint256 _week) external pure returns (uint8[4] memory) {
        // For the 16th competition week: the first team vs the fourth team and the second vs the third
        if (_week == 16)  return [ 0, 3,  1, 2 ];

        /*
         * For the 17th competition week: the first vs the third.
         * NOTE. Because in the array in the Fantasy League, the winners of the 16th week will be in first and third
         * place. Two zeros at the end for compatibility with the algorithm.
         */
        if (_week == 17)  return [ 0, 1,  0, 0 ];

        revert("Schedule does not contain a week with the specified number");
    }
}
