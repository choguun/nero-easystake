'use client';

import React from 'react';
import { useState, ChangeEvent, useEffect, useCallback, useMemo } from 'react';
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
import { Award, Gift, PlusCircle, MinusCircle, Percent, Info, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

import { useSignature, useSendUserOp, useConfig, useEthersSigner } from '@/hooks';
import { UserOperation } from '@/types';
import { SendUserOpContext } from '@/contexts';
import { ERC20_ABI, LP_TOKEN_STAKER_ABI } from '@/constants/abi';
import {
  LP_TOKEN_STAKER_ADDRESS,
  EASYSTAKE_LP_TOKEN_ADDRESS, // This is the NERO-stNERO LP token for staking
  EASYSTAKE_REWARD_TOKEN_ADDRESS, // This is your EasyStakeToken (EST) or equivalent
} from '@/constants/contracts';
import { formatUnitsSafe, parseUnitsSafe } from '@/utils/formatUnits';
// import { TokenIcon } from '@/components/features/token'; // Assuming this component exists if you want icons

// const MOCK_LP_STAKING_APY = 15.5; // APY for staking LP tokens - To be replaced with on-chain derived data or info

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  allowance?: string; // For LP Staker contract
  logoURI?: string;
}

interface InfoCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ElementType;
  isLoading?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, unit, icon: Icon, isLoading }) => (
  <Card className="bg-background/70 text-center">
    <CardHeader className="pb-2">
      <CardDescription className="text-sm flex items-center justify-center gap-1">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {title}
      </CardDescription>
      <CardTitle className="text-2xl">
        {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 
          <>
            {typeof value === 'number' ? value.toLocaleString(undefined, {maximumFractionDigits: 4}) : value}
            {unit && <span className="text-lg ml-1">{unit}</span>}
          </>
        }
      </CardTitle>
    </CardHeader>
  </Card>
);

const getExplorerLink = (chainId: number | undefined, hash: string, type: 'tx' | 'address' | 'userop') => {
  // Basic explorer link structure, adapt as needed for your specific chain/explorer
  // Example for Sepolia Etherscan. Replace with your actual block explorer that supports UserOps if different.
  const baseUrl = chainId === 11155111 ? 'https://sepolia.etherscan.io' : 'https://your-block-explorer.com'; 
  if (type === 'userop' && chainId === 11155111) { // Specific handling for Jiffyscan/UserOps on Sepolia
    return `https://www.jiffyscan.xyz/userOpHash/${hash}?network=sepolia`;
  }
  return `${baseUrl}/${type === 'tx' ? 'tx' : type}/${hash}`;
};


export default function RewardsPage() {
  const { toast } = useToast();
  const { AAaddress, isConnected } = useSignature();
  const { execute, checkUserOpStatus, latestUserOpResult } = useSendUserOp();
  const { chainId } = useConfig();
  const provider = useEthersSigner()?.provider;
  const sendUserOpCtx = React.useContext(SendUserOpContext);

  // UI State
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true); // For initial data load
  const [isProcessing, setIsProcessing] = useState(false); // For transactions
  const [userOpHash, setUserOpHash] = useState<string | null>(null);
  const [txStatusMessage, setTxStatusMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState('stake');
  const [currentAction, setCurrentAction] = useState<'stake' | 'unstake' | 'approve' | 'claim' | null>(null);

  // Token & Staking Info State
  const [lpTokenInfo, setLpTokenInfo] = useState<TokenInfo | null>(null);
  const [rewardTokenInfo, setRewardTokenInfo] = useState<TokenInfo | null>(null);
  const [stakedLpBalance, setStakedLpBalance] = useState<string>('0');
  const [earnedRewards, setEarnedRewards] = useState<string>('0');
  
  // Reward Parameters (for display/info)
  const [rewardRate, setRewardRate] = useState<string>('0');
  const [rewardsPeriodFinish, setRewardsPeriodFinish] = useState<string>('N/A');
  const [isRewardPeriodActive, setIsRewardPeriodActive] = useState<boolean>(false);


  // Stake LP State
  const [stakeLpAmount, setStakeLpAmount] = useState<string>('');

  // Unstake LP State
  const [unstakeLpPercentSlider, setUnstakeLpPercentSlider] = useState<number[]>([50]);
  const [unstakeLpAmount, setUnstakeLpAmount] = useState<string>('0');


  const fetchTokenMetadataAndBalance = useCallback(async (tokenAddress: string, forSpender?: string): Promise<TokenInfo | null> => {
    if (!provider || !AAaddress) return null;
    let tokenSymbolForError = tokenAddress.substring(0,6); // Default for error message
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const [name, symbol, decimals, balance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.balanceOf(AAaddress),
      ]);
      tokenSymbolForError = symbol; // Update if symbol is fetched
      const tokenInfo: TokenInfo = {
        address: tokenAddress, name, symbol, decimals,
        balance: ethersUtils.formatUnits(balance, decimals),
      };
      if (forSpender) {
        const allowance = await contract.allowance(AAaddress, forSpender);
        tokenInfo.allowance = ethersUtils.formatUnits(allowance, decimals);
      }
      return tokenInfo;
    } catch (error) {
      console.error(`Error fetching token data for ${tokenAddress}:`, error);
      toast({ title: 'Token Data Error', description: `Could not load details for ${tokenSymbolForError}...`, variant: 'destructive' });
      return null;
    }
  }, [provider, AAaddress, toast]);
  
  const handleCancel = useCallback(() => {
    setIsProcessing(false);
    setUserOpHash(null);
    setTxStatusMessage('');
    setCurrentAction(null);
    if (sendUserOpCtx) sendUserOpCtx.setIsWalletPanel(false);
    toast({ title: 'Transaction Cancelled', description: 'You cancelled the operation.' });
  }, [toast, sendUserOpCtx]);

  const fetchData = useCallback(async () => {
    if (!isConnected || !AAaddress || !provider) {
      setIsPageLoading(false);
      return;
    }
    setIsPageLoading(true);
    setTxStatusMessage(''); // Clear previous messages

    try {
      const lpDataPromise = fetchTokenMetadataAndBalance(EASYSTAKE_LP_TOKEN_ADDRESS, LP_TOKEN_STAKER_ADDRESS);
      const rewardDataPromise = fetchTokenMetadataAndBalance(EASYSTAKE_REWARD_TOKEN_ADDRESS);
      const stakerContract = new ethers.Contract(LP_TOKEN_STAKER_ADDRESS, LP_TOKEN_STAKER_ABI, provider);

      const [
        lpData, 
        rewardData, 
        rawStakedBalance, 
        rawEarnedRewards,
        rawRewardRate,
        rawPeriodFinish
      ] = await Promise.all([
        lpDataPromise,
        rewardDataPromise,
        stakerContract.stakedBalance(AAaddress),
        stakerContract.earned(AAaddress),
        stakerContract.rewardRate(),
        stakerContract.periodFinish()
      ]);

      if (lpData) setLpTokenInfo(lpData);
      if (rewardData) setRewardTokenInfo(rewardData);

      setStakedLpBalance(ethersUtils.formatUnits(rawStakedBalance, lpData?.decimals || 18));
      setEarnedRewards(ethersUtils.formatUnits(rawEarnedRewards, rewardData?.decimals || 18));
      
      setRewardRate(ethersUtils.formatUnits(rawRewardRate, rewardData?.decimals || 18));
      const periodFinishTimestamp = rawPeriodFinish.toNumber();
      if (periodFinishTimestamp > 0) {
        setRewardsPeriodFinish(new Date(periodFinishTimestamp * 1000).toLocaleString());
        setIsRewardPeriodActive(Date.now() / 1000 < periodFinishTimestamp && rawRewardRate.gt(0));
      } else {
        setRewardsPeriodFinish('Not set');
        setIsRewardPeriodActive(false);
      }
      
    } catch (error: any) {
      console.error('Error fetching rewards page data:', error);
      toast({ title: 'Data Fetch Error', description: error.message || 'Could not load staking data.', variant: 'destructive' });
    } finally {
      setIsPageLoading(false);
    }
  }, [isConnected, AAaddress, provider, fetchTokenMetadataAndBalance, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (sendUserOpCtx && !sendUserOpCtx.isWalletPanel && isProcessing && !userOpHash) {
      handleCancel();
    }
  }, [sendUserOpCtx, isProcessing, userOpHash, handleCancel]);

  useEffect(() => { // For unstake slider calculation
    if (lpTokenInfo && parseFloat(stakedLpBalance) > 0) {
        const percent = unstakeLpPercentSlider[0] / 100;
        const amount = parseFloat(stakedLpBalance) * percent;
        setUnstakeLpAmount(amount.toFixed(Math.min(lpTokenInfo.decimals, 8)));
    } else {
        setUnstakeLpAmount('0');
    }
  }, [unstakeLpPercentSlider, stakedLpBalance, lpTokenInfo]);

  const handleStakeLpAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\\d*\\.?\\d*$/.test(value) || value === '') setStakeLpAmount(value);
  };

  const handleUnstakeLpPercentChange = (value: number[]) => {
    setUnstakeLpPercentSlider(value);
  };
  
  const handleMaxStake = () => {
    if (lpTokenInfo) setStakeLpAmount(lpTokenInfo.balance);
  };

  const handleApproveLpTokens = async () => {
    if (!lpTokenInfo) return;
    setIsProcessing(true);
    setCurrentAction('approve');
    setTxStatusMessage(`Approving ${lpTokenInfo.symbol}...`);
    try {
      const result = await execute({
        target: lpTokenInfo.address,
        abi: ERC20_ABI,
        functionName: 'approve',
        params: [LP_TOKEN_STAKER_ADDRESS, ethers.constants.MaxUint256],
        value: '0',
      });
      if (result.userOpHash) {
        setUserOpHash(result.userOpHash);
        setTxStatusMessage('Approval submitted. Waiting for confirmation...');
      } else {
        throw new Error(result.error || 'Approval failed or was cancelled.');
      }
    } catch (error: any) {
      console.error('Approval Error:', error);
      toast({ title: 'Approval Failed', description: error.message, variant: 'destructive' });
      handleCancel();
    }
  };

  const handleStakeLp = async () => {
    if (!lpTokenInfo || !stakeLpAmount || parseFloat(stakeLpAmount) <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount to stake.', variant: 'destructive' });
      return;
    }
    const amountBN = parseUnitsSafe(stakeLpAmount, lpTokenInfo.decimals);
    if (amountBN.isZero()) return;
    
    setIsProcessing(true);
    setCurrentAction('stake');
    setTxStatusMessage(`Staking ${stakeLpAmount} ${lpTokenInfo.symbol}...`);
    try {
      const result = await execute({
        target: LP_TOKEN_STAKER_ADDRESS,
        abi: LP_TOKEN_STAKER_ABI,
        functionName: 'stake',
        params: [amountBN],
        value: '0',
      });
      if (result.userOpHash) {
        setUserOpHash(result.userOpHash);
        setTxStatusMessage('Staking transaction submitted. Waiting for confirmation...');
      } else {
        throw new Error(result.error || 'Staking failed or was cancelled.');
      }
    } catch (error: any) {
      console.error('Staking Error:', error);
      toast({ title: 'Staking Failed', description: error.message, variant: 'destructive' });
      handleCancel();
    }
  };

  const handleUnstakeLp = async () => {
    if (!lpTokenInfo || !unstakeLpAmount || parseFloat(unstakeLpAmount) <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount to unstake.', variant: 'destructive' });
      return;
    }
    const amountBN = parseUnitsSafe(unstakeLpAmount, lpTokenInfo.decimals);
    if (amountBN.isZero()) return;

    setIsProcessing(true);
    setCurrentAction('unstake');
    setTxStatusMessage(`Unstaking ${unstakeLpAmount} ${lpTokenInfo.symbol}...`);
    try {
      const result = await execute({
        target: LP_TOKEN_STAKER_ADDRESS,
        abi: LP_TOKEN_STAKER_ABI,
        functionName: 'unstake',
        params: [amountBN],
        value: '0',
      });
      if (result.userOpHash) {
        setUserOpHash(result.userOpHash);
        setTxStatusMessage('Unstaking transaction submitted. Waiting for confirmation...');
      } else {
        throw new Error(result.error || 'Unstaking failed or was cancelled.');
      }
    } catch (error: any) {
      console.error('Unstaking Error:', error);
      toast({ title: 'Unstaking Failed', description: error.message, variant: 'destructive' });
      handleCancel();
    }
  };

  const handleClaimRewards = async () => {
    if (!rewardTokenInfo || parseFloat(earnedRewards) <= 0) {
      toast({ title: 'No Rewards', description: 'There are no rewards to claim.', variant: 'destructive' });
      return;
    }
    setIsProcessing(true);
    setCurrentAction('claim');
    setTxStatusMessage(`Claiming rewards...`);
    try {
      const result = await execute({
        target: LP_TOKEN_STAKER_ADDRESS,
        abi: LP_TOKEN_STAKER_ABI,
        functionName: 'claimReward',
        params: [],
        value: '0',
      });
      if (result.userOpHash) {
        setUserOpHash(result.userOpHash);
        setTxStatusMessage('Claim transaction submitted. Waiting for confirmation...');
      } else {
        throw new Error(result.error || 'Claiming failed or was cancelled.');
      }
    } catch (error: any) {
      console.error('Claiming Error:', error);
      toast({ title: 'Claiming Failed', description: error.message, variant: 'destructive' });
      handleCancel();
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const pollStatus = async () => {
      if (!userOpHash || !isProcessing || !currentAction) return;
      try {
        setTxStatusMessage(`Confirming ${currentAction} transaction...`);
        const status = await checkUserOpStatus(userOpHash);
        if (status) {
          toast({ title: 'Transaction Successful', description: `Your ${currentAction} operation was completed.` });
          setUserOpHash(null);
          setIsProcessing(false);
          setTxStatusMessage('');
          setCurrentAction(null);
          fetchData(); // Refresh all data
        } else {
          setTxStatusMessage('Transaction submitted. Waiting for confirmation...');
        }
      } catch (error: any) {
        console.error('Polling Error:', error);
        toast({ title: 'Transaction Error', description: error.message, variant: 'destructive' });
        handleCancel();
      }
    };

    if (userOpHash && isProcessing) {
      interval = setInterval(pollStatus, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userOpHash, isProcessing, currentAction, checkUserOpStatus, toast, fetchData, handleCancel]);

  const isLpTokenApproved = useMemo(() => {
    if (!lpTokenInfo || !lpTokenInfo.allowance) return false;
    // For staking, we need approval for the amount we want to stake.
    // A common pattern is to approve MaxUint256 once.
    // Here, we check if allowance is effectively "infinite" (very large number) or greater than current stake amount if that's small.
    // Let's assume MaxUint256 is used for approval.
    const allowanceBN = parseUnitsSafe(lpTokenInfo.allowance, lpTokenInfo.decimals);
    // A practical threshold for "approved enough", e.g., more than total supply, or just a very large number.
    // Or, simply check if greater than current balance for a simpler check if not approving MaxUint256.
    // For now, let's assume if it's non-zero it's likely MaxUint256 from our approve logic.
    // A more precise check would be allowanceBN.gte(parseUnitsSafe(stakeLpAmount, lpTokenInfo.decimals) || 0)
    // but since we approve MaxUint256, a simpler check is often if allowance > 0 or some large threshold.
    const stakeAmountBN = parseUnitsSafe(stakeLpAmount, lpTokenInfo.decimals);
    if (!allowanceBN) return false;
    if (stakeAmountBN && stakeAmountBN.gt(0)) {
        return allowanceBN.gte(stakeAmountBN);
    }
    return allowanceBN.gt(0); // Fallback: if allowance is > 0, assume it might be enough or max approved.
  }, [lpTokenInfo, stakeLpAmount]);


  if (!isConnected || !AAaddress) {
    return (
      <div className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center px-4 py-12 md:px-6">
        <Card className="shadow-lg w-full max-w-md">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>Please connect your wallet to manage staking rewards.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {/* Assuming you have a CustomConnectButton or similar */}
            {/* <CustomConnectButton /> */}
            <p className="text-muted-foreground">Connect your wallet to proceed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center px-4 py-12 md:px-6">
      <Card className="shadow-lg w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            LP Token Staking Rewards
          </CardTitle>
          <CardDescription>
            Stake your {lpTokenInfo?.symbol || 'LP'} tokens to earn <Badge variant="secondary">{rewardTokenInfo?.symbol || 'Reward'}</Badge> tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard title="Your LP Balance" value={parseFloat(lpTokenInfo?.balance || '0').toFixed(4)} unit={lpTokenInfo?.symbol || 'LP'} icon={Info} isLoading={isPageLoading} />
            <InfoCard title="Currently Staked" value={parseFloat(stakedLpBalance).toFixed(4)} unit={lpTokenInfo?.symbol || 'LP'} icon={Info} isLoading={isPageLoading} />
            {/* APY Info - placeholder for now */}
            <InfoCard 
              title={isRewardPeriodActive ? "Current Reward Rate" : "Rewards Info"} 
              value={isRewardPeriodActive ? `${parseFloat(rewardRate).toFixed(6)}` : "N/A"} 
              unit={isRewardPeriodActive ? `${rewardTokenInfo?.symbol || 'Tokens'}/sec` : ""} 
              icon={Percent} 
              isLoading={isPageLoading} 
            />
          </div>
          {isRewardPeriodActive && rewardsPeriodFinish !== 'N/A' && (
            <p className="text-xs text-center text-muted-foreground">
              Current reward period ends: {rewardsPeriodFinish}.
            </p>
          )}
          {!isRewardPeriodActive && !isPageLoading && (
             <p className="text-xs text-center text-orange-500 flex items-center justify-center gap-1">
                <Info className="h-3 w-3" /> Reward period may not be active or funding is depleted. Rate: {parseFloat(rewardRate).toFixed(6)} {rewardTokenInfo?.symbol || 'Tokens'}/sec.
            </p>
          )}


          <Card className="bg-secondary/30 border-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-accent" />
                Your Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xl font-semibold">
                {isPageLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : parseFloat(earnedRewards).toFixed(6)}
                <span className="text-sm font-normal text-muted-foreground ml-1">{rewardTokenInfo?.symbol || 'Tokens'}</span>
              </p>
              <Button 
                onClick={handleClaimRewards} 
                disabled={isProcessing || isPageLoading || parseFloat(earnedRewards) <= 0}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isProcessing && txStatusMessage.toLowerCase().includes('claim') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isProcessing && txStatusMessage.toLowerCase().includes('claim') ? 'Claiming...' : `Claim ${rewardTokenInfo?.symbol || 'Rewards'}`}
              </Button>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stake" className="flex items-center gap-1" disabled={isProcessing}><PlusCircle className="h-4 w-4" /> Stake LP</TabsTrigger>
              <TabsTrigger value="unstake" className="flex items-center gap-1" disabled={isProcessing}><MinusCircle className="h-4 w-4" /> Unstake LP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stake" className="space-y-4 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="stake-lp-amount">Amount to Stake ({lpTokenInfo?.symbol || 'LP'})</Label>
                  <span className="text-sm text-muted-foreground">Balance: {isPageLoading ? '...' : parseFloat(lpTokenInfo?.balance || '0').toFixed(4)}</span>
                </div>
                <div className="relative">
                    <Input 
                        id="stake-lp-amount" 
                        type="text" 
                        placeholder="0.0" 
                        value={stakeLpAmount} 
                        onChange={handleStakeLpAmountChange} 
                        inputMode="decimal" 
                        className="pr-16" 
                        disabled={isProcessing || isPageLoading}
                    />
                    <Button variant="ghost" size="sm" onClick={handleMaxStake} className="absolute right-1 top-1/2 -translate-y-1/2 h-7" disabled={isProcessing || isPageLoading}>Max</Button>
                </div>
              </div>
              {!isLpTokenApproved && parseFloat(stakeLpAmount) > 0 && lpTokenInfo && (
                <Button onClick={handleApproveLpTokens} disabled={isProcessing || isPageLoading} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  {isProcessing && txStatusMessage.toLowerCase().includes('approve') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isProcessing && txStatusMessage.toLowerCase().includes('approve') ? 'Approving...' : `Approve ${lpTokenInfo.symbol} for Staking`}
                </Button>
              )}
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleStakeLp}
                disabled={isProcessing || isPageLoading || !parseFloat(stakeLpAmount) || parseFloat(stakeLpAmount) <=0 || !isLpTokenApproved || parseFloat(stakeLpAmount) > parseFloat(lpTokenInfo?.balance || '0')}
              >
                {isProcessing && txStatusMessage.toLowerCase().includes('stake') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isProcessing && txStatusMessage.toLowerCase().includes('stake') ? 'Staking...' : 'Stake LP Tokens'}
              </Button>
            </TabsContent>

            <TabsContent value="unstake" className="space-y-4 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="unstake-lp-percent">Amount to Unstake ({unstakeLpPercentSlider[0]}%)</Label>
                   <span className="text-sm text-muted-foreground">Staked: {isPageLoading ? '...' : parseFloat(stakedLpBalance).toFixed(4)} {lpTokenInfo?.symbol || 'LP'}</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                    <Slider
                        id="unstake-lp-percent"
                        min={0}
                        max={100}
                        step={1}
                        value={unstakeLpPercentSlider}
                        onValueChange={handleUnstakeLpPercentChange}
                        className="w-full"
                        disabled={isProcessing || isPageLoading || parseFloat(stakedLpBalance) <= 0}
                    />
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                    type="text" 
                    readOnly 
                    value={`${unstakeLpAmount} ${lpTokenInfo?.symbol || 'LP Tokens'}`} 
                    className="bg-muted border-muted cursor-not-allowed mt-2" 
                />
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleUnstakeLp}
                disabled={isProcessing || isPageLoading || parseFloat(unstakeLpAmount) <= 0 || parseFloat(unstakeLpAmount) > parseFloat(stakedLpBalance)}
              >
                {isProcessing && txStatusMessage.toLowerCase().includes('unstake') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isProcessing && txStatusMessage.toLowerCase().includes('unstake') ? 'Unstaking...' : 'Unstake LP Tokens'}
              </Button>
            </TabsContent>
          </Tabs>

           {txStatusMessage && (
            <CardFooter className="flex flex-col items-center justify-center pt-6 border-t mt-4">
                <div className="flex items-center gap-2">
                    {txStatusMessage.toLowerCase().includes('error') || txStatusMessage.toLowerCase().includes('failed') ? <XCircle className="h-5 w-5 text-red-500" /> :
                     txStatusMessage.toLowerCase().includes('successful') ? <CheckCircle className="h-5 w-5 text-green-500" /> :
                     isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Info className="h-5 w-5 text-muted-foreground"/> 
                    }
                    <p className={`text-sm ${
                        txStatusMessage.toLowerCase().includes('error') || txStatusMessage.toLowerCase().includes('failed') ? 'text-red-500' : 
                        txStatusMessage.toLowerCase().includes('successful') ? 'text-green-500' : 'text-muted-foreground'
                    }`}>{txStatusMessage}</p>
                </div>
                {userOpHash && (
                <a 
                    href={getExplorerLink(chainId, userOpHash, 'userop')}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-500 hover:underline mt-1"
                >
                    View UserOp on Explorer
                </a>
                )}
            </CardFooter>
        )}
        </CardContent>
      </Card>
    </div>
  );
}

    