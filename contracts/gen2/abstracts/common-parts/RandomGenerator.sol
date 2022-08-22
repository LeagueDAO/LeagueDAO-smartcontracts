// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "../../interfaces/INomoRNG.sol";

/**
 * @title Random generator -- contract, which is common part of several contracts in `contracts/gen2/*`, provides the
 * random numbers.
 *
 * @dev This contract includes the following functionality:
 *  - Sets the `NomoRNG` random generator contract which is connected with the Chainlink VRFv2.
 *  - Stores and updates the random number.
 */
abstract contract RandomGenerator is ReentrancyGuardUpgradeable {
    // _______________ Storage _______________

    // The random number generator interface
    INomoRNG public generator;

    // The current random number
    uint256 public randNumber;

    // _______________ Events _______________

    /**
     * @dev Emitted when the interface address of the `NomoRNG` random generator contract (`generator`) is changed to an
     * address `_generator`.
     *
     * @param _generator The address which is set by the current interface address of the random generator contract.
     */
    event RandomGeneratorSet(address _generator);

    /**
     * @dev Emitted when the random number (`randNumber`) has been updated to a number (`_randomNumber`).
     *
     * @param _randomNumber The number which is set by the current random number (`randNumber`).
     */
    event RandNumberUpdated(uint256 _randomNumber);

    // _______________ Initializer _______________

    /*
     * Sets the address of the `NomoRNG` random number generator to a `_generator`.
     *
     * NOTE. The function init_{ContractName}_unchained found in every upgradeble contract is the initializer function
     * without the calls to parent initializers, and can be used to avoid the double initialization problem.
     */
    function init_RandomGenerator_unchained(address _generator) internal onlyInitializing {
        generator = INomoRNG(_generator);
        __ReentrancyGuard_init();
        emit RandomGeneratorSet(_generator);
    }

    // _______________ Internal functions _______________

    /*
     * Sets the random number generator contract (`generator`) as `_generator`. (`NomoRNG` is the random generator
     * contract).
     *
     * Requirements:
     *  - A random generator address (`_generator`) should not equal to the zero address.
     *
     * `_generator` -- an address of the random generator that updates the random number (`randNumber`).
     */
    function setRandomGenerator(address _generator) internal {
        require(_generator != address(0), "Zero address");

        generator = INomoRNG(_generator);
        emit RandomGeneratorSet(_generator);
    }

    /*
     * Updates the random number (`randNumber`) via Chainlink VRFv2.
     *
     * Requirements:
     *  - The random generator address (`generator`) should not equal to the zero address.
     *
     * NOTE. Firstly, need to generate the random number on the `NomoRNG` contract.
     */
    function updateRandomNumber() internal nonReentrant {
        require(address(generator) != address(0), "Zero address");

        // Getting of the random number (after that the generator forgets this number)
        uint256 randNum = generator.requestRandomNumber();
        randNumber = randNum;

        emit RandNumberUpdated(randNum);
    }

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new variables without shifting
     * down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps.
     */
    uint256[48] private gap;
}
