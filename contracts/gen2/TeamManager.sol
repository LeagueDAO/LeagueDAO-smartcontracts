// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "./interfaces/IGen2PlayerToken.sol";
import "./abstracts/team-manager-parts/StakeValidator.sol";
import "./abstracts/team-manager-parts/Staker.sol";

import "./abstracts/team-manager-parts/TeamPointsCalculator.sol";

/**
 * @title TeamManager -- .
 */
contract TeamManager is TeamPointsCalculator {
    // _______________ Initializer _______________

    /**
     * @dev Initializes this contract by setting the deployer as the initial administrator that has the
     * `DEFAULT_ADMIN_ROLE` role and the following parameters:
     * @param _gen2PlayerToken   An address of the second generation player NFT contract that mints duplicates of the
     * first generation player NF tokens.
     * @param _calculator   The contract that calculates scores of the specific first generation player NF tokens.
     *
     * @notice It is used as the constructor for upgradeable contracts.
     */
    function initialize(
        address _gen2PlayerToken,
        address _teamsStakingDeadlinesContract,
        address _calculator
    ) external initializer {
        init_SeasonSync_unchained(_msgSender());
        init_StakeValidator_unchained(_gen2PlayerToken, _teamsStakingDeadlinesContract);
        init_Staker_unchained();
        init_TeamPointsCalculator_unchained(_calculator);
    }

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private gap;
}
