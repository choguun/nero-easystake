// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.20;

import "forge-std/Script.sol";
import "../src/EasyStakeVault.sol"; // Assuming EasyStakeVault.sol is in src/

contract DepositEthToVault is Script {
    // --- CONFIGURATION: REPLACE WITH YOUR ACTUAL DEPLOYED EasyStakeVault ADDRESS ---
    address constant VAULT_ADDRESS = 0x163EBB40a546Fd33d18dCeC56c0650fF7fECA1c7; // Replace with your deployed EasyStakeVault address
    // --- END CONFIGURATION ---

    // --- DEPOSIT AMOUNT: Adjust as needed ---
    // This is the amount of native NERO you want to deposit.
    uint256 constant NERO_DEPOSIT_AMOUNT = 0.2 ether;
    // --- END DEPOSIT AMOUNT ---

    uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY"); // Or use vm.envString for raw private key

    function run() external {
        vm.startBroadcast(deployerPrivateKey);

        EasyStakeVault vault = EasyStakeVault(payable(VAULT_ADDRESS)); // Cast to payable address first

        console.log("Attempting to deposit %s NERO to EasyStakeVault at %s...", NERO_DEPOSIT_AMOUNT / 1 ether, VAULT_ADDRESS);
        
        // Call depositEth function, sending native NERO with the call
        vault.depositEth{value: NERO_DEPOSIT_AMOUNT}();

        console.log("Successfully called depositEth().");
        // You can add checks here to verify shares minted if desired, e.g., by checking balance of shares for msg.sender
        // uint256 sharesBalance = vault.balanceOf(msg.sender);
        // console.log("Shares balance for sender after deposit: %s", sharesBalance);

        vm.stopBroadcast();
    }
}
