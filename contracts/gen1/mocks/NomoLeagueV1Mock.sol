// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeCastUpgradeable.sol";
import "../v1/interfaces/INomoRouterV1.sol";
import "../interfaces/INomoNFT.sol";
import "../interfaces/INomoCalculator.sol";
import "./NomoLeagueConstantMock.sol";

contract NomoLeagueV1Mock is OwnableUpgradeable, NomoLeagueConstantMock {
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using SafeCastUpgradeable for uint256;
    using SafeCastUpgradeable for int256;

    /// @notice Nomo Router contract
    INomoRouterV1 public router;

    /// @notice Nomo NFT contract
    INomoNFT public nft;

    /// @notice Token in form of which rewards are payed
    IERC20Upgradeable public rewardToken;

    /// @notice Name of the league
    string public name;

    /// @notice Total number of games in the league
    uint256 public totalGames;

    /// @notice Maximal number of tokens one player can stake
    uint256 public tokenLimitPerPlayer;

    /// @notice Duration of one game
    //    uint256 public constant GAME_DURATION = 6 days + 12 hours;

    /// @notice Duration of staking period in one game
    //    uint256 public constant STAKING_DURATION = 2 days;

    /// @notice Last game ID (index)
    uint256 public lastGameId;

    /// @notice Timestamp when last game has started
    uint256 public lastGameStart;

    /// @notice Displays if all games in league have finished
    bool public finished;

    /// @notice Structure to store one player's info
    /// @dev Active points is total number of NFT points, active in this game (staked in time)
    /// @dev Pending points is total number of NFT points, that were staked too late to participate in current game
    /// @dev Current game is ID of the game when player has interacted with contract for the last time (used for calculations)
    struct Player {
        uint256 activePoints;
        uint256 pendingPoints;
        uint256 currentGame;
        uint256 tokensStaked;
    }

    /// @notice Mapping of addresses to their player info
    mapping(address => Player) public players;

    /// @notice Total number of active (participating in current game) points of staked NFTs
    uint256 public totalActivePoints;

    /// @notice Total number of pending (not participating in current game) points of staked NFTs
    uint256 public totalPendingPoints;

    /// @notice Mapping of tokenIds to number of points with which they are staked
    mapping(uint256 => uint256) public tokenPoints;

    /// @notice Internal mapping of token IDs to the game IDs when they were pending (used for calculations)
    mapping(uint256 => uint256) public _tokenPendingAtGame;

    /// @notice Reward per one active point, magnified by 2**128 for precision
    uint256 public _magnifiedRewardPerPoint;

    /// @notice Mapping of game IDs to values of magnifiedRewardPerPoint at their end (used for calculations)
    mapping(uint256 => uint256) public _rewardPerPointAfterGame;

    /// @notice Mapping of addresses to their corrections of the rewards (used to maintain rewards unchanged when number of player's points change)
    mapping(address => int256) public _magnifiedRewardCorrections;

    //// @notice Mapping of addresses to their withdrawn reward amounts
    mapping(address => uint256) public _rewardWithdrawals;

    /// @notice Magnitude by which rewards are multiplied during calculations for precision
    uint256 public constant _magnitude = 2**128;

    // EVENTS

    /// @notice Event emitted when user withdraws his reward
    event RewardWithdrawn(address indexed account, uint256 amount);

    /// @notice Event emitted when new game starts
    event NewGameStarted(uint256 indexed index);

    /// @notice Event emitted when token is staked to the league
    event TokenStaked(address indexed account, uint256 indexed tokenId);

    /// @notice Event emitted when token is unstaked from league
    event TokenUnstaked(address indexed account, uint256 indexed tokenId);

    /// @notice Event emitted when user's active points change
    event ActivePointsChanged(uint256 newPoints);

    /// @notice Event emitted when token points update
    event UpdatePoints(
        address indexed account,
        uint256 indexed tokenId,
        uint256 indexed lastGameId,
        uint256 tokenPendingAtGame,
        uint256 newPoints
    );

    // CONSTRUCTOR

    function initialize(
        INomoRouterV1 router_,
        string memory name_,
        uint256 totalGames_,
        uint256 tokenLimitPerPlayer_
    ) external initializer {
        __Ownable_init();

        router = router_;
        nft = INomoNFT(router.nft());
        rewardToken = IERC20Upgradeable(router.rewardToken());

        name = name_;
        totalGames = totalGames_;
        tokenLimitPerPlayer = tokenLimitPerPlayer_;
    }

    // PUBLIC FUNCTIONS

    /**
     * @notice Function to withdraw accumulated reward
     */
    function withdrawReward() external {
        _movePendingPoints(msg.sender);

        uint256 reward = totalRewardOf(msg.sender);
        _rewardWithdrawals[msg.sender] += reward;
        rewardToken.safeTransfer(msg.sender, reward);

        emit RewardWithdrawn(msg.sender, reward);
    }

    /**
     * @notice Auxilary function to update player's pending and active point
     */
    function updatePlayer(address account) external {
        _movePendingPoints(account);
    }

    // VIEW FUNCTIONS

    /**
     * @notice Function to get total reward of one account in the league
     * @param account Address to get reward for
     * @return Total reward
     */
    function totalRewardOf(address account) public view returns (uint256) {
        uint256 currentActivePoints = players[account].activePoints + players[account].pendingPoints;
        int256 currentCorrections = _magnifiedRewardCorrections[account] -
            SafeCastUpgradeable.toInt256(
                _rewardPerPointAfterGame[players[account].currentGame] * players[account].pendingPoints
            );

        uint256 accumulatedReward = SafeCastUpgradeable.toUint256(
            SafeCastUpgradeable.toInt256(currentActivePoints * _magnifiedRewardPerPoint) + currentCorrections
        ) / _magnitude;
        return accumulatedReward - _rewardWithdrawals[account];
    }

    // RESTRICTED FUNCTIONS

    /**
     * @notice Function to finish current game (distributing reward) and start a new one, can only be called by owner
     * @param totalReward Reward to distribute for current game
     */
    function nextGame(uint256 totalReward) external onlyOwner {
        require(!finished, "NomoLeague::nextGame: league is finished");
        if (lastGameId != 0) {
            _finishGame(totalReward);
        }
        if (lastGameId < totalGames) {
            lastGameStart = block.timestamp;
            lastGameId += 1;

            emit NewGameStarted(lastGameId);
        } else {
            finished = true;
        }
    }

    /**
     * @notice Function to stake token, can't be called directly, staking should go through router
     */
    function stakeToken(address account, uint256 tokenId) external onlyRouter {
        _movePendingPoints(account);

        require(
            players[account].tokensStaked + 1 <= tokenLimitPerPlayer,
            "NomoLeague::stakeToken: stake exceeds limit per player"
        );
        players[account].tokensStaked++;

        uint256 points = _getPoints(tokenId);
        tokenPoints[tokenId] = points;
        if (block.timestamp > lastGameStart + STAKING_DURATION || lastGameStart == 0) {
            _tokenPendingAtGame[tokenId] = lastGameId;
            totalPendingPoints += points;
            players[account].pendingPoints += points;
        } else {
            totalActivePoints += points;
            emit ActivePointsChanged(totalActivePoints);
            players[account].activePoints += points;
            _magnifiedRewardCorrections[account] -= SafeCastUpgradeable.toInt256(_magnifiedRewardPerPoint * points);
        }

        emit TokenStaked(account, tokenId);
    }

    /**
     * @notice Function to update tokens limit per player
     */
    function setTokenLimitPerPlayer(uint256 _newLimit) external onlyOwner {
        tokenLimitPerPlayer = _newLimit;
    }

    /**
     * @notice Function to update league's name
     */
    function setName(string memory _newName) external onlyOwner {
        name = _newName;
    }

    /**
     * @notice Function to unstake token, can't be called directly, unstaking should go through router
     */
    function unstakeToken(address account, uint256 tokenId) external onlyRouter {
        _movePendingPoints(account);

        players[account].tokensStaked--;

        if (_tokenPendingAtGame[tokenId] == lastGameId) {
            totalPendingPoints -= tokenPoints[tokenId];
            players[account].pendingPoints -= tokenPoints[tokenId];
        } else {
            totalActivePoints -= tokenPoints[tokenId];
            emit ActivePointsChanged(totalActivePoints);
            players[account].activePoints -= tokenPoints[tokenId];
            _magnifiedRewardCorrections[account] += SafeCastUpgradeable.toInt256(
                _magnifiedRewardPerPoint * tokenPoints[tokenId]
            );
        }
        _tokenPendingAtGame[tokenId] = 0;
        tokenPoints[tokenId] = 0;

        emit TokenUnstaked(account, tokenId);
    }

    /**
     * @notice Function to update token points, can't be called directly, updating should go through router
     */
    function updatePoints(address account, uint256 tokenId) external onlyRouter {
        _movePendingPoints(account);
        uint256 oldPoints = tokenPoints[tokenId];
        uint256 newPoints = _getPoints(tokenId);
        if (_tokenPendingAtGame[tokenId] == lastGameId) {
            players[account].pendingPoints -= oldPoints;
            players[account].pendingPoints += newPoints;
            totalPendingPoints -= oldPoints;
            totalPendingPoints += newPoints;
        } else {
            players[account].activePoints -= oldPoints;
            players[account].activePoints += newPoints;
            _magnifiedRewardCorrections[account] += (SafeCastUpgradeable.toInt256(
                _magnifiedRewardPerPoint * oldPoints
            ) - SafeCastUpgradeable.toInt256(_magnifiedRewardPerPoint * newPoints));
            totalActivePoints -= oldPoints;
            totalActivePoints += newPoints;
        }
        tokenPoints[tokenId] = newPoints;
        emit UpdatePoints(account, tokenId, lastGameId, _tokenPendingAtGame[tokenId], newPoints);
    }

    // PRIVATE FUNCTION

    /// @dev This function updates reward per point, distributing reward
    /// @dev and then converts pending points from current game to active for next game
    function _finishGame(uint256 totalReward) private {
        require(
            block.timestamp >= lastGameStart + GAME_DURATION,
            "NomoLeague::startNewGame: previous game isn't finished yet"
        );

        if (totalReward > 0) {
            require(
                totalActivePoints > 0,
                "NomoLeague::startNewGame: can't distribute non-zero reward with zero players"
            );
            _magnifiedRewardPerPoint += (_magnitude * totalReward) / totalActivePoints;
        }

        _rewardPerPointAfterGame[lastGameId] = _magnifiedRewardPerPoint;
        totalActivePoints += totalPendingPoints;
        emit ActivePointsChanged(totalActivePoints);
        totalPendingPoints = 0;
    }

    function _getPoints(uint256 tokenId) private view returns (uint256) {
        (, , , , , uint256 setId, , , ) = nft.getCardImageDataByTokenId(tokenId);
        return INomoCalculator(router.calculator(setId)).calculatePoints(tokenId, lastGameStart);
    }

    /// @dev This function converts player's pending points from previous games to active
    /// @dev It is called before each player's interaction with league for correct lazy reward calculations
    function _movePendingPoints(address account) private {
        if (players[account].currentGame != lastGameId) {
            players[account].activePoints += players[account].pendingPoints;
            _magnifiedRewardCorrections[account] -= SafeCastUpgradeable.toInt256(
                _rewardPerPointAfterGame[players[account].currentGame] * players[account].pendingPoints
            );
            players[account].pendingPoints = 0;
            players[account].currentGame = lastGameId;
        }
    }

    // MODIFIERS

    modifier onlyRouter() {
        require(msg.sender == address(router), "NomoLeague: sender isn't NomoRouter");
        _;
    }
}
