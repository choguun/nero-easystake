// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../interfaces/IERC20.sol";
import "../libraries/SafeMath.sol";

contract MockERC20 is IERC20 {
    using SafeMath for uint256;

    // State variables for metadata, to be set in constructor
    string internal _name;
    string internal _symbol;
    uint8 internal _decimals;

    // Public state variables from IERC20
    uint256 public override totalSupply;
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    constructor(string memory name_, string memory symbol_, uint8 decimals_, uint256 initialSupply) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        
        uint256 scaledInitialSupply = initialSupply * (10**uint256(decimals_));
        totalSupply = scaledInitialSupply;
        balanceOf[msg.sender] = scaledInitialSupply;
        emit Transfer(address(0), msg.sender, scaledInitialSupply);
    }

    function name() external view override returns (string memory) {
        return _name;
    }

    function symbol() external view override returns (string memory) {
        return _symbol;
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address recipient, uint256 amount) external override returns (bool) {
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(amount);
        balanceOf[recipient] = balanceOf[recipient].add(amount);
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        balanceOf[sender] = balanceOf[sender].sub(amount);
        balanceOf[recipient] = balanceOf[recipient].add(amount);
        allowance[sender][msg.sender] = allowance[sender][msg.sender].sub(amount);
        emit Transfer(sender, recipient, amount);
        return true;
    }

    // Additional mint function for testing, if needed
    function mint(address account, uint256 amount) external {
        uint256 scaledAmount = amount * (10**uint256(_decimals));
        balanceOf[account] = balanceOf[account].add(scaledAmount);
        totalSupply = totalSupply.add(scaledAmount);
        emit Transfer(address(0), account, scaledAmount);
    }
} 