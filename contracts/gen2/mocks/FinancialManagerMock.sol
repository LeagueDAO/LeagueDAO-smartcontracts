// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "../interfaces/IFantasyLeague.sol";
import "../interfaces/IMegaLeague.sol";
import "../interfaces/IStrategy.sol";
import "../../../contracts/mocks/ERC20Mock.sol";

contract FinancialManagerMock is Initializable, AccessControlUpgradeable {
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

    // amount that was invested in strategy
    uint256 public depositAmount;

    // pool id
    uint256 public poolId;

    address[] public tokens;

    uint256[] public tokenBalances;

    uint256 public bodyOfDepositInWant;

    uint256 public bodyOfDepositInUsd;

    uint256 public lastWeekOfPlayoff;

    //playoff reward amount per user
    uint256 public playoffRewardAmount;

    address public playoffRewardToken;
    // _______________ Events _______________

    event YeildCollected(address _token, uint256 _amount);

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
        poolId = 69; //not real pool id
        playoffRewardAmount = 900 ether;
        playoffRewardToken = _tokens[1];
        lastWeekOfPlayoff = 17;
    }

    // _______________ External functions _______________

    /// @notice deposit whole balance of [USDC, USDT, DAI, MAI] from this contract to strategy
    function depositBalance() external onlyRole(DEFAULT_ADMIN_ROLE) {
        //Do not need to deposit beacause there is NO STARATEGY
    }

    /// @notice Collect yield from strategy
    /// @param _underlying token address
    function yeild(address _underlying) external onlyRole(MULTISIG_ROLE) {
        uint256 yeildAmount = ERC20Mock(_underlying).balanceOf(address(this)) / 10; // 10% yeild
        ERC20Mock(_underlying).mint(address(this), yeildAmount);
        ERC20Mock(_underlying).transfer(multisigUser, yeildAmount);

        emit YeildCollected(_underlying, yeildAmount);
    }

    /// @notice transfer playoffRewardAmount * division in playoffRewardToken to FantasyLeague and rest of deposit to MegaLeague
    function supplyRewardsForPlayoffAndMegaleague() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            IFantasyLeague(fantasyLeague).getCurrentWeek() >= lastWeekOfPlayoff,
            "Impossible to send playoff rewards at this week"
        );

        // transfer to fantasy league  division * playoffRewardAmount in underlying
        uint256 numberOfDivisions = IFantasyLeague(fantasyLeague).getNumberOfDivisions();
        IERC20Upgradeable(playoffRewardToken).transfer(
            fantasyLeague,
            numberOfDivisions * playoffRewardAmount * 1 ether
        );
        emit RewardsForPlayoffAreSupplied(numberOfDivisions * playoffRewardAmount * 1 ether);

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

    function setMmultisigUser(address _multisigUser) external onlyRole(DEFAULT_ADMIN_ROLE) {
        multisigUser = _multisigUser;
    }

    function setFantasyLeague(address _fantasyLeague) external onlyRole(DEFAULT_ADMIN_ROLE) {
        fantasyLeague = _fantasyLeague;
    }

    function setMegaleague(address _megaLeague) external onlyRole(DEFAULT_ADMIN_ROLE) {
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
