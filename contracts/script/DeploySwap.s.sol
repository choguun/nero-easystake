// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";
import "../src/mocks/MockERC20.sol";
import "../src/UniswapV2Factory.sol";
import "../src/UniswapV2Router02.sol";
import "../src/UniswapV2Pair.sol";

contract DeploySwap is Script {
    // --- WNERO Address (Mainnet or Testnet) ---
    // User provided: 0x82D1C63b242434386C21bC2649B132CDd4dD3260
    address constant WNERO_ADDRESS = 0x82D1C63b242434386C21bC2649B132CDd4dD3260;
    address constant STNERO_ADDRESS = 0x163EBB40a546Fd33d18dCeC56c0650fF7fECA1c7;

    // Function to run the deployment script
    // It can optionally take an existing factory address.
    // If existingFactoryAddress is address(0), it deploys a new factory.
    // It always deploys a new router.
    function run(address existingFactoryAddress) external returns (address deployedFactoryAddress, address deployedRouterAddress) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey); // Get deployer address for logging
        vm.startBroadcast(deployerPrivateKey);

        UniswapV2Factory factory;
        if (existingFactoryAddress == address(0)) {
            console.log("Deploying new UniswapV2Factory (feeToSetter will be %s)...", deployerAddress);
        factory = new UniswapV2Factory();
            deployedFactoryAddress = address(factory);
            console.log("New UniswapV2Factory deployed to:", deployedFactoryAddress);
        } else {
            console.log("Using existing UniswapV2Factory at:", existingFactoryAddress);
            factory = UniswapV2Factory(existingFactoryAddress);
            deployedFactoryAddress = existingFactoryAddress;
        }

        // Log the INIT_CODE_PAIR_HASH for verification purposes
        // This uses the current compiled bytecode of UniswapV2Pair
        bytes memory creationCode = type(UniswapV2Pair).creationCode;
        bytes32 initCodePairHash = keccak256(creationCode);
        console.log("Current compiled INIT_CODE_PAIR_HASH (for UniswapV2Pair.sol):");
        console.logBytes32(initCodePairHash);
        // This should match the hash in UniswapV2Library.sol for the new router to work correctly.

        // Deploy a new UniswapV2Router02
        console.log("Deploying new UniswapV2Router02 with factory: %s and WNERO: %s...", deployedFactoryAddress, WNERO_ADDRESS);
        UniswapV2Router02 router = new UniswapV2Router02(deployedFactoryAddress, WNERO_ADDRESS);
        deployedRouterAddress = address(router);
        console.log("New UniswapV2Router02 deployed to:", deployedRouterAddress);

        // Check if the WNERO/stNero pair exists on the factory, create if not.
        // This step is mostly for completeness if using a new factory.
        // If using an existing factory where the pair already exists, this call won't create a new one.
        address pairAddress = factory.getPair(WNERO_ADDRESS, STNERO_ADDRESS);
        if (pairAddress == address(0)) {
            console.log("WNERO/stNero pair does not exist on factory. Creating...");
            pairAddress = factory.createPair(WNERO_ADDRESS, STNERO_ADDRESS);
        console.log("WNERO/stNero Pair created at address:", pairAddress);
        require(pairAddress != address(0), "Pair creation failed");
        } else {
            console.log("WNERO/stNero pair already exists at:", pairAddress);
        }

        vm.stopBroadcast();

        console.log("\n--- Deployment Summary ---");
        console.log("Using/Deployed UniswapV2Factory: %s", deployedFactoryAddress);
        console.log("Newly Deployed UniswapV2Router02: %s", deployedRouterAddress);
        console.log("   (New Router linked to Factory: %s, WNERO: %s)", deployedFactoryAddress, WNERO_ADDRESS);
        console.log("WNERO/stNero Pair (existing or created): %s", pairAddress);
        
        // Return values are implicitly handled by the function signature
    }
}
