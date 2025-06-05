'use client';

import { useState, ChangeEvent, useEffect, useCallback, useContext, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, Coins, Repeat2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ethers, BigNumber, Signer as EthersSigner, utils as ethersUtils } from 'ethers';

// --- Custom Hooks & Context from AA Setup (mirroring stake page) ---
import { useSignature, useSendUserOp, useConfig, usePaymasterContext } from '@/hooks';
import { SendUserOpContext } from '@/contexts';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// --- Import addresses from constants contracts.ts ---
import {
  UNISWAP_ROUTER_ADDRESS as APP_UNISWAP_ROUTER_ADDRESS, // Alias to avoid naming conflict if any
  WNERO_ADDRESS as APP_WNERO_ADDRESS,
  STNERO_ADDRESS as APP_STNERO_ADDRESS
} from '@/constants/contracts';
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
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmountEstimate, setToAmountEstimate] = useState<string>('');
  
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [tokenMetadata, setTokenMetadata] = useState<Record<string, {symbol: string, decimals: number}>>({});

  const [allowance, setAllowance] = useState<BigNumber>(BigNumber.from(0));
  const [isLoading, setIsLoading] = useState<boolean>(false); // General loading for swap tx
  const [isFetchingEstimate, setIsFetchingEstimate] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [needsApproval, setNeedsApproval] = useState<boolean>(false);

  const { toast } = useToast();
  // const provider = useEthersProvider(); // Use provider for read-only calls where possible
  // const signer = useEthersSigner();
  // const userAddress = useUserAddress();

  // --- AA Hooks Integration ---
  const { AAaddress: userAddress, isConnected, signer: aaSignerDetails } = useSignature(); // Renamed AAaddress to userAddress for consistency
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
    const ACTUAL_TESTNET_RPC_URL = 'https://rpc-testnet.nerochain.io'; // Defined as in stake page
    return new ethers.providers.JsonRpcProvider(configRpcUrl || ACTUAL_TESTNET_RPC_URL); 
  }, [eoaSigner, configRpcUrl]);
  
  const provider = getProvider(); // Provider for read-only calls
  // --- End of AA Hooks Integration ---

  const debouncedFromAmount = useDebounce(fromAmount, 500); // Debounce for 500ms

  const fromTokenInfo = useMemo(() => {
    const metadata = tokenMetadata[fromToken.address];
    return {
      ...fromToken,
      symbol: metadata?.symbol || 'Token',
      decimals: metadata?.decimals || 18,
    };
  }, [fromToken, tokenMetadata]);

  const toTokenInfo = useMemo(() => {
    const metadata = tokenMetadata[toToken.address];
    return {
      ...toToken,
      symbol: metadata?.symbol || 'Token',
      decimals: metadata?.decimals || 18,
    };
  }, [toToken, tokenMetadata]);

  const fromTokenBalance = tokenBalances[fromTokenInfo.address] || '0';
  const toTokenBalance = tokenBalances[toTokenInfo.address] || '0';
  
  // Fetch Token Metadata (Symbol & Decimals)
  const fetchTokenMetadata = useCallback(async (tokenAddress: string) => {
    const currentProvider = getProvider(); // Use getProvider
    if (!currentProvider || tokenMetadata[tokenAddress]) {
      // console.log(`[SwapPage] fetchTokenMetadata: Skipping ${tokenAddress}, provider missing or metadata already fetched.`);
      return; 
    }
    console.log(`[SwapPage] fetchTokenMetadata: Fetching metadata for ${tokenAddress}`);
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, currentProvider);
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();
      console.log(`[SwapPage] fetchTokenMetadata: Fetched for ${tokenAddress}`, { symbol, decimals });
      setTokenMetadata(prev => ({ ...prev, [tokenAddress]: { symbol, decimals } }));
    } catch (error) {
      console.error(`[SwapPage] Failed to fetch metadata for ${tokenAddress}:`, error);
      setTokenMetadata(prev => ({ ...prev, [tokenAddress]: { symbol: 'UNKN', decimals: 18 } })); // Fallback
    }
  }, [getProvider, tokenMetadata]);

  useEffect(() => {
    fetchTokenMetadata(APP_WNERO_ADDRESS);
    fetchTokenMetadata(APP_STNERO_ADDRESS);
  }, [fetchTokenMetadata]);

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!userAddress || userAddress === '0x' || !fromTokenInfo.decimals || !toTokenInfo.decimals) return; // Changed from signer to userAddress
    // setIsLoading(true); // Indicate general loading for balances - Moved to a more granular control if needed
    const currentProvider = getProvider(); // Use the dynamic provider
    if (!currentProvider) {
        toast({ title: "Provider Error", description: "Cannot fetch balances, provider not available.", variant: "destructive" });
        return;
    }

    try {
      const tokensToFetch = [fromTokenInfo, toTokenInfo];
      const newBalances: Record<string, string> = {};
      for (const token of tokensToFetch) {
        if (token.address && token.decimals) {
            const contract = new ethers.Contract(token.address, ERC20_ABI, currentProvider);
            const balanceBN = await contract.balanceOf(userAddress);
            newBalances[token.address] = ethers.utils.formatUnits(balanceBN, token.decimals);
        }
      }
      setTokenBalances(prev => ({...prev, ...newBalances}));
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      toast({ title: "Error", description: "Failed to fetch token balances.", variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, fromTokenInfo, toTokenInfo, toast, getProvider, tokenMetadata]); // Added getProvider, tokenMetadata, changed signer to userAddress

  useEffect(() => {
    if(userAddress && userAddress !== '0x' && fromTokenInfo.decimals && toTokenInfo.decimals) { // Ensure decimals are loaded and userAddress is valid
        fetchBalances();
    }
  }, [userAddress, fetchBalances, fromTokenInfo.decimals, toTokenInfo.decimals]);

  // Get exchange rate / estimate output (uses debounced amount)
  useEffect(() => {
    const getEstimate = async () => {
      console.log("[SwapPage] Attempting to get estimate..."); 
      const currentProvider = getProvider();

      const fromTokenMeta = tokenMetadata[fromTokenInfo.address];
      const toTokenMeta = tokenMetadata[toTokenInfo.address];

      if (!debouncedFromAmount || parseFloat(debouncedFromAmount) <= 0 || !currentProvider || !fromTokenMeta || !toTokenMeta) {
        setToAmountEstimate('');
        console.log("[SwapPage] GetEstimate returning early. Conditions:", { 
          hasDebouncedAmount: !!debouncedFromAmount && parseFloat(debouncedFromAmount) > 0,
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
        const routerContract = new ethers.Contract(APP_UNISWAP_ROUTER_ADDRESS, UNISWAP_V2_ROUTER_ABI, currentProvider);
        
        console.log("[SwapPage] Parsing amountIn with:", { 
          amount: debouncedFromAmount,
          decimals: fromTokenInfo.decimals 
        });
        const amountIn = ethers.utils.parseUnits(debouncedFromAmount, fromTokenInfo.decimals);
        let path: string[] = [fromTokenInfo.address, toTokenInfo.address];
        if (fromTokenInfo.address === APP_WNERO_ADDRESS && toTokenInfo.address === APP_STNERO_ADDRESS) {
          path = [APP_WNERO_ADDRESS, APP_STNERO_ADDRESS];
        } else if (fromTokenInfo.address === APP_STNERO_ADDRESS && toTokenInfo.address === APP_WNERO_ADDRESS) {
          path = [APP_STNERO_ADDRESS, APP_WNERO_ADDRESS];
        }
        console.log("[SwapPage] Calling getAmountsOut with:", { 
          amountInFormatted: amountIn.toString(), 
          path, 
          fromTokenAddress: fromTokenInfo.address, 
          toTokenAddress: toTokenInfo.address 
        }); 

        const amountsOut = await routerContract.getAmountsOut(amountIn, path);
        console.log("[SwapPage] Received amountsOut:", amountsOut && amountsOut.map((a: BigNumber) => a.toString())); 

        setToAmountEstimate(ethers.utils.formatUnits(amountsOut[1], toTokenInfo.decimals));
      } catch (error) {
        console.error("[SwapPage] Failed to get amount out estimate:", error); 
        setToAmountEstimate('');
      } finally {
        setIsFetchingEstimate(false);
      }
    };

    // Ensure fromTokenInfo and toTokenInfo have addresses before attempting to get an estimate
    if (fromTokenInfo.address && toTokenInfo.address && fromTokenInfo.decimals && toTokenInfo.decimals) { // also check decimals are loaded
        console.log("[SwapPage] useEffect for getEstimate triggered. DebouncedFromAmount:", debouncedFromAmount, "FromToken:", fromTokenInfo.symbol, "ToToken:", toTokenInfo.symbol);
        getEstimate();
    } else {
        console.log("[SwapPage] useEffect for getEstimate: fromToken or toToken address/decimals missing, clearing estimate.", {fromAddress: fromTokenInfo.address, toAddress: toTokenInfo.address, fromDec: fromTokenInfo.decimals, toDec: toTokenInfo.decimals });
      setToAmountEstimate('');
    }
  }, [debouncedFromAmount, fromTokenInfo, toTokenInfo, getProvider, tokenMetadata]);

  // Check allowance (uses debounced amount)
  useEffect(() => {
    const checkAllowance = async () => {
      const currentProvider = getProvider(); // Use the dynamic provider
      if (!currentProvider || !userAddress || userAddress === '0x' || !debouncedFromAmount || parseFloat(debouncedFromAmount) <= 0 || !fromTokenInfo.decimals) {
        setNeedsApproval(false);
        return;
      }
      // No approval needed for native token (though WNERO is ERC20, this logic is for future native integration)
      if (fromTokenInfo.address === ethers.constants.AddressZero) { 
        setNeedsApproval(false);
        return;
      }
      try {
        const tokenContract = new ethers.Contract(fromTokenInfo.address, ERC20_ABI, currentProvider);
        const currentAllowance = await tokenContract.allowance(userAddress, APP_UNISWAP_ROUTER_ADDRESS);
        setAllowance(currentAllowance);
        const amountInBN = ethers.utils.parseUnits(debouncedFromAmount, fromTokenInfo.decimals);
        setNeedsApproval(currentAllowance.lt(amountInBN));
      } catch (error) {
        console.error("Failed to check allowance:", error);
        setNeedsApproval(true); 
      }
    };
    checkAllowance();
  }, [userAddress, fromTokenInfo, debouncedFromAmount, getProvider]); // Added getProvider, changed signer to userAddress


  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
    setFromAmount(''); 
    setToAmountEstimate('');
    setNeedsApproval(false); 
  };

  const handleApprove = async () => {
    if (!eoaSigner || !userAddress || userAddress === '0x' || !fromAmount || parseFloat(fromAmount) <= 0 || !fromTokenInfo.decimals) {
        toast({ title: "Invalid Input", description: "Please connect wallet, ensure AA address is available, and amount is valid.", variant: 'destructive' });
        return;
    }

    // Defensive check for fromTokenInfo.address using ethers.utils.isAddress
    if (!fromTokenInfo.address || !ethersUtils.isAddress(fromTokenInfo.address)) {
        console.error("[SwapPage] handleApprove: fromTokenInfo.address is invalid or undefined! Address:", fromTokenInfo.address);
        toast({ title: "Token Error", description: `Invalid or missing From token address: ${fromTokenInfo.address || 'undefined'}. Please select a valid token.`, variant: 'destructive' });
        setIsApproving(false);
        return;
    }
    console.log("[SwapPage] handleApprove: fromTokenInfo details (address validated):", fromTokenInfo);

    setIsApproving(true);
    setUserOpHash(null); 
    setTxStatus(''); 
    setCurrentAction(null);

    try {
      const userOpPayload = {
        target: fromTokenInfo.address,
        abi: ERC20_ABI,
        functionName: "approve",
        params: [
          APP_UNISWAP_ROUTER_ADDRESS,
          ethers.constants.MaxUint256,
        ],
        value: BigInt(0),
      };
      
      toast({ title: "Approval UserOp", description: "Preparing approval transaction..." });
      const userOpResult = await executeUserOp(userOpPayload as any);

      if (userOpResult?.error) {
        // Handle error returned from executeUserOp itself
        console.error("[SwapPage] Approval UserOp failed directly:", userOpResult.error);
        toast({ title: "Approval Failed", description: userOpResult.error, variant: 'destructive' });
        setIsApproving(false);
        return; // Stop further processing
      }

      if (userOpResult?.userOpHash && !userOpResult.userOpHash.startsWith('ERROR')) { // Check for valid hash
        setUserOpHash(userOpResult.userOpHash);
        setCurrentAction('approve');
        setIsPollingStatus(true);
        toast({ title: "Approval Sent", description: `UserOp Hash: ${userOpResult.userOpHash}. Waiting for confirmation...` });
      } else {
        // Handle cases where hash is missing or is an error placeholder
        const errorMsg = userOpResult?.userOpHash || "Failed to send approval UserOperation or UserOpHash not received.";
        console.error("[SwapPage] Approval UserOp issue:", errorMsg);
        toast({ title: "Approval Problem", description: errorMsg, variant: 'destructive' });
        setIsApproving(false);
      }

    } catch (error: any) {
      console.error("Approval UserOp caught exception:", error);
      toast({ title: "Approval Exception", description: error.reason || error.message || "Could not approve token via UserOp.", variant: 'destructive' });
      setIsApproving(false);
    } 
  };

  const handleSwap = async () => {
    if (!eoaSigner || !userAddress || userAddress === '0x' || !fromAmount || parseFloat(fromAmount) <= 0 || !fromTokenInfo.decimals || !toTokenInfo.decimals || !toAmountEstimate) {
        toast({ title: "Invalid Input", description: "Please connect wallet, ensure AA address and amounts are valid, and estimate is available.", variant: 'destructive' });
        return;
    }
    if (needsApproval) {
        toast({ title: "Approval Required", description: `Please approve ${fromTokenInfo.symbol} spending first.`, variant: 'default' });
        return;
    }

    setIsLoading(true);
    setUserOpHash(null); 
    setTxStatus(''); 
    setCurrentAction(null);

    try {
      const amountIn = ethers.utils.parseUnits(fromAmount, fromTokenInfo.decimals);
      const estimatedOut = ethers.utils.parseUnits(toAmountEstimate, toTokenInfo.decimals);
      
      const slippageBps = BigNumber.from(50);
      const amountOutMin = estimatedOut.sub(estimatedOut.mul(slippageBps).div(BigNumber.from(10000)));

      if (amountOutMin.isNegative() || amountOutMin.isZero()) {
        toast({ title: "Error", description: "Calculated minimum output amount is too low. Try a larger amount or check slippage.", variant: "destructive"});
      setIsLoading(false);
      return;
    }

      const path = [fromTokenInfo.address, toTokenInfo.address];
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      
      const userOpPayload = {
        target: APP_UNISWAP_ROUTER_ADDRESS,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: "swapExactTokensForTokens",
        params: [
          amountIn,
          amountOutMin,
          path,
          userAddress,
          deadline
        ],
        value: BigInt(0),
      };

      toast({ title: "Swap UserOp", description: "Preparing swap transaction..." });
      const userOpResult = await executeUserOp(userOpPayload as any);

      if (userOpResult?.error) {
        // Handle error returned from executeUserOp itself
        console.error("[SwapPage] Swap UserOp failed directly:", userOpResult.error);
        toast({ title: "Swap Failed", description: userOpResult.error, variant: 'destructive' });
        setIsLoading(false);
        return; // Stop further processing
      }

      if (userOpResult?.userOpHash && !userOpResult.userOpHash.startsWith('ERROR')) { // Check for valid hash
        setUserOpHash(userOpResult.userOpHash);
        setCurrentAction('swap');
        setIsPollingStatus(true);
        toast({ title: "Swap Sent", description: `UserOp Hash: ${userOpResult.userOpHash}. Waiting for confirmation...` });
      } else {
         // Handle cases where hash is missing or is an error placeholder
        const errorMsg = userOpResult?.userOpHash || "Failed to send swap UserOperation or UserOpHash not received.";
        console.error("[SwapPage] Swap UserOp issue:", errorMsg);
        toast({ title: "Swap Problem", description: errorMsg, variant: 'destructive' });
        setIsLoading(false);
      }
      
    } catch (error: any) {
      console.error("Swap UserOp caught exception:", error);
      let errorMsg = "An unknown error occurred during swap.";
      if (error.reason) errorMsg = error.reason;
      else if (error.data?.message) errorMsg = error.data.message;
      else if (error.message) errorMsg = error.message;
      toast({ title: "Swap Exception", description: errorMsg, variant: 'destructive' });
      setIsLoading(false);
    }
  };
  
  // --- Add state for UserOp polling (mirroring stake page) ---
  const [userOpHash, setUserOpHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string>('');
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'swap' | null>(null);
  // --- End of UserOp polling state ---

  // --- Add useEffect for UserOp polling (mirroring stake page, simplified for approve/swap) ---
  useEffect(() => {
    let intervalId: number | null = null;
    const pollStatus = async () => {
      if (!userOpHash || !isPollingStatus || !currentAction) return;
      try {
        setTxStatus(`Confirming ${currentAction}... UserOp: ${userOpHash.substring(0,10)}...`);
        const statusResult = await checkUserOpStatus(userOpHash);
        let successful = false;
        let failed = false;

        if (typeof statusResult === 'boolean') {
          if (statusResult === true) successful = true;
        } else if (statusResult && typeof statusResult === 'object') {
          if ((statusResult as any).mined === true || (statusResult as any).executed === true) successful = true;
          else if ((statusResult as any).failed === true) failed = true;
        }

        if (successful) {
          toast({ title: `${currentAction === 'approve' ? 'Approval' : 'Swap'} Successful!`, description: `UserOp ${userOpHash} confirmed.` });
          setTxStatus(`${currentAction === 'approve' ? 'Approval' : 'Swap'} successful!`);
          setIsPollingStatus(false);
          if (sendUserOpCtx) sendUserOpCtx.setIsWalletPanel(false); // Example context usage
          if (paymasterCtx) paymasterCtx.clearToken(); // Example context usage
          
          if (currentAction === 'approve') {
            // Force re-check allowance
            // Slight delay to allow state to propagate on-chain if necessary
            setTimeout(async () => {
                const currentProvider = getProvider();
                if (currentProvider && userAddress && userAddress !== '0x' && fromTokenInfo.decimals) {
                    const tokenContract = new ethers.Contract(fromTokenInfo.address, ERC20_ABI, currentProvider);
                    const newAllowance = await tokenContract.allowance(userAddress, APP_UNISWAP_ROUTER_ADDRESS);
                    setAllowance(newAllowance);
                    const amountInBN = ethers.utils.parseUnits(debouncedFromAmount || "0", fromTokenInfo.decimals);
                    setNeedsApproval(newAllowance.lt(amountInBN));
                }
                setIsApproving(false); // Reset approving state
            }, 1000);
          } else if (currentAction === 'swap') {
            fetchBalances();
            setFromAmount('');
            setIsLoading(false); // Reset loading state
          }
          setUserOpHash(null);
          setCurrentAction(null);
        } else if (failed) {
          toast({ title: `${currentAction === 'approve' ? 'Approval' : 'Swap'} Failed`, description: `UserOp ${userOpHash} failed.`, variant: 'destructive' });
          setTxStatus(`${currentAction === 'approve' ? 'Approval' : 'Swap'} failed.`);
          setIsPollingStatus(false);
          if (currentAction === 'approve') setIsApproving(false);
          if (currentAction === 'swap') setIsLoading(false);
          setCurrentAction(null);
        } else {
          setTxStatus(`UserOp submitted (${userOpHash.substring(0,10)}...), awaiting confirmation...`);
        }
      } catch (error) {
        console.error(`[SwapPage] Error polling ${currentAction} status for UserOpHash ${userOpHash}:`, error);
        toast({ title: "Polling Error", description: `Error polling ${currentAction} status.`, variant: 'destructive' });
        setTxStatus(`Error polling ${currentAction} status.`);
        setIsPollingStatus(false);
        if (currentAction === 'approve') setIsApproving(false);
        if (currentAction === 'swap') setIsLoading(false);
        setCurrentAction(null);
      }
    };

    if (userOpHash && isPollingStatus && currentAction) {
      intervalId = window.setInterval(pollStatus, 5000) as unknown as number;
      pollStatus(); // Initial call
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [userOpHash, isPollingStatus, checkUserOpStatus, currentAction, sendUserOpCtx, paymasterCtx, fetchBalances, getProvider, userAddress, fromTokenInfo, debouncedFromAmount, toast]);
  // --- End of UserOp polling useEffect ---


  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center px-4 md:px-6">
      <Card className="shadow-lg w-full max-w-md">
        <CardHeader>
            <div className="flex justify-between items-center">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Repeat2 className="h-6 w-6 text-primary" />
            Swap Tokens
          </CardTitle>
                {/* <ConnectButton showBalance={false} accountStatus="address" /> */}
            </div>
          <CardDescription className="flex items-center justify-between">
            <span>Exchange {fromTokenInfo.symbol} for {toTokenInfo.symbol} seamlessly.</span>
             <Button variant="ghost" size="icon" onClick={fetchBalances} className="h-7 w-7" title="Refresh balances" disabled={isLoading || isApproving || !isConnected || !userAddress || userAddress === '0x'}>
                <RotateCcw className="h-4 w-4" />
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <Label htmlFor="from-amount">From: {fromTokenInfo.symbol}</Label>
              <span className="text-sm text-muted-foreground">
                Balance: {tokenBalances[fromTokenInfo.address] ? parseFloat(tokenBalances[fromTokenInfo.address]!).toFixed(4) : '0.0000'}
              </span>
            </div>
            <div className="relative">
              <Input
                id="from-amount"
                type="text"
                placeholder="0.0"
                value={fromAmount}
                onChange={handleAmountChange}
                className="pr-16 text-lg"
                inputMode="decimal"
                disabled={!isConnected || !userAddress || userAddress === '0x' || !fromTokenInfo.decimals || isLoading || isApproving}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                disabled={!isConnected || !userAddress || userAddress === '0x' || !fromTokenInfo.decimals || isLoading || isApproving}
              >
                Max
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" size="icon" onClick={handleSwitchTokens} aria-label="Switch tokens" disabled={!isConnected || !fromTokenInfo.decimals || !toTokenInfo.decimals || isLoading || isApproving}>
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <Label htmlFor="to-amount">To: {toTokenInfo.symbol}</Label>
               <span className="text-sm text-muted-foreground">
                Balance: {tokenBalances[toTokenInfo.address] ? parseFloat(tokenBalances[toTokenInfo.address]!).toFixed(4) : '0.0000'}
              </span>
            </div>
            <Input
              id="to-amount"
              type="text"
              readOnly
              placeholder="0.0"
              value={isFetchingEstimate ? "Fetching..." : (toAmountEstimate ? `≈ ${parseFloat(toAmountEstimate).toFixed(4)}` : '0.0')}
              className="bg-muted border-muted cursor-not-allowed text-lg"
            />
          </div>
          
          {toAmountEstimate && parseFloat(fromAmount) > 0 && !isFetchingEstimate && (
          <p className="text-xs text-muted-foreground text-center">
              1 {fromTokenInfo.symbol} ≈ {(parseFloat(toAmountEstimate) / parseFloat(fromAmount)).toFixed(4)} {toTokenInfo.symbol}
          </p>
          )}
          {isFetchingEstimate && <p className="text-xs text-muted-foreground text-center">Fetching best price...</p>}

        </CardContent>
        <CardFooter className="flex flex-col gap-2">
           {needsApproval && userAddress && userAddress !== '0x' && fromTokenInfo.address !== ethers.constants.AddressZero && (
            <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleApprove}
                disabled={isApproving || isLoading || !isConnected || !userAddress || userAddress === '0x' || !fromAmount || parseFloat(fromAmount) <=0 || !fromTokenInfo.decimals || isPollingStatus}
            >
                {isApproving ? `Approving (${currentAction === 'approve' && userOpHash ? userOpHash.substring(0,6) + '...' : 'Processing...' })` : `Approve ${fromTokenInfo.symbol} Spending`}
            </Button>
           )}
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSwap}
            disabled={isLoading || isApproving || needsApproval || !isConnected || !userAddress || userAddress === '0x' || !fromAmount || parseFloat(fromAmount) <= 0 || isNaN(parseFloat(fromAmount)) || !toAmountEstimate || !fromTokenInfo.decimals || isPollingStatus}
          >
            {isLoading ? `Swapping (${currentAction === 'swap' && userOpHash ? userOpHash.substring(0,6) + '...' : 'Processing...' })` : (currentAction === 'swap' && isPollingStatus ? `Confirming Swap...` : `Swap ${fromTokenInfo.symbol}`)}
          </Button>
          {txStatus && <p className="text-xs text-muted-foreground text-center pt-2">{txStatus}</p>}
          {!isConnected && <p className="text-xs text-destructive text-center">Please connect your wallet to swap.</p>}
          {isConnected && (!userAddress || userAddress === '0x') && <p className="text-xs text-destructive text-center">AA Wallet address not available. Ensure your wallet is fully connected and configured.</p>}
        </CardFooter>
      </Card>
    </div>
  );
}
