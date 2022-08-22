// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../../interfaces/IFantasyLeague.sol";

/**
 * @title
 */
abstract contract SeasonSync is AccessControlUpgradeable {
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

    // _______________ Initializer _______________

    function init_SeasonSync_unchained(address _admin) internal onlyInitializing {
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

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[48] private gap;
}
