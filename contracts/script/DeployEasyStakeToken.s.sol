// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EasyStakeToken.sol";

contract DeployEasyStakeToken is Script {
    function run() external returns (EasyStakeToken) {
        vm.startBroadcast();
        // The initial owner will be the address executing this script
        EasyStakeToken easyStakeToken = new EasyStakeToken(msg.sender);
        vm.stopBroadcast();
        console.log("EasyStakeToken deployed at:", address(easyStakeToken));
        return easyStakeToken;
    }
}