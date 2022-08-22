// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "./StakeValidator.sol";

/**
 * @dev
 */
abstract contract Staker is StakeValidator {
    // _______________ Storage _______________

    /*
     * Stores a division ID of a user (after the shuffle process on FantasyLeague contract).
     * Season ID => (user => [division ID + 1]).
     * NOTE Plus 1, because the zero value is used to check that the user has been added.
     */
    mapping(uint256 => mapping(address => uint256)) private userDivisionIncreasedId;

    // ____ For competing team squad ____

    /// @notice Players staked by the user. Staked players are active team of the user
    // Season ID => (user => staked players)
    mapping(uint256 => mapping(address => uint256[])) public stakedPlayers;

    /*
     * Stores a player token index in the array of staked players.
     * Season ID => (user => (token ID => [1 + token index in the stakedPlayers[user] array])).
     * NOTE Plus 1, because the zero value is used to check that the player token ID has been added.
     */
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) private stakedPlayerIncreasedIndex;

    // _______________ Events _______________

    event UserDivisionIdSet(uint256 _season, address _user, uint256 _divisionId);

    /// @notice When user stakes new token to the team
    event PlayerStaked(uint256 _season, address _user, uint256 _tokenId);

    /// @notice When user unstakes token from the team
    event PlayerUnstaked(uint256 _season, address _user, uint256 _tokenId);

    // _______________ Modifiers _______________

    // Check that a `_user` is added
    modifier addedUser(uint256 _season, address _user) {
        require(isUserAdded(_season, _user), "Unknown user");
        _;
    }

    // _______________ Initializer _______________

    function init_Staker_unchained() internal onlyInitializing {}

    // _______________ External functions _______________

    /**
     * @dev Sets a division ID of a user.
     *
     * @param _user   A user address.
     * @param _divisionId   A user division ID.
     */
    function setUserDivisionId(address _user, uint256 _divisionId) external onlyFantasyLeague nonzeroAddress(_user) {
        // Check if user is already added
        uint256 season = seasonId;
        require(!isUserAdded(season, _user), "The user has already been added");

        // Plus 1, because the zero value is used to check that the user has been added
        userDivisionIncreasedId[season][_user] = _divisionId + 1;
        emit UserDivisionIdSet(season, _user, _divisionId);
    }

    /**
     * @notice Adds players to caller's team
     * @dev Uses stakePlayer() function for each tokenId in the passed array. Caller must be registered user and there must be free places to stake (unused limits).
     * @param _tokenIds   An array of token IDs.
     */
    function stakePlayers(uint256[] calldata _tokenIds) external {
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            stakePlayer(_tokenIds[i]);
        }
    }

    /**
     * @notice Adds player to caller's team
     * @dev Caller must be registered user and there must be free places to stake (unused limits).
     * @param _tokenId Player NFT tokenId
     */
    function stakePlayer(uint256 _tokenId) public addedUser(seasonId, _msgSender()) {
        // Check that `_tokenId` is in a right division
        require(
            getCorrectedId(userDivisionIncreasedId[seasonId][_msgSender()]) ==
                gen2PlayerToken.nftIdToDivisionId(_tokenId),
            "Token from another division"
        );
        // Check that `_tokenId` belongs to the current season
        require(gen2PlayerToken.nftIdToSeasonId(_tokenId) == seasonId, "Token from another season");

        // Adding of a player to caller's team
        addToTeam(_tokenId);
        // Taking of a player token
        gen2PlayerToken.transferFrom(_msgSender(), address(this), _tokenId);
        emit PlayerStaked(seasonId, _msgSender(), _tokenId);
    }

    /**
     * @notice Removes players from caller's team
     * @dev Uses unstakePlayer() function for each tokenId in the passed array. Caller must be registered user and there must be staked players in the team.
     * @param _tokenIds   An array of token IDs.
     */
    function unstakePlayers(uint256[] calldata _tokenIds) external {
        for (uint256 i = 0; i < _tokenIds.length; i++) {
            unstakePlayer(_tokenIds[i]);
        }
    }

    /**
     * @notice Remove player from caller's team
     * @dev Caller must be registered user and there must be staked players in the team.
     * @param _tokenId Player NFT tokenId
     */
    function unstakePlayer(uint256 _tokenId) public addedUser(seasonId, _msgSender()) {
        deleteFromTeam(_tokenId);
        gen2PlayerToken.transferFrom(address(this), _msgSender(), _tokenId);
        emit PlayerUnstaked(seasonId, _msgSender(), _tokenId);
    }

    // ____ Extra view functionality for back end ____

    function getUserDivisionId(uint256 _season, address _user)
        external
        view
        addedUser(_season, _user)
        returns (uint256)
    {
        return getCorrectedId(userDivisionIncreasedId[_season][_user]);
    }

    function getStakedPlayerIndex(
        uint256 _season,
        address _user,
        uint256 _tokenId
    ) external view returns (uint256) {
        require(isPlayerStaked(_season, _user, _tokenId), "Such a player is not staked");
        return getCorrectedIndex(stakedPlayerIncreasedIndex[_season][_user][_tokenId]);
    }

    /**
     * @notice Returns an array of token ids staked by the specified user
     * @return Array of Gen2Player NFTs ids
     */
    function getStakedPlayersOfUser(uint256 _season, address _user)
        external
        view
        addedUser(_season, _user)
        returns (uint256[] memory)
    {
        return stakedPlayers[_season][_user];
    }

    // _______________ Public functions _______________

    function isUserAdded(uint256 _season, address _user) public view returns (bool) {
        return userDivisionIncreasedId[_season][_user] != 0;
    }

    function isPlayerStaked(
        uint256 _season,
        address _user,
        uint256 _tokenId
    ) public view returns (bool) {
        return stakedPlayerIncreasedIndex[_season][_user][_tokenId] != 0;
    }

    // _______________ Private functions _______________

    function getCorrectedId(uint256 _increasedId) private pure returns (uint256) {
        return _increasedId - 1;
    }

    function getCorrectedIndex(uint256 _increasedIndex) private pure returns (uint256) {
        return _increasedIndex - 1;
    }

    function addToTeam(uint256 _tokenId) private {
        uint256 season = seasonId;
        require(!isPlayerStaked(season, _msgSender(), _tokenId), "This player has already been staked");
        // Reverts if there is no free space left for a token with such a position
        validatePosition(_tokenId, _msgSender());
        // Reverts if staking after deadline
        validateDeadline(_tokenId);

        uint256[] storage players = stakedPlayers[season][_msgSender()];
        players.push(_tokenId);
        stakedPlayerIncreasedIndex[season][_msgSender()][_tokenId] = players.length;
    }

    function deleteFromTeam(uint256 _tokenId) private {
        uint256 season = seasonId;
        require(isPlayerStaked(season, _msgSender(), _tokenId), "This player is not staked");

        // Reverts if unstaking after deadline
        validateDeadline(_tokenId);

        unstakePosition(_tokenId, _msgSender());

        uint256[] storage players = stakedPlayers[season][_msgSender()];
        mapping(uint256 => uint256) storage increasedIndex = stakedPlayerIncreasedIndex[season][_msgSender()];

        // Deletion of the player from the array of staked players and writing down of its index in the mapping
        // Index of the player in the array of staked players
        uint256 playerIndex = getCorrectedIndex(increasedIndex[_tokenId]);
        uint256 lastPlayerTokenId = players[players.length - 1];
        // Replacing of the deleted player with the last one in the array
        players[playerIndex] = lastPlayerTokenId;
        // Cutting off the last player
        players.pop();

        // Replacing of an index of the last player with the deleted one
        increasedIndex[lastPlayerTokenId] = playerIndex + 1;
        // Reset of the deleted player index
        delete increasedIndex[_tokenId];
    }

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[47] private gap;
}
