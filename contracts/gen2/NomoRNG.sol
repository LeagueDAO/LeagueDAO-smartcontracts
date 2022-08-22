// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

/**
 * @title Nomo random number generator
 */
contract NomoRNG is Ownable, VRFConsumerBaseV2 {
    /// @dev Chainlink VRFv2 coordinator
    VRFCoordinatorV2Interface private immutable COORDINATOR;

    /// @dev Chainlink subscription ID
    uint64 private immutable subscriptionId;

    /// @dev Chainlink key hash
    bytes32 private immutable keyHash;

    /// @notice Chainlink Request ID
    uint256 public requestId;

    /// @notice Random number from Chainlink
    uint256 public randomNumber;

    /// @notice Allowed addresses to request random number
    mapping(address => bool) public requesters;

    /// @dev When random number generated
    event RandomGenerated(uint256 random);

    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
    }

    /**
     * @notice Send random to requester contract
     * @dev After external contract gets a number, set random to zero
     * @return _random Random number
     */
    function requestRandomNumber() external returns (uint256 _random) {
        require(requesters[_msgSender()], "not allowed");
        require(randomNumber > 0, "not generated");
        _random = randomNumber;
        randomNumber = 0;
    }

    /**
     * @notice Set requester contract
     */
    function setRequester(address _requester, bool _isAllowed) external onlyOwner {
        requesters[_requester] = _isAllowed;
    }

    /**
     * @notice Generate random number
     */
    function generateRandom() external onlyOwner {
        require(randomNumber == 0, "already generated");
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            3, // request confirmations
            100000, // callback gas limit
            1 // number of "words"
        );
    }

    /**
     * @notice Callback function used by VRF Coordinator
     * @param requestId - id of the request
     * @param randomWords - array of random results from VRF Coordinator
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        randomNumber = randomWords[0];
        emit RandomGenerated(randomNumber);
    }
}
