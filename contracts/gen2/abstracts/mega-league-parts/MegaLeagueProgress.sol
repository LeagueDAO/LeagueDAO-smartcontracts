// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "../common-parts/SeasonSync.sol";

abstract contract MegaLeagueProgress is SeasonSync {
    // _______________ Enums _______________

    enum MegaLeagueStage {
        WaitingCompletedPlayoff,
        DivisionWinnersReading,
        MegaLeague,
        RewardsCalculation,
        RewardsWithdrawal
    }

    // _______________ Storage _______________

    MegaLeagueStage private megaLeagueStage;

    // _______________ Events _______________

    event MegaLeagueStageMovedTo(MegaLeagueStage indexed _s);

    // _______________ Modifiers _______________

    modifier onlyMegaLeagueStage(MegaLeagueStage _s) {
        require(megaLeagueStage == _s, "This is not available at the current stage of the Mega League");
        _;
    }

    // _______________ Initializer _______________

    function init_MegaLeagueProgress_unchained() internal onlyInitializing {
        megaLeagueStage = MegaLeagueStage.WaitingCompletedPlayoff;
        emit MegaLeagueStageMovedTo(MegaLeagueStage.WaitingCompletedPlayoff);
    }

    // _______________ Public functions _______________

    function getMegaLeagueStage() external view returns (MegaLeagueStage) {
        return megaLeagueStage;
    }

    // _______________ External functions _______________

    function startMegaLeague() external onlyFantasyLeague {
        moveMegaLeagueStageTo(MegaLeagueStage.DivisionWinnersReading);
    }

    function finishMegaLeague() external onlyFantasyLeague {
        moveMegaLeagueStageTo(MegaLeagueStage.WaitingCompletedPlayoff);
    }

    // _______________ Internal functions _______________

    function moveMegaLeagueStageTo(MegaLeagueStage _s) internal {
        MegaLeagueStage s = megaLeagueStage;
        if (s != MegaLeagueStage.RewardsWithdrawal) {
            require(s < _s, "The Mega League stage should only be moved forward");
        } else {
            require(
                _s == MegaLeagueStage.WaitingCompletedPlayoff,
                "Stage should only be moved to waiting completed playoff"
            );
        }

        megaLeagueStage = _s;
        emit MegaLeagueStageMovedTo(_s);
    }

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private gap;
}
