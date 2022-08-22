// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "../common-parts/SeasonSync.sol";
import "../../interfaces/IGen2PlayerToken.sol";
import "../../interfaces/ITeamsStakingDeadlines.sol";

/**
 * @dev
 */
abstract contract StakeValidator is SeasonSync {
    // _______________ Storage _______________

    // ____ External Gen2 NF Player Token interface ____

    /// @notice External Genesis Gen2 NF Player Token contract interface. This tokens is staked by users
    IGen2PlayerToken public gen2PlayerToken;

    // ____ External Teams Staking Deadlines interface ____

    /// @notice External Teams Staking Deadlines contract interface. This contract is used to store staking deadlines for teams
    ITeamsStakingDeadlines public teamsStakingDeadlinesContract;

    // ____  To check the filling of competing team positions (roles) during staking ____

    /// @notice Staking limitations setting, e.g. user can stake 1 QB, 2 RB, 2 WR, 1 TE, 3 DEF Line, 1 LB, 1 DEF Back + flex staking (see above)
    // Season ID => position code => staking amount
    mapping(uint256 => mapping(uint256 => uint256)) public positionNumber;

    /**
     * @notice Flex position code (see flex position staking limitation description below)
     * @dev Other position codes will be taken from admin and compared to position codes specified in the Genesis NomoNFT (see NomoNFT contract to find position codes and CardImages functionality)
     */
    uint256 public constant FLEX_POSITION = uint256(keccak256(abi.encode("FLEX_POSITION")));

    /// @notice Custom positions flex limitation, that's a places for staking where several positions code can stand/be, e.g. 3 staking places for QB, RB, WR or TE, so, for example, user can use them as 2 QB + 1 TE or 1 WR + 1 RB + 1 TE or in other way when in total there will 3 NFTs (additionally to usual limitations) with specified positions
    // Season ID => position code => is included in flex limitation
    mapping(uint256 => mapping(uint256 => bool)) public isFlexPosition;

    /// @notice  amount of staking places for flex limitation
    // Season ID => flex position number
    mapping(uint256 => uint256) public flexPositionNumber;

    // Season ID => token id => is token staked in the flex position
    mapping(uint256 => mapping(uint256 => bool)) public isPlayerInFlexPosition;

    /// @notice Staked tokens by position to control staking limitations
    // Season ID => user => position code => amount
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) public userPositionNumber;

    // _______________ Events _______________

    /// @notice When staked NFT contract changed
    event Gen2PlayerTokenSet(address _gen2PlayerToken);

    /// @notice When staking deadlines contract changed
    event TeamsStakingDeadlinesContractSet(address _teamsStakingDeadlinesContract);

    /// @notice When staking limitation updated
    event PositionNumberSet(uint256 _season, uint256 indexed _position, uint256 _newStakingLimit);

    /// @notice When positions are added or deleted from flex limitation
    event FlexPositionSet(uint256 _season, uint256 indexed _position, bool _isFlexPosition);

    /// @notice When flex limit amount is changed
    event FlexPositionNumberSet(uint256 _season, uint256 indexed _newNumber);

    // _______________ Modifiers _______________

    // Check that the `_address` is not zero
    modifier nonzeroAddress(address _address) {
        require(_address != address(0), "Zero address");
        _;
    }

    /*
     * Safety check that player token owner did not forget to pass a valid position code.
     *
     * `_position`   Integer number code that represents specific position of a player. This value should exist in the
     * Genesis NomoNFT contract (see NomoNFT contract to find position codes and CardImages functionality).
     *
     * NOTE Position code with zero value is potentially unsafe, so it is better not to use it at all.
     */
    modifier nonzeroPosition(uint256 _position) {
        require(_position != 0, "position code is 0, check position code");
        _;
    }

    // _______________ Initializer _______________

    function init_StakeValidator_unchained(address _gen2PlayerToken, address _teamsStakingDeadlinesContract)
        internal
        onlyInitializing
    {
        gen2PlayerToken = IGen2PlayerToken(_gen2PlayerToken);
        emit Gen2PlayerTokenSet(_gen2PlayerToken);

        setTeamsStakingDeadlinesContract(_teamsStakingDeadlinesContract);
    }

    // _______________ External functions _______________

    /**
     * @notice Change NFT address
     *
     * @param _gen2PlayerToken New NFT address
     */
    function setGen2PlayerToken(address _gen2PlayerToken)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonzeroAddress(_gen2PlayerToken)
    {
        gen2PlayerToken = IGen2PlayerToken(_gen2PlayerToken);
        emit Gen2PlayerTokenSet(_gen2PlayerToken);
    }

    /**
     * @notice Change staking deadlines contract address
     *
     * @param _teamsStakingDeadlinesContract New staking deadlines contract address
     */
    function setTeamsStakingDeadlinesContract(address _teamsStakingDeadlinesContract)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonzeroAddress(_teamsStakingDeadlinesContract)
    {
        teamsStakingDeadlinesContract = ITeamsStakingDeadlines(_teamsStakingDeadlinesContract);
        emit TeamsStakingDeadlinesContractSet(_teamsStakingDeadlinesContract);
    }

    /**
     * @notice Allows contract owner to set limitations for staking ( see flex limitations setter below)
     * @dev This is only usual limitation, in addition there are positions flex limitation
     * @param _position integer number code that represents specific position; ths value must exist in the Genesis NomoNFT (see NomoNFT contract to find position codes and CardImages functionality). Notice - this function reverts if _position is 0
     * @param _howMany amount of players with specified position that user can stake. Notice - user can stake some positions over this limit if these positions are included in the flex limitation
     */
    function setPositionNumber(uint256 _position, uint256 _howMany)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonzeroPosition(_position)
    {
        uint256 season = seasonId;
        positionNumber[season][_position] = _howMany;
        emit PositionNumberSet(season, _position, _howMany);
    }

    /**
     * @notice Allows contract owner to change positions in flex limitation
     * @dev This is addition to usual limitation
     * @param _position integer number code that represents specific position; ths value must exist in the Genesis NomoNFT (see NomoNFT contract to find position codes and CardImages functionality). Notice - this function reverts if _position is 0
     * @param _isFlexPosition if true, then position is in the flex, if false, then tokens with this positions can't be staked in flex limitation places
     */
    function setFlexPosition(uint256 _position, bool _isFlexPosition)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonzeroPosition(_position)
    {
        uint256 season = seasonId;
        require(
            isFlexPosition[season][_position] != _isFlexPosition,
            "passed _position is already with passed bool value"
        );
        isFlexPosition[season][_position] = _isFlexPosition;
        emit FlexPositionSet(season, _position, _isFlexPosition);
    }

    /**
     * @notice Allows contract owner to set number of tokens which can be staked as a part of the flex limitation
     * @dev If new limit is 0, then it means that flex limitation disabled. Note: you can calculate total number of tokens that can be staked by user if you will sum flex limitation amount and all limits for all positions.
     * @param _newFlexPositionNumber number of tokens that can be staked as a part of the positions flex limit
     */
    function setFlexPositionNumber(uint256 _newFlexPositionNumber) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 season = seasonId;
        flexPositionNumber[season] = _newFlexPositionNumber;
        emit FlexPositionNumberSet(season, _newFlexPositionNumber);
    }

    // _______________ Internal functions _______________

    /**
     * @notice Check limitations and fill the position limit with token if there is a free place.
     * @dev Reverts if user reached all limits for token's position
     * @param _tokenId Gen2PlayerToken id user wants to stake
     * @param _user User's address
     */
    function validatePosition(uint256 _tokenId, address _user) internal {
        // get token's position
        uint256 position = gen2PlayerToken.getTokenPosition(_tokenId);
        require(position != 0, "Position code can't be zero");
        // check limits
        // 1. check simple limitations
        uint256 season = seasonId;
        mapping(uint256 => uint256) storage userPositionNum = userPositionNumber[season][_user];
        if (userPositionNum[position] < positionNumber[season][position]) {
            // stake using simple limit
            userPositionNum[position] += 1;
        } else {
            // check if this position can be staked in flex limit
            require(isFlexPosition[season][position], "Simple limit is reached and can't stake in flex");
            // check that flex limit isn't reached
            uint256 userFlexPosNumber = userPositionNum[FLEX_POSITION];
            require(userFlexPosNumber < flexPositionNumber[season], "Simple and flex limits reached");
            // if requirements passed, then we can stake this token in flex limit
            userPositionNum[FLEX_POSITION] += 1;
            isPlayerInFlexPosition[season][_tokenId] = true;
        }
    }

    function unstakePosition(uint256 _tokenId, address _user) internal {
        // get token's position
        uint256 position = gen2PlayerToken.getTokenPosition(_tokenId);
        require(position != 0, "Position code can't be zero");

        uint256 season = seasonId;
        if (isPlayerInFlexPosition[season][_tokenId]) {
            userPositionNumber[season][_user][FLEX_POSITION] -= 1;
            isPlayerInFlexPosition[season][_tokenId] = false;
        } else {
            userPositionNumber[season][_user][position] -= 1;
        }
    }

    // _______________ Deadline validation internal functions _______________

    /**
     * @notice Check if token's staking deadline is greater than block.timestamp
     * @dev Reverts if token's staking deadline is less than block.timestamp
     * @param _tokenId Gen2PlayerToken id user wants to stake
     */
    function validateDeadline(uint256 _tokenId) internal view {
        uint256 tokenCardImageId = gen2PlayerToken.nftIdToImageId(_tokenId);
        uint256 stakingDeadline = teamsStakingDeadlinesContract.getCardImageTeamDeadline(tokenCardImageId);
        require(stakingDeadline > block.timestamp, "Token's staking deadline is less than current timestamp");
    }

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[43] private gap;
}
