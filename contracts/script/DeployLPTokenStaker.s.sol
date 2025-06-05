// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {LPTokenStaker} from "../src/LPTokenStaker.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// It's good practice to also import the specific token contracts if you might deploy them here
// or need their specific types, e.g.:
// import {YourLPTokenContractName} from "../src/YourLPTokenContractName.sol";
// import {EasyStakeToken} from "../src/EasyStakeToken.sol";

contract DeployLPTokenStaker is Script {
    // --- Customizable Configuration ---

    // Default placeholder addresses - REPLACE THESE or set via environment variables
    // Example: For a local Anvil node where you've deployed these tokens.
    address constant DEFAULT_LP_TOKEN_ADDRESS = 0x0000000000000000000000000000000000000001; // Placeholder - e.g., NERO-stNERO LP Token
    address constant DEFAULT_REWARD_TOKEN_ADDRESS = 0x0000000000000000000000000000000000000002; // Placeholder - e.g., EasyStakeToken (EST)
    // The deployer of this script will be the initial owner by default.

    // --- Script Execution ---
    function run() external returns (LPTokenStaker deployedStaker, address lpTokenAddr, address rewardTokenAddr, address ownerAddr) {
        // 1. Get LP Token Address
        lpTokenAddr = vm.envAddress("LP_TOKEN_ADDRESS");
        if (lpTokenAddr == address(0)) {
            console.log(
                "LP_TOKEN_ADDRESS not found in env. Using default: %s",
                DEFAULT_LP_TOKEN_ADDRESS
            );
            lpTokenAddr = DEFAULT_LP_TOKEN_ADDRESS;
        }
        require(lpTokenAddr != address(0), "DeployLPTokenStaker: Invalid LP Token address");
        console.log("Using LP Token (to be staked) at:", lpTokenAddr);

        // 2. Get Reward Token Address (EasyStakeToken)
        rewardTokenAddr = vm.envAddress("REWARD_TOKEN_ADDRESS");
        if (rewardTokenAddr == address(0)) {
            console.log(
                "REWARD_TOKEN_ADDRESS not found in env. Using default: %s",
                DEFAULT_REWARD_TOKEN_ADDRESS
            );
            rewardTokenAddr = DEFAULT_REWARD_TOKEN_ADDRESS;
        }
        require(rewardTokenAddr != address(0), "DeployLPTokenStaker: Invalid Reward Token address");
        console.log("Using Reward Token (e.g., EasyStakeToken) at:", rewardTokenAddr);

        // 3. Get Initial Owner Address
        ownerAddr = vm.envAddress("INITIAL_OWNER_ADDRESS");
        if (ownerAddr == address(0)) {
            ownerAddr = msg.sender; // Default to the deployer of this script
            console.log(
                "INITIAL_OWNER_ADDRESS not found in env. Defaulting to deployer: %s",
                ownerAddr
            );
        } else {
            console.log("Using Initial Owner address from env:", ownerAddr);
        }
        require(ownerAddr != address(0), "DeployLPTokenStaker: Invalid Initial Owner address");

        // 4. Start broadcast for deployment
        vm.startBroadcast(msg.sender); // Deployment is done by the script runner's account

        // 5. Deploy the LPTokenStaker contract
        deployedStaker = new LPTokenStaker(
            lpTokenAddr,       // Address of the LP token to be staked
            rewardTokenAddr,   // Address of the EasyStakeToken (reward token)
            ownerAddr          // Initial owner of the LPTokenStaker contract
        );

        // 6. Stop broadcast
        vm.stopBroadcast();

        console.log(
            "LPTokenStaker deployed successfully to address: %s",
            address(deployedStaker)
        );
        console.log("  LP Token used for staking:", address(deployedStaker.lpToken()));
        console.log("  Reward Token (EasyStakeToken):", address(deployedStaker.rewardToken()));
        console.log("  Initial Owner:", deployedStaker.owner());

        return (deployedStaker, lpTokenAddr, rewardTokenAddr, ownerAddr);
    }
} 