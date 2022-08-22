// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeCastUpgradeable.sol";
import "../interfaces/INomoRouter.sol";
import "../interfaces/INomoNFT.sol";
import "../interfaces/INomoCalculator.sol";
import "./NomoLeagueConstantMock.sol";

contract NomoLeagueMock is OwnableUpgradeable, NomoLeagueConstantMock {
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using SafeCastUpgradeable for uint256;
    using SafeCastUpgradeable for int256;

    /// @notice Nomo Router contract
    INomoRouter public router;

    /// @notice Nomo NFT contract
    INomoNFT public nft;

    /// @notice Token in form of which rewards are payed, v1 version, don't use now
    IERC20Upgradeable internal rewardToken;

    /// @notice Name of the league
    string public name;

    /// @notice Total number of games in the league
    uint256 public totalGames;

    /// @notice Maximal number of tokens one player can stake
    uint256 public tokenLimitPerPlayer;

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
    /// @notice v1 version, don't use for new contract
    uint256 private _magnifiedRewardPerPoint;

    /// @notice Mapping of game IDs to values of magnifiedRewardPerPoint at their end (used for calculations)
    /// @notice v1 version, don't use for new contract
    mapping(uint256 => uint256) private _rewardPerPointAfterGame;

    /// @notice Mapping of addresses to their corrections of the rewards (used to maintain rewards unchanged when number of player's points change)
    /// @notice v1 version, don't use for new contract
    mapping(address => int256) private _magnifiedRewardCorrections;

    //// @notice Mapping of addresses to their withdrawn reward amounts
    /// @notice v1 version, don't use for new contract
    mapping(address => uint256) private _rewardWithdrawals;

    /// @notice Magnitude by which rewards are multiplied during calculations for precision
    uint256 public constant _magnitude = 2**128;

    /// @notice Tokens in form of which rewards are payed
    address[] public rewardTokens;

    /// @notice Reward per one active point, magnified by 2**128 for precision
    mapping(uint256 => uint256) internal _v2_magnifiedRewardPerPoint;

    /// @notice Reward token position => game IDs => values of magnifiedRewardPerPoint at their end (used for calculations)
    mapping(uint256 => mapping(uint256 => uint256)) internal _v2_rewardPerPointAfterGame;

    /// @notice Reward token position => user address => corrections of the rewards (used to maintain rewards unchanged when number of player's points change)
    mapping(uint256 => mapping(address => int256)) internal _v2_magnifiedRewardCorrections;

    //// @notice Reward token position => user address => withdrawn reward amounts
    mapping(uint256 => mapping(address => uint256)) internal _v2_rewardWithdrawals;

    //// @notice Helpful flag for provide update to new version
    uint256 internal _version;

    // EVENTS

    /// @notice Event emitted when user withdraws his reward
    event RewardsWithdrawn(address indexed account, uint256[] amounts);

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
        INomoRouter router_,
        string memory name_,
        uint256 totalGames_,
        uint256 tokenLimitPerPlayer_
    ) external initializer {
        __Ownable_init();

        router = router_;
        nft = INomoNFT(router.nft());
        uint256 rewardTokensLength = router.rewardTokensLength();
        rewardTokens = new address[](rewardTokensLength);
        for (uint256 i = 0; i < rewardTokensLength; i++) {
            rewardTokens[i] = router.rewardTokens(i);
        }

        name = name_;
        totalGames = totalGames_;
        tokenLimitPerPlayer = tokenLimitPerPlayer_;

        _version = 2;
    }

    // PUBLIC FUNCTIONS

    /**
     * @notice Function to sync reward tokens list with router
     */
    function updateRewardTokensList() external onlyOwner {
        uint256 rewardTokensLength = router.rewardTokensLength();
        require(rewardTokensLength > rewardTokens.length, "already updated");
        for (uint256 i = rewardTokens.length; i < rewardTokensLength; i++) {
            rewardTokens.push(router.rewardTokens(i));
        }
    }

    /**
     * @notice Function to withdraw accumulated rewards
     */
    function withdrawReward() external {
        _movePendingPoints(msg.sender);

        uint256[] memory rewards = totalRewardsOf(msg.sender);
        _moveRewardWithdrawals(msg.sender);
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            _v2_rewardWithdrawals[i][msg.sender] += rewards[i];
            IERC20Upgradeable(rewardTokens[i]).safeTransfer(msg.sender, rewards[i]);
        }

        emit RewardsWithdrawn(msg.sender, rewards);
    }

    /**
     * @notice Function to withdraw accumulated rewards via router
     */
    function withdrawRewardForUser(address _user) external onlyRouter {
        _movePendingPoints(_user);

        uint256[] memory rewards = totalRewardsOf(_user);
        _moveRewardWithdrawals(_user);
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            _v2_rewardWithdrawals[i][_user] += rewards[i];
            IERC20Upgradeable(rewardTokens[i]).safeTransfer(_user, rewards[i]);
        }

        emit RewardsWithdrawn(_user, rewards);
    }

    /**
     * @notice Auxilary function to update player's pending and active point
     */
    function updatePlayer(address account) external {
        _movePendingPoints(account);
    }

    // VIEW FUNCTIONS

    /**
     * @notice Function to get total rewards of one account in the league
     * @param account Address to get rewards for
     * @return Total rewards, in order corresponded rewardTokens
     */
    function totalRewardsOf(address account) public view returns (uint256[] memory) {
        uint256 currentActivePoints = players[account].activePoints + players[account].pendingPoints;
        uint256 rewardTokensLength = router.rewardTokensLength();

        uint256[] memory pendingRewards = new uint256[](rewardTokensLength);
        for (uint256 i = 0; i < rewardTokensLength; i++) {
            int256 currentCorrections = getMagnifiedRewardCorrections(i, account) -
                SafeCastUpgradeable.toInt256(
                    getRewardPerPointAfterGame(i, players[account].currentGame) * players[account].pendingPoints
                );

            uint256 accumulatedReward = SafeCastUpgradeable.toUint256(
                SafeCastUpgradeable.toInt256(currentActivePoints * getMagnifiedRewardPerPoint(i)) + currentCorrections
            ) / _magnitude;

            pendingRewards[i] = accumulatedReward - getRewardWithdrawals(i, account);
        }
        return pendingRewards;
    }

    /**
     * @notice Function to get total accumulated rewards of one account in the league
     * @param account Address to get rewards for
     * @return Total accumulated rewards, in order corresponded rewardTokens
     */
    function getAccumulatedReward(address account) public view returns (uint256[] memory) {
        uint256 currentActivePoints = players[account].activePoints + players[account].pendingPoints;
        uint256 rewardTokensLength = router.rewardTokensLength();

        uint256[] memory accumulatedReward = new uint256[](rewardTokensLength);
        for (uint256 i = 0; i < rewardTokensLength; i++) {
            int256 currentCorrections = getMagnifiedRewardCorrections(i, account) -
                SafeCastUpgradeable.toInt256(
                    getRewardPerPointAfterGame(i, players[account].currentGame) * players[account].pendingPoints
                );

            accumulatedReward[i] =
                SafeCastUpgradeable.toUint256(
                    SafeCastUpgradeable.toInt256(currentActivePoints * getMagnifiedRewardPerPoint(i)) +
                        currentCorrections
                ) /
                _magnitude;
        }
        return accumulatedReward;
    }

    /**
     * @notice Getter for magnifiedRewardPerPoint
     */
    function getMagnifiedRewardPerPoint(uint256 rewardIndex) public view returns (uint256) {
        if (rewardIndex == 0 && _version < 2 && _magnifiedRewardPerPoint != type(uint256).max) {
            return _magnifiedRewardPerPoint;
        }
        return _v2_magnifiedRewardPerPoint[rewardIndex];
    }

    /**
     * @notice Getter for rewardPerPointAfterGame
     */
    function getRewardPerPointAfterGame(uint256 rewardIndex, uint256 gameId) public view returns (uint256) {
        if (rewardIndex == 0 && _version < 2 && _rewardPerPointAfterGame[gameId] != type(uint256).max) {
            return _rewardPerPointAfterGame[gameId];
        }
        return _v2_rewardPerPointAfterGame[rewardIndex][gameId];
    }

    /**
     * @notice Getter for magnifiedRewardCorrections
     */
    function getMagnifiedRewardCorrections(uint256 rewardIndex, address account) public view returns (int256) {
        if (rewardIndex == 0 && _version < 2 && _magnifiedRewardCorrections[account] != type(int256).max) {
            return _magnifiedRewardCorrections[account];
        }
        return _v2_magnifiedRewardCorrections[rewardIndex][account];
    }

    /**
     * @notice Getter for rewardWithdrawals
     */
    function getRewardWithdrawals(uint256 rewardIndex, address account) public view returns (uint256) {
        if (rewardIndex == 0 && _version < 2 && _rewardWithdrawals[account] != type(uint256).max) {
            return _rewardWithdrawals[account];
        }
        return _v2_rewardWithdrawals[rewardIndex][account];
    }

    // RESTRICTED FUNCTIONS

    /**
     * @notice Function to finish current game (distributing reward) and start a new one, can only be called by owner
     * @param totalRewards Rewards to distribute for current game
     */
    function nextGame(uint256[] calldata totalRewards) external onlyOwner {
        require(!finished, "NomoLeague::nextGame: league is finished");
        if (lastGameId != 0) {
            _finishGame(totalRewards);
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
            _moveMagnifiedRewardPerPoint();
            _moveMagnifiedRewardCorrections(account);
            for (uint256 i = 0; i < rewardTokens.length; i++) {
                _v2_magnifiedRewardCorrections[i][account] -= SafeCastUpgradeable.toInt256(
                    _v2_magnifiedRewardPerPoint[i] * points
                );
            }
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
            _moveMagnifiedRewardPerPoint();
            _moveMagnifiedRewardCorrections(account);
            for (uint256 i = 0; i < rewardTokens.length; i++) {
                _v2_magnifiedRewardCorrections[i][account] += SafeCastUpgradeable.toInt256(
                    _v2_magnifiedRewardPerPoint[i] * tokenPoints[tokenId]
                );
            }
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
            _moveMagnifiedRewardPerPoint();
            _moveMagnifiedRewardCorrections(account);
            for (uint256 i = 0; i < rewardTokens.length; i++) {
                _v2_magnifiedRewardCorrections[i][account] += (SafeCastUpgradeable.toInt256(
                    _v2_magnifiedRewardPerPoint[i] * oldPoints
                ) - SafeCastUpgradeable.toInt256(_v2_magnifiedRewardPerPoint[i] * newPoints));
            }
            totalActivePoints -= oldPoints;
            totalActivePoints += newPoints;
        }
        tokenPoints[tokenId] = newPoints;
        emit UpdatePoints(account, tokenId, lastGameId, _tokenPendingAtGame[tokenId], newPoints);
    }

    // PRIVATE FUNCTION

    /// @dev This function updates reward per point, distributing reward
    /// @dev and then converts pending points from current game to active for next game
    function _finishGame(uint256[] calldata totalRewards) private {
        require(
            block.timestamp >= lastGameStart + GAME_DURATION,
            "NomoLeague::startNewGame: previous game isn't finished yet"
        );
        require(totalRewards.length == rewardTokens.length, "wrong totalRewards length");
        _moveMagnifiedRewardPerPoint();
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            if (totalRewards[i] > 0) {
                require(
                    totalActivePoints > 0,
                    "NomoLeague::startNewGame: can't distribute non-zero reward with zero players"
                );
                _v2_magnifiedRewardPerPoint[i] += (_magnitude * totalRewards[i]) / totalActivePoints;
            }
        }

        _moveRewardPerPointAfterGame(lastGameId);
        for (uint256 i = 0; i < rewardTokens.length; i++) {
            _v2_rewardPerPointAfterGame[i][lastGameId] = _v2_magnifiedRewardPerPoint[i];
        }
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
            _moveRewardPerPointAfterGame(players[account].currentGame);
            _moveMagnifiedRewardCorrections(account);
            for (uint256 i = 0; i < rewardTokens.length; i++) {
                _v2_magnifiedRewardCorrections[i][account] -= SafeCastUpgradeable.toInt256(
                    _v2_rewardPerPointAfterGame[i][players[account].currentGame] * players[account].pendingPoints
                );
            }
            players[account].pendingPoints = 0;
            players[account].currentGame = lastGameId;
        }
    }

    /**
     * @notice Helper for update magnifiedRewardPerPoint for work with many tokens
     */
    function _moveMagnifiedRewardPerPoint() internal {
        if (_version < 2 && _magnifiedRewardPerPoint != type(uint256).max) {
            _v2_magnifiedRewardPerPoint[0] = _magnifiedRewardPerPoint;
            _magnifiedRewardPerPoint = type(uint256).max;
        }
    }

    /**
     * @notice Helper for update rewardPerPointAfterGame for work with many tokens
     */
    function _moveRewardPerPointAfterGame(uint256 gameId) internal {
        if (_version < 2 && _rewardPerPointAfterGame[gameId] != type(uint256).max) {
            _v2_rewardPerPointAfterGame[0][gameId] = _rewardPerPointAfterGame[gameId];
            _rewardPerPointAfterGame[gameId] = type(uint256).max;
        }
    }

    /**
     * @notice Helper for update magnifiedRewardCorrections for work with many tokens
     */
    function _moveMagnifiedRewardCorrections(address account) internal {
        if (_version < 2 && _magnifiedRewardCorrections[account] != type(int256).max) {
            _v2_magnifiedRewardCorrections[0][account] = _magnifiedRewardCorrections[account];
            _magnifiedRewardCorrections[account] = type(int256).max;
        }
    }

    /**
     * @notice Helper for update rewardWithdrawals for work with many tokens
     */
    function _moveRewardWithdrawals(address account) internal {
        if (_version < 2 && _rewardWithdrawals[account] != type(uint256).max) {
            _v2_rewardWithdrawals[0][account] = _rewardWithdrawals[account];
            _rewardWithdrawals[account] = type(uint256).max;
        }
    }

    // MODIFIERS

    modifier onlyRouter() {
        require(msg.sender == address(router), "NomoLeague: sender isn't NomoRouter");
        _;
    }
}
