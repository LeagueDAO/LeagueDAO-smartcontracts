// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

// Here these contracts is connected to the Fantasy League contract (`FantasyLeague.sol`)
import "./GameProgress.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../../interfaces/ILeaguePassNFT.sol";
import "../../interfaces/ITeamManager.sol";
import "../common-parts/RandomGenerator.sol";

// List of errors for this contract
// Reverts when try to pass the zero address as a parameter value
error ZeroAddress();
// Reverts when try to call by someone else a function that is intended only for the `LeaguePassNFT` contract
error NotALeaguePassNFTContract();
// Reverts when try to use an address that did not join to the Fantasy League
error UnknownUser();
// Reverts when try to join a user who has already been added
error UserIsAlreadyAdded();
// Reverts when shuffle of users with a zero random number
error RandNumberIsNotUpdated();
// Reverts when shuffle of zero users
error NumberOfUsersToShuffleIsZero();
// Reverts when shuffle not during the shuffling stage
error NotAUserShuffleGameStage();
// Reverts when shuffle after the end of the shuffle
error ShuffleIsCompleted();

/**
 * @title Users and divisions -- contract, which is part of the Fantasy League contract (`FantasyLeague.sol`), provides
 * storing of all users and assigment of them to divisions.
 *
 * @notice This contract connects `GameProgress.sol`, `ILeaguePassNFT.sol`, `ITeamManager.sol`, `RandomGenerator.sol`
 * and OpenZeppelin `AccessControlUpgradeable.sol` to the Fantasy League contract.
 *
 * Assigment of users to divisions is implemented by shuffling the user array randomly using `RandomGenerator.sol`
 * which is linked to `NomoRNG.sol`. Storing of divisions is implemented by offset in the user array.
 *
 * @dev This contract includes the following functionality:
 *  - Sets the entry pass and team manager contracts (`LeaguePassNFT.sol` and `TeamManager.sol`).
 *  - Adds and stores all users.
 *  - Sets the `RandonGenerator` contract and updates the random number.
 *  - Shuffles users to assign them to divisions.
 *  - Gives divisions, user division IDs and the number of users and divisions.
 */
abstract contract UsersNDivisions is RandomGenerator, GameProgress, AccessControlUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // _______________ Constants _______________

    // (For user dividing into divisions). Number of teams in one division. 1 user per 1 team
    uint256 public constant DIVISION_SIZE = 12;

    // _______________ Storage _______________

    // ____ User adding access ____

    // The League Entry Pass contract that adds users
    ILeaguePassNFT public leaguePassNFT;

    // ____ Management of users ____

    /*
     * The array of added (joined) users.
     * Season ID => users.
     */
    mapping(uint256 => address[]) public users;

    // Season ID => (user => is user)
    mapping(uint256 => mapping(address => bool)) public isUser;

    // The contract stores the user's team of players and calculates the score of that team
    ITeamManager public teamManager;

    // ____ Mapping for the auction contract ____

    /*
     * Stores a division ID of a user (after the shuffle process).
     * Season ID => (user => [division ID + 1]).
     * NOTE. Plus 1, because the zero value means that the user is not assigned a division.
     */
    mapping(uint256 => mapping(address => uint256)) private userDivisionIncreasedId;

    // ____ Shuffle ____

    /*
     * Number of users who have already been shuffled (assigned to a division).
     *
     * NOTE. It's basically an array pointer to split a transaction into several and continue shuffling from the point
     * at which it was stopped.
     */
    uint256 public shuffledUserNum;

    // _______________ Events _______________

    /**
     * @dev Emitted when the interface address of the entry pass contract (`leaguePassNFT`) is changed to an address
     * `_leaguePassNFT`.
     *
     * @param _leaguePassNFT The address which is set by the current interface address of the entry pass contract.
     */
    event LeaguePassNFTSet(address _leaguePassNFT);

    /**
     * @dev Emitted when the interface address of the team manager contract (`teamManager`) is changed to an address
     * `_teamManager`.
     *
     * @param _teamManager The address which is set by the current interface address of the team manager contract.
     */
    event TeamManagerSet(address _teamManager);

    /**
     * @dev Emitted when a new user (`_user`) is added (joined) to the game (the Fantasy League) in the specified season
     * (`_seasonId`).
     *
     * @param _seasonId The season in which the user was added.
     * @param _user An added user.
     */
    event UserAdded(uint256 indexed _seasonId, address _user);

    // _______________ Modifiers _______________

    /**
     * @dev Check that an address (`_address`) is not zero. Reverts in the opposite case.
     *
     * @param _address Address check for zero.
     */
    modifier nonzeroAddress(address _address) {
        if (_address == address(0)) revert ZeroAddress();
        _;
    }

    /// @dev Check that the call is from the entry pass contract (`leaguePassNFT`). Reverts in the opposite case
    modifier onlyLeaguePassNFT() {
        if (_msgSender() != address(leaguePassNFT)) revert NotALeaguePassNFTContract();
        _;
    }

    /**
     * @dev Check that a user (`_user`) is added in the season (`_season`). Reverts in the opposite case.
     *
     * @param _season A season ID.
     * @param _user A user address to check.
     */
    modifier addedUser(uint256 _season, address _user) {
        if (!isUser[_season][_user]) revert UnknownUser();
        _;
    }

    // _______________ Initializer _______________

    /*
     * Grants the default administrator role (`DEFAULT_ADMIN_ROLE`) to the deployer, sets the random generator interface
     * as `_generator`.
     *
     * NOTE. The function init_{ContractName}_unchained found in every upgradeble contract is the initializer function
     * without the calls to parent initializers, and can be used to avoid the double initialization problem.
     */
    function init_UsersNDivisions_unchained(address _generator) internal onlyInitializing {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());

        setRandomGenerator(_generator);
    }

    // _______________ External functions _______________

    /**
     * @dev Sets the entry pass contract (`leaguePassNFT`) as `_leaguePassNFT`, syncs the current season ID of
     * the passed entry pass with that in this contract.
     *
     * Requirements:
     *  - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
     *  - An entry pass address (`_leaguePassNFT`) should not equal to the zero address.
     *
     * @param _leaguePassNFT An address of the LeagueDAO entry pass contract -- `LeaguePassNFT` that adds users to this
     * contract.
     */
    function setLeaguePassNFT(address _leaguePassNFT)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonzeroAddress(_leaguePassNFT)
    {
        leaguePassNFT = ILeaguePassNFT(_leaguePassNFT);
        emit LeaguePassNFTSet(_leaguePassNFT);

        leaguePassNFT.updateSeasonId();
    }

    /**
     * @dev Adds a new user to the game (to this contract) in the current season `seasonId`.
     *
     * Requirements:
     *  - The caller should be the entry pass contract (`leaguePassNFT`).
     *  - A user address (`_user`) should not equal to the zero address.
     *  - This function should only be called in the game stage of user adding (`GameStage.UserAdding`). (This is the
     *    first stage in which the Fantasy League (`FantasyLeague`) stays at the start of the season).
     *  - A user address (`_user`) should not already have been added.
     *
     * @param _user An address of a user.
     */
    function addUser(address _user)
        external
        onlyLeaguePassNFT
        nonzeroAddress(_user)
        onlyGameStage(GameStage.UserAdding)
    {
        // Check if user is already added
        uint256 season = seasonId.current();
        if (isUser[season][_user]) revert UserIsAlreadyAdded();

        // Add team to the game
        users[season].push(_user);
        isUser[season][_user] = true;

        emit UserAdded(season, _user);
    }

    /**
     * @dev Sets the random number generator contract (`generator`) as `_generator`. (`NomoRNG` is the random generator
     * contract).
     *
     * Requirements:
     *  - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
     *  - A random generator address (`_generator`) should not equal to the zero address.
     *
     * @param _generator An address of the random generator that updates the random number (`randNumber`).
     */
    function setRandGenerator(address _generator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        setRandomGenerator(_generator);
    }

    /**
     * @dev Updates the random number (`randNumber`) via Chainlink VRFv2.
     *
     * Requirements:
     *  - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
     *  - The random generator address (`generator`) should not equal to the zero address.
     *
     * @notice Firstly, need to generate the random number on the `NomoRNG` contract.
     */
    function updateRandNum() external onlyRole(DEFAULT_ADMIN_ROLE) {
        updateRandomNumber();
    }

    /**
     * @dev Sets the team manager contract (`teamManager`) as `_teamManager`, syncs the current season ID of the passed
     * team manager with that in this contract.
     *
     * Requirements:
     *  - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
     *  - A team manager address (`_teamManager`) should not equal to the zero address.
     *
     * @param _teamManager   An address of the Team Manager contract (`TeamManager`) that calculates scores and stakes
     * user players.
     */
    function setTeamManager(address _teamManager) external onlyRole(DEFAULT_ADMIN_ROLE) nonzeroAddress(_teamManager) {
        teamManager = ITeamManager(_teamManager);
        emit TeamManagerSet(_teamManager);

        teamManager.updateSeasonId();
    }

    /**
     * @dev This function does the following:
     *  - Shuffles the array of all users to randomly divides users into divisions of 12 users.
     *  - Sets a user division ID in this and `TeamManager` contracts (`teamManager`).
     *  - Moves the game stage to the stage of waiting of the next game function (`GameStage.WaitingNextGame`) when the
     *    shuffling is completed.
     *
     * Requirements:
     *  - The caller should have the default admin role (`DEFAULT_ADMIN_ROLE`).
     *  - The random number (`randNumber`) should not equal to the zero.
     *  - The number of users to shuffle (`_numberToShuffle`) should not equal to the zero.
     *  - After the first call of this function (see below the `_numberToShuffle` param description), it should only be
     *    called in the game stage of user shuffle (`GameStage.UserShuffle`).
     *  - The team manager contract (`teamManager`) should be set.
     *
     * @param _numberToShuffle A number of users to shuffle. It allows you to split the function call into multiple
     * transactions to avoid reaching the gas cost limit. Each time the function is called, this number can be anything
     * greater than zero. When the process of shuffle is completed, the `FantasyLeague` moves on to the next stage
     * (`GameStage.WaitingNextGame`).
     */
    function shuffleUsers(uint256 _numberToShuffle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (randNumber == 0) revert RandNumberIsNotUpdated();
        if (_numberToShuffle == 0) revert NumberOfUsersToShuffleIsZero();

        if (shuffledUserNum == 0) {
            moveGameStageTo(GameStage.UserShuffle);
        }
        if (getGameStage() != GameStage.UserShuffle) revert NotAUserShuffleGameStage();

        // Check that all users was shuffled
        address[] storage refUsers = users[seasonId.current()];
        uint256 usersLen = refUsers.length;
        if (shuffledUserNum >= usersLen) revert ShuffleIsCompleted();

        // Check that the shuffle will be completed after this transaction
        if (usersLen <= shuffledUserNum + _numberToShuffle) {
            _numberToShuffle = usersLen - shuffledUserNum;
            moveGameStageTo(GameStage.WaitingNextGame);
        }

        // Shuffle the array of users
        uint256 newShuffledUserNum = shuffledUserNum + _numberToShuffle;
        uint256 index;
        address user;
        mapping(address => uint256) storage refUserDivisionIncreasedId = userDivisionIncreasedId[seasonId.current()];
        for (uint256 i = shuffledUserNum; i < newShuffledUserNum; ++i) {
            index = i + (uint256(keccak256(abi.encodePacked(randNumber))) % (usersLen - i));
            // Swap
            user = refUsers[index];
            refUsers[index] = refUsers[i];
            refUsers[i] = user;

            // Saving of a user division ID
            uint256 divisionId = i / DIVISION_SIZE;
            refUserDivisionIncreasedId[user] = divisionId + 1;
            // Send of a user division ID to the TeamManager contract
            teamManager.setUserDivisionId(user, divisionId);
        }
        // Saving of the number of users that were shuffled
        shuffledUserNum += _numberToShuffle;
    }

    // ____ Extra view functionality for back end ____

    /**
     * @dev Returns a division ID of a user (`_user`) in a season (`_season`).
     *
     * Requirements:
     *  - A user (`_user`) should be added in a season (`_season`).
     *
     * @return   A user division ID.
     */
    function getUserDivisionId(uint256 _season, address _user)
        external
        view
        addedUser(_season, _user)
        returns (uint256)
    {
        return getCorrectedId(userDivisionIncreasedId[_season][_user]);
    }

    /**
     * @dev Returns a division of 12 users by the specified division ID (`_divisionId`) and season (`_season`).
     *
     * @return division   A division -- an array of 12 users.
     */
    function getDivisionUsers(uint256 _season, uint256 _divisionId) external view returns (address[] memory division) {
        division = new address[](DIVISION_SIZE);
        // Array of users of the specified season
        address[] storage refUsers = users[_season];
        uint256 offsetInArray = _divisionId * division.length;
        for (uint256 i = 0; i < division.length; ++i) {
            division[i] = refUsers[i + offsetInArray];
        }
        return division;
    }

    // _______________ Public functions _______________

    /**
     * @dev Returns the number of users who is added (joined) to the Fantasy League.
     *
     * @return   The number of users who is added (joined) to the Fantasy League.
     */
    function getNumberOfUsers() public view returns (uint256) {
        return users[seasonId.current()].length;
    }

    /**
     * @dev Returns the total number of divisions in the Fantasy League.
     *
     * @return   The total number of divisions.
     */
    function getNumberOfDivisions() public view returns (uint256) {
        return getNumberOfUsers() / DIVISION_SIZE;
    }

    // _______________ Private functions _______________

    // Returns the number decreased by one. Made for convenience when working with IDs in a mapping
    function getCorrectedId(uint256 _increasedId) private pure returns (uint256) {
        return _increasedId - 1;
    }

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new variables without shifting
     * down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps.
     */
    uint256[44] private gap;
}
