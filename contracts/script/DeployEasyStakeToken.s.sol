// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {EasyStakeToken} from "../src/EasyStakeToken.sol";

contract DeployEasyStakeToken is Script {
    // --- Customizable Configuration ---
    // The deployer of this script will be the initial owner of EasyStakeToken by default.

    // --- Script Execution ---
    function run() external returns (EasyStakeToken deployedToken, address initialOwnerAddr) {
        // 1. Get Initial Owner Address for EasyStakeToken (receives 100% and ownership)
        initialOwnerAddr = vm.envAddress("EST_INITIAL_OWNER_ADDRESS");
        if (initialOwnerAddr == address(0)) {
            initialOwnerAddr = msg.sender; // Default to the deployer of this script
            console.log(
                "EST_INITIAL_OWNER_ADDRESS not found in env. Defaulting to deployer: %s",
                initialOwnerAddr
            );
        } else {
            console.log("Using EST Initial Owner address from env:", initialOwnerAddr);
        }
        require(initialOwnerAddr != address(0), "DeployEasyStakeToken: Invalid EST Initial Owner address");

        // 2. Start broadcast for deployment
        vm.startBroadcast(msg.sender); // Deployment is done by the script runner's account

        // 3. Deploy the EasyStakeToken contract
        deployedToken = new EasyStakeToken(initialOwnerAddr);

        // 4. Stop broadcast
        vm.stopBroadcast();

        console.log(
            "EasyStakeToken deployed successfully to address: %s",
            address(deployedToken)
        );
        console.log("  Total Supply:", deployedToken.totalSupply());
        console.log("  Initial Owner (%s) balance:", initialOwnerAddr, deployedToken.balanceOf(initialOwnerAddr));
        console.log("  EasyStakeToken Owner:", deployedToken.owner());

        return (deployedToken, initialOwnerAddr);
    }
}