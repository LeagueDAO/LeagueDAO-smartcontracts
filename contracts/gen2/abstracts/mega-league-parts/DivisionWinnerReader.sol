// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "../mega-league-parts/MegaLeagueProgress.sol";
import "../mega-league-parts/DivisionWinnerStatsStruct.sol";

abstract contract DivisionWinnerReader is MegaLeagueProgress {
    // _______________ Storage _______________

    /*
     * Next division winner index to process. It is basically an division winner pointer to continue the different
     * processes from where it stopped in the last transaction.
     */
    uint256 public nextProcessedDivisionWinner;

    // Season ID => array of division champions
    mapping(uint256 => address[]) public divisionWinners;

    /*
     * Stores a division winner index in the array of division winners.
     * Season ID => (division winner => [1 + index in the `divisionWinners` array]).
     * NOTE. Plus 1, because the zero value is used to check that a division winner exists.
     */
    mapping(uint256 => mapping(address => uint256)) public divisionWinnersIncreasedIndex;

    // Season ID => (division winner => DivisionWinnerStats)
    mapping(uint256 => mapping(address => DivisionWinnerStats)) public divisionWinnerStats;

    // _______________ Initializer _______________

    function init_DivisionWinnerReader_unchained() internal onlyInitializing {}

    // _______________ External functions _______________

    /**
     * @dev Reads the array of division winner and their season statistics from the FantasyLeague contract after the
     * playoff end and saves it to this contract.
     *
     * @param _numberOfDivisions A number of divisions to process. It allows you to split the function call into
     * multiple transactions to avoid reaching the gas cost limit. Each time the function is called, this number can be
     * anything greater than zero. When the process of reading is completed, the MegaLeague moves on to the next stage
     * (`MegaLeagueStage.MegaLeague`).
     */
    // prettier-ignore
    function readDivisionWinner(uint256 _numberOfDivisions)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyMegaLeagueStage(MegaLeagueStage.DivisionWinnersReading)
    {
        require(_numberOfDivisions != 0, "Number of divisions should be greater than zero");

        uint256 fromDivisionWinner = nextProcessedDivisionWinner;
        // The last division winner that will be calculated in this batch
        uint256 toDivisionWinner = nextProcessedDivisionWinner + _numberOfDivisions - 1;
        // Check of overflow
        uint256 lastDivisionWinner = fantasyLeague.getNumberOfDivisions() - 1;
        if (toDivisionWinner < lastDivisionWinner) {
            nextProcessedDivisionWinner = toDivisionWinner + 1;
        } else {
            if (toDivisionWinner != lastDivisionWinner) {
                toDivisionWinner = lastDivisionWinner;
            }
            nextProcessedDivisionWinner = 0;
            moveMegaLeagueStageTo(MegaLeagueStage.MegaLeague);
        }

        // Addresses of division winners
        // Reading of division winners
        uint256 season = seasonId;
        address[] memory dWinners = fantasyLeague.getSomeDivisionWinners(season, fromDivisionWinner, toDivisionWinner);

        // Saving of division winners to the storage
        address dWinner;
        address[] storage refDivisionWinners = divisionWinners[season];
        mapping(address => uint256) storage refDivisionWinnersIncreasedIndex = divisionWinnersIncreasedIndex[season];
        for (uint256 i = 0; i < dWinners.length; ++i) {
            dWinner = dWinners[i];
            refDivisionWinners.push(dWinner);
            refDivisionWinnersIncreasedIndex[dWinner] = fromDivisionWinner + i;
        }

        // Season statistics of division winners
        // Reading of statistics
        DivisionWinnerStats[] memory dWinnersStats =
            fantasyLeague.getSomeDivisionWinnersStats(season, fromDivisionWinner, toDivisionWinner);

        // Saving of statistics to the storage
        mapping(address => DivisionWinnerStats) storage refDivisionWinnerStats = divisionWinnerStats[season];
        for (uint256 i = 0; i < dWinnersStats.length; ++i)
            refDivisionWinnerStats[dWinners[i]] = dWinnersStats[i];
    }

    // _______________ Public functions _______________

    function isDivisionWinner(uint256 _season, address _user) public view returns (bool) {
        return divisionWinnersIncreasedIndex[_season][_user] != 0;
    }

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[46] private gap;
}
