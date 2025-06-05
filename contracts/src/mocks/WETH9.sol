// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Standard WETH9 contract
// From https://github.com/Uniswap/v2-periphery/blob/master/contracts/test/WETH9.sol
// (Adjusted for latest Solidity and to be self-contained for this script)

interface IWETH9 {
    function deposit() external payable;
    function withdraw(uint wad) external;
    function totalSupply() external view returns (uint);
    function approve(address guy, uint wad) external returns (bool);
    function transfer(address dst, uint wad) external returns (bool);
    function transferFrom(address src, address dst, uint wad) external returns (bool);
    function balanceOf(address guy) external view returns (uint);
    event Approval(address indexed src, address indexed guy, uint wad);
    event Transfer(address indexed src, address indexed dst, uint wad);
    event Deposit(address indexed dst, uint wad);
    event Withdrawal(address indexed src, uint wad);
}

contract WETH9 is IWETH9 {
    string public name     = "Wrapped NERO"; // Customizable name
    string public symbol   = "WNERO";      // Customizable symbol
    uint8  public decimals = 18;

    mapping (address => uint)                       public override balanceOf;
    mapping (address => mapping (address => uint))  public allowance;
    uint256                                         private _totalSupply;

    function totalSupply() public view override returns (uint) {
        return _totalSupply;
    }

    function approve(address guy, uint wad) public override returns (bool) {
        allowance[msg.sender][guy] = wad;
        emit Approval(msg.sender, guy, wad);
        return true;
    }

    function transfer(address dst, uint wad) public override returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    function transferFrom(address src, address dst, uint wad) public override returns (bool) {
        require(balanceOf[src] >= wad, "WETH9: insufficient balance");
        if (src != msg.sender && allowance[src][msg.sender] != type(uint256).max) {
            require(allowance[src][msg.sender] >= wad, "WETH9: insufficient allowance");
            allowance[src][msg.sender] -= wad;
        }
        balanceOf[src] -= wad;
        balanceOf[dst] += wad;
        emit Transfer(src, dst, wad);
        return true;
    }

    function deposit() public payable override {
        balanceOf[msg.sender] += msg.value;
        _totalSupply += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint wad) public override {
        require(balanceOf[msg.sender] >= wad, "WETH9: insufficient balance for withdrawal");
        balanceOf[msg.sender] -= wad;
        _totalSupply -= wad;
        payable(msg.sender).transfer(wad);
        emit Withdrawal(msg.sender, wad);
    }

    receive() external payable {
        deposit();
    }
} 