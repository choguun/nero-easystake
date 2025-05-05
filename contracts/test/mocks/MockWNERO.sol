// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IWNERO
 * @dev Interface for the Wrapped NERO (WNERO) contract.
 */
interface IWNERO is IERC20 {
    function deposit() external payable;
    function withdraw(uint256 wad) external;
}

/**
 * @title MockWNERO
 * @dev A mock WNERO contract for testing purposes.
 * Simulates basic wrapping (deposit) and unwrapping (withdraw).
 */
contract MockWNERO is IWNERO, ERC20 {
    constructor()
        ERC20("Mock Wrapped NERO", "mWNERO")
    {}

    /**
     * @notice Mints WNERO equivalent to the sent NERO (msg.value).
     */
    function deposit() external payable override {
        _mint(msg.sender, msg.value);
    }

    /**
     * @notice Burns WNERO and sends back equivalent NERO.
     */
    function withdraw(uint256 wad) external override {
        require(balanceOf(msg.sender) >= wad, "MockWNERO: insufficient balance");
        _burn(msg.sender, wad);
        (bool success, ) = msg.sender.call{value: wad}("");
        require(success, "MockWNERO: NERO transfer failed");
    }

    // Helper function to mint tokens for testing setup
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    // Allow anyone to receive NERO
    receive() external payable {}
    fallback() external payable {}
} 