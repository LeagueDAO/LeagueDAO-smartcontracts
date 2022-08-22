// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./interfaces/ITokenVesting.sol";

contract LeagueTokenVesting is ITokenVesting, AccessControlUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    /* ========== TYPES  ========== */

    /**
     * @dev Round information
     * @param totalSupply - total supply allocated to the round
     * @param supplyLeft - available supply that can be assigned to investor
     * @param price - price of token (ex: 0.12$ = 0.12 * 100 = 12)
     * @param initialReleasePercent - percent to tokens which will be given at the tge
     * @param cliffPeriod - duration of cliff period
     * @param cliffEndTime - time at which cliff ends
     * @param vestingPeriod - duration of individual vesting
     * @param noOfVestings - total no of vesting to give
     */
    struct RoundInfo {
        uint256 totalSupply;
        uint256 supplyLeft;
        uint256 price;
        uint256 initialReleasePercent;
        uint256 cliffPeriod;
        uint256 cliffEndTime;
        uint256 vestingPeriod;
        uint256 noOfVestings;
    }

    /**
     * @dev Investor information
     * @param totalAssigned - total tokens assigned to the investor
     * @param vestingTokens - no of tokens to give at each vesting
     * @param vestingsClaimed - total no off vesting which will be given
     * @param initialClaimReleased - tell tokens released at the tge are received or not
     */
    struct Investor {
        uint256 totalAssigned;
        uint256 vestingTokens;
        uint256 vestingsClaimed;
        bool initialClaimReleased;
    }

    /**
     * @dev Team information
     * @param beneficiary - address of account which be be able to claim tokens
     * @param cliffPeriod - duration of cliff period
     * @param cliffEndTime - time at which cliff ends
     * @param vestingPeriod - duration of individual vesting
     * @param noOfVestings - total no of vesting to give
     * @param totalSupply - total supply allocated to the round
     * @param initialReleasePercent - percent to tokens which will be given at the tge
     * @param vestingTokens - no of tokens to give at each vesting
     * @param vestingsClaimed - total no off vesting which will be given
     * @param initialClaimReleased - tell tokens released at the tge are received or not
     */
    struct TeamInfo {
        address beneficiary;
        uint256 cliffPeriod;
        uint256 cliffEndTime;
        uint256 vestingPeriod;
        uint256 noOfVestings;
        uint256 totalSupply;
        uint256 initialReleasePercent;
        uint256 vestingsClaimed;
        uint256 vestingTokens;
        bool initialClaimReleased;
    }

    /* ========== STATE VARIABLES  ========== */

    /// @notice Round information
    RoundInfo public roundInfo;

    /// @notice Investors data by address
    mapping(address => Investor) public investorInfo;

    /// @notice List of investors
    address[] public investors;

    /// @notice
    uint256 public startTime;

    /// @notice League token instance
    IERC20Upgradeable public leagueToken;

    /* ========== CONSTANTS ========== */

    /// @notice Vester role name
    bytes32 public constant VESTER_ROLE = keccak256("VESTER_ROLE");

    /*
     * @dev All value which are in percent are multiplied with MULTIPLIER(100) to handle precision up to 2 places
     * 100% = 100 * 100 (MULTIPLIER)
     */
    uint256 private constant PERCENTAGE_MULTIPLIER = 10000;

    /**
        365 days in 1 year
        1 month = 30 days + 10 hours,
        12 months = 360 days + 120 hours = 365 days
        4 months = 120 days + 40 hours;
        6 months = 180 days + 60 hours;
        9 months = 270 days + 90 hours;
    */

    /**
        supply : 100.0%
        initial release : 0%
        cliff: 0 days,
        vesting schedule : unlock new tokens each 7 days for 2 years
        no of vestings : 2 years/7 days = 104 vests
     */
    uint256 private constant SUPPLY_PERCENT = 10000;
    uint256 private constant PRICE = 1e18;
    uint256 private constant INITIAL_RELEASE_PERCENT = 0;
    uint256 private constant CLIFF_PERIOD = 0 days;
    uint256 private constant VESTING_PERIOD = 7 days;
    uint256 private constant NO_OF_VESTINGS = 100;

    /* ========== CONSTRUCTOR ========== */

    /**
     * @dev all the details are hard coded
     * @param _leagueToken - League token address
     * @param _startAfter - Delay before start
     */
    function initialize(IERC20Upgradeable _leagueToken, uint256 _startAfter) public initializer {
        require(_startAfter > 0, "Invalid startTime");
        require(address(_leagueToken) != address(0), "Zero address");

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(VESTER_ROLE, _msgSender());

        uint256 _startTime = block.timestamp + _startAfter;

        leagueToken = _leagueToken;
        startTime = _startTime;
        uint256 leagueTotalSupply = 460_000_000 * 10**18;

        _addRound(
            leagueTotalSupply,
            PRICE,
            INITIAL_RELEASE_PERCENT,
            CLIFF_PERIOD,
            VESTING_PERIOD,
            NO_OF_VESTINGS,
            _startTime
        );
    }

    /* ========== ADMIN FUNCTIONS ========== */

    /**
     * @dev Add new vester address
     * @param _newVester - Address of new vester
     */
    function addVester(address _newVester) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(VESTER_ROLE, _newVester);
    }

    /**
     * @dev Remove vester
     * @param _vesterToRemove - Address of new vester
     */
    function removeVester(address _vesterToRemove) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(VESTER_ROLE, _vesterToRemove);
    }

    /**
     * @notice Update start time
     * @param _startAfter - Time after which u want to start (cant be 0);
     * @dev Can only be updated before the start
     */
    function updateStartTime(uint256 _startAfter) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_startAfter > 0, "Invalid startTime");
        require(block.timestamp < startTime, "Already started");

        uint256 _startTime = block.timestamp + _startAfter;

        _massUpdateCliffEndTime(_startTime);

        startTime = _startTime;
    }

    /**
     * @notice Recover any erc20 token
     * @param _token - ERC20 token address
     * @param _amount - Amount to recover
     * @dev All tokens goes to the admin wallet first
     */
    function recoverToken(address _token, uint256 _amount) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20Upgradeable(_token).safeTransfer(_msgSender(), _amount);
        emit RecoverToken(_token, _amount);
    }

    /* ========== VESTER FUNCTIONS ========== */

    /**
     * @notice Add, update or remove single investor
     * @param _investor - Address of investor
     * @param _amount - For how much amount (in $) has investor invested. ex  100$ = 100 * 100 = 100,00
     * @dev To remove make amount 0 before it starts
     * @dev You can add, updated and remove any time
     */
    function addOrUpdateInvestor(address _investor, uint256 _amount) external override onlyRole(VESTER_ROLE) {
        _addInvestor(_investor, _amount);
        emit InvestorAdded(_investor, _amount);
    }

    /**
     * @notice Add, update or remove batch of investors
     * @param _investors - Array of address of investors
     * @param _amounts - Array of investors amounts
     */
    function addOrUpdateInvestors(address[] memory _investors, uint256[] memory _amounts)
        external
        override
        onlyRole(VESTER_ROLE)
    {
        uint256 _length = _investors.length;

        require(_amounts.length == _length, "Arguments length not match");
        require(_length > 0, "Empty arrays");

        for (uint256 i = 0; i < _length; i++) {
            _addInvestor(_investors[i], _amounts[i]);
        }

        emit InvestorsAdded(_investors, _amounts);
    }

    /* ========== Investor FUNCTIONS ========== */

    /**
     * @notice claim unlocked tokens (only investor)
     */
    function claimInvestorUnlockedTokens() external override onlyInvestor started {
        RoundInfo memory round = roundInfo;
        Investor memory investor = investorInfo[_msgSender()];

        require(investor.vestingsClaimed < round.noOfVestings, "Already claimed all vesting");

        uint256 unlockedTokens;

        if (block.timestamp >= round.cliffEndTime) {
            uint256 claimableVestingLeft;
            (unlockedTokens, claimableVestingLeft) = _getInvestorUnlockedTokensAndVestingLeft(round, investor);

            investorInfo[_msgSender()].vestingsClaimed = investor.vestingsClaimed + claimableVestingLeft;
        }

        if (!investor.initialClaimReleased) {
            unlockedTokens =
                unlockedTokens +
                ((investor.totalAssigned * round.initialReleasePercent) / PERCENTAGE_MULTIPLIER);
            investorInfo[_msgSender()].initialClaimReleased = true;
        }

        require(unlockedTokens > 0, "No unlocked tokens available");

        leagueToken.safeTransfer(_msgSender(), unlockedTokens);
        emit InvestorTokensClaimed(_msgSender(), unlockedTokens);
    }

    /* ========== PRIVATE FUNCTIONS ========== */
    /**
     * @dev Add new round
     * @param _totalSupply - Total supply of NOMO token for this round
     * @param _price - Price of NOMO token in $
     * @param _initialReleasePercent - Tokens to be released at token generation event
     * @param _cliffPeriod - Time user have to wait after start to get his/her first vesting
     * @param _vestingPeriod - Duration of single vesting (in secs)
     * @param _noOfVestings - Total no of vesting will be given
     * @param _startTime - Vesting started at
     */
    function _addRound(
        uint256 _totalSupply,
        uint256 _price,
        uint256 _initialReleasePercent,
        uint256 _cliffPeriod,
        uint256 _vestingPeriod,
        uint256 _noOfVestings,
        uint256 _startTime
    ) internal virtual {
        RoundInfo storage newRoundInfo = roundInfo;

        newRoundInfo.price = _price;
        newRoundInfo.totalSupply = _totalSupply;
        newRoundInfo.supplyLeft = _totalSupply;
        newRoundInfo.initialReleasePercent = _initialReleasePercent;
        newRoundInfo.cliffPeriod = _cliffPeriod;
        newRoundInfo.vestingPeriod = _vestingPeriod;
        newRoundInfo.noOfVestings = _noOfVestings;
        newRoundInfo.cliffEndTime = _startTime + _cliffPeriod;
    }

    function _massUpdateCliffEndTime(uint256 _startTime) private {
        roundInfo.cliffEndTime = _startTime + roundInfo.cliffPeriod;
    }

    function _addInvestor(address _investorAddress, uint256 _amount) private {
        require(_investorAddress != address(0), "Invalid address");

        RoundInfo memory round = roundInfo;
        Investor storage investor = investorInfo[_investorAddress];
        uint256 totalAssigned = (_amount * 1e18) / round.price;

        require(round.supplyLeft >= totalAssigned, "Insufficient supply");

        if (investor.totalAssigned == 0) {
            investors.push(_investorAddress);
            roundInfo.supplyLeft = round.supplyLeft - totalAssigned;
        } else {
            roundInfo.supplyLeft = round.supplyLeft + investor.totalAssigned - totalAssigned;
        }
        investor.totalAssigned = totalAssigned;
        investor.vestingTokens =
            (totalAssigned - ((totalAssigned * round.initialReleasePercent) / PERCENTAGE_MULTIPLIER)) /
            round.noOfVestings;
    }

    /**
     * @notice Calculate the total vesting claimable vesting left for investor
     * @dev will only run in case if cliff period ends and investor have unclaimed vesting left
     */
    function _getInvestorUnlockedTokensAndVestingLeft(RoundInfo memory _round, Investor memory _investor)
        private
        view
        returns (uint256, uint256)
    {
        uint256 totalClaimableVesting = ((block.timestamp - _round.cliffEndTime) / _round.vestingPeriod) + 1;

        uint256 claimableVestingLeft = totalClaimableVesting > _round.noOfVestings
            ? _round.noOfVestings - _investor.vestingsClaimed
            : totalClaimableVesting - _investor.vestingsClaimed;

        uint256 unlockedTokens = _investor.vestingTokens * claimableVestingLeft;

        return (unlockedTokens, claimableVestingLeft);
    }

    /* ========== VIEWS ========== */

    /**
     * @return amount of unlockToken which are currently unclaimed for a investor
     */
    function getInvestorClaimableTokens(address _investor) external view override returns (uint256) {
        RoundInfo memory round = roundInfo;
        Investor memory investor = investorInfo[_investor];

        if (startTime == 0 || block.timestamp < startTime || investor.vestingsClaimed == round.noOfVestings) return 0;

        uint256 unlockedTokens;
        if (block.timestamp >= round.cliffEndTime) {
            (unlockedTokens, ) = _getInvestorUnlockedTokensAndVestingLeft(round, investor);
        }

        if (!investor.initialClaimReleased) {
            unlockedTokens =
                unlockedTokens +
                ((investor.totalAssigned * round.initialReleasePercent) / PERCENTAGE_MULTIPLIER);
        }

        return unlockedTokens;
    }

    function getInvestorTotalAssigned(address _investor) external view returns (uint256) {
        return investorInfo[_investor].totalAssigned;
    }

    function getInvestorVestingTokens(address _investor) external view returns (uint256) {
        return investorInfo[_investor].vestingTokens;
    }

    function getInvestorVestingsClaimed(address _investor) external view returns (uint256) {
        return investorInfo[_investor].vestingsClaimed;
    }

    function getInvestorTokensInContract(address _investor) external view returns (uint256) {
        return
            investorInfo[_investor].totalAssigned -
            (investorInfo[_investor].vestingTokens * investorInfo[_investor].vestingsClaimed);
    }

    /* ========== MODIFIERS ========== */

    modifier started() {
        require(block.timestamp > startTime, "Not started yet");
        _;
    }

    modifier onlyInvestor() {
        require(investorInfo[_msgSender()].totalAssigned > 0, "Caller is not a investor");
        _;
    }
}
