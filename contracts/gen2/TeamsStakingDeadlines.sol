// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../../contracts/gen1/interfaces/INomoNFT.sol";
import "./interfaces/ITeamsStakingDeadlines.sol";

/// @title Contract which stores staking deadlines for teams and binds CardImages to teams.
/// @notice There are two separate functionalities in this contract: deadlines and teams names. You don't need to set teams names for deadlines to work and vice versa.
contract TeamsStakingDeadlines is OwnableUpgradeable {
    // NomoNFT contract
    INomoNFT public nomoNFT;
    // card image id => team id
    mapping(uint256 => uint256) public cardImageToTeam;
    // team id => deadline
    mapping(uint256 => uint256) public teamDeadline;
    // team id => team name
    mapping(uint256 => string) public teamName;

    event UpdatedCardImageToTeam(uint256 indexed _cardImageId, uint256 indexed _teamId);
    event UpdatedTeamToDeadline(uint256 indexed _teamId, uint256 indexed _deadline);
    event UpdatedTeamToName(uint256 indexed _teamId, string indexed _name);

    modifier nonZeroTeamId(uint256 _teamId) {
        require(_teamId != 0, "Team id should be greater than 0");
        _;
    }

    // _________ INITIALIZER _________

    /**
     * @notice Initializer for the contract.
     * @param _nomoNFT NomoNFT contract
     */
    function initialize(INomoNFT _nomoNFT) external initializer {
        __Ownable_init();
        nomoNFT = _nomoNFT;
    }

    // _________ OWNER SETTERS _________

    /**
     * @notice Set cardImage's team id. Only owner (back-end) can call this function. Team id can't be 0.
     * @param _cardImageId card image id
     * @param _teamId team id
     */
    function setCardImageToTeam(uint256 _cardImageId, uint256 _teamId) public onlyOwner nonZeroTeamId(_teamId) {
        require(nomoNFT.cardImageToExistence(_cardImageId), "CardImage doesn't exist");
        cardImageToTeam[_cardImageId] = _teamId;
        emit UpdatedCardImageToTeam(_cardImageId, _teamId);
    }

    /**
     * @notice Set array of cardImages to team id. Only owner (back-end) can call this function. Team id can't be 0.
     * @param _cardImageIds array of card image ids
     * @param _teamId team id
     */
    function setCardImagesToTeam(uint256[] calldata _cardImageIds, uint256 _teamId)
        external
        onlyOwner
        nonZeroTeamId(_teamId)
    {
        for (uint256 i = 0; i < _cardImageIds.length; i++) {
            setCardImageToTeam(_cardImageIds[i], _teamId);
        }
    }

    /**
     * @notice Set staking deadline for a team. Only owner (back-end) can call this function.
     * @param _teamId Team id.
     * @param _deadline Staking deadline.
     */
    function setTeamDeadline(uint256 _teamId, uint256 _deadline) public onlyOwner nonZeroTeamId(_teamId) {
        require(_deadline > block.timestamp, "Deadline should be greater than current time");
        teamDeadline[_teamId] = _deadline;
        emit UpdatedTeamToDeadline(_teamId, _deadline);
    }

    /**
     * @notice Set staking deadline for several teams. Only owner (back-end) can call this function.
     * @param _teamIds Team ids.
     * @param _deadlines Staking deadlines.
     */
    function setTeamsDeadlines(uint256[] memory _teamIds, uint256[] memory _deadlines) external onlyOwner {
        require(_teamIds.length == _deadlines.length, "Team ids and deadlines must have the same length");
        for (uint256 i = 0; i < _teamIds.length; i++) {
            setTeamDeadline(_teamIds[i], _deadlines[i]);
        }
    }

    /**
     * @notice Set team name. Only owner (back-end) can call this function. Team names aren't used for team deadlines.
     * @param _teamId Team id.
     * @param _name Team name.
     */
    function setTeamName(uint256 _teamId, string memory _name) public onlyOwner nonZeroTeamId(_teamId) {
        teamName[_teamId] = _name;
        emit UpdatedTeamToName(_teamId, _name);
    }

    /**
     * @notice Set team names for several teams. Only owner (back-end) can call this function. Team names aren't used for team deadlines.
     * @param _teamIds Team ids.
     * @param _names Team names.
     */
    function setTeamsNames(uint256[] memory _teamIds, string[] memory _names) external onlyOwner {
        require(_teamIds.length == _names.length, "Team ids and names must have the same length");
        for (uint256 i = 0; i < _teamIds.length; i++) {
            setTeamName(_teamIds[i], _names[i]);
        }
    }

    // _________ GETTERS _________

    /**
     * @notice Get CardImage's team deadline.
     * @param _cardImageId Card image id.
     * @return Team deadline.
     */
    function getCardImageTeamDeadline(uint256 _cardImageId) external view returns (uint256) {
        return teamDeadline[cardImageToTeam[_cardImageId]];
    }

    /**
     * @notice Get CardImage's team name.
     * @param _cardImageId Card image id.
     * @return Team name.
     */
    function getCardImageTeamName(uint256 _cardImageId) external view returns (string memory) {
        return teamName[cardImageToTeam[_cardImageId]];
    }
}
