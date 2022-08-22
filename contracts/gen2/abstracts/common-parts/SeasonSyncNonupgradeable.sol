// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../../interfaces/IFantasyLeague.sol";

/**
 * @title
 */
abstract contract SeasonSyncNonupgradeable is AccessControl {
    // _______________ Storage _______________

    IFantasyLeague public fantasyLeague;

    uint256 public seasonId;

    // _______________ Events _______________

    event FantasyLeagueSet(address _fantasyLeague);

    event SeasonIdUpdated(uint256 indexed _seasonId);

    // _______________ Modifiers _______________

    modifier onlyFantasyLeague() {
        require(_msgSender() == address(fantasyLeague), "Function should only be called by the FantasyLeague contract");
        _;
    }

    // _______________ Constructor _______________

    constructor(address _admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
    }

    // _______________ External functions _______________

    function setFantasyLeague(address _fantasyLeague) external onlyRole(DEFAULT_ADMIN_ROLE) {
        fantasyLeague = IFantasyLeague(_fantasyLeague);
        emit FantasyLeagueSet(_fantasyLeague);
    }

    function updateSeasonId() external {
        require(
            _msgSender() == address(fantasyLeague) || hasRole(DEFAULT_ADMIN_ROLE, _msgSender()),
            "Should be called by the FantasyLeague contract or administrator"
        );

        uint256 season = fantasyLeague.getSeasonId();
        seasonId = season;
        emit SeasonIdUpdated(season);
    }
}
