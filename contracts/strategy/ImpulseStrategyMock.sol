// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "../mocks/ERC20Mock.sol";

contract ImpulseStrategyMock {
    struct UserInfo {
        uint256 shares; // How many Shares the user has.
        uint256 depositInWant; // How many ASSET tokens the user has provided.
    }

    uint256 public wantTotal;
    uint256 internal totalSupplyShares;
    address[4] public underlyings;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    event Deposit(address indexed user, uint256 indexed poolId, uint256 amount);

    constructor(address[4] memory _underlyings) {
        underlyings = _underlyings;
    }

    // Deposit / Withdraw interface

    function depositInUnderlying(uint256 _pid, uint256[] calldata _amounts) public {
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 shares;
        uint256 want;
        // Strategy part
        for (uint256 i = 0; i < underlyings.length; i++) {
            if (_amounts[i] != 0) {
                ERC20Mock(underlyings[i]).transferFrom(msg.sender, address(1), _amounts[i]);
                want += _amounts[i];
            }

            if (totalSupplyShares == 0) {
                shares += _amounts[i];
            } else {
                shares += (_amounts[i] * totalSupplyShares) / wantTotal;
            }
        }
        totalSupplyShares += shares;
        wantTotal += want;

        // Staking part
        user.shares += shares;
        uint256 wantAmt = (user.shares * wantTotal) / totalSupplyShares;
        user.depositInWant = wantAmt;

        emit Deposit(msg.sender, _pid, wantAmt);
    }

    function withdrawInOneUnderlying(
        uint256 _pid,
        uint256 _wantAmt,
        address _underlying
    ) public {
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.shares > 0 && user.depositInWant >= _wantAmt, "withdraw: wrong amount");
        // Staking part
        uint256 userTotalAmount = (user.shares * wantTotal) / totalSupplyShares;
        uint256 withdrawTotalAmount = (_wantAmt * userTotalAmount) / user.depositInWant;
        // Strategy part
        uint256 sharesAmount = (withdrawTotalAmount * totalSupplyShares) / wantTotal;
        // Staking part
        user.shares -= sharesAmount;
        if (totalSupplyShares == 0) user.depositInWant -= _wantAmt;
        else user.depositInWant = (user.shares * wantTotal) / totalSupplyShares;

        ERC20Mock(_underlying).mint(msg.sender, withdrawTotalAmount);
    }

    // Mock function for yield generation
    function earn(uint256 _amount) public {
        wantTotal += _amount * 1 ether;
    }

    // View interface
    function userPoolAmount(uint256 _pid, address _user) public view returns (uint256) {
        UserInfo memory user = userInfo[_pid][_user];
        return user.depositInWant;
    }

    function yieldBalance(uint256 _pid, address _user) external view virtual returns (uint256) {
        if (totalSupplyShares == 0) {
            return 0;
        }
        UserInfo memory user = userInfo[_pid][_user];
        return ((user.shares * wantTotal) / totalSupplyShares) - user.depositInWant;
    }
}
