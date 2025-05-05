// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {EasyStakeVault} from "../src/EasyStakeVault.sol";
import {MockWNERO} from "./mocks/MockWNERO.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EasyStakeVaultTest is Test {
    EasyStakeVault public vault;
    MockWNERO public wnero;

    address public constant DEPLOYER = address(0x1);
    address public constant ALICE = address(0xA11cE);
    address public constant BOB = address(0xB0B);

    uint256 public constant ONE_NERO = 1 ether;

    // Declare events mirroring the ones in EasyStakeVault
    event EthDeposited(
        address indexed user,
        uint256 ethAmount,
        uint256 WNEROAmount,
        uint256 sharesMinted
    );
    event EthRedeemed(
        address indexed user,
        address indexed receiver,
        uint256 sharesBurned,
        uint256 WNEROAmount,
        uint256 ethAmount
    );

    function setUp() public {
        vm.label(DEPLOYER, "Deployer");
        vm.label(ALICE, "Alice");
        vm.label(BOB, "Bob");

        // Deal initial NERO balance to users
        vm.deal(ALICE, 100 * ONE_NERO);
        vm.deal(BOB, 100 * ONE_NERO);

        // Deploy Mock WNERO
        vm.startPrank(DEPLOYER);
        wnero = new MockWNERO();

        // Deploy EasyStakeVault
        vault = new EasyStakeVault(
            address(wnero),
            "Vaulted Wrapped NERO",
            "vWNERO",
            DEPLOYER
        );
        vm.stopPrank();
    }

    // --- Test depositEth --- //

    function test_depositEth_basic() public {
        uint256 depositAmount = 5 * ONE_NERO;

        // Alice deposits NERO
        vm.startPrank(ALICE);
        // Calculate expected shares before deposit
        uint256 expectedShares = vault.previewDeposit(depositAmount);
        vm.expectEmit(false, false, false, true, address(vault)); // Check only data
        // emit EthDeposited(ALICE, depositAmount, depositAmount, depositAmount); // Old: Assumed 1:1
        emit EthDeposited(ALICE, depositAmount, depositAmount, expectedShares); // Use previewed shares
        vault.depositEth{value: depositAmount}();

        // Check balances
        // assertEq(vault.balanceOf(ALICE), depositAmount, "Alice share balance incorrect");
        assertEq(vault.balanceOf(ALICE), expectedShares, "Alice share balance incorrect");
        assertEq(wnero.balanceOf(address(vault)), depositAmount, "Vault WNERO balance incorrect");
        assertEq(vault.totalAssets(), depositAmount, "Vault total assets incorrect");
        // assertEq(vault.totalSupply(), depositAmount, "Vault total supply incorrect");
        assertEq(vault.totalSupply(), expectedShares, "Vault total supply incorrect");
        assertEq(ALICE.balance, 100 * ONE_NERO - depositAmount, "Alice NERO balance incorrect");
        vm.stopPrank();
    }

    function test_depositEth_multipleDeposits() public {
        uint256 aliceDeposit = 3 * ONE_NERO;
        uint256 bobDeposit = 7 * ONE_NERO;
        uint256 totalDeposit = aliceDeposit + bobDeposit;

        // Alice deposits
        vm.startPrank(ALICE);
        vault.depositEth{value: aliceDeposit}();
        vm.stopPrank();

        // Bob deposits
        vm.startPrank(BOB);
        vault.depositEth{value: bobDeposit}();
        vm.stopPrank();

        // Check balances
        assertEq(vault.balanceOf(ALICE), aliceDeposit, "Alice share balance incorrect");
        assertEq(vault.balanceOf(BOB), bobDeposit, "Bob share balance incorrect");
        assertEq(wnero.balanceOf(address(vault)), totalDeposit, "Vault WNERO balance incorrect");
        assertEq(vault.totalAssets(), totalDeposit, "Vault total assets incorrect");
        assertEq(vault.totalSupply(), totalDeposit, "Vault total supply incorrect");
    }

    function test_depositEth_zeroDeposit() public {
        vm.startPrank(ALICE);
        vm.expectRevert(EasyStakeVault.ZeroDeposit.selector);
        vault.depositEth{value: 0}();
        vm.stopPrank();
    }

    // --- Test redeemEth --- //

    function test_redeemEth_basic() public {
        uint256 depositAmount = 10 * ONE_NERO;
        uint256 redeemShares = 4 * ONE_NERO;

        // Alice deposits
        vm.startPrank(ALICE);
        vault.depositEth{value: depositAmount}();

        uint256 initialAliceNero = ALICE.balance;
        uint256 initialVaultWnero = wnero.balanceOf(address(vault));

        // Alice redeems some shares for NERO
        vm.expectEmit(false, false, false, true, address(vault));
        emit EthRedeemed(ALICE, ALICE, redeemShares, redeemShares, redeemShares);
        vault.redeemEth(redeemShares, ALICE);
        vm.stopPrank();

        // Check balances
        assertEq(vault.balanceOf(ALICE), depositAmount - redeemShares, "Alice share balance incorrect");
        assertEq(wnero.balanceOf(address(vault)), initialVaultWnero - redeemShares, "Vault WNERO balance incorrect");
        assertEq(ALICE.balance, initialAliceNero + redeemShares, "Alice NERO balance incorrect");
        assertEq(vault.totalAssets(), depositAmount - redeemShares, "Vault total assets incorrect");
        assertEq(vault.totalSupply(), depositAmount - redeemShares, "Vault total supply incorrect");
    }

    function test_redeemEth_redeemAll() public {
        uint256 depositAmount = 10 * ONE_NERO;

        // Alice deposits
        vm.startPrank(ALICE);
        vault.depositEth{value: depositAmount}();

        uint256 initialAliceNero = ALICE.balance;

        // Alice redeems all shares for NERO to Bob's address
        vm.expectEmit(false, false, false, true, address(vault));
        emit EthRedeemed(ALICE, BOB, depositAmount, depositAmount, depositAmount);
        vault.redeemEth(depositAmount, BOB);
        vm.stopPrank();

        // Check balances
        assertEq(vault.balanceOf(ALICE), 0, "Alice share balance non-zero");
        assertEq(wnero.balanceOf(address(vault)), 0, "Vault WNERO balance non-zero");
        assertEq(BOB.balance, 100 * ONE_NERO + depositAmount, "Bob NERO balance incorrect");
        assertEq(ALICE.balance, initialAliceNero, "Alice NERO balance changed");
        assertEq(vault.totalAssets(), 0, "Vault total assets non-zero");
        assertEq(vault.totalSupply(), 0, "Vault total supply non-zero");
    }

    function test_redeemEth_zeroShares() public {
        vm.startPrank(ALICE);
        vm.expectRevert(EasyStakeVault.ZeroShares.selector);
        vault.redeemEth(0, ALICE);
        vm.stopPrank();
    }

    function test_redeemEth_invalidReceiver() public {
        uint256 depositAmount = 1 * ONE_NERO;
        vm.startPrank(ALICE);
        vault.depositEth{value: depositAmount}();
        vm.expectRevert(abi.encodeWithSelector(EasyStakeVault.InvalidReceiver.selector, address(0)));
        vault.redeemEth(depositAmount, address(0));
        vm.stopPrank();
    }

    function test_redeemEth_insufficientShares() public {
        uint256 depositAmount = 1 * ONE_NERO;
        vm.startPrank(ALICE);
        vault.depositEth{value: depositAmount}();
        // ERC4626 internal checks handle insufficient shares
        // Expect ERC4626ExceededMaxWithdraw because the check happens in withdraw()
        uint256 sharesToRedeem = depositAmount + 1;
        uint256 assetsToWithdraw = vault.previewRedeem(sharesToRedeem); // Calculate assets needed for the shares
        uint256 maxWithdraw = vault.maxWithdraw(ALICE); // Max assets Alice can withdraw

        // Expect revert with the error signature string
        bytes memory expectedError = abi.encodeWithSignature(
            "ERC4626ExceededMaxWithdraw(address,uint256,uint256)",
            ALICE,           // owner
            assetsToWithdraw,// assets requested
            maxWithdraw      // max assets available
        );
        vm.expectRevert(expectedError);

        vault.redeemEth(sharesToRedeem, ALICE);
        vm.stopPrank();
    }

    // --- TODO: Add tests for standard ERC4626 functions (deposit, mint, withdraw, redeem) ---
    // --- TODO: Add tests for edge cases (direct receive, rescue functions) ---

} 