// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "../interfaces/IStrategy.sol";
import "../interfaces/INomoRouter.sol";
import "../interfaces/INomoNFT.sol";

contract NomoVault is OwnableUpgradeable, ERC20Upgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    /// @notice NomoNFT contract
    INomoNFT public nft;

    /// @notice Strategy contract
    IStrategy public strategy;

    /// @notice NomoRouter contract
    INomoRouter public router;

    /// @notice Mapping from addresses to indicators if they have sales role
    mapping(address => bool) public hasSalesRole;

    /// @notice Mapping from league IDs to list of token IDs sold in those leagues
    mapping(uint256 => uint256[]) public leagueTokenIds;

    /// @notice List of league IDs operated by this vault
    uint256[] public leagueIds;

    //@notice dust for rewards distribution
    uint256 public constant DUST = 10e12;

    // EVENTS

    /// @notice Event emitted when NFTs sale callback is executed in the vault
    event NftSale(uint256[] tokensIds, uint256[] prices);

    /// @notice Event emitted when rewards are distributed between leagues
    event RewardDistributed(uint256 reward, address league);

    /// @notice Event emitted when new strategy is set for the vault
    event StrategyUpgraded(address newStrategy);

    /// @notice Event emitted when sales role is granted or revoked for some address
    event SalesRoleSet(address account, bool hasRole);

    /// @notice Event emitted when new leagues are added to the vault
    event LeaguesAdded(uint256[] leagueIds);

    /// @notice Event emitted when leagues are removed from the vault (and rewards respectively)
    event LeaguesRemoved(uint256[] leagueIds);

    // CONSTRUCTOR

    /**
     * @notice Upgradeable contract constructor
     * @param nft_ Address of the NomoNFT contract
     * @param strategy_ Address of the strategy contract
     * @param router_ Address of the NomoRouter contract
     */
    function initialize(
        INomoNFT nft_,
        IStrategy strategy_,
        INomoRouter router_
    ) external initializer {
        __Ownable_init();
        __ERC20_init("Nomo Vault", "NOMOVAULT");

        nft = nft_;
        strategy = strategy_;
        router = router_;
    }

    // MUTATIVE FUNCTIONS

    /**
     * @notice Function that is called by sales contract as callback in order to deposit funds to strategy
     * @param tokensIds List of token IDs sold
     * @param prices Prices of sold tokens respectively (as wei)
     */
    function nftSaleCallback(uint256[] memory tokensIds, uint256[] memory prices) external onlySales {
        require(tokensIds.length == prices.length, "NomoVault: length mismatch");

        uint256 totalPrice;
        uint256 initialSupply = totalSupply();
        uint256 initialBalance = balance();
        for (uint256 i = 0; i < tokensIds.length; i++) {
            uint256 shares;
            if (initialSupply == 0) {
                shares = prices[i];
            } else {
                shares = (prices[i] * initialSupply) / initialBalance;
            }
            uint256 leagueId = _getTokenLeague(tokensIds[i]);
            _mint(router.leagues(leagueId), shares);
            totalPrice += prices[i];
            leagueTokenIds[leagueId].push(tokensIds[i]);
        }

        want().safeTransferFrom(msg.sender, address(this), totalPrice);
        _earn();

        emit NftSale(tokensIds, prices);
    }

    /**
     * @notice Function is called by owner to extract and distribute reward between leagues
     * @param league Address of league which you want to distribute rewards for
     */
    function distributeReward(address league) external onlyOwner {
        strategy.getReward();
        uint256 reward = want().balanceOf(address(this));

        for (uint256 i = 0; i <= leagueIds.length; i++) {
            require(i != leagueIds.length, "Vault: this league does not exist or has not been added yet");
            if (league == router.leagues(leagueIds[i])) {
                break;
            }
        }
        uint256 leagueShare = (reward * balanceOf(league)) / totalSupply();

        if (leagueShare > DUST) {
            want().safeTransfer(league, leagueShare);
            emit RewardDistributed(leagueShare, league);
            return;
        }
        emit RewardDistributed(0, league);
    }

    /**
     * @notice Function is called by owner to upgrade vault to new strategy
     * @param strategy_ Address of the new strategy contract
     */
    function upgradeStrategy(IStrategy strategy_) external onlyOwner {
        strategy.getReward();
        strategy.withdraw(strategy.totalWantDeposited());
        strategy = strategy_;
        _earn();

        emit StrategyUpgraded(address(strategy_));
    }

    /**
     * @notice Function can be used by owner to withdraw any stuck token from the vault
     * @param token address of the token to rescue.
     */
    function withdrawAnyToken(address token) external onlyOwner {
        require(token != address(want()), "Vault: can not withdraw want");

        uint256 amount = IERC20Upgradeable(token).balanceOf(address(this));
        IERC20Upgradeable(token).safeTransfer(msg.sender, amount);
    }

    /**
     * @notice Function is used by owner to grant or revoke sales role for some address
     * @param account Address to set sales role for
     * @param hasRole True to grant role, false to revoke
     */
    function setSalesRole(address account, bool hasRole) external onlyOwner {
        hasSalesRole[account] = hasRole;

        emit SalesRoleSet(account, hasRole);
    }

    /**
     * @notice Function is used by owner to add leagues to the contract
     * @param newLeagueIds List of league IDs added to the contract
     */
    function addLeagues(uint256[] memory newLeagueIds) external onlyOwner {
        for (uint256 i = 0; i < newLeagueIds.length; i++) {
            leagueIds.push(newLeagueIds[i]);
        }

        emit LeaguesAdded(newLeagueIds);
    }

    /**
     * @notice Function is used by owner to remove leagues from the contract (and clear their rewards)
     * @param removedLeagueIds List of league IDs removed from the contract
     */
    function removeLeagues(uint256[] memory removedLeagueIds) external onlyOwner {
        for (uint256 i = 0; i < removedLeagueIds.length; i++) {
            for (uint256 j = 0; j < leagueIds.length; j++) {
                if (leagueIds[j] == removedLeagueIds[i]) {
                    leagueIds[j] = leagueIds[leagueIds.length - 1];
                    leagueIds.pop();
                    address league = router.leagues(removedLeagueIds[i]);
                    _burn(league, balanceOf(league));
                    break;
                }
            }
        }

        emit LeaguesRemoved(removedLeagueIds);
    }

    // VIEW FUNCTIONS

    /**
     * @notice View function that returns want token for the used strategy and vault
     * @return Address of the want token
     */
    function want() public view returns (IERC20Upgradeable) {
        return IERC20Upgradeable(strategy.wantToken());
    }

    /**
     * @notice View function that returns total amount of funds operated by the strategy
     * @return Want equivalent of total funds
     */
    function balance() public view returns (uint256) {
        return want().balanceOf(address(this)) + strategy.totalWantDeposited();
    }

    // INTERNAL FUNCTIONS

    /**
     * @notice Internal function that deposits vault balance to the strategy
     */
    function _earn() internal {
        want().safeTransfer(address(strategy), want().balanceOf(address(this)));
        strategy.deposit();
    }

    /**
     * @notice Internal function that gets league ID for given token ID
     * @return leagueId League ID
     */
    function _getTokenLeague(uint256 tokenId) private view returns (uint256 leagueId) {
        (, , leagueId, , , , , , ) = nft.getCardImageDataByTokenId(tokenId);
    }

    // MODIFIERS

    /**
     * @notice Modifier to limit function only to accounts with sales role
     */
    modifier onlySales() {
        require(hasSalesRole[msg.sender], "NomoVault: caller is not sales");
        _;
    }
}
