// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

/// @title Contract which stores staking deadlines for teams and binds CardImages to teams.
interface ITeamsStakingDeadlines {
    /**
     * @notice Get team id for a card image.
     * @param _cardImageId card image id.
     * @return _teamId team id
     */
    function cardImageToTeam(uint256 _cardImageId) external view returns (uint256 _teamId);

    /**
     * @notice Get staking deadline for a team.
     * @param _teamId team id.
     * @return _deadline staking deadline
     */
    function teamDeadline(uint256 _teamId) external view returns (uint256 _deadline);

    /**
     * @notice Get team name for a team.
     * @param _teamId team id.
     * @return _name team name
     */
    function teamName(uint256 _teamId) external view returns (string memory _name);

    /**
     * @notice Get CardImage's team deadline.
     * @param _cardImageId Card image id.
     * @return Team deadline.
     */
    function getCardImageTeamDeadline(uint256 _cardImageId) external view returns (uint256);

    /**
     * @notice Get CardImage's team name.
     * @param _cardImageId Card image id.
     * @return Team name.
     */
    function getCardImageTeamName(uint256 _cardImageId) external view returns (string memory);
}
