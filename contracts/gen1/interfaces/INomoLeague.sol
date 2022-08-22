// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

interface INomoLeague {
    event RewardWithdrawn(address indexed account, uint256 amount);

    event NewGameStarted(uint256 indexed index);

    event TokenStaked(address indexed account, uint256 indexed tokenId);

    event TokenUnstaked(address indexed account, uint256 indexed tokenId);

    event ActivePointsChanged(uint256 newPoints);

    function withdrawReward() external;

    function withdrawRewardForUser(address _user) external;

    function nextGame(uint256 totalReward) external;

    function stakeToken(address account, uint256 tokenId) external;

    function unstakeToken(address account, uint256 tokenId) external;

    function updatePoints(address account, uint256 tokenId) external;

    function totalRewardsOf(address account) external view returns (uint256[] memory);
}
