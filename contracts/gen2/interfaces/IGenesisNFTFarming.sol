// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

/// @dev Required interface of an GenesisNFTFarming compliant contract
interface IGenesisNFTFarming {
    function deadline() external view returns (uint256);

    function extendDeadlineTo(uint256 newDeadline) external;

    function dust() external view returns (uint256);

    function setDust(uint256 newDust) external;

    function initialize() external;

    function addReward(
        uint256 cardID,
        address token,
        uint256 value
    ) external;

    function rewardValue(uint256 cardID, address token) external view returns (uint256 value);

    function rewards(uint256 cardID, address token) external view returns (uint256 value);

    // __________ Reward withdrawal __________
    function withdrawRewards(uint256 tokenID) external;

    function withdrawReward(uint256 tokenID, address token) external;

    function withdrawRewardsFor(uint256 tokenID, address recipient) external;

    function withdrawRewardFor(
        uint256 tokenID,
        address recipient,
        address token
    ) external;

    function withdrawBalances(address recipient) external;

    function withdrawBalance(address recipient, address token) external;

    // __________ Reward token whitelist __________
    function allowToken(address token) external;

    function disallowToken(address token) external;

    function isAllowedToken(address token) external view returns (bool);

    function getAllowedTokens() external view returns (address[] memory tokens);

    function allowedTokens(uint256 index) external view returns (address token);
}
