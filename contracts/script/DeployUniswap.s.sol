// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";
import "../src/mocks/MockERC20.sol";
import "../src/UniswapV2Factory.sol";
import "../src/UniswapV2Router02.sol";

contract DeployUniswap is Script {
    // --- WNERO Address (Mainnet or Testnet) ---
    // User provided: 0x82D1C63b242434386C21bC2649B132CDd4dD3260
    address constant WNERO_ADDRESS = 0x82D1C63b242434386C21bC2649B132CDd4dD3260;
    address constant STNERO_ADDRESS = 0xBe4fEB63f6Cf58EcdcB45918f77feD98304Dd3fE;

    function run() external returns (UniswapV2Factory factory, UniswapV2Router02 router, address pairAddress) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 2. Deploy UniswapV2Factory
        // The factory constructor automatically sets feeToSetter to msg.sender.
        console.log("Deploying UniswapV2Factory (feeToSetter will be %s)...", msg.sender);
        factory = new UniswapV2Factory();
        console.log("UniswapV2Factory deployed to:", address(factory));

        // 3. Deploy UniswapV2Router02
        // The router constructor takes the factory address and WETH (WNERO) address.
        console.log("Deploying UniswapV2Router02 linked to Factory: %s and WNERO: %s", address(factory), WNERO_ADDRESS);
        router = new UniswapV2Router02(address(factory), WNERO_ADDRESS);
        console.log("UniswapV2Router02 deployed to:", address(router));

        // 4. Create WNERO/stNero Pair
        console.log("Creating Uniswap V2 Pair for WNERO (%s) and stNero (%s)...", WNERO_ADDRESS, STNERO_ADDRESS);
        pairAddress = factory.createPair(WNERO_ADDRESS, STNERO_ADDRESS);
        console.log("WNERO/stNero Pair created at address:", pairAddress);
        require(pairAddress != address(0), "Pair creation failed");

        vm.stopBroadcast();

        console.log("\n--- Deployment Summary ---");
        console.log("UniswapV2Factory: %s", address(factory));
        console.log("UniswapV2Router02: %s", address(router));
        console.log("   (Router linked to Factory: %s, WNERO: %s)", address(factory), WNERO_ADDRESS);
        console.log("WNERO/stNero Pair: %s", pairAddress);
    }
}
