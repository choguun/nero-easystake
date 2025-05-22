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
    try {
      if (isNative) {
        const balance = await provider.getBalance(AAaddress);
        return {
          address: NERO_ADDRESS, // Special address for native NERO
          name: 'Nero', // Native token name
          symbol: 'NERO', // Native token symbol
          decimals: 18, // Native token decimals
          balance: ethersUtils.formatEther(balance),
          logoURI: '/logo.png', // Placeholder
        };
      }
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const [name, symbol, decimals, balance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.balanceOf(AAaddress),
      ]);
      return {
        address: tokenAddress,
        name,
        symbol,
        decimals,
        balance: ethersUtils.formatUnits(balance, decimals),
        logoURI: '' // Fetch or use a default/placeholder
      };
    } catch (error) {
      console.error(`Error fetching data for ${tokenAddress}:`, error);
      toast({ title: 'Data Fetch Error', description: `Could not load details for token ${tokenAddress}`, variant: 'destructive' });
      return null;
    }
  }, [provider, AAaddress, toast]);

    const fetchAllowance = useCallback(async (tokenAddress: string, owner: string, spender: string, decimals: number): Promise<string> => {
        if (!provider) return '0';
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const allowance = await contract.allowance(owner, spender);
        return ethersUtils.formatUnits(allowance, decimals);
    }, [provider]);

  // --- Initial Data Fetching ---
  useEffect(() => {
    const init = async () => {
      if (isConnected && AAaddress && provider) {
        setIsLoading(true);
        console.log('[LiquidityPage] Fetching initial token data...');
        const wneroData = await fetchTokenMetadataAndBalance(WNERO_ADDRESS);
        const stneroData = await fetchTokenMetadataAndBalance(STNERO_ADDRESS);
        // Use the imported actual pair address
        const lpData = await fetchTokenMetadataAndBalance(WNERO_STNERO_PAIR_ADDRESS);

        if (wneroData) {
            wneroData.allowance = await fetchAllowance(WNERO_ADDRESS, AAaddress, UNISWAP_ROUTER_ADDRESS, wneroData.decimals);
            setTokenAInfo(wneroData);
        }
        if (stneroData) {
            stneroData.allowance = await fetchAllowance(STNERO_ADDRESS, AAaddress, UNISWAP_ROUTER_ADDRESS, stneroData.decimals);
            setTokenBInfo(stneroData);
        }
        if (lpData) {
            lpData.allowance = await fetchAllowance(WNERO_STNERO_PAIR_ADDRESS, AAaddress, UNISWAP_ROUTER_ADDRESS, lpData.decimals);
            setLpTokenInfo(lpData);
        }
        setIsLoading(false);
      }
    };
    init();
  }, [isConnected, AAaddress, provider, fetchTokenMetadataAndBalance, fetchAllowance]);


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
    
    // TODO: Add slippage calculation for min amounts
    const amountAMin = amountADesired.mul(995).div(1000); // 99.5% slippage, example
    const amountBMin = amountBDesired.mul(995).div(1000); // 99.5% slippage, example

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
  const handleRemoveLiquidity = async () => {
    // TODO: Implement approval for LP tokens if needed
    // TODO: Implement removeLiquidity / removeLiquidityETH call
    toast({ title: 'Not Implemented', description: 'Remove liquidity functionality is coming soon.'});
  };

  // --- UI Event Handlers ---
  const handleAddAmountAChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) setAddAmountA(value);
    // TODO: Add logic to estimate amountB if a pair exists and rates are known
  };
  const handleAddAmountBChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) setAddAmountB(value);
    // TODO: Add logic to estimate amountA
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
