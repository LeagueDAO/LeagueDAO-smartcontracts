// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

interface INomoRouterV1 {
    event TokenStaked(address indexed account, uint256 indexed tokenId, uint256 leagueId);

    event TokenUnstaked(address indexed account, uint256 indexed tokenId, uint256 leagueId);

    event LeagueAdded(address indexed league, uint256 indexed leagueId);

    event LeagueRemoved(address indexed league, uint256 indexed leagueId);

    function stakeTokens(uint256[] calldata tokenIds) external;

    function unstakeTokens(uint256[] calldata tokenIds) external;

    function totalRewardOf(address account) external view returns (uint256);

    function nft() external view returns (address);

    function rewardToken() external view returns (address);

    function calculator(uint256 setId) external view returns (address);
}
