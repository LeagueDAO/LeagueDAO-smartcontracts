// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "../FantasyLeague.sol";

contract FantasyLeagueMock is FantasyLeague {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    function setUserSeasonStats(
        address user,
        uint256 seasonId,
        uint32 wins,
        uint32 losses,
        uint32 ties,
        uint256 points
    ) external {
        userSeasonStats[user][seasonId] = UserSeasonStats(wins, losses, ties, points);
    }

    function setNewUsersList(address[] calldata _users) external {
        users[seasonId.current()] = _users;
        for (uint256 i = 0; i < _users.length; i++) {
            isUser[seasonId.current()][_users[i]] = true;
        }
    }

    function setGameStage(GameStage _gameStage) external {
        gameStage = _gameStage;
    }

    function incrementSeasonId() external {
        seasonId.increment();

        leaguePassNFT.updateSeasonId();
    }
}
