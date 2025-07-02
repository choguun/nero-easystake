"use client";

import {
  useState,
  ChangeEvent,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRightLeft,
  Coins,
  Repeat2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ethers,
  BigNumber,
  Signer as EthersSigner,
  utils as ethersUtils,
} from "ethers";

// --- Custom Hooks & Context from AA Setup (mirroring stake page) ---
import {
  useSignature,
  useSendUserOp,
  useConfig,
  usePaymasterContext,
} from "@/hooks";
import { SendUserOpContext } from "@/contexts";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// --- Import addresses from constants contracts.ts ---
import {
  UNISWAP_ROUTER_ADDRESS as APP_UNISWAP_ROUTER_ADDRESS, // Alias to avoid naming conflict if any
  WNERO_ADDRESS as APP_WNERO_ADDRESS,
  STNERO_ADDRESS as APP_STNERO_ADDRESS,
} from "@/constants/contracts";
// --- End of addresses ---

// --- ABIs ---
// Simplified ERC20 ABI for balance, allowance, approve
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// Simplified UniswapV2Router02 ABI for swapping and getting amounts
const UNISWAP_V2_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function factory() view returns (address)",
  "function WETH() view returns (address)",
  // Potentially add swapExactETHForTokens and swapExactTokensForETH if dealing with native NERO directly
];
// --- End of ABIs ---

interface TokenInfo {
  address: string;
  symbol?: string; // Optional now, will be fetched
  decimals?: number; // Optional now, will be fetched
}

const INITIAL_WNERO_TOKEN: TokenInfo = { address: APP_WNERO_ADDRESS };
const INITIAL_STNERO_TOKEN: TokenInfo = { address: APP_STNERO_ADDRESS };

// --- Custom Hooks ---
// Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// Placeholder Wallet Hooks (NEEDS REPLACEMENT WITH ROBUST SOLUTION like Wagmi/RainbowKit)
// const useEthersProvider = () => { // Renamed for clarity
//   if (typeof window !== 'undefined' && window.ethereum) {
//     return new ethers.providers.Web3Provider(window.ethereum);
//   }
//   return null;
// };

// const useEthersSigner = () => {
//   const provider = useEthersProvider();
//   return provider?.getSigner() ?? null;
// };

// const useUserAddress = () => {
//   const signer = useEthersSigner();
//   const [address, setAddress] = useState<string | null>(null);
//   useEffect(() => {
//     if (signer) {
//       signer.getAddress().then(setAddress).catch(console.error);
//     } else {
//       setAddress(null);
//     }
//   }, [signer]);
//   return address;
// };
// --- End of Custom Hooks ---

export default function SwapPage() {
  const [fromToken, setFromToken] = useState<TokenInfo>(INITIAL_WNERO_TOKEN);
  const [toToken, setToToken] = useState<TokenInfo>(INITIAL_STNERO_TOKEN);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmountEstimate, setToAmountEstimate] = useState<string>("");

  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>(
    {},
  );
  const [tokenMetadata, setTokenMetadata] = useState<
    Record<string, { symbol: string; decimals: number }>
  >({});

  const [allowance, setAllowance] = useState<BigNumber>(BigNumber.from(0));
  const [isLoading, setIsLoading] = useState<boolean>(false); // General loading for swap tx
  const [isFetchingEstimate, setIsFetchingEstimate] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [needsApproval, setNeedsApproval] = useState<boolean>(false);

  // --- State for transaction polling and cancellation ---
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [userOpHash, setUserOpHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string>("");
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  const [currentAction, setCurrentAction] = useState<"swap" | "approve" | null>(
    null,
  );

  const { toast } = useToast();
  // const provider = useEthersProvider(); // Use provider for read-only calls where possible
  // const signer = useEthersSigner();
  // const userAddress = useUserAddress();

  // --- AA Hooks Integration ---
  const {
    AAaddress: userAddress,
    isConnected,
    signer: aaSignerDetails,
    loading: sigLoading,
  } = useSignature(); // Renamed AAaddress to userAddress for consistency
  const { execute: executeUserOp, checkUserOpStatus } = useSendUserOp();
  const { entryPoint: entryPointAddress, rpcUrl: configRpcUrl } = useConfig();
  const sendUserOpCtx = useContext(SendUserOpContext);
  const paymasterCtx = usePaymasterContext();

  const eoaSigner = aaSignerDetails as EthersSigner | undefined; // EOA signer for specific tasks if needed, or to get provider

  const getProvider = useCallback(() => {
    if (eoaSigner && eoaSigner.provider) {
      return eoaSigner.provider;
    }
    // Fallback to a new JsonRpcProvider using configRpcUrl or a default
    const ACTUAL_TESTNET_RPC_URL = "https://rpc-testnet.nerochain.io"; // Defined as in stake page
    return new ethers.providers.JsonRpcProvider(
      configRpcUrl || ACTUAL_TESTNET_RPC_URL,
    );
  }, [eoaSigner, configRpcUrl]);

  const provider = getProvider(); // Provider for read-only calls
  // --- End of AA Hooks Integration ---

  const debouncedFromAmount = useDebounce(fromAmount, 500); // Debounce for 500ms

  const fromTokenInfo = useMemo(() => {
    const metadata = tokenMetadata[fromToken.address];
    return {
      ...fromToken,
      symbol: metadata?.symbol || "Token",
      decimals: metadata?.decimals || 18,
    };
  }, [fromToken, tokenMetadata]);

  const toTokenInfo = useMemo(() => {
    const metadata = tokenMetadata[toToken.address];
    return {
      ...toToken,
      symbol: metadata?.symbol || "Token",
      decimals: metadata?.decimals || 18,
    };
  }, [toToken, tokenMetadata]);

  const fromTokenBalance = tokenBalances[fromTokenInfo.address] || "0";
  const toTokenBalance = tokenBalances[toTokenInfo.address] || "0";

  // Fetch Token Metadata (Symbol & Decimals)
  const fetchTokenMetadata = useCallback(
    async (tokenAddress: string) => {
      const currentProvider = getProvider(); // Use getProvider
      if (!currentProvider || tokenMetadata[tokenAddress]) {
        // console.log(`[SwapPage] fetchTokenMetadata: Skipping ${tokenAddress}, provider missing or metadata already fetched.`);
        return;
      }
      console.log(
        `[SwapPage] fetchTokenMetadata: Fetching metadata for ${tokenAddress}`,
      );
      try {
        const contract = new ethers.Contract(
          tokenAddress,
          ERC20_ABI,
          currentProvider,
        );
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        console.log(
          `[SwapPage] fetchTokenMetadata: Fetched for ${tokenAddress}`,
          { symbol, decimals },
        );
        setTokenMetadata((prev) => ({
          ...prev,
          [tokenAddress]: { symbol, decimals },
        }));
      } catch (error) {
        console.error(
          `[SwapPage] Failed to fetch metadata for ${tokenAddress}:`,
          error,
        );
        setTokenMetadata((prev) => ({
          ...prev,
          [tokenAddress]: { symbol: "UNKN", decimals: 18 },
        })); // Fallback
      }
    },
    [getProvider, tokenMetadata],
  );

  useEffect(() => {
    fetchTokenMetadata(APP_WNERO_ADDRESS);
    fetchTokenMetadata(APP_STNERO_ADDRESS);
  }, [fetchTokenMetadata]);

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (
      !userAddress ||
      userAddress === "0x" ||
      !fromTokenInfo.decimals ||
      !toTokenInfo.decimals
    )
      return; // Changed from signer to userAddress
    // setIsLoading(true); // Indicate general loading for balances - Moved to a more granular control if needed
    const currentProvider = getProvider(); // Use the dynamic provider
    if (!currentProvider) {
      toast({
        title: "Provider Error",
        description: "Cannot fetch balances, provider not available.",
        variant: "destructive",
      });
      return;
    }

    try {
      const tokensToFetch = [fromTokenInfo, toTokenInfo];
      const newBalances: Record<string, string> = {};
      for (const token of tokensToFetch) {
        if (token.address && token.decimals) {
          const contract = new ethers.Contract(
            token.address,
            ERC20_ABI,
            currentProvider,
          );
          const balanceBN = await contract.balanceOf(userAddress);
          newBalances[token.address] = ethers.utils.formatUnits(
            balanceBN,
            token.decimals,
          );
        }
      }
      setTokenBalances((prev) => ({ ...prev, ...newBalances }));
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      toast({
        title: "Error",
        description: "Failed to fetch token balances.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    userAddress,
    fromTokenInfo,
    toTokenInfo,
    toast,
    getProvider,
    tokenMetadata,
  ]); // Added getProvider, tokenMetadata, changed signer to userAddress

  useEffect(() => {
    if (
      userAddress &&
      userAddress !== "0x" &&
      fromTokenInfo.decimals &&
      toTokenInfo.decimals
    ) {
      // Ensure decimals are loaded and userAddress is valid
      fetchBalances();
    }
  }, [
    userAddress,
    fetchBalances,
    fromTokenInfo.decimals,
    toTokenInfo.decimals,
  ]);

  const checkAllowance = useCallback(async () => {
    const fromAmountBN = ethersUtils.parseUnits(
      debouncedFromAmount || "0",
      fromTokenInfo.decimals,
    );
    if (
      !provider ||
      !userAddress ||
      userAddress === "0x" ||
      fromTokenInfo.address === APP_WNERO_ADDRESS ||
      fromAmountBN.isZero()
    ) {
      setNeedsApproval(false);
      return;
    }
    try {
      const contract = new ethers.Contract(
        fromTokenInfo.address,
        ERC20_ABI,
        provider,
      );
      const currentAllowance = await contract.allowance(
        userAddress,
        APP_UNISWAP_ROUTER_ADDRESS,
      );
      setAllowance(currentAllowance);
      setNeedsApproval(currentAllowance.lt(fromAmountBN));
    } catch (error) {
      console.error("Failed to check allowance:", error);
      setNeedsApproval(true); // Assume approval is needed on error
    }
  }, [
    provider,
    userAddress,
    debouncedFromAmount,
    fromTokenInfo.address,
    fromTokenInfo.decimals,
  ]);

  // Get exchange rate / estimate output (uses debounced amount)
  useEffect(() => {
    const getEstimate = async () => {
      console.log("[SwapPage] Attempting to get estimate...");
      const currentProvider = getProvider();

      const fromTokenMeta = tokenMetadata[fromTokenInfo.address];
      const toTokenMeta = tokenMetadata[toTokenInfo.address];

      if (
        !debouncedFromAmount ||
        parseFloat(debouncedFromAmount) <= 0 ||
        !currentProvider ||
        !fromTokenMeta ||
        !toTokenMeta
      ) {
        setToAmountEstimate("");
        console.log("[SwapPage] GetEstimate returning early. Conditions:", {
          hasDebouncedAmount:
            !!debouncedFromAmount && parseFloat(debouncedFromAmount) > 0,
          hasProvider: !!currentProvider,
          fromTokenMetaLoaded: !!fromTokenMeta,
          toTokenMetaLoaded: !!toTokenMeta,
          debouncedFromAmount,
          fromTokenInfo,
          toTokenInfo,
        });
        return;
      }

      // At this point, fromTokenInfo.decimals and toTokenInfo.decimals reflect the data in tokenMetadata
      // (either successfully fetched or the fallback 18 if fetchTokenMetadata failed for a token)
      setIsFetchingEstimate(true);
      try {
        const routerContract = new ethers.Contract(
          APP_UNISWAP_ROUTER_ADDRESS,
          UNISWAP_V2_ROUTER_ABI,
          currentProvider,
        );

        console.log("[SwapPage] Parsing amountIn with:", {
          amount: debouncedFromAmount,
          decimals: fromTokenInfo.decimals,
        });
        const amountIn = ethers.utils.parseUnits(
          debouncedFromAmount,
          fromTokenInfo.decimals,
        );
        let path: string[] = [fromTokenInfo.address, toTokenInfo.address];
        if (
          fromTokenInfo.address === APP_WNERO_ADDRESS &&
          toTokenInfo.address === APP_STNERO_ADDRESS
        ) {
          path = [APP_WNERO_ADDRESS, APP_STNERO_ADDRESS];
        } else if (
          fromTokenInfo.address === APP_STNERO_ADDRESS &&
          toTokenInfo.address === APP_WNERO_ADDRESS
        ) {
          path = [APP_STNERO_ADDRESS, APP_WNERO_ADDRESS];
        }
        console.log("[SwapPage] Calling getAmountsOut with:", {
          amountInFormatted: amountIn.toString(),
          path,
          fromTokenAddress: fromTokenInfo.address,
          toTokenAddress: toTokenInfo.address,
        });

        const amountsOut = await routerContract.getAmountsOut(amountIn, path);
        console.log(
          "[SwapPage] Received amountsOut:",
          amountsOut && amountsOut.map((a: BigNumber) => a.toString()),
        );

        setToAmountEstimate(
          ethers.utils.formatUnits(amountsOut[1], toTokenInfo.decimals),
        );
      } catch (error) {
        console.error("[SwapPage] Failed to get amount out estimate:", error);
        setToAmountEstimate("");
      } finally {
        setIsFetchingEstimate(false);
      }
    };

    // Ensure fromTokenInfo and toTokenInfo have addresses before attempting to get an estimate
    if (
      fromTokenInfo.address &&
      toTokenInfo.address &&
      fromTokenInfo.decimals &&
      toTokenInfo.decimals
    ) {
      // also check decimals are loaded
      console.log(
        "[SwapPage] useEffect for getEstimate triggered. DebouncedFromAmount:",
        debouncedFromAmount,
        "FromToken:",
        fromTokenInfo.symbol,
        "ToToken:",
        toTokenInfo.symbol,
      );
      getEstimate();
    } else {
      console.log(
        "[SwapPage] useEffect for getEstimate: fromToken or toToken address/decimals missing, clearing estimate.",
        {
          fromAddress: fromTokenInfo.address,
          toAddress: toTokenInfo.address,
          fromDec: fromTokenInfo.decimals,
          toDec: toTokenInfo.decimals,
        },
      );
      setToAmountEstimate("");
    }
  }, [
    debouncedFromAmount,
    fromTokenInfo,
    toTokenInfo,
    getProvider,
    tokenMetadata,
  ]);

  useEffect(() => {
    if (debouncedFromAmount && parseFloat(debouncedFromAmount) > 0) {
      checkAllowance();
    }
  }, [
    debouncedFromAmount,
    fromTokenInfo.decimals,
    needsApproval,
    checkAllowance,
  ]);

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    if (/^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  };

  const handleMaxClick = () => {
    setFromAmount(fromTokenBalance);
  };

  const handleSwitchTokens = () => {
    setFromToken(toToken); // Use the full toToken state here
    setToToken(fromToken); // Use the full fromToken state here
    setFromAmount("");
    setToAmountEstimate("");
    setNeedsApproval(false);
  };

  const handleCancel = useCallback(() => {
    setIsPollingStatus(false);
    setIsProcessingTx(false);
    setIsApproving(false);
    setCurrentAction(null);
    setTxStatus("");
    setUserOpHash(null);
    if (sendUserOpCtx) sendUserOpCtx.setIsWalletPanel(false);
    toast({
      title: "Transaction Cancelled",
      description: "You cancelled the operation.",
    });
  }, [toast, sendUserOpCtx]);

  useEffect(() => {
    if (
      sendUserOpCtx &&
      !sendUserOpCtx.isWalletPanel &&
      isProcessingTx &&
      !userOpHash
    ) {
      handleCancel();
    }
  }, [sendUserOpCtx, isProcessingTx, userOpHash, handleCancel]);

  const handleApprove = async () => {
    if (
      !eoaSigner ||
      !userAddress ||
      userAddress === "0x" ||
      !fromAmount ||
      parseFloat(fromAmount) <= 0 ||
      !fromTokenInfo.decimals
    ) {
      toast({
        title: "Invalid Input",
        description:
          "Please connect wallet, ensure AA address is available, and amount is valid.",
        variant: "destructive",
      });
      return;
    }

    // Defensive check for fromTokenInfo.address using ethers.utils.isAddress
    if (
      !fromTokenInfo.address ||
      !ethersUtils.isAddress(fromTokenInfo.address)
    ) {
      console.error(
        "[SwapPage] handleApprove: fromTokenInfo.address is invalid or undefined! Address:",
        fromTokenInfo.address,
      );
      toast({
        title: "Token Error",
        description: `Invalid or missing From token address: ${fromTokenInfo.address || "undefined"}. Please select a valid token.`,
        variant: "destructive",
      });
      setIsApproving(false);
      return;
    }
    console.log(
      "[SwapPage] handleApprove: fromTokenInfo details (address validated):",
      fromTokenInfo,
    );

    setIsApproving(true);
    setTxStatus("Requesting approval...");
    setCurrentAction("approve");
    setIsProcessingTx(true);

    try {
      const tokenContract = new ethers.Contract(
        fromTokenInfo.address,
        ERC20_ABI,
        provider,
      );
      // Create UserOp for approval
      const approveData = tokenContract.interface.encodeFunctionData(
        "approve",
        [APP_UNISWAP_ROUTER_ADDRESS, ethers.constants.MaxUint256],
      );

      setTxStatus("Awaiting signature for approval...");
      const result = await executeUserOp({
        target: fromTokenInfo.address,
        abi: ERC20_ABI,
        functionName: "approve",
        params: [APP_UNISWAP_ROUTER_ADDRESS, ethers.constants.MaxUint256],
        value: 0,
      });

      if (result.userOpHash) {
        setUserOpHash(result.userOpHash);
        setIsPollingStatus(true); // Start polling for approval status
        setTxStatus("Approval submitted, waiting for confirmation...");
      } else {
        throw new Error(result.error || "Approval failed or was cancelled.");
      }
    } catch (error: any) {
      console.error("Approval failed:", error);
      toast({
        title: "Approval Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
      handleCancel();
    }
  };

  const handleSwap = async () => {
    // Basic validations
    if (
      !userAddress ||
      !provider ||
      !fromTokenInfo.decimals ||
      !toTokenInfo.decimals
    ) {
      toast({
        title: "Setup Error",
        description: "User or token information is missing.",
        variant: "destructive",
      });
      return;
    }
    const fromAmountBN = ethers.utils.parseUnits(
      fromAmount,
      fromTokenInfo.decimals,
    );
    if (fromAmountBN.isZero()) {
      toast({
        title: "Invalid Amount",
        description: "Cannot swap zero tokens.",
        variant: "destructive",
      });
      return;
    }
    const balanceBN = ethers.utils.parseUnits(
      fromTokenBalance,
      fromTokenInfo.decimals,
    );
    if (fromAmountBN.gt(balanceBN)) {
      toast({
        title: "Insufficient Balance",
        description: `You do not have enough ${fromTokenInfo.symbol}.`,
        variant: "destructive",
      });
      return;
    }
    if (needsApproval) {
      toast({
        title: "Approval Required",
        description: `Please approve ${fromTokenInfo.symbol} first.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTxStatus("Preparing swap...");
    setCurrentAction("swap");
    setIsProcessingTx(true);

    try {
      // Get a reasonable deadline
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

      // This is a simplification. In a real app, you'd want a more robust way to calculate min amount out, like from a quote.
      const amountOutMin = ethers.utils
        .parseUnits(toAmountEstimate, toTokenInfo.decimals)
        .mul(99)
        .div(100); // Accept 1% slippage

      const path = [fromTokenInfo.address, toTokenInfo.address];

      setTxStatus("Awaiting signature for swap...");

      const result = await executeUserOp({
        target: APP_UNISWAP_ROUTER_ADDRESS,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        params: [
          fromAmountBN,
          amountOutMin,
          path,
          userAddress, // send to user's AA wallet
          deadline,
        ],

        value: 0,
      });

      if (result.userOpHash) {
        setUserOpHash(result.userOpHash);
        setIsPollingStatus(true);
        setTxStatus("Swap submitted, waiting for confirmation...");
      } else {
        throw new Error(result.error || "Swap failed or was cancelled.");
      }
    } catch (error: any) {
      console.error("Swap failed:", error);
      toast({
        title: "Swap Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
      handleCancel();
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const pollStatus = async () => {
      if (!userOpHash || !isPollingStatus || !currentAction) return;

      try {
        setTxStatus(`Confirming ${currentAction}...`);
        const statusResult = await checkUserOpStatus(userOpHash);

        const actionVerb =
          currentAction.charAt(0).toUpperCase() + currentAction.slice(1);

        if (statusResult) {
          console.log(
            `[SwapPage] ${actionVerb} successful for UserOpHash: ${userOpHash}`,
          );
          toast({
            title: `${actionVerb} Successful!`,
            description: `Your ${currentAction} operation was completed.`,
          });

          if (currentAction === "approve") {
            setNeedsApproval(false);
            checkAllowance(); // Re-check allowance to update UI
          }
          if (currentAction === "swap") {
            setFromAmount(""); // Reset input
            setToAmountEstimate("");
          }

          fetchBalances(); // Refresh balances for both tokens

          // Reset all transaction states
          setIsPollingStatus(false);
          setUserOpHash(null);
          setCurrentAction(null);
          setIsLoading(false);
          setIsApproving(false);
          setIsProcessingTx(false);
          if (sendUserOpCtx) sendUserOpCtx.setIsWalletPanel(false);
          if (paymasterCtx) paymasterCtx.clearToken();
        } else {
          setTxStatus(
            `UserOp submitted, awaiting ${currentAction} confirmation...`,
          );
        }
      } catch (error) {
        console.error(
          `[SwapPage] Error polling ${currentAction} status for UserOpHash ${userOpHash}:`,
          error,
        );
        toast({
          title: `Polling Error`,
          description: `Error checking ${currentAction} status.`,
          variant: "destructive",
        });
        setIsPollingStatus(false); // Stop polling on error
        setIsLoading(false);
        setIsApproving(false);
        setIsProcessingTx(false);
        setCurrentAction(null);
      }
    };

    if (userOpHash && isPollingStatus) {
      intervalId = setInterval(pollStatus, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    userOpHash,
    isPollingStatus,
    checkUserOpStatus,
    fetchBalances,
    checkAllowance,
    currentAction,
    toast,
    sendUserOpCtx,
    paymasterCtx,
  ]);

  if (sigLoading) {
    return (
      <div
        className="flex-grow flex items-center justify-center"
        data-oid="vug30s8"
      >
        <Loader2 className="h-8 w-8 animate-spin" data-oid="wm1ld-j" />
      </div>
    );
  }

  return (
    <div
      className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center px-4 md:px-6"
      data-oid="gsm98l0"
    >
      <Card className="shadow-lg w-full max-w-md" data-oid="5-iva2j">
        <CardHeader data-oid="bvw.hop">
          <div className="flex justify-between items-center" data-oid="7qymyx_">
            <CardTitle
              className="text-2xl flex items-center gap-2"
              data-oid="_.auzrr"
            >
              <Repeat2 className="h-6 w-6 text-primary" data-oid="zx0j-0b" />
              Swap Tokens
            </CardTitle>
            {/* <ConnectButton showBalance={false} accountStatus="address" /> */}
          </div>
          <CardDescription
            className="flex items-center justify-between"
            data-oid="5qb1z4:"
          >
            <span data-oid="10gi6ob">
              Exchange {fromTokenInfo.symbol} for {toTokenInfo.symbol}{" "}
              seamlessly.
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchBalances}
              className="h-7 w-7"
              title="Refresh balances"
              disabled={
                isLoading ||
                isApproving ||
                !isConnected ||
                !userAddress ||
                userAddress === "0x"
              }
              data-oid="_92g8ln"
            >
              <RotateCcw className="h-4 w-4" data-oid="b199n.g" />
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6" data-oid="p63pwku">
          <div className="space-y-2" data-oid="ido9qeo">
            <div
              className="flex justify-between items-baseline"
              data-oid="bewkbeb"
            >
              <Label htmlFor="from-amount" data-oid="z4uzd37">
                From: {fromTokenInfo.symbol}
              </Label>
              <span
                className="text-sm text-muted-foreground"
                data-oid="wjassf5"
              >
                Balance:{" "}
                {tokenBalances[fromTokenInfo.address]
                  ? parseFloat(tokenBalances[fromTokenInfo.address]!).toFixed(4)
                  : "0.0000"}
              </span>
            </div>
            <div className="relative" data-oid="57rc0kn">
              <Input
                id="from-amount"
                type="text"
                placeholder="0.0"
                value={fromAmount}
                onChange={handleAmountChange}
                className="pr-16 text-lg"
                inputMode="decimal"
                disabled={
                  !isConnected ||
                  !userAddress ||
                  userAddress === "0x" ||
                  !fromTokenInfo.decimals ||
                  isLoading ||
                  isApproving
                }
                data-oid="am8w6ow"
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                disabled={
                  !isConnected ||
                  !userAddress ||
                  userAddress === "0x" ||
                  !fromTokenInfo.decimals ||
                  isLoading ||
                  isApproving
                }
                data-oid="dflf_po"
              >
                Max
              </Button>
            </div>
          </div>

          <div className="flex justify-center" data-oid="41-6ry9">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwitchTokens}
              aria-label="Switch tokens"
              disabled={
                !isConnected ||
                !fromTokenInfo.decimals ||
                !toTokenInfo.decimals ||
                isLoading ||
                isApproving
              }
              data-oid="e9oyy3s"
            >
              <ArrowRightLeft
                className="h-5 w-5 text-primary"
                data-oid="uvtqm2q"
              />
            </Button>
          </div>

          <div className="space-y-2" data-oid="o1s2e69">
            <div
              className="flex justify-between items-baseline"
              data-oid="ftltub:"
            >
              <Label htmlFor="to-amount" data-oid="ycdhmf-">
                To: {toTokenInfo.symbol}
              </Label>
              <span
                className="text-sm text-muted-foreground"
                data-oid="vjw5zxw"
              >
                Balance:{" "}
                {tokenBalances[toTokenInfo.address]
                  ? parseFloat(tokenBalances[toTokenInfo.address]!).toFixed(4)
                  : "0.0000"}
              </span>
            </div>
            <Input
              id="to-amount"
              type="text"
              readOnly
              placeholder="0.0"
              value={
                isFetchingEstimate
                  ? "Fetching..."
                  : toAmountEstimate
                    ? `≈ ${parseFloat(toAmountEstimate).toFixed(4)}`
                    : "0.0"
              }
              className="bg-muted border-muted cursor-not-allowed text-lg"
              data-oid="9-yo3:o"
            />
          </div>

          {toAmountEstimate &&
            parseFloat(fromAmount) > 0 &&
            !isFetchingEstimate && (
              <p
                className="text-xs text-muted-foreground text-center"
                data-oid="gxn1d98"
              >
                1 {fromTokenInfo.symbol} ≈{" "}
                {(
                  parseFloat(toAmountEstimate) / parseFloat(fromAmount)
                ).toFixed(4)}{" "}
                {toTokenInfo.symbol}
              </p>
            )}
          {isFetchingEstimate && (
            <p
              className="text-xs text-muted-foreground text-center"
              data-oid="nr6ljyw"
            >
              Fetching best price...
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2" data-oid="7cabsrk">
          {needsApproval &&
            userAddress &&
            userAddress !== "0x" &&
            fromTokenInfo.address !== ethers.constants.AddressZero && (
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleApprove}
                disabled={
                  isApproving ||
                  isLoading ||
                  !isConnected ||
                  !userAddress ||
                  userAddress === "0x" ||
                  !fromAmount ||
                  parseFloat(fromAmount) <= 0 ||
                  !fromTokenInfo.decimals ||
                  isPollingStatus
                }
                data-oid="vxqqxg-"
              >
                {isApproving
                  ? `Approving (${currentAction === "approve" && userOpHash ? userOpHash.substring(0, 6) + "..." : "Processing..."})`
                  : `Approve ${fromTokenInfo.symbol} Spending`}
              </Button>
            )}
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSwap}
            disabled={
              isLoading ||
              isApproving ||
              needsApproval ||
              !isConnected ||
              !userAddress ||
              userAddress === "0x" ||
              !fromAmount ||
              parseFloat(fromAmount) <= 0 ||
              isNaN(parseFloat(fromAmount)) ||
              !toAmountEstimate ||
              !fromTokenInfo.decimals ||
              isPollingStatus
            }
            data-oid="p.m5-:7"
          >
            {isLoading
              ? `Swapping (${currentAction === "swap" && userOpHash ? userOpHash.substring(0, 6) + "..." : "Processing..."})`
              : currentAction === "swap" && isPollingStatus
                ? `Confirming Swap...`
                : `Swap ${fromTokenInfo.symbol}`}
          </Button>
          {txStatus && (
            <p
              className="text-xs text-muted-foreground text-center pt-2"
              data-oid="6uv.4su"
            >
              {txStatus}
            </p>
          )}
          {!isConnected && (
            <p
              className="text-xs text-destructive text-center"
              data-oid="-lstfnh"
            >
              Please connect your wallet to swap.
            </p>
          )}
          {isConnected && (!userAddress || userAddress === "0x") && (
            <p
              className="text-xs text-destructive text-center"
              data-oid="7hbpve."
            >
              AA Wallet address not available. Ensure your wallet is fully
              connected and configured.
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
