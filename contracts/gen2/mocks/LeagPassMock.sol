// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;
import "../abstracts/common-parts/SeasonSyncNonupgradeable.sol";

contract LeagPassMock is SeasonSyncNonupgradeable {
    constructor() SeasonSyncNonupgradeable(msg.sender) {}

    function joinTheLeague() external {
        fantasyLeague.addUser(_msgSender());
    }

    function joinTheLeagueZeroAddress() external {
        fantasyLeague.addUser(address(0));
    }
}
