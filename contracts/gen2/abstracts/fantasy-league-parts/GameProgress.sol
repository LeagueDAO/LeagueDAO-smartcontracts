// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

// Here these contracts is connected to the Fantasy League contract (`FantasyLeague.sol`)
// This is developed with OpenZeppelin upgradeable contracts v4.5.2
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

// List of errors for this contract
// Reverts when movement to the stage which is not further in the enum or exception
error IncorrectGameStageDirectionChange();
/*
 * Reverts when movement from the exception stage to the stage which is not `GameStage.WaitingNextGame`,
 * `GameStage.UserAdding`.
 */
error IncorrectGameStageChange();
// Reverts when try to untimely call a function
error IncorrectGameStage();

/**
 * @title Game Progress -- contract, which is part of the Fantasy League contract (`FantasyLeague.sol`), provides
 * season and game process advancement functionality for the Fantasy League contract.
 *
 * @notice All contracts that require a current season ID are oriented to the season ID in this contract
 * using the season sync contract (`SeasonSync.sol` or `SeasonSyncNonupgradeable.sol`).
 *
 * It is through this contract that the sequence of function calls is regulated.
 *
 * This contract connects OpenZeppelin `Initializable.sol` and `CountersUpgradeable.sol` to the Fantasy League contract.
 *
 * @dev This contract includes the following functionality:
 *  - Stores the list of game stages for the Fantasy League contract and the current game stage, as well as advances it
 *    to the next.
 *  - Stores the current season ID and advances it to the next.
 */
abstract contract GameProgress is Initializable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // _______________ Enums _______________

    /*
     * A list of states of the game stage variable (`gameStage`), that is, the game stages of the Fantasy League
     * contract during one season.
     *
     * This list is used to ensure that the Fantasy League contract functions are called in the required sequence. That
     * is, this list tells you what now needs to be called in the Fantasy League contract.
     *
     * NOTE. Adding and shuffle of users (`UserAdding` and `UserShuffle`) occurs once a season. Then the Fantasy League
     * game process can be represented by three main stages: weekly head to head competitions (15 weeks),
     * playoffs (16th and 17th week), and the Mega League [final] (17th week). The state of waiting for the next game
     * (`WaitingNextGame`) is associated with a special function (`nextGame()`, FantasyLeague.sol) that is repeatedly
     * called by the back end to continue the game process. We get into this state every week before the competitions
     * start. States with the prefix "H2H" are used for the weekly H2H competition stage. That is, every week we get to
     * `H2HCompetitions`, `H2HRewardPerPointCalculation` and `H2HRewardsUpdate`. On 16th week, we move on to
     * the playoff stage, where first the competitors are selected from all users (`PlayoffCompetitorsSelection`), then
     * the competitions are held (`PlayoffCompetitions`), and then the rewards are calculated (`PlayoffRewards`). Then,
     * using the next game function (`nextGame()`, FantasyLeague.sol), we move on to the Mega League,
     * which is implemented in an external contract (`MegaLeague.sol`).
     *
     * In addition, users have a player staking period (forming their game team) with individual deadlines. The staking
     * takes place between state `WaitingNextGame` and `H2HCompetitions`. External contract `TeamManager.sol` is
     * responsible for the functionality of the stake, and external contract `TeamsStakingDeadlines.sol` is responsible
     * for the deadlines.
     */
    enum GameStage {
        UserAdding,
        UserShuffle,
        WaitingNextGame,
        H2HCompetitions,
        H2HRewardPerPointCalculation,
        H2HRewardsUpdate,
        PlayoffCompetitorsSelection,
        PlayoffCompetitions,
        PlayoffRewards,
        MegaLeague
    }

    // _______________ Storage _______________

    // The current stage of the Fantasy League game process. See the `GameStage` enum comment for details
    GameStage internal gameStage;

    /*
     * The the current season ID, during which the entire process of the Fantasy League game takes place. (The season
     * is about 17 weeks long).
     */
    CountersUpgradeable.Counter public seasonId;

    // _______________ Events _______________

    /**
     * @dev Emitted when the game stage (`gameStage`) is moved to the next stage (`_gs`). That is, the `gameStage`
     * variable is assigned value `_gs`.
     *
     * @param _gs A new game stage value.
     */
    event GameStageMovedTo(GameStage indexed _gs);

    /**
     * @dev Emitted when the Fantasy League moves on to the next season (`_seasonId`). That is, the `seasonId` variable
     * is assigned value `_seasonId`.
     *
     * @param _seasonId A next season ID.
     */
    event SeasonFinished(uint256 indexed _seasonId);

    // _______________ Modifiers _______________

    /**
     * @dev Checks that the current game stage is the `_gs` stage. Reverts in the opposite case.
     *
     * @param _gs The value of the game stage to compare with the current one.
     */
    modifier onlyGameStage(GameStage _gs) {
        if (gameStage != _gs) revert IncorrectGameStage();
        _;
    }

    // _______________ Initializer _______________

    /*
     * Sets the game stage (`gameStage`) to the user adding stage (`GameStage.UserAdding`).
     *
     * NOTE. The function init_{ContractName}_unchained found in every upgradeble contract is the initializer function
     * without the calls to parent initializers, and can be used to avoid the double initialization problem.
     */
    function init_GameProgress_unchained() internal onlyInitializing {
        gameStage = GameStage.UserAdding;
        emit GameStageMovedTo(GameStage.UserAdding);
    }

    // _______________ External functions _______________

    //  ____ Extra view functionality for back end ____

    /**
     * @dev Returns the current value of the season ID (`seasonId`).
     *
     * @return   The current season ID.
     */
    function getSeasonId() external view returns (uint256) {
        return seasonId.current();
    }

    // _______________ Public functions _______________

    /**
     * @dev Returns the current value of the game stage (`gameStage`).
     *
     * @return   The current game stage.
     */
    function getGameStage() public view returns (GameStage) {
        return gameStage;
    }

    // _______________ Internal functions _______________

    /*
     * Moves the game state (`gameStage`) to the specified one.
     *
     * Requirements:
     *  - The stage to which moves should be further in the enum, except for: `GameStage.H2HRewardsUpdate`,
     *    `GameStage.PlayoffCompetitions`, `GameStage.PlayoffRewards`.
     */
    function moveGameStageTo(GameStage _gs) internal {
        GameStage gs = gameStage;
        if (
            gs != GameStage.H2HRewardsUpdate &&
            gs != GameStage.PlayoffCompetitions &&
            gs != GameStage.PlayoffRewards &&
            gs != GameStage.MegaLeague
        ) {
            if (gs > _gs) revert IncorrectGameStageDirectionChange();
        } else {
            if (!(_gs == GameStage.WaitingNextGame || _gs == GameStage.UserAdding || _gs == GameStage.PlayoffRewards))
                revert IncorrectGameStageChange();
        }

        gameStage = _gs;
        emit GameStageMovedTo(_gs);
    }

    // Moves this contract to next season
    function closeSeason() internal {
        emit SeasonFinished(seasonId.current());
        seasonId.increment();
    }

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new variables without shifting
     * down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps.
     */
    uint256[48] private gap;
}
