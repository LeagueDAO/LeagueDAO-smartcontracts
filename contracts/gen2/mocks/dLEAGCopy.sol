// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.6;

import "@openzeppelin/contracts-upgradeable/token/ERC20/presets/ERC20PresetMinterPauserUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @dev {ERC20PresetMinterPauserUpgradeable} token whose ownership and minting capabilities are transferred to a specified owner.
 * @dev {ERC20PermitUpgradeable} enables permit based interactions
 **/
contract dLEAGCopy is ERC20PresetMinterPauserUpgradeable, ERC20PermitUpgradeable, UUPSUpgradeable {
    mapping(address => bool) public whitelisted;
    event WhiteListedSet(address whitelisted, bool isWhitelisted);

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, `PAUSER_ROLE` to the caller.
     */
    function initializeToken(string memory name, string memory symbol) public initializer {
        __ERC20Permit_init(name);
        __ERC20PresetMinterPauser_init(name, symbol);

        revokeRole(MINTER_ROLE, _msgSender());
    }

    function setMinterRole(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }

    function setWhitelisted(address _whitelisted, bool _isWhitelisted) external onlyRole(DEFAULT_ADMIN_ROLE) {
        whitelisted[_whitelisted] = _isWhitelisted;

        emit WhiteListedSet(_whitelisted, _isWhitelisted);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20Upgradeable, ERC20PresetMinterPauserUpgradeable) {
        require(
            (from == address(0) || to == address(0)) || whitelisted[from] || whitelisted[to],
            "dLEAG: Non-Transferrable token!"
        );

        ERC20PresetMinterPauserUpgradeable._beforeTokenTransfer(from, to, amount);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
