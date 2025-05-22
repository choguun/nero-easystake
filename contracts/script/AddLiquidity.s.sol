// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "forge-std/Script.sol";
import "../src/interfaces/IUniswapV2Router02.sol";
import "../src/interfaces/IUniswapV2Factory.sol";
import "../src/interfaces/IUniswapV2Pair.sol"; // Added for reading pair tokens
import "../src/interfaces/IERC20.sol";
import "../src/interfaces/IWETH.sol"; // Keep IWETH import for deposit
import "../src/libraries/UniswapV2Library.sol";
import "../src/UniswapV2Pair.sol"; // Added import for UniswapV2Pair
// import "../src/UniswapV2Pair.sol"; // << COMMENTED OUT

contract AddLiquidity is Script {
    // --- CONFIGURATION (from user's latest deployment logs) ---
    address constant ROUTER_ADDRESS = 0x6E74A5a4e4E44498cE1F845d812D5011075f602E;
    address constant WNERO_ADDRESS = 0x82D1C63b242434386C21bC2649B132CDd4dD3260;
    address constant STNERO_ADDRESS = 0x163EBB40a546Fd33d18dCeC56c0650fF7fECA1c7; // This is the EasyStakeVault address
    // --- END CONFIGURATION ---

    // --- LIQUIDITY AMOUNTS ---
    uint256 constant AMOUNT_WNERO_DESIRED = 0.1 ether; // 1 WNERO (assuming 18 decimals)
    uint256 constant AMOUNT_STNERO_DESIRED = 0.1 ether; // 1 stNERO/Vault (assuming 18 decimals)
    // --- END LIQUIDITY AMOUNTS ---

    // --- SLIPPAGE & DEADLINE ---
    uint256 constant MIN_LIQUIDITY_PERCENTAGE = 99; // Allow 1% slippage for amounts minted
    uint256 constant LIQUIDITY_DEADLINE_SECONDS = 60; // 1 minute
    // --- END SLIPPAGE & DEADLINE ---


    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        IUniswapV2Router02 router = IUniswapV2Router02(ROUTER_ADDRESS);
        IWETH wethInternal = IWETH(WNERO_ADDRESS);         // For IWETH-specific functions like deposit
        IERC20 wneroToken = IERC20(WNERO_ADDRESS);         // For ERC20 functions like approve, balanceOf, allowance
        IERC20 stNeroToken = IERC20(STNERO_ADDRESS);

        // --- Wrap NERO to WNERO ---
        console.log("Wrapping %s NERO to WNERO...", AMOUNT_WNERO_DESIRED);
        wethInternal.deposit{value: AMOUNT_WNERO_DESIRED}();
        console.log("NERO wrapped to WNERO successfully.");
        // --- End Wrap NERO to WNERO ---

        address factoryAddress = router.factory();
        console.log("Router is using Factory at address:", factoryAddress);

        console.log("TEST POINT A");

        // --- INIT_CODE_PAIR_HASH Diagnosis ---
        bytes32 factoryCalculatedInitCodeHash = keccak256(type(UniswapV2Pair).creationCode);
        console.log("Factory-calculated INIT_CODE_PAIR_HASH (bytes32):");
        console.logBytes32(factoryCalculatedInitCodeHash);

        // The following line is from the *standard* Uniswap V2 library, ensure your UniswapV2Library.sol matches the FACTORY above.
        // bytes32 libraryHardcodedInitCodeHash = hex"96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";
        // console.log("UniswapV2Library's current hardcoded INIT_CODE_PAIR_HASH (for comparison):"); // Add a log for the library's actual hash if you read it

        // require(factoryCalculatedInitCodeHash == libraryHardcodedInitCodeHash,
        //     "CRITICAL: Factory-calculated INIT_CODE_PAIR_HASH does NOT match UniswapV2Library's hardcoded hash!");
        // --- End INIT_CODE_PAIR_HASH Diagnosis ---

        console.log("TEST POINT B"); 

        address libraryCalculatedPairAddress = UniswapV2Library.pairFor(factoryAddress, WNERO_ADDRESS, STNERO_ADDRESS);
        console.log(string.concat("Library-calculated pair address: ", vm.toString(libraryCalculatedPairAddress)));

        IUniswapV2Factory factory = IUniswapV2Factory(factoryAddress);
        address actualPairAddress = factory.getPair(WNERO_ADDRESS, STNERO_ADDRESS);
        console.log(string.concat("Actual pair address from factory.getPair: ", vm.toString(actualPairAddress))); 
        
        require(actualPairAddress != address(0), "Pair does not exist, cannot add liquidity.");
        require(actualPairAddress == libraryCalculatedPairAddress, 
            "CRITICAL: Library calculated pair address MISMATCHES actual pair address from factory.getPair! Ensure INIT_CODE_PAIR_HASH in UniswapV2Library.sol is correct for this factory.");

        IUniswapV2Pair pairContract = IUniswapV2Pair(actualPairAddress);
        address token0 = pairContract.token0();
        address token1 = pairContract.token1();
        console.log("Pair contract (%s) token0:", actualPairAddress, token0);
        console.log("Pair contract (%s) token1:", actualPairAddress, token1);
        require(token0 != address(0) && token1 != address(0), "Pair token0 or token1 is address(0)!");
        bool isCorrectOrder = (token0 == WNERO_ADDRESS && token1 == STNERO_ADDRESS) || (token0 == STNERO_ADDRESS && token1 == WNERO_ADDRESS);
        require(isCorrectOrder, "Pair tokens do not match WNERO/STNERO.");

        console.log("Approving WNERO for Router (%s tokens)...", AMOUNT_WNERO_DESIRED);
        wneroToken.approve(ROUTER_ADDRESS, AMOUNT_WNERO_DESIRED); // Use IERC20 for approve
        console.log("WNERO approved.");

        console.log("Approving stNERO (Vault) for Router (%s tokens)...", AMOUNT_STNERO_DESIRED);
        stNeroToken.approve(ROUTER_ADDRESS, AMOUNT_STNERO_DESIRED);
        console.log("stNERO (Vault) approved.");

        // --- Pre-AddLiquidity Checks ---
        uint256 wneroBalance = wneroToken.balanceOf(deployerAddress); // Use IERC20 for balanceOf
        uint256 wneroAllowance = wneroToken.allowance(deployerAddress, ROUTER_ADDRESS); // Use IERC20 for allowance
        console.log("Deployer WNERO balance:", wneroBalance);
        console.log("Router WNERO allowance from deployer:", wneroAllowance);

        uint256 stneroBalance = stNeroToken.balanceOf(deployerAddress);
        uint256 stneroAllowance = stNeroToken.allowance(deployerAddress, ROUTER_ADDRESS);
        console.log("Deployer stNERO balance:", stneroBalance);
        console.log("Router stNERO allowance from deployer:", stneroAllowance);

        require(wneroBalance >= AMOUNT_WNERO_DESIRED, "Deployer has insufficient WNERO balance.");
        require(wneroAllowance >= AMOUNT_WNERO_DESIRED, "Router has insufficient WNERO allowance from deployer.");
        require(stneroBalance >= AMOUNT_STNERO_DESIRED, "Deployer has insufficient stNERO balance.");
        require(stneroAllowance >= AMOUNT_STNERO_DESIRED, "Router has insufficient stNERO allowance from deployer.");
        // --- End Pre-AddLiquidity Checks ---

        uint amountWNEROMin = 0; // For first liquidity, or accept any price.
        uint amountstNEROMin = 0;

        console.log("Adding liquidity to WNERO/stNERO pair (%s)... Desired: %s WNERO, %s stNERO (Vault)", actualPairAddress, AMOUNT_WNERO_DESIRED, AMOUNT_STNERO_DESIRED);

        (uint actualAmountWNERO, uint actualAmountstNERO, uint lpTokensReceived) = router.addLiquidity(
            WNERO_ADDRESS,
            STNERO_ADDRESS,
            AMOUNT_WNERO_DESIRED,
            AMOUNT_STNERO_DESIRED,
            amountWNEROMin,
            amountstNEROMin,
            deployerAddress, // LP tokens recipient
            block.timestamp + LIQUIDITY_DEADLINE_SECONDS
        );

        console.log("Liquidity added successfully!");
        console.log("Received LP Tokens:", lpTokensReceived);
        console.log("Actual WNERO added:", actualAmountWNERO);
        console.log("Actual stNERO (Vault) added:", actualAmountstNERO);

        vm.stopBroadcast();
    }
}
