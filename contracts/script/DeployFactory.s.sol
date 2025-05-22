// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "forge-std/Script.sol";
import "../src/UniswapV2Factory.sol";

contract DeployFactory is Script {
  
    function run() external returns (address deployedFactoryAddress) {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey); // Get deployer address for logging
        vm.startBroadcast(deployerPrivateKey);

        UniswapV2Factory factory;
        console.log("Deploying new UniswapV2Factory (feeToSetter will be %s)...", deployerAddress);
        factory = new UniswapV2Factory();
        deployedFactoryAddress = address(factory);
        console.log("New UniswapV2Factory deployed to:", deployedFactoryAddress);

        vm.stopBroadcast();

        console.log("Using/Deployed UniswapV2Factory: %s", deployedFactoryAddress);
    }
}
