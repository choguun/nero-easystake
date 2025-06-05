// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EasyStakeToken is ERC20, Ownable {
    // Assuming 18 decimals for EST, which is the default for ERC20 constructor used.
    uint256 public constant INITIAL_TOTAL_SUPPLY = 1_000_000 * (10**18);

    constructor(address initialOwner)
        ERC20("EasyStakeToken", "EST") // This sets decimals to 18 by default
        Ownable(initialOwner) // Sets the deployer as the initial owner of the token contract
    {
        require(initialOwner != address(0), "EST: Initial owner cannot be zero address");
        _mint(initialOwner, INITIAL_TOTAL_SUPPLY); // Mint 100% to the initial owner
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}