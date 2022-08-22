// SPDX-License-Identifier: MIT

pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    uint256 public constant MAX_CAP = 100 * (10**6) * (10**18); // 100 million

    constructor() ERC20("DAIMock", "DAIM") {
        _mint(msg.sender, MAX_CAP);
    }

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}
