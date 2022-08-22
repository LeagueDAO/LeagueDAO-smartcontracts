// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "../gen1/interfaces/INomoNFT.sol";
import "./interfaces/IGen2PlayerToken.sol";

contract Gen2PointsCalculator is Ownable {
    using SafeCast for uint256;
    using SafeCast for int256;

    /// @dev NomoNFT token
    INomoNFT nft;
    IGen2PlayerToken gen2PlayerToken;

    /// @notice List of allowance to set token parameters
    mapping(uint256 => bool) public allowedParametersSets;

    /// @notice List of multipliers
    mapping(string => int256) public multipliers;

    /// @notice Multipliers divider
    int256 public constant MULTIPLIERS_DIVIDER = 100;

    /// @notice Parameters divider
    int256 public immutable parametersDivider;

    /// @notice Changes window delay in seconds
    uint256 public delay;

    /// @notice Changes window duration in seconds
    uint256 public changesWindow;

    /// @notice Start point of changes window (timestamp)
    uint256 public announceTimestamp = 0;

    /// @dev Start point of changes window
    event ChangesAnnouncement();

    /// @dev When some of parameters was changed
    event ParametersChanged();

    /// @dev When delay was changed
    event DelayChanged(uint256 newValue);

    /// @dev When changes window updated
    event WindowChanged(uint256 newValue);

    /**
     * @dev Allows to make changes of parameters in the specified timeframe
     */
    modifier onlyInChangesWindow() {
        require(
            announceTimestamp + delay < block.timestamp && block.timestamp < announceTimestamp + delay + changesWindow,
            "not in changes window"
        );
        _;
    }

    /**
     * @dev Contract constructor
     * @param _nft Address of the NomoNFT
     * @param _delay Delay in seconds
     * @param _changesWindow Duration in seconds
     */
    constructor(
        INomoNFT _nft,
        IGen2PlayerToken _gen2PlayerToken,
        uint256 _delay,
        uint256 _changesWindow
    ) {
        require(_delay > 1 hours, "The delay must be more than 1 hour");
        require(_changesWindow > 5 minutes, "Invalid window value");
        nft = _nft;
        gen2PlayerToken = _gen2PlayerToken;
        parametersDivider = nft.PARAMETERS_DECIMALS().toInt256();
        delay = _delay;
        announceTimestamp = block.timestamp - delay - 3; // sub 3 sec to be sure changesWindow started
        changesWindow = _changesWindow;
    }

    /**
     * @notice Allow parameters sets
     * @param _setId ID of the set
     */
    function allowParametersSets(uint256 _setId) external onlyOwner onlyInChangesWindow {
        allowedParametersSets[_setId] = true;
        emit ParametersChanged();
    }

    /**
     * @notice Disallow parameters sets
     * @param _setId ID of the set
     */
    function disallowParametersSets(uint256 _setId) external onlyOwner onlyInChangesWindow {
        allowedParametersSets[_setId] = false;
        emit ParametersChanged();
    }

    /**
     * @notice Set multiplier
     * @param _name League name
     * @param _multiplier Multiplier value
     */
    function setMultiplier(string memory _name, int256 _multiplier) external onlyOwner onlyInChangesWindow {
        multipliers[_name] = _multiplier;
        emit ParametersChanged();
    }

    /**
     * @notice Announce changes of params
     */
    function announceChanges() external onlyOwner {
        announceTimestamp = block.timestamp;
        emit ChangesAnnouncement();
    }

    /**
     * @notice Set delay
     * @param _delay Delay in seconds
     */
    function setDelay(uint256 _delay) external onlyOwner onlyInChangesWindow {
        require(_delay > 1 hours, "The delay must be more than 1 hour");
        delay = _delay;
        emit DelayChanged(delay);
        emit ParametersChanged();
    }

    /**
     * @notice Set changes window, when it possible to update params
     * @param _changesWindow Duration in seconds
     */
    function setChangesWindow(uint256 _changesWindow) external onlyOwner onlyInChangesWindow {
        require(_changesWindow > 5 minutes, "Invalid window value");
        changesWindow = _changesWindow;
        emit WindowChanged(changesWindow);
        emit ParametersChanged();
    }

    /**
     * @notice Set multipliers when possible
     * @param _names Array of names
     * @param _multipliers Array of multipliers
     */
    function setMultipliers(string[] memory _names, int256[] calldata _multipliers)
        external
        onlyOwner
        onlyInChangesWindow
    {
        require(_names.length == _multipliers.length, "_names.length != _multipliers.length");
        for (uint256 i = 0; i < _names.length; i++) {
            multipliers[_names[i]] = _multipliers[i];
        }
        emit ParametersChanged();
    }

    /**
     * @notice Calculate points by token ID and game start timestamp
     * @param _tokenId ID of the token
     * @param _gameStartTime Timestamp when game was started
     * @return points Game points
     */
    function calculatePoints(uint256 _tokenId, uint256 _gameStartTime) external view returns (uint256 points) {
        uint256 _imageId = gen2PlayerToken.nftIdToImageId(_tokenId);
        (
            ,
            ,
            ,
            ,
            ,
            uint256 parametersSetId,
            string[] memory parametersNames,
            uint256[] memory parametersValues,
            uint256 parametersUpdateTime
        ) = nft.getCardImage(_imageId);

        require(allowedParametersSets[parametersSetId], "token's parameters set not allowed");
        if (parametersUpdateTime < _gameStartTime) {
            return 0;
        }
        require(parametersNames.length == parametersValues.length, "parametersNames.length != parametersValues.length");
        int256 signedPoints = 0;
        for (uint256 i = 0; i < parametersNames.length; ++i)
            signedPoints += multipliers[parametersNames[i]] * parametersValues[i].toInt256();
        if (signedPoints <= 0) {
            points = 0;
        } else {
            // Dividing by the divisors and simple rounding to the nearest integer
            signedPoints =
                (// * 10 and + 5, to get a rounded value
                (signedPoints * int256(10)) / MULTIPLIERS_DIVIDER / parametersDivider + int256(5)) /
                int256(10); // Dividing by 10 for truncation
            points = signedPoints.toUint256();
        }
    }
}
