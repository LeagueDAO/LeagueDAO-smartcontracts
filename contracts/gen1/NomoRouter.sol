// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/INomoLeague.sol";
import "./interfaces/INomoNFT.sol";

contract NomoRouter is OwnableUpgradeable {
    /// @notice Nomo NFT contract
    INomoNFT public nft;

    /// @notice Token in form of which rewards are payed, v1 version, don't use now
    IERC20 internal rewardToken;

    /// @notice v1 version, don't use now; Address that is authorized to update token points in leagues
    address public updater;

    /// @notice Mapping of tokenIds to their staker's addresses
    mapping(uint256 => address) public stakers;

    /// @notice Mapping of tokenIds to league contracts where they are staked
    mapping(uint256 => INomoLeague) public stakedAt;

    /// @notice Mapping of leagueIds to league contracts
    mapping(uint256 => INomoLeague) public leagues;

    /// @notice Mapping of addresses to lists of tokenIds that each address has staked
    mapping(address => uint256[]) public stakedTokenIds;

    /// @dev Mapping of token set ids to calculator contract addresses
    mapping(uint256 => address) private _calculators;

    /// @dev List of leagueIds
    uint256[] private _leagueIds;

    /// @notice Tokens in form of which rewards are payed
    address[] public rewardTokens;

    /// @notice Addresses authorized to update token points in leagues
    mapping(address => bool) public updaters;

    // EVENTS

    /// @dev Event emitted when token is staked to some league
    event TokenStaked(address indexed account, uint256 indexed tokenId, uint256 leagueId);

    /// @dev Event emitted when token is unstaked from some league
    event TokenUnstaked(address indexed account, uint256 indexed tokenId, uint256 leagueId);

    /// @dev Event emitted when new league is added
    event LeagueAdded(address indexed league, uint256 indexed leagueId);

    /// @dev Event emitted when some existing league is removed
    event LeagueRemoved(address indexed league, uint256 indexed leagueId);

    /// @dev Event emitted when new calculator is set
    event CalculatorUpdated(uint256 indexed setId, address indexed newCalculator);

    /// @dev Event emitted when new updater is set
    event UpdaterUpdated(address indexed newUpdater, bool isUpdater);

    /// @dev Event emitted when points are updated for some token
    event PointsUpdated(uint256 indexed tokenId);

    // CONSTRUCTOR

    /**
     * @notice Acts like constructor for upgradeable contracts
     * @param nft_ NomoNFT token address
     * @param rewardTokens_ Array of reward tokens
     * @param updater_ Address for updater role
     */
    function initialize(
        INomoNFT nft_,
        address[] memory rewardTokens_,
        address updater_
    ) external initializer {
        __Ownable_init();

        nft = nft_;
        rewardTokens = new address[](rewardTokens_.length);
        for (uint256 i = 0; i < rewardTokens_.length; i++) {
            rewardTokens[i] = rewardTokens_[i];
        }
        setUpdater(updater_, true);
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
        stakedAt[tokenId] = INomoLeague(address(0));

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

    /**
     * @notice Withdraw your rewards
     */
    function withdrawRewards() external {
        for (uint256 i = 0; i < _leagueIds.length; i++) {
            uint256 leagueId = _leagueIds[i];
            INomoLeague league = leagues[leagueId];
            league.withdrawRewardForUser(msg.sender);
        }
    }

    // RESTRICTED FUNCTIONS

    /**
     * @notice Function add reward tokens
     * @param tokens list of reward tokens
     */
    function addRewardTokens(address[] calldata tokens) external onlyOwner {
        for (uint256 i = 0; i < tokens.length; i++) {
            rewardTokens.push(tokens[i]);
        }
    }

    /**
     * @notice Function to add league, can only be called by owner
     * @param league Address of the league contract
     * @param leagueId ID that should be assigned to this league
     */
    function addLeague(INomoLeague league, uint256 leagueId) external onlyOwner {
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
     * @param _updater New updater address
     * @param _isUpdater New updater address
     */
    function setUpdater(address _updater, bool _isUpdater) public onlyOwner {
        require(_updater != address(0), "NomoRouter::setUpdater: can't set zero address");
        updaters[_updater] = _isUpdater;
        emit UpdaterUpdated(_updater, _isUpdater);
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
     * @notice Function to get total rewards of some account in all leagues
     * @param account Address to get rewards for
     * @return Total rewards
     */
    function totalRewardsOf(address account) external view returns (uint256[] memory) {
        uint256 countRewardTokens = rewardTokens.length;
        uint256[] memory totalReward = new uint256[](countRewardTokens);
        for (uint256 i = 0; i < _leagueIds.length; i++) {
            uint256[] memory rewards = leagues[_leagueIds[i]].totalRewardsOf(account);
            for (uint256 j = 0; j < countRewardTokens; j++) {
                totalReward[j] += rewards[j];
            }
        }
        return totalReward;
    }

    /**
     * @notice Function to get all league IDs
     * @return Array of league IDs
     */
    function leagueIds() external view returns (uint256[] memory) {
        return _leagueIds;
    }

    /**
     * @notice Function to get calculator address by parameters set id
     * @param setId Id of the set
     * @return Address of calculator
     */
    function calculator(uint256 setId) external view returns (address) {
        return _calculators[setId];
    }

    /**
     * @notice Function to get length of address with reward tokens
     * @return Length of array
     */
    function rewardTokensLength() external view returns (uint256) {
        return rewardTokens.length;
    }

    // PRIVATE FUNCTIONS

    /**
     * @dev Get league ID
     * @param tokenId ID of the token
     * @return ID of the league
     */
    function _getLeague(uint256 tokenId) private view returns (uint256) {
        (, , uint256 leagueId, , , , , , ) = nft.getCardImageDataByTokenId(tokenId);
        return leagueId;
    }

    // MODIFIERS

    /**
     * @dev Updater role
     */
    modifier onlyUpdater() {
        require(updaters[msg.sender], "NomoRouter: caller is not the updater");
        _;
    }
}
