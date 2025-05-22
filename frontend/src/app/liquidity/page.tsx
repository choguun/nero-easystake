'use client';

import React, { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react';
import { ethers, utils as ethersUtils, BigNumber } from 'ethers';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, PlusCircle, MinusCircle, Percent, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { useSignature, useSendUserOp, useConfig, useEthersSigner } from '@/hooks';
import {
  UserOperationResultInterface,
  UserOperation,
} from '@/types';
import {
  UNISWAP_V2_ROUTER_ABI,
  ERC20_ABI,
  WETH_ABI,
  UNISWAP_V2_PAIR_ABI,
} from '@/constants/abi';
import {
  NERO_ADDRESS, // Assuming NERO is native, WNERO will be used for ERC20 operations
  STNERO_ADDRESS,
  WNERO_ADDRESS,
  UNISWAP_ROUTER_ADDRESS,
  WNERO_STNERO_PAIR_ADDRESS, // Added import for the actual pair address
  // UNISWAP_FACTORY_ADDRESS, // May not be needed directly
  // NERO_STNERO_PAIR_ADDRESS, // LP token address for NERO/stNERO
} from '@/constants/contracts'; // TODO: Create this file and add addresses
import { formatUnitsSafe, parseUnitsSafe } from '@/utils/formatUnits'; // TODO: Create this utility
import { TokenIcon } from '@/components/features/token'; // Assuming this component exists

// TODO: Define these addresses in @/constants/contracts.ts
// const MOCK_NERO_STNERO_PAIR_ADDRESS = '0xPairAddressHere'; // Removed mock placeholder

const DEFAULT_SLIPPAGE_TOLERANCE = 0.5; // 0.5%
const DEADLINE_MINUTES = 20; // 20 minutes from now

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  allowance?: string;
  logoURI?: string;
  isNative?: boolean;
}

export default function LiquidityPage() {
  const { toast } = useToast();
  const { AAaddress, isConnected, signer: aaSignerDetails } = useSignature();
  const { execute, checkUserOpStatus, latestUserOpResult } = useSendUserOp();
  const { rpcUrl, chainId } = useConfig();
  const provider = useEthersSigner()?.provider;

  // UI State
  const [activeTab, setActiveTab] = useState('add');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userOpHash, setUserOpHash] = useState<string | null>(null);
  const [txStatusMessage, setTxStatusMessage] = useState<string>('');

  // Token Info State
  const [tokenAInfo, setTokenAInfo] = useState<TokenInfo | null>(null); // NERO / WNERO
  const [tokenBInfo, setTokenBInfo] = useState<TokenInfo | null>(null); // stNERO
  const [lpTokenInfo, setLpTokenInfo] = useState<TokenInfo | null>(null);

  // Pool State for Add Liquidity
  const [pairToken0Address, setPairToken0Address] = useState<string | null>(null);
  const [poolReserveA, setPoolReserveA] = useState<BigNumber>(BigNumber.from(0)); // Corresponds to tokenAInfo
  const [poolReserveB, setPoolReserveB] = useState<BigNumber>(BigNumber.from(0)); // Corresponds to tokenBInfo
  const [poolLpTotalSupply, setPoolLpTotalSupply] = useState<BigNumber>(BigNumber.from(0));
  const [isCalculating, setIsCalculating] = useState(false); // To prevent recursive updates

  // Add Liquidity State
  const [addAmountA, setAddAmountA] = useState<string>('');
  const [addAmountB, setAddAmountB] = useState<string>('');
  // const [estimatedLpReceived, setEstimatedLpReceived] = useState<string>(''); // Will calculate this

  // Remove Liquidity State
  const [removeLpPercent, setRemoveLpPercent] = useState<number[]>([50]);
  const [removeLpAmount, setRemoveLpAmount] = useState<string>('');
  const [estimatedTokenAReceived, setEstimatedTokenAReceived] = useState<string>('');
  const [estimatedTokenBReceived, setEstimatedTokenBReceived] = useState<string>('');

  // TODO: Replace mock balances and calculations with actual on-chain data fetching and estimations
  // For now, keeping some of the old mock structure for layout placeholders
  const MOCK_NERO_BALANCE = parseFloat(tokenAInfo?.balance || '0');
  const MOCK_STNERO_BALANCE = parseFloat(tokenBInfo?.balance || '0');
  const MOCK_LP_TOKEN_BALANCE = parseFloat(lpTokenInfo?.balance || '0');

  // --- Helper Functions (to be implemented or expanded) ---
  const getDeadline = () => Math.floor(Date.now() / 1000) + DEADLINE_MINUTES * 60;

  const fetchTokenMetadataAndBalance = useCallback(async (tokenAddress: string, isNative?: boolean): Promise<TokenInfo | null> => {
    if (!provider || !AAaddress) return null;
    console.log(`[LiquidityPage] fetchTokenMetadataAndBalance called for ${tokenAddress}${isNative ? " (Native)" : ""}. AAaddress: ${AAaddress}, Provider exists: ${!!provider}`);
    try {
      if (isNative) {
        console.log(`[LiquidityPage] Fetching native balance for ${AAaddress}`);
        const balance = await provider.getBalance(AAaddress);
        const tokenInfo = {
          address: NERO_ADDRESS, // Special address for native NERO
          name: 'Nero', // Native token name
          symbol: 'NERO', // Native token symbol
          decimals: 18, // Native token decimals
          balance: ethersUtils.formatEther(balance),
          logoURI: '/logo.png', // Placeholder
        };
        console.log(`[LiquidityPage] Fetched native token info for ${tokenAddress}:`, tokenInfo);
        return tokenInfo;
      }
      console.log(`[LiquidityPage] Creating contract instance for ERC20 token: ${tokenAddress}`);
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      console.log(`[LiquidityPage] Fetching name, symbol, decimals, balance for ${tokenAddress} for account ${AAaddress}`);
      const [name, symbol, decimals, balance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.balanceOf(AAaddress),
      ]);
      const tokenInfo = {
        address: tokenAddress,
        name,
        symbol,
        decimals,
        balance: ethersUtils.formatUnits(balance, decimals),
        logoURI: '' // Fetch or use a default/placeholder
      };
      console.log(`[LiquidityPage] Fetched ERC20 token info for ${tokenAddress}:`, tokenInfo);
      return tokenInfo;
    } catch (error) {
      console.error(`[LiquidityPage] Error in fetchTokenMetadataAndBalance for ${tokenAddress}:`, error);
      toast({ title: 'Data Fetch Error', description: `Could not load details for token ${tokenAddress}`, variant: 'destructive' });
      return null;
    }
  }, [provider, AAaddress, toast]);

    const fetchAllowance = useCallback(async (tokenAddress: string, owner: string, spender: string, decimals: number): Promise<string> => {
        if (!provider) {
            console.log(`[LiquidityPage] fetchAllowance: Provider not available for ${tokenAddress}.`);
            return '0';
        }
        console.log(`[LiquidityPage] fetchAllowance called for token: ${tokenAddress}, owner: ${owner}, spender: ${spender}, decimals: ${decimals}`);
        try {
            const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
            console.log(`[LiquidityPage] Fetching allowance for ${tokenAddress} from ${owner} to ${spender}`);
            const allowance = await contract.allowance(owner, spender);
            const formattedAllowance = ethersUtils.formatUnits(allowance, decimals);
            console.log(`[LiquidityPage] Fetched allowance for ${tokenAddress}: ${formattedAllowance}`);
            return formattedAllowance;
        } catch (error) {
            console.error(`[LiquidityPage] Error in fetchAllowance for ${tokenAddress}:`, error);
            toast({ title: 'Allowance Fetch Error', description: `Could not load allowance for ${tokenAddress}`, variant: 'destructive' });
            return '0';
        }
    }, [provider, toast]);

  // --- Initial Data Fetching ---
  useEffect(() => {
    console.log('[LiquidityPage] useEffect triggered. Dependencies:', { isConnected, AAaddress, providerExists: !!provider });
    const init = async () => {
      console.log('[LiquidityPage] init() called.');
      if (isConnected && AAaddress && provider) {
        setIsLoading(true);
        console.log('[LiquidityPage] Starting initial token data fetching process...');
        
        const wneroDataPromise = fetchTokenMetadataAndBalance(WNERO_ADDRESS);
        const stneroDataPromise = fetchTokenMetadataAndBalance(STNERO_ADDRESS);
        const lpDataPromise = fetchTokenMetadataAndBalance(WNERO_STNERO_PAIR_ADDRESS);
        
        console.log('[LiquidityPage] Awaiting all token metadata and balance promises...');
        const [wneroData, stneroData, lpData] = await Promise.all([wneroDataPromise, stneroDataPromise, lpDataPromise]);
        console.log('[LiquidityPage] All token metadata and balance promises resolved:', { wneroData, stneroData, lpData });

        if (wneroData) {
            console.log('[LiquidityPage] WNERO data received, fetching allowance...');
            wneroData.allowance = await fetchAllowance(WNERO_ADDRESS, AAaddress, UNISWAP_ROUTER_ADDRESS, wneroData.decimals);
            setTokenAInfo(wneroData);
            console.log('[LiquidityPage] WNERO data and allowance set to state:', wneroData);
        } else {
            console.warn('[LiquidityPage] No WNERO data received from fetchTokenMetadataAndBalance.');
            setTokenAInfo(null); // Explicitly set to null if no data
        }
        if (stneroData) {
            console.log('[LiquidityPage] STNERO data received, fetching allowance...');
            stneroData.allowance = await fetchAllowance(STNERO_ADDRESS, AAaddress, UNISWAP_ROUTER_ADDRESS, stneroData.decimals);
            setTokenBInfo(stneroData);
            console.log('[LiquidityPage] STNERO data and allowance set to state:', stneroData);
        } else {
            console.warn('[LiquidityPage] No STNERO data received from fetchTokenMetadataAndBalance.');
            setTokenBInfo(null); // Explicitly set to null
        }

        if (lpData) {
            console.log('[LiquidityPage] LP token data received, fetching allowance...');
            lpData.allowance = await fetchAllowance(WNERO_STNERO_PAIR_ADDRESS, AAaddress, UNISWAP_ROUTER_ADDRESS, lpData.decimals);
            setLpTokenInfo(lpData);
            console.log('[LiquidityPage] LP token data and allowance set to state:', lpData);
            
            if (provider) {
                console.log('[LiquidityPage] Provider exists, fetching LP token total supply for pair:', WNERO_STNERO_PAIR_ADDRESS);
                try {
                    const lpContract = new ethers.Contract(WNERO_STNERO_PAIR_ADDRESS, UNISWAP_V2_PAIR_ABI, provider);
                    const totalSupply = await lpContract.totalSupply();
                    setPoolLpTotalSupply(totalSupply);
                    console.log('[LiquidityPage] LP Token Total Supply fetched successfully:', totalSupply.toString());
                } catch (error) {
                    console.error("[LiquidityPage] Error fetching LP token total supply:", error);
                    toast({ title: 'LP Data Error', description: 'Could not load LP token total supply.', variant: 'destructive' });
                    setPoolLpTotalSupply(BigNumber.from(0));
                }
            } else {
                 console.warn('[LiquidityPage] Provider not available for fetching LP total supply when LP data was present.');
            }
        } else {
            console.warn('[LiquidityPage] No LP token data received. Resetting LP total supply and info.');
            setLpTokenInfo(null); // Explicitly set to null
            setPoolLpTotalSupply(BigNumber.from(0));
        }

        // Fetch pair reserves
        console.log('[LiquidityPage] Checking conditions for fetching pair reserves:', {
            pairAddress: WNERO_STNERO_PAIR_ADDRESS,
            hasProvider: !!provider,
            hasWneroData: !!wneroData, // Log the actual data for check
            hasStneroData: !!stneroData, // Log the actual data for check
        });
        if (WNERO_STNERO_PAIR_ADDRESS && provider && wneroData && stneroData) { // Ensure wneroData & stneroData are truthy
          try {
            console.log('[LiquidityPage] Conditions met. Attempting to fetch reserves from pair:', WNERO_STNERO_PAIR_ADDRESS);
            const pairContract = new ethers.Contract(WNERO_STNERO_PAIR_ADDRESS, UNISWAP_V2_PAIR_ABI, provider);
            const rawReserves = await pairContract.getReserves();
            console.log('[LiquidityPage] Raw reserves fetched:', { reserve0: rawReserves[0].toString(), reserve1: rawReserves[1].toString() }); // Access by index
            const t0Address = await pairContract.token0();
            console.log('[LiquidityPage] Pair token0 fetched:', t0Address);
            setPairToken0Address(t0Address);
            
            let finalReserveA = BigNumber.from(0);
            let finalReserveB = BigNumber.from(0);

            if (t0Address.toLowerCase() === WNERO_ADDRESS.toLowerCase()) {
              finalReserveA = rawReserves[0]; // reserve0
              finalReserveB = rawReserves[1]; // reserve1
              console.log('[LiquidityPage] Pool Reserves ALIGNED (WNERO/Token0, STNERO/Token1):', finalReserveA.toString(), finalReserveB.toString());
            } else if (t0Address.toLowerCase() === STNERO_ADDRESS.toLowerCase()) {
              finalReserveA = rawReserves[1]; // WNERO is token1 in pair
              finalReserveB = rawReserves[0]; // STNERO is token0 in pair
              console.log('[LiquidityPage] Pool Reserves ALIGNED (STNERO/Token0, WNERO/Token1):', finalReserveA.toString(), finalReserveB.toString());
            } else {
                const t1Address = await pairContract.token1();
                console.warn("[LiquidityPage] Pair tokens don't match WNERO/STNERO. WNERO:", WNERO_ADDRESS, "STNERO:", STNERO_ADDRESS, "Pair t0:", t0Address, "Pair t1:", t1Address );
            }
            setPoolReserveA(finalReserveA);
            setPoolReserveB(finalReserveB);
            console.log('[LiquidityPage] Pair reserves set to state.');
          } catch (error) {
            console.error("[LiquidityPage] Error fetching pair reserves:", error);
            toast({ title: 'Pool Data Error', description: 'Could not load pool reserves.', variant: 'destructive' });
            setPoolReserveA(BigNumber.from(0));
            setPoolReserveB(BigNumber.from(0));
          }
        } else {
            console.warn('[LiquidityPage] SKIPPED reserve fetching due to unmet conditions (missing provider, pair address, or token data). Resetting reserves.');
            setPoolReserveA(BigNumber.from(0));
            setPoolReserveB(BigNumber.from(0));
        }
        setIsLoading(false);
        console.log('[LiquidityPage] Initial data fetching process complete. isLoading set to false.');
      } else {
        console.warn('[LiquidityPage] Conditions not met for initial data fetch in useEffect:', { isConnected, AAaddress, providerExists: !!provider });
        // Potentially set isLoading to false here if it was true and conditions aren't met,
        // to prevent indefinite loading state if dependencies change and conditions are still not met.
        if (isLoading) setIsLoading(false);
      }
    };

    init().catch(err => {
        console.error("[LiquidityPage] Unhandled error in init function promise chain:", err);
        setIsLoading(false); // Ensure loading is stopped on error
        toast({ title: 'Initialization Error', description: 'An unexpected error occurred while initializing the page.', variant: 'destructive' });
    });
    console.log('[LiquidityPage] useEffect execution finished.');
  }, [isConnected, AAaddress, provider, fetchTokenMetadataAndBalance, fetchAllowance, toast]); // REMOVED isLoading from dependency array


  // --- Add Liquidity Logic ---
  const handleApprove = useCallback(async (tokenInfo: TokenInfo, amount: string) => {
    if (!tokenInfo || !UNISWAP_ROUTER_ADDRESS) return;
    setIsProcessing(true);
    setTxStatusMessage(`Approving ${tokenInfo.symbol}...`);
    setUserOpHash(null);

    const amountToApprove = parseUnitsSafe(amount, tokenInfo.decimals); 
    if (!amountToApprove || amountToApprove.isZero()) {
        toast({ title: 'Invalid Amount', description: 'Approval amount must be greater than zero.', variant: 'destructive' });
        setIsProcessing(false);
        return;
    }

    try {
      const result = await execute({
        target: tokenInfo.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        params: [UNISWAP_ROUTER_ADDRESS, ethers.constants.MaxUint256], // Approve max for simplicity
        value: '0',
      });
      
      if (result.userOpHash && !result.error) {
        setUserOpHash(result.userOpHash);
        setTxStatusMessage(`Approval submitted for ${tokenInfo.symbol}. Waiting for confirmation...`);
        // TODO: Poll for status and update allowance
      } else {
        throw new Error(result.error || 'Approval failed to submit.');
      }
    } catch (error: any) {
      console.error('Approval error:', error);
      toast({ title: 'Approval Error', description: error.message, variant: 'destructive' });
      setTxStatusMessage(`Failed to approve ${tokenInfo.symbol}.`);
    } finally {
      // setIsProcessing(false); // Keep processing until tx confirmed or failed
    }
  }, [execute, toast]);

  const handleAddLiquidity = async () => {
    if (!tokenAInfo || !tokenBInfo || !UNISWAP_ROUTER_ADDRESS || !AAaddress) {
        toast({ title: 'Missing Data', description: 'Token information or router address is missing.', variant: 'destructive' });
        return;
    }
    setIsProcessing(true);
    setTxStatusMessage('Adding liquidity...');
    setUserOpHash(null);

    const amountADesired = parseUnitsSafe(addAmountA, tokenAInfo.decimals);
    const amountBDesired = parseUnitsSafe(addAmountB, tokenBInfo.decimals);

    if (!amountADesired || amountADesired.isZero() || !amountBDesired || amountBDesired.isZero()) {
        toast({ title: 'Invalid Amounts', description: 'Please enter valid amounts for both tokens.', variant: 'destructive' });
        setIsProcessing(false);
        return;
    }
    
    const slippageMultiplier = BigNumber.from(Math.floor((1 - DEFAULT_SLIPPAGE_TOLERANCE / 100) * 10000)); // e.g., 0.5% slippage -> 9950
    const slippageDivisor = BigNumber.from(10000);

    const amountAMin = amountADesired.mul(slippageMultiplier).div(slippageDivisor);
    const amountBMin = amountBDesired.mul(slippageMultiplier).div(slippageDivisor);

    // For this example, assuming TokenA is WNERO and TokenB is stNERO
    // If one token was NERO (native), we'd use addLiquidityETH
    try {
        const result = await execute({
            target: UNISWAP_ROUTER_ADDRESS,
            abi: UNISWAP_V2_ROUTER_ABI,
            functionName: 'addLiquidity',
            params: [
                tokenAInfo.address,
                tokenBInfo.address,
                amountADesired,
                amountBDesired,
                amountAMin, 
                amountBMin,
                AAaddress, 
                getDeadline(),
            ],
            value: '0',
        });

        if (result.userOpHash && !result.error) {
            setUserOpHash(result.userOpHash);
            setTxStatusMessage('Add liquidity transaction submitted. Waiting for confirmation...');
            // TODO: Poll for status, then update balances (tokenA, tokenB, LP)
        } else {
            throw new Error(result.error || 'Add liquidity failed to submit.');
        }
    } catch (error: any) {
        console.error('Add Liquidity error:', error);
        toast({ title: 'Add Liquidity Error', description: error.message, variant: 'destructive' });
        setTxStatusMessage('Failed to add liquidity.');
    } finally {
        // setIsProcessing(false);
    }
  };

  // --- Remove Liquidity Logic ---
  const handleApproveLpTokens = useCallback(async (lpAmountToRemove: BigNumber) => {
    if (!lpTokenInfo || !UNISWAP_ROUTER_ADDRESS) {
      toast({ title: 'Missing Info', description: 'LP token information or router address is not available.', variant: 'default' });
      return false;
    }
    if (lpAmountToRemove.isZero()) {
        toast({ title: 'Invalid Amount', description: 'LP amount to approve cannot be zero.', variant: 'default' });
        return false;
    }

    setIsProcessing(true);
    setTxStatusMessage(`Approving ${lpTokenInfo.symbol} for removal...`);
    setUserOpHash(null);

    try {
      const result = await execute({
        target: lpTokenInfo.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        params: [UNISWAP_ROUTER_ADDRESS, lpAmountToRemove], // Approve the exact amount to remove for now
        value: '0',
      });

      if (result.userOpHash && !result.error) {
        setUserOpHash(result.userOpHash);
        setTxStatusMessage(`Approval submitted for ${lpTokenInfo.symbol}. Waiting for confirmation...`);
        // Consider polling for tx confirmation and then updating allowance state.
        // For now, we assume the user will wait or we might proceed optimistically if tx is fast.
        // Ideally, poll and only proceed to removeLiquidity after approval confirmed.
        toast({ title: 'Approval Sent', description: `User operation ${result.userOpHash} submitted.`});
        return true; // Indicate approval was sent
      } else {
        throw new Error(result.error || 'LP Token approval failed to submit.');
      }
    } catch (error: any) {
      console.error("[LiquidityPage] LP Approval Error:", error);
      toast({ title: 'LP Approval Error', description: error.message || 'Could not submit LP approval.', variant: 'destructive' });
      setIsProcessing(false);
      return false;
    }
    // Note: setIsProcessing(false) should be handled after polling or in a finally block if awaiting confirmation here.
    // For now, it's reset on error or if the calling function handles success.
  }, [execute, toast, lpTokenInfo, AAaddress, fetchAllowance]);


  const handleRemoveLiquidity = async () => {
    if (!isConnected || !AAaddress || !tokenAInfo || !tokenBInfo || !lpTokenInfo || !provider) {
      toast({ title: 'Prerequisites Missing', description: 'Please connect your wallet and ensure all token data is loaded.', variant: 'default' });
      return;
    }

    setIsProcessing(true);
    setTxStatusMessage('Preparing to remove liquidity...');
    setUserOpHash(null);

    try {
      const lpDecimals = lpTokenInfo.decimals;
      const calculatedLpAmountToRemove = parseUnitsSafe(removeLpAmount, lpDecimals);

      if (!calculatedLpAmountToRemove || calculatedLpAmountToRemove.isZero() || poolLpTotalSupply.isZero()) {
        toast({ 
            title: 'Invalid Input', 
            description: poolLpTotalSupply.isZero() 
                ? 'Cannot calculate token amounts: LP total supply is zero (pool might be empty or data missing).' 
                : 'Please enter a valid amount of LP tokens to remove.', 
            variant: 'destructive' 
        });
        setIsProcessing(false);
        return;
      }

      const currentLpAllowance = parseUnitsSafe(lpTokenInfo.allowance || '0', lpDecimals);
      if (currentLpAllowance.lt(calculatedLpAmountToRemove)) {
        toast({ title: 'Approval Required', description: `You need to approve ${lpTokenInfo.symbol} for removal.`, variant: 'default' });
        const approvalSent = await handleApproveLpTokens(calculatedLpAmountToRemove);
        if (!approvalSent) { // If approval wasn't even submitted (e.g. user rejected, or immediate error)
          setIsProcessing(false); // Stop processing
          return;
        }
        // If approval was sent, we might want to wait here, or let the user click "Remove" again
        // For a simpler flow now, we'll ask them to try again after approval confirms.
        setTxStatusMessage('LP Token approval submitted. Please wait for confirmation and try removing again.');
        // We don't set setIsProcessing(false) here if we expect user to click again after approval.
        // Or, ideally, disable button and poll for approval. For now, simple message.
        // To make it more robust, this should poll for allowance update.
        // For now, let's allow proceeding, but it might fail if approval is not mined.
        // A better UX would be to disable the remove button until allowance is confirmed.
        // For now, let's just re-fetch allowance after attempting approval.
        // This is still not ideal as the next step might be too quick.
        // A robust solution would involve waiting for the approval transaction.

        // We will proceed for now, assuming approval will be fast or already done
        // A better approach is to wait for the approval receipt.
        // For now, let's assume the approval was for MaxUint256 or sufficient.
        // Re-fetching after sending approval op
        const newAllowance = await fetchAllowance(lpTokenInfo.address, AAaddress, UNISWAP_ROUTER_ADDRESS, lpTokenInfo.decimals);
        setLpTokenInfo(prev => prev ? {...prev, allowance: newAllowance} : null);
        if (parseUnitsSafe(newAllowance, lpTokenInfo.decimals).lt(calculatedLpAmountToRemove)) {
            toast({ title: 'Approval Processing', description: 'Approval still pending or insufficient. Please wait and try again.', variant: 'default' });
            setIsProcessing(false);
            return;
        }
      }

      // Using WNERO (tokenA) and STNERO (tokenB)
      // We want to remove liquidity to get NERO (native) and STNERO (tokenB)
      // So, stNERO is the 'token' for removeLiquidityETH
      const tokenForRouter = tokenBInfo.address; // STNERO
      const liquidityToRemove = calculatedLpAmountToRemove;

      // Calculate expected amounts before slippage
      const expectedAmountA = liquidityToRemove.mul(poolReserveA).div(poolLpTotalSupply);
      const expectedAmountB = liquidityToRemove.mul(poolReserveB).div(poolLpTotalSupply);

      const slippageMultiplier = BigNumber.from(Math.floor((1 - DEFAULT_SLIPPAGE_TOLERANCE / 100) * 10000)); // e.g., 0.5% slippage -> 9950
      const slippageDivisor = BigNumber.from(10000);

      // amountETHMin is for WNERO (tokenA), amountTokenMin is for STNERO (tokenB)
      const amountETHMin = expectedAmountA.mul(slippageMultiplier).div(slippageDivisor);
      const amountTokenMin = expectedAmountB.mul(slippageMultiplier).div(slippageDivisor);

      console.log('[RemoveLiquidity] Calculated Min Amounts:', {
        expectedWNERO: formatUnitsSafe(expectedAmountA, tokenAInfo.decimals),
        minWNERO_ETH: formatUnitsSafe(amountETHMin, tokenAInfo.decimals),
        expectedSTNERO: formatUnitsSafe(expectedAmountB, tokenBInfo.decimals),
        minSTNERO: formatUnitsSafe(amountTokenMin, tokenBInfo.decimals),
        slippageTolerance: `${DEFAULT_SLIPPAGE_TOLERANCE}%`,
      });

      const deadline = getDeadline();
      const toAddress = AAaddress;

      setTxStatusMessage('Submitting remove liquidity transaction...');

      const result = await execute({
        target: UNISWAP_ROUTER_ADDRESS,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: 'removeLiquidityETH',
        params: [
          tokenForRouter,
          liquidityToRemove,
          amountTokenMin,
          amountETHMin,
          toAddress,
          deadline,
        ],
        value: '0', // No value sent to the router for removeLiquidityETH itself
      });

      if (result.userOpHash && !result.error) {
        setUserOpHash(result.userOpHash);
        setTxStatusMessage(`Remove liquidity submitted: ${result.userOpHash}. Waiting for confirmation...`);
        toast({ title: 'Transaction Sent', description: `User operation ${result.userOpHash} submitted.`});
        // TODO: Poll for status, then update balances of NERO, STNERO, and LP tokens.
      } else {
        throw new Error(result.error || 'Remove liquidity failed to submit.');
      }
    } catch (error: any) {
      console.error("[LiquidityPage] Remove Liquidity Error:", error);
      toast({ title: 'Remove Liquidity Error', description: error.message || 'Could not submit remove liquidity transaction.', variant: 'destructive' });
    } finally {
      // setIsProcessing(false); // Should be set after polling/confirmation
    }
  };

  // --- UI Event Handlers ---
  const handleAddAmountAChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
        setAddAmountA(value);
        if (isCalculating) return; // Prevent recursive calculation
        
        console.log('[handleAddAmountAChange] Attempting calculation. Input value:', value);
        console.log('[handleAddAmountAChange] State for calculation:', {
            hasTokenAInfo: !!tokenAInfo,
            hasTokenBInfo: !!tokenBInfo,
            poolReserveA_isZero: poolReserveA.isZero(),
            poolReserveB_isZero: poolReserveB.isZero(),
            poolReserveA_val: poolReserveA.toString(),
            poolReserveB_val: poolReserveB.toString(),
        });

        if (value && tokenAInfo && tokenBInfo && !poolReserveA.isZero() && !poolReserveB.isZero()) {
            setIsCalculating(true);
            try {
                const amountA_BN = parseUnitsSafe(value, tokenAInfo.decimals);
                if (amountA_BN && amountA_BN.gt(0)) {
                    const amountB_BN = amountA_BN.mul(poolReserveB).div(poolReserveA);
                    setAddAmountB(formatUnitsSafe(amountB_BN, tokenBInfo.decimals)); // Show full precision from calc
                } else {
                    setAddAmountB(''); // Clear if amount A is zero or invalid
                }
            } catch (error) {
                console.error("Error calculating amount B:", error);
                setAddAmountB(''); // Clear on error
            } finally {
                setIsCalculating(false);
            }
        } else if (!value) { // If amount A is cleared
             setIsCalculating(true); // ensure B is also cleared without re-trigger
             setAddAmountB('');
             setIsCalculating(false);
        }
    }
  };
  const handleAddAmountBChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
        setAddAmountB(value);
        if (isCalculating) return; // Prevent recursive calculation

        if (value && tokenAInfo && tokenBInfo && !poolReserveA.isZero() && !poolReserveB.isZero()) {
            setIsCalculating(true);
            try {
                const amountB_BN = parseUnitsSafe(value, tokenBInfo.decimals);
                if (amountB_BN && amountB_BN.gt(0)) {
                    const amountA_BN = amountB_BN.mul(poolReserveA).div(poolReserveB);
                    setAddAmountA(formatUnitsSafe(amountA_BN, tokenAInfo.decimals)); // Show full precision
                } else {
                    setAddAmountA(''); // Clear if amount B is zero or invalid
                }
            } catch (error) {
                console.error("Error calculating amount A:", error);
                setAddAmountA('');
            } finally {
                setIsCalculating(false);
            }
        } else if (!value) { // If amount B is cleared
            setIsCalculating(true);
            setAddAmountA('');
            setIsCalculating(false);
        }
    }
  };
  const handleRemoveLpPercentChange = (value: number[]) => {
    setRemoveLpPercent(value);
    if (lpTokenInfo && parseFloat(lpTokenInfo.balance) > 0) {
        const percentVal = value[0] / 100;
        const lpToRemove = parseFloat(lpTokenInfo.balance) * percentVal;
        setRemoveLpAmount(lpToRemove.toFixed(Math.min(lpTokenInfo.decimals, 8))); // Show reasonable precision
        // TODO: Estimate tokens received based on lpAmount and pool reserves
    } else {
        setRemoveLpAmount('0');
    }
  };

 // --- Derived State / Memoized Values ---
  const isTokenAApproved = useMemo(() => {
    if (!tokenAInfo || !tokenAInfo.allowance) return false;
    const allowanceBN = parseUnitsSafe(tokenAInfo.allowance, tokenAInfo.decimals);
    const amountBN = parseUnitsSafe(addAmountA, tokenAInfo.decimals);
    if (!allowanceBN || !amountBN) return false;
    return allowanceBN.gte(amountBN);
  }, [tokenAInfo, addAmountA]);

  const isTokenBApproved = useMemo(() => {
    if (!tokenBInfo || !tokenBInfo.allowance) return false;
    const allowanceBN = parseUnitsSafe(tokenBInfo.allowance, tokenBInfo.decimals);
    const amountBN = parseUnitsSafe(addAmountB, tokenBInfo.decimals);
    if (!allowanceBN || !amountBN) return false;
    return allowanceBN.gte(amountBN);
  }, [tokenBInfo, addAmountB]);
  
  // TODO: isLpTokenApproved for remove liquidity

  // --- Render Logic ---
  // Keeping parts of the original return structure for now

  // Effect for polling UserOp status
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    const pollStatus = async () => {
      if (!userOpHash || !isProcessing) return;
      try {
        const statusResult = await checkUserOpStatus(userOpHash);
        let successful = false;
        let failed = false;

        if (typeof statusResult === 'boolean') {
          if (statusResult === true) successful = true;
        } else if (statusResult && typeof statusResult === 'object') {
          // Adapt based on the actual structure of checkUserOpStatus result
          if ((statusResult as any).mined === true || (statusResult as any).executed === true) successful = true;
          else if ((statusResult as any).failed === true || (statusResult as any).error) failed = true;
        }

        if (successful) {
          toast({ title: 'Transaction Confirmed!', description: `${txStatusMessage.split('.')[0]} was successful.` });
          setIsProcessing(false);
          setUserOpHash(null);
          setTxStatusMessage('Transaction successful!');
          // TODO: Refresh balances (tokenA, tokenB, LP)
          // Example: fetchData().then(() => console.log("Balances updated."));
        } else if (failed) {
          toast({ title: 'Transaction Failed', description: latestUserOpResult?.error || 'UserOperation failed to execute.', variant: 'destructive' });
          setIsProcessing(false);
          setUserOpHash(null);
          setTxStatusMessage(latestUserOpResult?.error || 'Transaction failed.');
        } else {
          setTxStatusMessage(`Transaction submitted (${userOpHash.substring(0,10)}...). Awaiting confirmation...`);
        }
      } catch (error: any) {
        console.error('Error polling UserOp status:', error);
        toast({ title: 'Polling Error', description: error.message, variant: 'destructive' });
        setIsProcessing(false); // Stop polling on error
        setUserOpHash(null);
        setTxStatusMessage('Error checking transaction status.');
      }
    };

    if (userOpHash && isProcessing) {
      pollStatus(); // Initial check
      intervalId = setInterval(pollStatus, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [userOpHash, isProcessing, checkUserOpStatus, toast, latestUserOpResult, txStatusMessage]);


  // --- Actual Page Render ---
  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center px-4 md:px-6">
      <Card className="shadow-lg w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" />
            Manage Liquidity
          </CardTitle>
          <CardDescription>
            Add or remove liquidity. Earn fees by providing liquidity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add" className="flex items-center gap-1"><PlusCircle className="h-4 w-4" /> Add Liquidity</TabsTrigger>
              <TabsTrigger value="remove" className="flex items-center gap-1"><MinusCircle className="h-4 w-4" /> Remove Liquidity</TabsTrigger>
            </TabsList>
            
            {/* Add Liquidity Tab */}
            <TabsContent value="add" className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="add-amount-a">{tokenAInfo?.symbol || 'Token A'} Amount</Label>
                  <span className="text-sm text-muted-foreground">
                    Balance: {isLoading ? 'Loading...' : parseFloat(tokenAInfo?.balance || '0').toFixed(4)}
                  </span>
                </div>
                <Input 
                  id="add-amount-a" 
                  type="text" 
                  placeholder="0.0" 
                  value={addAmountA} 
                  onChange={handleAddAmountAChange} 
                  inputMode="decimal" 
                  disabled={isProcessing || isLoading}
                />
                {!isTokenAApproved && parseFloat(addAmountA) > 0 && tokenAInfo && (
                    <Button onClick={() => handleApprove(tokenAInfo, addAmountA)} disabled={isProcessing} className="w-full mt-1">
                        {isProcessing ? 'Approving...' : `Approve ${tokenAInfo.symbol}`}
                    </Button>
                )}
              </div>

              <div className="flex justify-center items-center text-muted-foreground">
                <PlusCircle className="h-5 w-5" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="add-amount-b">{tokenBInfo?.symbol || 'Token B'} Amount</Label>
                  <span className="text-sm text-muted-foreground">
                     Balance: {isLoading ? 'Loading...' : parseFloat(tokenBInfo?.balance || '0').toFixed(4)}
                  </span>
                </div>
                <Input 
                  id="add-amount-b" 
                  type="text" 
                  placeholder="0.0" 
                  value={addAmountB} 
                  onChange={handleAddAmountBChange} 
                  inputMode="decimal" 
                  disabled={isProcessing || isLoading}
                />
                 {!isTokenBApproved && parseFloat(addAmountB) > 0 && tokenBInfo && (
                    <Button onClick={() => handleApprove(tokenBInfo, addAmountB)} disabled={isProcessing} className="w-full mt-1">
                         {isProcessing ? 'Approving...' : `Approve ${tokenBInfo.symbol}`}
                    </Button>
                )}
              </div>
              
              {/* TODO: Add display for estimated LP tokens, pool rate etc. */}

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                onClick={handleAddLiquidity}
                disabled={isProcessing || isLoading || !isTokenAApproved || !isTokenBApproved || !parseFloat(addAmountA) || !parseFloat(addAmountB) }
              >
                {isProcessing ? txStatusMessage.includes('submitted') ? 'Waiting Confirmation...': 'Processing...' : 'Add Liquidity'}
              </Button>
            </TabsContent>

            {/* Remove Liquidity Tab */}
            <TabsContent value="remove" className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="remove-lp-percent">Amount to Remove ({removeLpPercent[0]}%)</Label>
                   <span className="text-sm text-muted-foreground">
                    LP Balance: {isLoading ? 'Loading...' : parseFloat(lpTokenInfo?.balance || '0').toFixed(4)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Slider
                        id="remove-lp-percent"
                        min={0}
                        max={100}
                        step={1}
                        value={removeLpPercent}
                        onValueChange={handleRemoveLpPercentChange}
                        className="w-full"
                        disabled={isProcessing || isLoading}
                    />
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                    type="text" 
                    readOnly 
                    value={`${removeLpAmount} ${lpTokenInfo?.symbol || 'LP Tokens'}`}
                    className="bg-muted border-muted cursor-not-allowed mt-2" 
                    disabled={isProcessing || isLoading}
                />
                {/* TODO: Add approval for LP tokens if needed */}
              </div>
              
              {/* TODO: Display estimated NERO and stNERO received */}

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                onClick={handleRemoveLiquidity}
                disabled={isProcessing || isLoading || parseFloat(removeLpAmount) <= 0}
              >
                {isProcessing ? 'Processing...' : 'Remove Liquidity'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        {txStatusMessage && (
            <CardFooter className="flex flex-col items-center justify-center pt-4 border-t">
                <p className={`text-sm ${txStatusMessage.includes('failed') || txStatusMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{txStatusMessage}</p>
                {userOpHash && (
                <a 
                    href={`https://your-explorer-url/userop/${userOpHash}`} // TODO: Replace with actual explorer URL
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-500 hover:underline mt-1"
                >
                    View on Explorer
                </a>
                )}
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
