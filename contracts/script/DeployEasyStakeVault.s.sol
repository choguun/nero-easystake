// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {EasyStakeVault} from "../src/EasyStakeVault.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // For WNERO type

contract DeployEasyStakeVault is Script {
    string public constant VAULT_NAME = "Vaulted Wrapped NERO";
    string public constant VAULT_SYMBOL = "vWNERO";

    function run() external returns (EasyStakeVault) {
        // Load environment variables
        address wneroAddress = vm.envAddress("WNERO_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY"); // Or use vm.envString for raw private key

        // Validate WNERO_ADDRESS
        require(wneroAddress != address(0), "DeployEasyStakeVault: WNERO_ADDRESS env var not set or invalid.");

        // Start broadcasting transactions with the deployer's private key
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the EasyStakeVault
        EasyStakeVault vault = new EasyStakeVault(
            wneroAddress,
            VAULT_NAME,
            VAULT_SYMBOL,
            vm.addr(deployerPrivateKey) // Initial owner is the deployer
        );

        // Stop broadcasting
        vm.stopBroadcast();

        console.log("EasyStakeVault deployed to:", address(vault));
        console.log("Underlying WNERO asset:", address(vault.WNERO_TOKEN()));
        console.log("Vault owner:", vault.owner());

        return vault;
    }
} 