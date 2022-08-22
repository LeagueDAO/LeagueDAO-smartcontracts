// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

// This is developed with OpenZeppelin Upgradeable Contracts v4.5.2
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

/**
 * @title Genesis NFT Farming -- Contract that provides rewards for Genesis Player NFT owners.
 *
 * @notice Rewards are awarded due to the use of player tokens by users during the draft for the Divisions and the
 * Genesis free agent purchase.
 *
 * This contract includes the following functionality:
 *  - Adding of rewards in ERC20 tokens for users via Genesis NF token card ID before the deadline.
 *  - Withdrawal of their rewards by the users via Genesis NF token ID before the deadline.
 *  - Withdrawal of all the balances by the owner of this contract after the deadline.
 *  - ERC20 reward token whitelist functionality.
 *
 * @dev Warning. This contract is not intended for inheritance. In case of inheritance, it is recommended to change the
 * access of all storage variables from public to private in order to avoid violating the integrity of the storage. In
 * addition, you will need to add functions for them to get values.
 */
contract GenesisNFTFarming is OwnableUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    // _______________ Storage _______________
    /**
     * @dev The time after which the user can no longer pick up rewards. After that, the remaining belongs to the
     * owner of this contract.
     */
    uint256 public deadline; // In seconds

    /// @dev The number of tokens that are considered not significant. Using to verify this
    uint256 public dust; // In wei

    /// @dev Interface of the Genesis ERC721 contract
    IGenesisERC721 public erc721;

    /// @dev Stores a reward for a Genesis NFT card ID in a specified token
    // (Genesis NFT card ID => (token => value))
    mapping(uint256 => mapping(address => uint256)) public rewards;

    /// @dev ERC20 tokens that is allowed by the owner of this contract
    mapping(address => bool) public isAllowedToken;
    /// @dev It exists for getting the list of all the allowed tokens
    address[] public allowedTokens;

    // _______________ Events _______________
    /**
     * @dev Emitted when `value` tokens of `token` are added to the reward for `cardID` and moved from the caller to
     * the contract.
     */
    event RewardAdding(uint256 indexed cardID, address indexed token, uint256 value);
    /**
     * @dev Emitted when `value` tokens of `token` are withdrawn for `cardID` and moved from the contract to
     * `recipient`.
     */
    event RewardWithdrawal(uint256 indexed cardID, address indexed recipient, address indexed token, uint256 value);
    /// @dev Emitted when `value` tokens of `token` are moved from the contract to `recipient`
    event BalanceWithdrawal(address indexed recipient, address indexed token, uint256 value);

    /// @dev Emitted when `token` is allowed
    event TokenAllowing(address indexed token);
    /// @dev Emitted when `token` is disallowed
    event TokenDisallowing(address indexed token);

    /// @dev Emitted when the dust is set to `dust`
    event DustSetting(uint256 dust);
    /// @dev Emitted when the Genesis ERC721 contract is set to `erc721`
    event ERC721Setting(address erc721);
    /// @dev Emitted when the deadline is extended to `deadline`
    event DeadlineExtensionTo(uint256 deadline);

    // _______________ Modifiers _______________
    /// @dev Throws if `token` is not allowed
    modifier onlyAllowedToken(address token) {
        require(isAllowedToken[token], "The token is not allowed");
        _;
    }

    /// @dev Throws if called before the deadline
    modifier beforeDeadline() {
        require(deadline >= block.timestamp, "Only available before the deadline");
        _;
    }

    /// @dev Throws if called after the deadline
    modifier afterDeadline() {
        require(deadline < block.timestamp, "Only available after the deadline");
        _;
    }

    /// @dev Throws if `addr` (the reward receiver) is not the owner of `tokenID`
    modifier onlyNFTOwner(uint256 tokenID, address addr) {
        require(erc721.ownerOf(tokenID) == addr, "The address is not the owner of the token ID");
        _;
    }

    // _______________ External functions _______________
    /**
     * @dev Initializes the contract by setting the deployer as the initial owner, the dust, deadline and Genesis
     * ERC721 contract address values. It is used as the constructor for upgradeable contracts.
     *
     * @param erc721_ Address of the Genesis ERC721 contract.
     * @param deadline_ Time (in seconds) after which the user can no longer pick up rewards.
     */
    function initialize(address erc721_, uint256 deadline_) external initializer {
        __Ownable_init();

        erc721 = IGenesisERC721(erc721_);
        emit ERC721Setting(erc721_);

        dust = 1e12; // 10 ** 12 wei
        emit DustSetting(1e12);

        extendDeadlineTo(deadline_);
    }

    /**
     * @dev Adds a reward for a Genesis NFT card ID.
     *
     * Requirements:
     * - The token should be allowed.
     * - The Genesis NFT card ID should exist.
     * - The caller should approve `value` tokens of `token` for the contract.
     *
     * @param cardID Identifier of a Genesis NFT card.
     * @param token Address of an allowed ERC20 token in which the reward will be.
     * @param value Amount of reward.
     */
    function addReward(
        uint256 cardID,
        address token,
        uint256 value
    ) external onlyAllowedToken(token) {
        require(erc721.cardImageToExistence(cardID), "Unknown card ID");

        rewards[cardID][token] += value;
        IERC20Upgradeable(token).safeTransferFrom(_msgSender(), address(this), value);
        emit RewardAdding(cardID, token, value);
    }

    /**
     * @dev Transfers rewards for `tokenID` to the caller.
     *
     * Requirements:
     * - A user should call it before the deadline.
     * - The caller should be the owner of `tokenID`.
     *
     * @param tokenID The Genesis NF token ID.
     */
    function withdrawRewards(uint256 tokenID) external beforeDeadline onlyNFTOwner(tokenID, _msgSender()) {
        uint256 cardID = erc721.cardToCardImageID(tokenID);
        uint256 value;
        // Withdrawal from all the allowed tokens
        for (uint256 i = 0; i < allowedTokens.length; ++i) {
            value = rewards[cardID][allowedTokens[i]];
            if (value > dust) _withdrawReward(cardID, _msgSender(), allowedTokens[i], value);
        }
    }

    /**
     * @dev Transfers the reward in tokens of the specified `token` for `tokenID` to the caller.
     *
     * Requirements:
     * - A user should call it before the deadline.
     * - `token` should be allowed.
     * - The caller should be the owner of `tokenID`.
     *
     * @param tokenID The Genesis NF token ID.
     * @param token Allowed ERC20 token that is desired for reward withdrawal.
     */
    function withdrawReward(uint256 tokenID, address token)
        external
        beforeDeadline
        onlyAllowedToken(token)
        onlyNFTOwner(tokenID, _msgSender())
    {
        uint256 cardID = erc721.cardToCardImageID(tokenID);
        uint256 value = rewards[cardID][token];
        if (value > dust) _withdrawReward(cardID, _msgSender(), token, value);
    }

    /**
     * @dev Transfers rewards for `tokenID` to `recipient`.
     *
     * Requirements:
     * - The caller should be the owner of this contract.
     * - `recipient` should be the owner of `tokenID`.
     *
     * @param tokenID The Genesis NF token ID.
     * @param recipient The owner of the `tokenID`.
     */
    function withdrawRewardsFor(uint256 tokenID, address recipient)
        external
        onlyOwner
        onlyNFTOwner(tokenID, recipient)
    {
        uint256 cardID = erc721.cardToCardImageID(tokenID);
        uint256 value;
        // Withdrawal from all the allowed tokens
        for (uint256 i = 0; i < allowedTokens.length; ++i) {
            value = rewards[cardID][allowedTokens[i]];
            if (value > dust) _withdrawReward(cardID, recipient, allowedTokens[i], value);
        }
    }

    /**
     * @dev Transfers the reward in tokens of the specified `token` for `tokenID` to `recipient`.
     *
     * Requirements:
     * - The caller should be the owner of this contract.
     * - `token` should be allowed.
     * - `recipient` should be the owner of `tokenID`.
     *
     * @param tokenID The Genesis NF token ID.
     * @param recipient The owner of the `tokenID`.
     * @param token Allowed ERC20 token that is desired for reward withdrawal.
     */
    function withdrawRewardFor(
        uint256 tokenID,
        address recipient,
        address token
    ) external onlyOwner onlyAllowedToken(token) onlyNFTOwner(tokenID, recipient) {
        uint256 cardID = erc721.cardToCardImageID(tokenID);
        uint256 value = rewards[cardID][token];
        if (value > dust) _withdrawReward(cardID, recipient, token, value);
    }

    /**
     * @dev Transfers all the reward token balances of the contract to `recipient`.
     *
     * Requirements:
     *  - The caller should be the owner of this contract.
     *  - The deadline should be reached.
     *
     * @param recipient Account to which balances are transferred.
     *
     * Warning. This function, when called, violates the contract storage because it does not clear the mapping of
     * rewards. This is not implemented due to the absence of such a need. This function should be used only after all
     * interested users withdraw their rewards, and the use of the contract stops. It is still possible to restore
     * functionality by sending all tokens removed using this function or more to this contract.
     */
    function withdrawBalances(address recipient) external onlyOwner afterDeadline {
        uint256 value;
        // Withdrawal from all the allowed tokens
        for (uint256 i = 0; i < allowedTokens.length; ++i) {
            value = IERC20Upgradeable(allowedTokens[i]).balanceOf(address(this));
            if (value > dust) _withdrawBalance(recipient, allowedTokens[i], value);
        }
    }

    /**
     * @dev Transfers the balance of the specified `token` to `recipient`. Owner can withdraw any token using this function after the deadline, so we can ensure that no tokens are locked in this contract.
     *
     * Requirements:
     *  - The caller should be the owner of this contract.
     *  - The deadline should be reached.
     *
     * @param recipient Account to which balances are transferred.
     *
     * Warning. This function, when called, violates the contract storage. See `withdrawBalances()` description for
     * details.
     */
    function withdrawBalance(address recipient, address token) external onlyOwner afterDeadline {
        uint256 value = IERC20Upgradeable(token).balanceOf(address(this));
        if (value > dust) _withdrawBalance(recipient, token, value);
    }

    /**
     * @dev Allows `token` for reward adding.
     *
     * Requirements:
     * - The caller should be the owner of this contract.
     * - The token should be not allowed.
     *
     * @param token Address of a ERC20 token.
     */
    function allowToken(address token) external onlyOwner {
        require(!isAllowedToken[token], "The token has already allowed");

        isAllowedToken[token] = true;
        allowedTokens.push(token);
        emit TokenAllowing(token);
    }

    /**
     * @dev Disallows `token`.
     *
     * Requirements:
     * - The caller should be the owner of this contract.
     * - The token should be allowed.
     * - The balance of the token should be greater than the dust.
     *
     * @param token Address of an allowed ERC20 token.
     */
    function disallowToken(address token) external onlyOwner onlyAllowedToken(token) {
        require(IERC20Upgradeable(token).balanceOf(address(this)) <= dust, "There are someone else's rewards");

        delete isAllowedToken[token];
        // Find the token to remove in the array
        for (uint256 i = 0; i < allowedTokens.length - 1; ++i)
            // Replacing the deleted element with the last one
            if (allowedTokens[i] == token) {
                allowedTokens[i] = allowedTokens[allowedTokens.length - 1];
                break;
            }
        allowedTokens.pop(); // Cutting off the last element
        emit TokenDisallowing(token);
    }

    // // See the ERC721 storage variable for details
    // function setERC721(address erc721_) external onlyOwner {
    //     require(erc721 == address(0), "Address of the ERC721 has already set");

    //     erc721 = IGenesisERC721(erc721_);
    //     emit ERC721Setting(erc721_);
    // }

    /**
     * @dev Sets the dust value to `newDust`.
     *
     * Requirements:
     * - The caller should be the owner of this contract.
     * - `newDust` should be less than 1e17.
     *
     * @param newDust The number of tokens in wei that are considered not significant.
     */
    function setDust(uint256 newDust) external onlyOwner {
        require(newDust < 1e17, "Uncorrect dust"); // 10 ** 17 wei

        dust = newDust;
        emit DustSetting(newDust);
    }

    /**
     * @dev Returns the reward value in tokens of the specified `token` for `cardID` if it is greater than the dust,
     * otherwise zero.
     *
     * @param cardID Identifier of a Genesis NFT card.
     * @param token Address of a ERC20 token.
     */
    function rewardValue(uint256 cardID, address token) external view returns (uint256) {
        uint256 reward = rewards[cardID][token];
        return reward > dust ? reward : 0;
    }

    function getAllowedTokens() external view returns (address[] memory) {
        return allowedTokens;
    }

    // _______________ Public functions _______________
    /**
     * @dev Extends the deadline value to `newDeadline`.
     *
     * Requirements:
     * - The caller should be the owner of this contract.
     * - `newDeadline` should be greater than the current block timestamp and less than or equal to
     *   (the_current_block_timestamp + 86400 * 28).
     * - `newDeadline` should be greater than the current deadline.
     *
     * @param newDeadline The time in seconds after which the user can no longer pick up rewards.
     */
    function extendDeadlineTo(uint256 newDeadline) public onlyOwner {
        require(
            newDeadline > block.timestamp && newDeadline <= block.timestamp + 86400 * 28, // 4 weeks
            "Uncorrect deadline"
        );
        require(deadline < newDeadline, "The deadline should be greater than the current deadline");

        deadline = newDeadline;
        emit DeadlineExtensionTo(newDeadline);
    }

    // _______________ Private functions _______________
    // Transfers a reward to the recipient
    function _withdrawReward(
        uint256 cardID,
        address recipient,
        address token,
        uint256 value
    ) private {
        // rewards[cardID][token] -= value; // Replace with this if adds the ability to withdraw a part of the value
        delete rewards[cardID][token];
        IERC20Upgradeable(token).safeTransfer(recipient, value);
        emit RewardWithdrawal(cardID, recipient, token, value);
    }

    /*
     * Transfers a balance to the recipient.
     *
     * Warning. This function, when called, violates the contract storage. See `withdrawBalances()` description for
     * details.
     */
    function _withdrawBalance(
        address recipient,
        address token,
        uint256 value
    ) private {
        IERC20Upgradeable(token).safeTransfer(recipient, value);
        emit BalanceWithdrawal(recipient, token, value);
    }
}

// This is here because the interface (interfaces/INomoNFT.sol) does not contain required declarations
interface IGenesisERC721 {
    /// @dev Returns "true" if `cardID` exists, otherwise "false"
    function cardImageToExistence(uint256 cardID) external view returns (bool exists);

    /// @dev Returns `cardID` that corresponds to `tokenID`
    function cardToCardImageID(uint256 tokenID) external view returns (uint256 cardID);

    // __________ From the OpenZeppelin ERC721 interface __________
    /**
     * @dev Returns `owner` of `tokenID` token.
     *
     * Requirements:
     * - `tokenID` should exist.
     */
    function ownerOf(uint256 tokenID) external view returns (address owner);
}
