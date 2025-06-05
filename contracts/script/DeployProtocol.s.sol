// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";

// Protocol Contracts
import {EasyStakeToken} from "../src/EasyStakeToken.sol";
import {EasyStakeVault} from "../src/EasyStakeVault.sol";
import {LPTokenStaker} from "../src/LPTokenStaker.sol";
import {UniswapV2Factory} from "../src/UniswapV2Factory.sol";
import {UniswapV2Router02} from "../src/UniswapV2Router02.sol";
import {IUniswapV2Pair} from "../src/interfaces/IUniswapV2Pair.sol"; // For typecasting LP Token
import {UniswapV2Pair} from "../src/UniswapV2Pair.sol"; // For INIT_CODE_PAIR_HASH

// Mocks (or your actual token contracts)
import {WETH9} from "../src/mocks/WETH9.sol";       // Represents WNativeToken (e.g., WNERO) - will use existing

// Interfaces
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployProtocol is Script {
    using stdJson for string;

    // --- CONFIGURABLE PARAMETERS (Defaults) ---
    string VAULT_TOKEN_NAME_DEFAULT = "Staked WNERO Token";
    string VAULT_TOKEN_SYMBOL_DEFAULT = "stNERO";

    uint256 WNERO_FOR_VAULT_DEPOSIT_UNSCALED_DEFAULT = 1;  // WNERO to deposit in EasyStakeVault to get stNERO shares
    uint256 WNATIVE_FOR_LP_LIQUIDITY_UNSCALED_DEFAULT = 1; // WNERO to pair with stNERO in LP

    uint256 EST_REWARDS_TO_FUND_UNSCALED_DEFAULT = 100_000;
    uint256 EST_REWARDS_DURATION_SECONDS_DEFAULT = 30 days;

    // --- STATE VARIABLES FOR CONFIG (to be set in setUp) ---
    string public VAULT_TOKEN_NAME;
    string public VAULT_TOKEN_SYMBOL;
    uint256 public WNERO_FOR_VAULT_DEPOSIT_WEI;
    uint256 public WNATIVE_FOR_LP_LIQUIDITY_WEI;

    uint256 public NATIVE_TO_WRAP_FOR_VAULT_AND_LP_WEI;

    uint256 public EST_REWARDS_TO_FUND_WEI;
    uint256 public EST_REWARDS_DURATION_SECONDS;
    
    address public DEPLOYER_ADDRESS; 
    uint256 deployerPrivateKey;

    address public WNATIVE_TOKEN_ADDRESS;
    address public EASY_STAKE_TOKEN_ADDRESS; // From env or new deployment
    address public EASY_STAKE_VAULT_ADDRESS; // From env or new deployment
    address public UNISWAP_FACTORY_ADDRESS;  // From env or new deployment
    address public UNISWAP_ROUTER_ADDRESS;   // From env or new deployment
    address public LP_TOKEN_STAKER_ADDRESS;  // From env or new deployment
    address public STNERO_WNERO_LP_PAIR_ADDRESS; 

    // --- DEPLOYED CONTRACT INSTANCES ---
    EasyStakeToken public easyStakeToken;
    WETH9 public wNativeToken;
    UniswapV2Factory public factoryContract; // Renamed to avoid conflict with factory state variable
    UniswapV2Router02 public routerContract; // Renamed to avoid conflict with router state variable
    IERC20 public lpToken;
    LPTokenStaker public lpTokenStaker;
    EasyStakeVault public easyStakeVault;

    function setUp() public virtual {
        deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        require(deployerPrivateKey != 0, "DEPLOYER_PRIVATE_KEY environment variable must be set.");
        DEPLOYER_ADDRESS = vm.addr(deployerPrivateKey);
        
        VAULT_TOKEN_NAME = vm.envString("VAULT_TOKEN_NAME");
        if (bytes(VAULT_TOKEN_NAME).length == 0) VAULT_TOKEN_NAME = VAULT_TOKEN_NAME_DEFAULT;
        VAULT_TOKEN_SYMBOL = vm.envString("VAULT_TOKEN_SYMBOL");
        if (bytes(VAULT_TOKEN_SYMBOL).length == 0) VAULT_TOKEN_SYMBOL = VAULT_TOKEN_SYMBOL_DEFAULT;

        uint256 estDecimals = 18;
        uint256 wNativeDecimals = 18;

        uint256 wneroForVaultUnscaled = vm.envExists("WNERO_FOR_VAULT_DEPOSIT_UNSCALED") ? vm.envUint("WNERO_FOR_VAULT_DEPOSIT_UNSCALED") : WNERO_FOR_VAULT_DEPOSIT_UNSCALED_DEFAULT;
        WNERO_FOR_VAULT_DEPOSIT_WEI = wneroForVaultUnscaled * (10**wNativeDecimals);
        
        uint256 wnativeForLpUnscaled = vm.envExists("WNATIVE_FOR_LP_LIQUIDITY_UNSCALED") ? vm.envUint("WNATIVE_FOR_LP_LIQUIDITY_UNSCALED") : WNATIVE_FOR_LP_LIQUIDITY_UNSCALED_DEFAULT;
        WNATIVE_FOR_LP_LIQUIDITY_WEI = wnativeForLpUnscaled * (10**wNativeDecimals);

        NATIVE_TO_WRAP_FOR_VAULT_AND_LP_WEI = WNERO_FOR_VAULT_DEPOSIT_WEI + WNATIVE_FOR_LP_LIQUIDITY_WEI;

        uint256 estRewardsUnscaled = vm.envExists("EST_REWARDS_TO_FUND_UNSCALED") ? vm.envUint("EST_REWARDS_TO_FUND_UNSCALED") : EST_REWARDS_TO_FUND_UNSCALED_DEFAULT;
        EST_REWARDS_TO_FUND_WEI = estRewardsUnscaled * (10**estDecimals);
        
        EST_REWARDS_DURATION_SECONDS = vm.envExists("EST_REWARDS_DURATION_SECONDS") ? vm.envUint("EST_REWARDS_DURATION_SECONDS") : EST_REWARDS_DURATION_SECONDS_DEFAULT;

        address wNativeAddr = vm.envAddress("WNATIVE_TOKEN_ADDRESS");
        if (wNativeAddr == address(0)) wNativeAddr = vm.envAddress("WNERO_ADDRESS");
        address WNATIVE_TOKEN_ADDRESS_FALLBACK = 0x82D1C63b242434386C21bC2649B132CDd4dD3260; 
        if (wNativeAddr == address(0)) wNativeAddr = WNATIVE_TOKEN_ADDRESS_FALLBACK;
        WNATIVE_TOKEN_ADDRESS = wNativeAddr;
        require(WNATIVE_TOKEN_ADDRESS != address(0), "WNATIVE_TOKEN_ADDRESS must be set.");

    }

    function run() external returns (address[6] memory deployedAddresses) {
        vm.startBroadcast(deployerPrivateKey);

        console.log("--- Starting Protocol Deployment (stNERO/WNERO LP) ---");
        console.log("Deployer Address:", DEPLOYER_ADDRESS);
        console.log("Initial native NERO balance of Deployer:", DEPLOYER_ADDRESS.balance);

        // --- 1. Deploy EasyStakeToken (EST) or use existing ---
        if (EASY_STAKE_TOKEN_ADDRESS == address(0)) {
            easyStakeToken = new EasyStakeToken(DEPLOYER_ADDRESS);
            EASY_STAKE_TOKEN_ADDRESS = address(easyStakeToken);
            console.log("EasyStakeToken deployed to:", EASY_STAKE_TOKEN_ADDRESS);
        } else {
            easyStakeToken = EasyStakeToken(payable(EASY_STAKE_TOKEN_ADDRESS));
            console.log("Using existing EasyStakeToken at:", EASY_STAKE_TOKEN_ADDRESS);
        }

        // --- 2. Use existing WNativeToken (WNERO) ---
        require(WNATIVE_TOKEN_ADDRESS != address(0), "WNATIVE_TOKEN_ADDRESS is not set.");
        wNativeToken = WETH9(payable(WNATIVE_TOKEN_ADDRESS)); 
        string memory wNativeName; 
        string memory wNativeSymbol;
        try wNativeToken.name() returns (string memory name) { wNativeName = name; } catch { wNativeName = "WNativeToken"; }
        try wNativeToken.symbol() returns (string memory symbol) { wNativeSymbol = symbol; } catch { wNativeSymbol = "WNT"; }
        console.log(string.concat("Using existing ", wNativeName, " (", wNativeSymbol, ") at: "), WNATIVE_TOKEN_ADDRESS);
        console.log(string.concat("Initial ", wNativeSymbol, " balance of Deployer: "), wNativeToken.balanceOf(DEPLOYER_ADDRESS));

        uint256 totalWNativeNeeded = WNERO_FOR_VAULT_DEPOSIT_WEI + WNATIVE_FOR_LP_LIQUIDITY_WEI;
        uint256 currentWNativeBalance = wNativeToken.balanceOf(DEPLOYER_ADDRESS);
        console.log(string.concat("Total ", wNativeSymbol, " needed for Vault deposit & LP: ", vm.toString(totalWNativeNeeded)));

        if (currentWNativeBalance < totalWNativeNeeded) {
            uint256 wNativeToWrap = totalWNativeNeeded - currentWNativeBalance;
            console.log(string.concat("Deployer ", wNativeSymbol, " balance is low (",vm.toString(currentWNativeBalance) , "). Attempting to wrap ", vm.toString(wNativeToWrap), " native NERO to ", wNativeSymbol, "."));
            if (DEPLOYER_ADDRESS.balance >= wNativeToWrap) {
                wNativeToken.deposit{value: wNativeToWrap}();
            } else {
                console.log(string.concat("Error: Insufficient native NERO to wrap needed ", wNativeSymbol));
            }
        }
        require(wNativeToken.balanceOf(DEPLOYER_ADDRESS) >= totalWNativeNeeded, string.concat("Error: Insufficient ", wNativeSymbol, " for vault and LP."));
        console.log(string.concat("Confirmed ", wNativeSymbol, " balance post-wrap check: "), wNativeToken.balanceOf(DEPLOYER_ADDRESS));
        
        // --- 3. Deploy EasyStakeVault (mints stNERO shares) or use existing ---
        if (EASY_STAKE_VAULT_ADDRESS == address(0)) {
            easyStakeVault = new EasyStakeVault(WNATIVE_TOKEN_ADDRESS, VAULT_TOKEN_NAME, VAULT_TOKEN_SYMBOL, DEPLOYER_ADDRESS);
            EASY_STAKE_VAULT_ADDRESS = address(easyStakeVault);
            console.log(string.concat(VAULT_TOKEN_SYMBOL, " (EasyStakeVault) deployed to: "), EASY_STAKE_VAULT_ADDRESS);
        } else {
            easyStakeVault = EasyStakeVault(payable(EASY_STAKE_VAULT_ADDRESS));
            VAULT_TOKEN_SYMBOL = easyStakeVault.symbol(); 
            console.log(string.concat("Using existing ", VAULT_TOKEN_SYMBOL, " (EasyStakeVault) at: "), EASY_STAKE_VAULT_ADDRESS);
        }
        IERC20 stNEROToken = IERC20(EASY_STAKE_VAULT_ADDRESS);

        console.log(string.concat("Deployer depositing ", vm.toString(WNERO_FOR_VAULT_DEPOSIT_WEI), " ", wNativeSymbol, " into ", VAULT_TOKEN_SYMBOL, " vault..."));
        wNativeToken.approve(EASY_STAKE_VAULT_ADDRESS, WNERO_FOR_VAULT_DEPOSIT_WEI);
        uint256 stNEROSharesMinted = easyStakeVault.deposit(WNERO_FOR_VAULT_DEPOSIT_WEI, DEPLOYER_ADDRESS);
        console.log(string.concat("Deposited ", wNativeSymbol, ". Deployer received ", vm.toString(stNEROSharesMinted), " ", VAULT_TOKEN_SYMBOL, " shares."));
        require(stNEROSharesMinted > 0, "Minted stNERO shares must be > 0 for LP.");

        // --- Log Actual INIT_CODE_PAIR_HASH (Crucial for Router Interaction) ---
        bytes32 actualInitCodePairHash = keccak256(type(UniswapV2Pair).creationCode);
        console.log("Actual INIT_CODE_PAIR_HASH from compiled UniswapV2Pair.sol:");
        console.logBytes32(actualInitCodePairHash);
        // Compare this with the hash in UniswapV2Library.sol if issues arise
        // The hash in UniswapV2Library.sol MUST match this for pairFor to work correctly.
        // Currently in UniswapV2Library.sol: hex'848277aa0caef011f3e35eea79d151ec8dd038a7cd1037f86dc34bbc8ef8cdb7'

        // --- 4. Deploy UniswapV2Factory or use existing ---
        if (UNISWAP_FACTORY_ADDRESS == address(0)) {
            console.log("Deploying new UniswapV2Factory (feeToSetter will be %s)...", DEPLOYER_ADDRESS);
            factoryContract = new UniswapV2Factory(); // No feeToSetter argument in this constructor
            UNISWAP_FACTORY_ADDRESS = address(factoryContract);
            console.log("New UniswapV2Factory deployed to:", UNISWAP_FACTORY_ADDRESS);
        } else {
            factoryContract = UniswapV2Factory(payable(UNISWAP_FACTORY_ADDRESS));
            console.log("Using existing UniswapV2Factory at:", UNISWAP_FACTORY_ADDRESS);
        }

        // --- 5. Deploy UniswapV2Router02 or use existing ---
        if (UNISWAP_ROUTER_ADDRESS == address(0)) {
            console.log("Deploying new UniswapV2Router02 with factory: %s and WNative: %s...", UNISWAP_FACTORY_ADDRESS, WNATIVE_TOKEN_ADDRESS);
            routerContract = new UniswapV2Router02(UNISWAP_FACTORY_ADDRESS, WNATIVE_TOKEN_ADDRESS);
            UNISWAP_ROUTER_ADDRESS = address(routerContract);
            console.log("New UniswapV2Router02 deployed to:", UNISWAP_ROUTER_ADDRESS);
        } else {
            routerContract = UniswapV2Router02(payable(UNISWAP_ROUTER_ADDRESS));
            console.log("Using existing UniswapV2Router02 at:", UNISWAP_ROUTER_ADDRESS);
            // Sanity check: Ensure existing router is linked to the same factory and WNative
            require(routerContract.factory() == UNISWAP_FACTORY_ADDRESS, "Router's factory mismatch");
            require(routerContract.WETH() == WNATIVE_TOKEN_ADDRESS, "Router's WETH mismatch");
        }

        // --- 6. Create stNERO/WNERO LP Pair (if it doesn't exist on the factory) ---
        STNERO_WNERO_LP_PAIR_ADDRESS = factoryContract.getPair(EASY_STAKE_VAULT_ADDRESS, WNATIVE_TOKEN_ADDRESS);
        if (STNERO_WNERO_LP_PAIR_ADDRESS == address(0)) {
            STNERO_WNERO_LP_PAIR_ADDRESS = factoryContract.createPair(EASY_STAKE_VAULT_ADDRESS, WNATIVE_TOKEN_ADDRESS);
            console.log(string.concat(VAULT_TOKEN_SYMBOL, "/", wNativeSymbol, " LP Pair created at: "), STNERO_WNERO_LP_PAIR_ADDRESS);
             require(STNERO_WNERO_LP_PAIR_ADDRESS != address(0), "Pair creation failed");
        } else {
            console.log(string.concat(VAULT_TOKEN_SYMBOL, "/", wNativeSymbol, " LP Pair already exists at: "), STNERO_WNERO_LP_PAIR_ADDRESS);
        }
        lpToken = IERC20(STNERO_WNERO_LP_PAIR_ADDRESS);

        // --- Add Liquidity for stNERO/WNERO ---
        uint256 stNEROBalanceForLP = stNEROToken.balanceOf(DEPLOYER_ADDRESS);
        require(stNEROBalanceForLP > 0, "Deployer has no stNERO for liquidity.");
        uint256 wNativeBalanceForLP = wNativeToken.balanceOf(DEPLOYER_ADDRESS); // Should be WNATIVE_FOR_LP_LIQUIDITY_WEI
        require(wNativeBalanceForLP >= WNATIVE_FOR_LP_LIQUIDITY_WEI, string.concat("Deployer has insufficient ", wNativeSymbol, " for LP."));
        
        stNEROToken.approve(UNISWAP_ROUTER_ADDRESS, stNEROBalanceForLP);
        wNativeToken.approve(UNISWAP_ROUTER_ADDRESS, WNATIVE_FOR_LP_LIQUIDITY_WEI);

        console.log(string.concat("Adding liquidity - ", VAULT_TOKEN_SYMBOL, ": ", vm.toString(stNEROBalanceForLP), ", ", wNativeSymbol, ": ", vm.toString(WNATIVE_FOR_LP_LIQUIDITY_WEI)));
        (uint amountStNERO, uint amountWNative, uint liquidity) = routerContract.addLiquidity(
            EASY_STAKE_VAULT_ADDRESS,
            WNATIVE_TOKEN_ADDRESS,
            stNEROBalanceForLP,
            WNATIVE_FOR_LP_LIQUIDITY_WEI,
            1, 1, // Min amounts (adjust for slippage if real scenario)
            DEPLOYER_ADDRESS,
            block.timestamp + 15 minutes
        );
        console.log(string.concat("Liquidity added - Actual ", VAULT_TOKEN_SYMBOL, ": ", vm.toString(amountStNERO), ", Actual ", wNativeSymbol, ": ", vm.toString(amountWNative), ", LP Tokens: ", vm.toString(liquidity)));
        
        // --- 7. Deploy LPTokenStaker or use existing ---
        if (LP_TOKEN_STAKER_ADDRESS == address(0)) {
            lpTokenStaker = new LPTokenStaker(STNERO_WNERO_LP_PAIR_ADDRESS, EASY_STAKE_TOKEN_ADDRESS, DEPLOYER_ADDRESS);
            LP_TOKEN_STAKER_ADDRESS = address(lpTokenStaker);
            console.log("LPTokenStaker deployed to:", LP_TOKEN_STAKER_ADDRESS);
        } else {
            lpTokenStaker = LPTokenStaker(payable(LP_TOKEN_STAKER_ADDRESS));
            console.log("Using existing LPTokenStaker at:", LP_TOKEN_STAKER_ADDRESS);
        }

        // --- 8. Fund LPTokenStaker with EasyStakeToken Rewards ---
        uint256 deployerESTBalance = easyStakeToken.balanceOf(DEPLOYER_ADDRESS);
        if (deployerESTBalance >= EST_REWARDS_TO_FUND_WEI) {
            easyStakeToken.approve(LP_TOKEN_STAKER_ADDRESS, EST_REWARDS_TO_FUND_WEI);
            lpTokenStaker.notifyRewardAmount(EST_REWARDS_TO_FUND_WEI, EST_REWARDS_DURATION_SECONDS);
            console.log("LPTokenStaker funded. Rate:", lpTokenStaker.rewardRate(), "Finish:", lpTokenStaker.periodFinish());
        } else {
            console.log(string.concat("Error: Insufficient EST to fund rewards. Have: ", vm.toString(deployerESTBalance), ", Need: ", vm.toString(EST_REWARDS_TO_FUND_WEI)));
        }

        vm.stopBroadcast();
        console.log("--- Protocol Deployment Completed ---");

        deployedAddresses = [
            EASY_STAKE_TOKEN_ADDRESS,
            WNATIVE_TOKEN_ADDRESS,
            EASY_STAKE_VAULT_ADDRESS,
            UNISWAP_ROUTER_ADDRESS,
            STNERO_WNERO_LP_PAIR_ADDRESS,
            LP_TOKEN_STAKER_ADDRESS
        ];
        return deployedAddresses;
    }
} 