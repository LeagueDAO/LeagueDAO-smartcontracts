// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title LeagueDAO Chield Token
/// @notice Contract used to bridge Leag token form Ethereum network to Polygon
contract ChildERC20 is ERC20Snapshot, ERC20Permit, AccessControl {
    address public childChainManager;

    bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");

    /// @notice Constructor
    /// @param _name Name of the token
    /// @param _symbol Symbol of the token
    /// @param _childChainManager Id of child chain manager
    constructor(
        string memory _name,
        string memory _symbol,
        address _childChainManager
    ) ERC20(_name, _symbol) ERC20Permit(_symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(DEPOSITOR_ROLE, _childChainManager);

        childChainManager = _childChainManager;
    }

    /// @notice Update child chain manager
    /// @param _newChildChainManager New child chain manager address
    function updateChildChainManager(address _newChildChainManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_newChildChainManager != address(0), "Bad ChildChainManager address");
        _revokeRole(DEPOSITOR_ROLE, childChainManager);
        _setupRole(DEPOSITOR_ROLE, _newChildChainManager);
        childChainManager = _newChildChainManager;
    }

    /// @notice Transfer tokens from Ethereum to Polygon network
    /// @param _user User address to recive tokens in polygon network
    /// @param _depositData Amount of tokens to recive in polygon network
    /// @dev Only polygon bridge contract can call this function
    function deposit(address _user, bytes calldata _depositData) external onlyRole(DEPOSITOR_ROLE) {
        uint256 amount = abi.decode(_depositData, (uint256));
        _mint(_user, amount);
    }

    /// @notice Transfer tokens from Polygon to Ethereum network
    /// @param _amount Amount of tokens to withdraw
    /// @dev It is interaction with polygon bridge
    function withdraw(uint256 _amount) external {
        _burn(_msgSender(), _amount);
    }

    /// @notice Take a snapshot of balances
    /// @return Snapshot id
    function snapshot() external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256) {
        return _snapshot();
    }

    /// @notice Gets current shanpshot id
    /// @return Snapshot id
    function getCurrentSnapshotId() external view returns (uint256) {
        return _getCurrentSnapshotId();
    }

    /// @dev Method is overwritten to resolve inheritance issue
    function _beforeTokenTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal virtual override(ERC20, ERC20Snapshot) {
        ERC20Snapshot._beforeTokenTransfer(_from, _to, _amount);
    }
}
