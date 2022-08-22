// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/INomoLeagueV1.sol";
import "../interfaces/INomoNFT.sol";

contract NomoRouterV1 is OwnableUpgradeable {
    /// @notice Nomo NFT contract
    INomoNFT public nft;

    /// @notice Token in form of which rewards are payed
    IERC20 public rewardToken;

    /// @notice Address that is authorized to update token points in leagues
    address public updater;

    /// @notice Mapping of tokenIds to their staker's addresses
    mapping(uint256 => address) public stakers;

    /// @notice Mapping of tokenIds to league contracts where they are staked
    mapping(uint256 => INomoLeagueV1) public stakedAt;

    /// @notice Mapping of leagueIds to league contracts
    mapping(uint256 => INomoLeagueV1) public leagues;

    /// @notice Mapping of addresses to lists of tokenIds that each address has staked
    mapping(address => uint256[]) public stakedTokenIds;

    /// @notice Mapping of token set ids to calculator contract addresses
    mapping(uint256 => address) private _calculators;

    /// @notice List of leagueIds
    uint256[] private _leagueIds;

    // EVENTS

    /// @notice Event emitted when token is staked to some league
    event TokenStaked(address indexed account, uint256 indexed tokenId, uint256 leagueId);

    /// @notice Event emitted when token is unstaked from some league
    event TokenUnstaked(address indexed account, uint256 indexed tokenId, uint256 leagueId);

    /// @notice Event emitted when new league is added
    event LeagueAdded(address indexed league, uint256 indexed leagueId);

    /// @notice Event emitted when some existing league is removed
    event LeagueRemoved(address indexed league, uint256 indexed leagueId);

    /// @notice Event emitted when new calculator is set
    event CalculatorUpdated(uint256 indexed setId, address indexed newCalculator);

    /// @notice Event emitted when new updater is set
    event UpdaterUpdated(address indexed newUpdater);

    /// @notice Event emitted when points are updated for some token
    event PointsUpdated(uint256 indexed tokenId);

    // CONSTRUCTOR

    function initialize(
        INomoNFT nft_,
        IERC20 rewardToken_,
        address updater_
    ) external initializer {
        __Ownable_init();

        nft = nft_;
        rewardToken = rewardToken_;
        updater = updater_;
    }

    // PUBLIC FUNCTIONS

    /**
     * @notice Function to stake multiple tokens
     * @param tokenIds List of token IDs
     */
    function stakeTokens(uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            stakeToken(tokenIds[i]);
        }
    }

    /**
     * @notice Function to unstake multiple tokens
     * @param tokenIds List of token IDs
     */
    function unstakeTokens(uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            unstakeToken(tokenIds[i]);
        }
    }

    /**
     * @notice Function to stake single token
     * @param tokenId ID of the token to stake
     */
    function stakeToken(uint256 tokenId) public {
        nft.transferFrom(msg.sender, address(this), tokenId);

        stakers[tokenId] = msg.sender;
        uint256 leagueId = _getLeague(tokenId);
        require(address(leagues[leagueId]) != address(0), "NomoRouter::stakeToken: can't stake to non-existent league");
        stakedAt[tokenId] = leagues[leagueId];
        leagues[leagueId].stakeToken(msg.sender, tokenId);

        stakedTokenIds[msg.sender].push(tokenId);

        emit TokenStaked(msg.sender, tokenId, leagueId);
    }

    /**
     * @notice Function to unstake single token
     * @param tokenId ID of the token to unstake
     */
    function unstakeToken(uint256 tokenId) public {
        require(stakers[tokenId] == msg.sender, "NomoRouter::unstakeToken: sender doesn't have token in stake");

        stakedAt[tokenId].unstakeToken(msg.sender, tokenId);
        stakers[tokenId] = address(0);
        stakedAt[tokenId] = INomoLeagueV1(address(0));

        for (uint256 i = 0; i < stakedTokenIds[msg.sender].length; i++) {
            if (stakedTokenIds[msg.sender][i] == tokenId) {
                stakedTokenIds[msg.sender][i] = stakedTokenIds[msg.sender][stakedTokenIds[msg.sender].length - 1];
                stakedTokenIds[msg.sender].pop();
                break;
            }
        }

        nft.transferFrom(address(this), msg.sender, tokenId);

        emit TokenUnstaked(msg.sender, tokenId, _getLeague(tokenId));
    }

    // RESTRICTED FUNCTIONS

    /**
     * @notice Function to add league, can only be called by owner
     * @param league Address of the league contract
     * @param leagueId ID that should be assigned to this league
     */
    function addLeague(INomoLeagueV1 league, uint256 leagueId) external onlyOwner {
        require(address(leagues[leagueId]) == address(0), "NomoRouter::addLeague: can't add league with the same id");
        leagues[leagueId] = league;
        _leagueIds.push(leagueId);

        emit LeagueAdded(address(league), leagueId);
    }

    /**
     * @notice Function to remove league, can only be called by owner
     * @param leagueId ID of the league to remove
     */
    function removeLeague(uint256 leagueId) external onlyOwner {
        for (uint256 i = 0; i < _leagueIds.length; i++) {
            if (_leagueIds[i] == leagueId) {
                emit LeagueRemoved(address(leagues[leagueId]), leagueId);

                _leagueIds[i] = _leagueIds[_leagueIds.length - 1];
                _leagueIds.pop();

                delete leagues[leagueId];

                return;
            }
        }
        revert("NomoRoute::removeLeague: no league with such leagueId exists");
    }

    /**
     * @notice Function to update token's points in league, can only be called by updater
     * @param tokenId ID of the token to update
     */
    function updatePoints(uint256 tokenId) public onlyUpdater {
        if (stakers[tokenId] != address(0)) {
            stakedAt[tokenId].updatePoints(stakers[tokenId], tokenId);
            emit PointsUpdated(tokenId);
        }
    }

    /**
     * @notice Function to mass update token points in league, can only be called by updater
     * @param tokenIds IDs of tokens to update
     */
    function updatePointsBatch(uint256[] calldata tokenIds) external onlyUpdater {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            updatePoints(tokenIds[i]);
        }
    }

    /**
     * @notice Function to set new updater, can only be called by owner
     * @param updater_ New updater address
     */
    function setUpdater(address updater_) external onlyOwner {
        updater = updater_;
        emit UpdaterUpdated(updater_);
    }

    /**
     * @notice Function to set new calculator contract address for parameters set
     * @param setId ID of the NFT parameters set to update calculator for
     * @param newCalculator Address of the calculator contract
     */
    function setCalculator(uint256 setId, address newCalculator) external onlyOwner {
        _calculators[setId] = newCalculator;
        emit CalculatorUpdated(setId, newCalculator);
    }

    // VIEW FUNCTION

    /**
     * @notice Function to get total reward of some account in all leagues
     * @param account Address to get rewards for
     * @return Total reward
     */
    function totalRewardOf(address account) external view returns (uint256) {
        uint256 totalReward = 0;
        for (uint256 i = 0; i < _leagueIds.length; i++) {
            totalReward += leagues[_leagueIds[i]].totalRewardOf(account);
        }
        return totalReward;
    }

    /**
     * @notice Function to get all league IDs
     */
    function leagueIds() external view returns (uint256[] memory) {
        return _leagueIds;
    }

    /**
     * @notice Function to get calculator address by parameters set id
     */
    function calculator(uint256 setId) external view returns (address) {
        return _calculators[setId];
    }

    // PRIVATE FUNCTIONS

    function _getLeague(uint256 tokenId) private view returns (uint256) {
        (, , uint256 leagueId, , , , , , ) = nft.getCardImageDataByTokenId(tokenId);
        return leagueId;
    }

    // MODIFIERS

    modifier onlyUpdater() {
        require(msg.sender == updater, "NomoRouter: caller is not the updater");
        _;
    }
}
