// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "../interfaces/IFantasyLeague.sol";
import "../interfaces/IMegaLeague.sol";
import "../interfaces/IStrategy.sol";
import "../../../contracts/mocks/ERC20Mock.sol";

contract FinancialManagerMock2 is Initializable, AccessControlUpgradeable {
    // _______________ Storage _______________
    bytes32 public constant MULTISIG_ROLE = keccak256("MULTISIG_ROLE");

    // strategy
    IStrategy public strategy;

    // user allowed to withdraw yield
    address public multisigUser;

    // playoff rewards recipient
    address public fantasyLeague;

    // megaleague rewards recipient
    address public megaLeague;

    // pool id
    uint256 public poolId;

    address[] public tokens;

    uint256 public lastWeekOfPlayoff;

    //playoff reward amount per user
    uint256 public playoffRewardAmount;

    address public playoffRewardToken;

    address public treasury;

    uint256 public treasuryShare; // in percent 10000 = 100% , 125 = 1.25%
    // _______________ Events _______________

    event YieldCollected(address _token, uint256 _amount);

    event RewardsForPlayoffAreSupplied(uint256 _amount);

    event RewardsForMegaLeagueAreSupplied(uint256 _amount);

    // _______________ Initializer _______________

    function initialize(
        address _strategy,
        address _multisigUser,
        address _fantasyLeague,
        address[] calldata _tokens
    ) external initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(MULTISIG_ROLE, _multisigUser);

        strategy = IStrategy(_strategy);
        multisigUser = _multisigUser;
        fantasyLeague = _fantasyLeague;
        tokens = _tokens; //[USDC, USDT, DAI, MAI]
        poolId = 3;
        playoffRewardToken = _tokens[1];
        playoffRewardAmount = 900 * 10**IERC20MetadataUpgradeable(_tokens[1]).decimals();
        lastWeekOfPlayoff = 17;
    }

    // _______________ External functions _______________

    /// @notice deposit whole balance of [USDC, USDT, DAI, MAI] from this contract to strategy
    function depositBalance() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256[] memory depositAmounts = new uint256[](tokens.length);
        uint256[] memory tokenBalances = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            tokenBalances[i] = (IERC20Upgradeable(tokens[i]).balanceOf(address(this)));
            if (tokenBalances[i] != 0) {
                uint256 treasuryAmount = (tokenBalances[i] / 10000) * treasuryShare;
                depositAmounts[i] = tokenBalances[i] - treasuryAmount;

                IERC20Upgradeable(tokens[i]).approve(address(strategy), depositAmounts[i]);
                IERC20Upgradeable(tokens[i]).transfer(treasury, treasuryAmount);
            }
        }
        strategy.depositInUnderlying(poolId, depositAmounts);
    }

    /// @notice Collect yield from strategy
    /// @param _underlying token address
    function yield(address _underlying) external onlyRole(MULTISIG_ROLE) {
        uint256 userPoolAmount = strategy.userPoolAmount(poolId, address(this));
        uint256 yieldBalance = strategy.yieldBalance(poolId, address(this));
        require(yieldBalance > 0, "No yield to be collected");

        uint256 interestInWant = (yieldBalance * userPoolAmount) / (userPoolAmount + yieldBalance);

        // withdraw interest, left body of deposit untouched
        strategy.withdrawInOneUnderlying(poolId, interestInWant, _underlying);

        //transfer to multisig contract
        uint256 balance = IERC20Upgradeable(_underlying).balanceOf(address(this));
        IERC20Upgradeable(_underlying).transfer(multisigUser, balance);

        emit YieldCollected(_underlying, balance);
    }

    /// @notice transfer playoffRewardAmount * division in playoffRewardToken to FantasyLeague and rest of deposit to MegaLeague
    function supplyRewardsForPlayoffAndMegaLeague() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            IFantasyLeague(fantasyLeague).getCurrentWeek() >= lastWeekOfPlayoff,
            "Impossible to send playoff rewards at this week"
        );

        // withdraw everything from league in underlying
        // uint256 wantAmount = strategy.userPoolAmount(poolId, address(this));
        // strategy.withdrawInOneUnderlying(poolId, wantAmount, playoffRewardToken);

        // transfer to fantasy league  division * playoffRewardAmount in underlying
        uint256 numberOfDivisions = IFantasyLeague(fantasyLeague).getNumberOfDivisions();
        uint256 totalRewardPlayoff = numberOfDivisions * playoffRewardAmount;
        IERC20Upgradeable(playoffRewardToken).transfer(address(fantasyLeague), totalRewardPlayoff);
        emit RewardsForPlayoffAreSupplied(totalRewardPlayoff);

        // transfer rest of usd to megaleague
        uint256 restOfBalance = IERC20Upgradeable(playoffRewardToken).balanceOf(address(this));
        IERC20Upgradeable(playoffRewardToken).transfer(megaLeague, restOfBalance);
        emit RewardsForMegaLeagueAreSupplied(restOfBalance);

        IMegaLeague(megaLeague).setMegaLeagueRewards(playoffRewardToken, restOfBalance);
    }

    // _______________ Setters _______________
    function setPoolId(uint256 _poolId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        poolId = _poolId;
    }

    function setStrategy(address _strategy) external onlyRole(DEFAULT_ADMIN_ROLE) {
        strategy = IStrategy(_strategy);
    }

    function setMultisigUser(address _multisigUser) external onlyRole(DEFAULT_ADMIN_ROLE) {
        multisigUser = _multisigUser;
    }

    function setFantasyLeague(address _fantasyLeague) external onlyRole(DEFAULT_ADMIN_ROLE) {
        fantasyLeague = _fantasyLeague;
    }

    function setMegaLeague(address _megaLeague) external onlyRole(DEFAULT_ADMIN_ROLE) {
        megaLeague = _megaLeague;
    }

    function setTokens(address[] calldata _tokens) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tokens = _tokens;
    }

    function setRewardTokenAndAmount(uint256 _amount, address _token) external onlyRole(DEFAULT_ADMIN_ROLE) {
        playoffRewardAmount = _amount;
        playoffRewardToken = _token;
    }

    function setLastWeekOfPlayoff(uint256 _lastWeekOfPlayoff) external onlyRole(DEFAULT_ADMIN_ROLE) {
        lastWeekOfPlayoff = _lastWeekOfPlayoff;
    }

    function setTreasury(address _address, uint256 _share) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_share >= 0 && _share <= 10000, "Share has to be between 0% and 100%");

        treasury = _address;
        treasuryShare = _share;
    }

    // _______________ Getters _______________

    function getPlayoffRewardTokenNValue() external view returns (address token, uint256 amount) {
        amount = playoffRewardAmount;
        token = playoffRewardToken;
    }

    // _______________ Gap reserved space _______________

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[37] private gap;
}
