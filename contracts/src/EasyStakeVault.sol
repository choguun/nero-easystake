// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title IWNERO
 * @dev Interface for the Wrapped NERO (WNERO) contract.
 * Includes deposit (wrap), withdraw (unwrap), and standard ERC20 functions.
 */
interface IWNERO is IERC20 {
    /**
     * @notice Wraps NERO into WNERO.
     * @dev Must be called with msg.value corresponding to the NERO being wrapped.
     * Mints WNERO tokens to the caller (msg.sender).
     */
    function deposit() external payable;

    /**
     * @notice Unwraps WNERO back into NERO.
     * @param wad The amount of WNERO to unwrap (in wei).
     * @dev Burns the specified amount of WNERO from the caller and sends
     * the corresponding NERO amount back to the caller.
     */
    function withdraw(uint256 wad) external;
}

/**
 * @title EasyStakeVault
 * @dev An ERC4626 vault that uses WNERO as the underlying asset, but provides
 * helper functions for users to deposit/withdraw native NERO directly.
 * @notice Deposit native NERO via `depositEth` to receive vault shares.
 * Withdraw native NERO via `redeemEth` by burning shares.
 * Standard ERC4626 functions operate directly with WNERO.
 * The vault shares represent a claim on the WNERO held within it.
 */
contract EasyStakeVault is ERC4626, Ownable, ReentrancyGuard {
    using SafeERC20 for IWNERO; // Use SafeERC20 for WNERO interactions

    // --- State Variables ---

    // WNERO contract address. This is the 'asset' for ERC4626.
    IWNERO public immutable WNERO_TOKEN;

    // --- Events ---

    /**
     * @notice Emitted when a user deposits native NERO and receives vault shares.
     * @param user The address of the user who deposited NERO.
     * @param ethAmount The amount of NERO deposited.
     * @param WNEROAmount The amount of WNERO wrapped and deposited into the vault.
     * @param sharesMinted The amount of vault shares minted to the user.
     */
    event EthDeposited(
        address indexed user,
        uint256 ethAmount,
        uint256 WNEROAmount,
        uint256 sharesMinted
    );

    /**
     * @notice Emitted when a user redeems shares and receives native NERO.
     * @param user The address initiating the redemption (owner of shares).
     * @param receiver The address receiving the native NERO.
     * @param sharesBurned The amount of vault shares burned.
     * @param WNEROAmount The amount of WNERO withdrawn from the vault and unwrapped.
     * @param ethAmount The amount of native NERO sent to the receiver.
     */
    event EthRedeemed(
        address indexed user,
        address indexed receiver,
        uint256 sharesBurned,
        uint256 WNEROAmount,
        uint256 ethAmount
    );

    /**
     * @notice Emitted if NERO is sent directly to the contract via receive().
     * @param sender The address that sent the NERO.
     * @param amount The amount of NERO received.
     */
    event EthReceived(address indexed sender, uint256 amount);


    // --- Errors ---
    error ZeroDeposit();
    error ZeroShares();
    error UnwrapFailed();
    error InvalidReceiver(address receiver); // Define custom error


    // --- Constructor ---

    /**
     * @dev Sets up the vault.
     * @param _WNEROAddress The address of the WNERO contract (e.g., WNERO9).
     * @param _vaultTokenName The name for this vault's share token (e.g., "Vaulted Wrapped NERO").
     * @param _vaultTokenSymbol The symbol for this vault's share token (e.g., "vWNERO").
     * @param _initialOwner The initial owner of the vault contract.
     */
    constructor(
        address _WNEROAddress,
        string memory _vaultTokenName,
        string memory _vaultTokenSymbol,
        address _initialOwner
    )
        ERC20(_vaultTokenName, _vaultTokenSymbol) // Initialize the vault share token (ERC20)
        ERC4626(IWNERO(_WNEROAddress)) // Initialize ERC4626 with WNERO as the asset
        Ownable(_initialOwner) // Initialize Ownable
    {
        require(_WNEROAddress != address(0), "Vault: Invalid WNERO address");
        require(_initialOwner != address(0), "Vault: Invalid initial owner");

        WNERO_TOKEN = IWNERO(_WNEROAddress);
    }

    // --- Custom NERO Deposit/Withdraw Functions ---

    /**
     * @notice Accepts native NERO, wraps it into WNERO, and deposits the WNERO
     * into the vault to mint shares for the depositor.
     * @dev This is the primary way for users to deposit using native NERO.
     */
    function depositEth() external payable {
        uint256 ethAmount = msg.value;
        address depositor = msg.sender;

        if (ethAmount == 0) {
            revert ZeroDeposit();
        }

        // 1. Wrap NERO into WNERO (WNERO is minted to this contract)
        WNERO_TOKEN.deposit{value: ethAmount}();

        // Check WNERO balance received (should match ethAmount)
        uint256 WNEROReceived = WNERO_TOKEN.balanceOf(address(this));
        // Note: If the vault already held WNERO, this check needs adjustment.
        // A safer way is to check balance before/after, but deposit() mints
        // WNERO directly, so ethAmount is the expected WNERO amount here.
        require(WNEROReceived >= ethAmount, "Vault: WNERO wrapping failed"); // Basic check

        // 2. Deposit the received WNERO into the ERC4626 vault mechanism
        // We don't need approve, as we will use internal functions.
        // WNERO_TOKEN.approve(address(this), ethAmount); // No longer needed

        // Calculate shares to mint based on the WNERO received
        uint256 sharesToMint = _convertToShares(ethAmount, Math.Rounding.Floor);
        if (sharesToMint == 0) {
            revert ZeroShares(); // Handle case where deposit results in zero shares
        }

        // Mint shares directly to the depositor
        _mint(depositor, sharesToMint);

        // Call the public deposit function to handle share minting <-- REMOVED
        // uint256 sharesMinted = deposit(ethAmount, depositor); // Incorrect: Tries to pull WNERO from depositor

        emit EthDeposited(depositor, ethAmount, ethAmount, sharesToMint);
    }

    /**
     * @notice Redeems vault shares from the caller, unwraps the corresponding WNERO
     * amount, and sends native NERO to the specified receiver.
     * @param shares The amount of vault shares to redeem.
     * @param receiver The address to receive the native NERO.
     */
    function redeemEth(uint256 shares, address receiver) external {
        address owner = msg.sender; // The user burning their shares

        if (shares == 0) {
            revert ZeroShares();
        }
        if (receiver == address(0)) {
            revert InvalidReceiver(address(0)); // Use custom error
        }

        // 1. Calculate corresponding WNERO amount for the shares
        uint256 WNEROAmount = previewRedeem(shares);
        if (WNEROAmount == 0) {
            revert ZeroDeposit(); // Revert if shares correspond to zero assets
        }

        // 2. Withdraw WNERO to this contract by burning owner's shares
        // Use super.withdraw to trigger the ERC4626 logic correctly.
        // The withdrawn WNERO (assets) will be sent to address(this).
        // The shares will be burned from 'owner'.
        super.withdraw(WNEROAmount, address(this), owner);

        // 3. Unwrap the WNERO received by this contract
        WNERO_TOKEN.withdraw(WNEROAmount);

        // 4. Send the unwrapped native NERO to the receiver
        (bool success, ) = receiver.call{value: WNEROAmount}("");
        if (!success) {
            // If NERO transfer fails, re-wrap NERO to WNERO and deposit back to owner?
            // Or just revert? Reverting is simpler and safer.
            // Consider the case where unwrap succeeded but send failed.
            // WNERO is gone, NERO is stuck here. rescueEth can recover.
            revert UnwrapFailed(); // Revert if NERO transfer fails
        }

        emit EthRedeemed(owner, receiver, shares, WNEROAmount, WNEROAmount);
    }


    // --- ERC4626 Standard Functions (Operating on WNERO) ---
    // Add nonReentrant guards to standard functions for consistency

    /**
     * @notice Allows depositing WNERO directly (standard ERC4626 function).
     * @dev Requires caller to have approved the vault to spend their WNERO.
     */
    function deposit(uint256 assets, address receiver)
        public
        override
        nonReentrant
        returns (uint256 shares)
    {
        // Calls the internal _deposit logic from the parent ERC4626 contract
        return super.deposit(assets, receiver); // assets here are WNERO
    }

     /**
     * @notice Allows minting shares by providing WNERO directly (standard ERC4626 function).
     * @dev Requires caller to have approved the vault to spend their WNERO.
     */
    function mint(uint256 shares, address receiver)
        public
        override
        nonReentrant
        returns (uint256 assets)
    {
        // Calls the internal _mint logic from the parent ERC4626 contract
        return super.mint(shares, receiver); // assets returned are WNERO
    }

    /**
     * @notice Allows withdrawing WNERO by burning shares (standard ERC4626 function).
     */
    function withdraw(uint256 assets, address receiver, address owner)
        public
        override
        nonReentrant
        returns (uint256 shares)
    {
         // Calls the internal _withdraw logic from the parent ERC4626 contract
        return super.withdraw(assets, receiver, owner); // assets here are WNERO
    }

    /**
     * @notice Allows redeeming shares for WNERO (standard ERC4626 function).
     */
    function redeem(uint256 shares, address receiver, address owner)
        public
        override
        nonReentrant
        returns (uint256 assets)
    {
        // Calls the internal _redeem logic from the parent ERC4626 contract
        return super.redeem(shares, receiver, owner); // assets returned are WNERO
    }


    // --- Fallback ---

    /**
     * @notice Fallback function to accept plain NERO transfers.
     * @dev Emits an event but does not automatically wrap or mint shares.
     * Users MUST explicitly call depositEth().
     */
    receive() external payable {
        emit EthReceived(msg.sender, msg.value);
        // IMPORTANT: Does NOT automatically wrap/deposit.
        // Consider reverting: revert("Vault: Direct NERO transfers not allowed; use depositEth()");
    }

    // --- ERC20 Decimals ---

    /**
     * @dev Returns the number of decimals used by the vault's share token.
     * @notice Defaults to the decimals of the underlying asset (WNERO), which is 18.
     * @return The number of decimals (18).
     */
    function decimals() public view virtual override returns (uint8) {
        // WNERO always has 18 decimals. We can return it directly.
        // Alternatively, could call WNERO_TOKEN.decimals() but it's constant.
        return 18;
    }

     // --- Utility Functions (Owner Controlled) ---

    /**
     * @notice Allows the owner to withdraw any accidentally sent ERC20 tokens
     * (excluding the underlying WNERO asset) from this contract.
     * @param tokenAddress The address of the ERC20 token to withdraw.
     * @param recipient The address to send the tokens to.
     * @param amount The amount of tokens to withdraw.
     */
    function rescueErc20(address tokenAddress, address recipient, uint256 amount) external onlyOwner {
        require(tokenAddress != address(WNERO_TOKEN), "Vault: Cannot rescue underlying asset");
        require(recipient != address(0), "Vault: Invalid recipient");
        SafeERC20.safeTransfer(IERC20(tokenAddress), recipient, amount); // Correct: Use SafeERC20 library
    }

     /**
     * @notice Allows the owner to withdraw any native NERO accidentally sent
     * or held by this contract (e.g., via receive() fallback).
     * @param recipient The address to send the NERO to.
     * @param amount The amount of NERO to withdraw.
     */
    function rescueEth(address payable recipient, uint256 amount) external onlyOwner {
         require(recipient != address(0), "Vault: Invalid recipient");
         require(address(this).balance >= amount, "Vault: Insufficient NERO balance");
         (bool success, ) = recipient.call{value: amount}("");
         require(success, "Vault: NERO rescue failed");
    }

    // --- Internal Helper Overrides (If needed for advanced logic) ---

    /**
     * @dev Override _convertToShares to establish a 1:1 ratio on the first deposit,
     * assuming asset and shares have the same decimals.
     */
    function _convertToShares(uint256 assets, Math.Rounding /*round*/) internal view override returns (uint256 shares) {
        // Enforce 1:1 share ratio as asset and shares have same decimals (18)
        return assets;
        /* // Old logic using super call for subsequent deposits
        uint256 supply = totalSupply();
        if (supply == 0) {
            // Initial deposit: shares = assets (assuming 18 decimals for both)
            // Adjust if vault share decimals differ from asset decimals.
            return assets;
        } else {
            // Use the standard OZ calculation for subsequent deposits
            return super._convertToShares(assets, round);
        }
        */
    }

    // function _convertToAssets(uint256 shares) internal view override returns (uint256 assets) { ... }
    // function totalAssets() public view override returns (uint256) { ... } // Already correctly returns WNERO balance via super.totalAssets()

}

// Interface needed for ERC4626 constructor type casting (already included via IWNERO)
// interface IERC20Metadata is IERC20 {
//     function name() external view returns (string memory);
//     function symbol() external view returns (string memory);
//     function decimals() external view returns (uint8);
// }
