'use client';

import { useState, ChangeEvent, useEffect, useCallback, useContext } from 'react';
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
import { Wallet, ArrowRightLeft, Repeat2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Imports from stake/page.tsx
import { useSignature, useSendUserOp, useConfig, usePaymasterContext } from '@/hooks';
import { ethers, utils as ethersUtils, Contract, BigNumberish } from 'ethers';
import { STAKING_ABI } from '@/constants/abi';
import { UserOperationResultInterface } from '@/types';
import { SendUserOpContext } from '@/contexts';
import { CustomConnectButton } from '@/components/features/connect';

// Import STNERO_ADDRESS from constants
import { STNERO_ADDRESS } from '@/constants/contracts';

// Use STNERO_ADDRESS from constants. The old EASYSTAKE_VAULT_ADDRESS constant is removed.
const EasyStakeVaultABI = STAKING_ABI;
const VAULT_DECIMALS = 18;

export default function StakePage() {
  const [isStakingMode, setIsStakingMode] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Hooks and contexts from stake/page.tsx
  const { AAaddress, isConnected, signer: aaSignerDetails, simpleAccountInstance } = useSignature();
  const { execute, checkUserOpStatus } = useSendUserOp();
  const { entryPoint: entryPointAddress, rpcUrl: configRpcUrl } = useConfig();
  const sendUserOpCtx = useContext(SendUserOpContext);
  const paymasterCtx = usePaymasterContext();

  // State from stake/page.tsx
  const [nativeBalance, setNativeBalance] = useState<string>('0');
  const [isLoadingNativeBalance, setIsLoadingNativeBalance] = useState(false);
  const [shareBalance, setShareBalance] = useState<string>('0');
  const [isLoadingShareBalance, setIsLoadingShareBalance] = useState(false);
  
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [userOpHash, setUserOpHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string>('');
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  const [currentAction, setCurrentAction] = useState<'stake' | 'unstake' | null>(null);

  // For estimates - using preview functions from the vault
  const [estimatedReceiveAmount, setEstimatedReceiveAmount] = useState<string>('0.0');

  // Derived state (kept from original stake2/page.tsx for UI logic)
  const inputTokenSymbol = isStakingMode ? 'NERO' : 'stNERO';
  const outputTokenSymbol = isStakingMode ? 'stNERO' : 'NERO';
  
  const getProvider = useCallback(() => {
    if (aaSignerDetails && aaSignerDetails.provider) {
      return aaSignerDetails.provider;
    }
    return new ethers.providers.JsonRpcProvider(configRpcUrl || 'https://rpc-testnet.nerochain.io');
  }, [aaSignerDetails, configRpcUrl]);

  const fetchNativeBalance = useCallback(async () => {
    const provider = getProvider();
    if (AAaddress && AAaddress !== '0x' && provider) {
      setIsLoadingNativeBalance(true);
      try {
        const balance = await provider.getBalance(AAaddress);
        setNativeBalance(ethersUtils.formatEther(balance));
      } catch (error) {
        console.error('[Stake2Page] Error fetching native balance:', error);
        setNativeBalance('Error');
        toast({ title: 'Error', description: 'Could not fetch NERO balance.', variant: 'destructive' });
      } finally {
        setIsLoadingNativeBalance(false);
      }
    }
  }, [AAaddress, getProvider, toast]);

  const fetchShareBalance = useCallback(async () => {
    const provider = getProvider();
    if (AAaddress && AAaddress !== '0x' && provider && STNERO_ADDRESS) {
      setIsLoadingShareBalance(true);
      try {
        const vaultContract = new Contract(STNERO_ADDRESS, EasyStakeVaultABI, provider);
        const balance = await vaultContract.balanceOf(AAaddress);
        setShareBalance(ethersUtils.formatUnits(balance, VAULT_DECIMALS));
      } catch (error) {
        console.error('[Stake2Page] Error fetching stNERO balance:', error);
        setShareBalance('Error');
        toast({ title: 'Error', description: 'Could not fetch stNERO balance.', variant: 'destructive' });
      } finally {
        setIsLoadingShareBalance(false);
      }
    }
  }, [AAaddress, getProvider, toast]);
  
  const fetchEstimates = useCallback(async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !STNERO_ADDRESS) {
      setEstimatedReceiveAmount('0.0');
      return;
    }

    const provider = getProvider();
    if (!provider) {
        console.warn('[Stake2Page] Provider not available for fetching estimates.');
        setEstimatedReceiveAmount('N/A'); 
        return;
    }
    const vaultContract = new Contract(STNERO_ADDRESS, EasyStakeVaultABI, provider);
    
    try {
      const amountInWei = ethersUtils.parseUnits(amount, isStakingMode ? 18 : VAULT_DECIMALS);

      if (isStakingMode) { // Staking NERO -> stNERO
        if (typeof vaultContract.previewDeposit === 'function') {
          const estimatedSharesOut = await vaultContract.previewDeposit(amountInWei);
          setEstimatedReceiveAmount(ethersUtils.formatUnits(estimatedSharesOut, VAULT_DECIMALS));
        } else {
          console.warn('[Stake2Page] vaultContract.previewDeposit is not a function. Cannot fetch estimate for staking.');
          setEstimatedReceiveAmount('N/A');
        }
      } else { // Unstaking stNERO (shares) -> NERO (assets)
        if (typeof vaultContract.previewRedeem === 'function') {
          const assetsOutWei = await vaultContract.previewRedeem(amountInWei); // amountInWei is shares
          setEstimatedReceiveAmount(ethersUtils.formatEther(assetsOutWei));
        } else if (typeof vaultContract.previewWithdraw === 'function') {
          // This assumes previewWithdraw here takes shares and returns assets.
          // Standard ERC4626 previewWithdraw typically takes assets one wants to withdraw.
          console.warn('[Stake2Page] Using vaultContract.previewWithdraw for unstaking estimate. Ensure it expects shares as input and returns assets.');
          const assetsOutWei = await vaultContract.previewWithdraw(amountInWei); // amountInWei is shares
          setEstimatedReceiveAmount(ethersUtils.formatEther(assetsOutWei));
        } else {
          console.warn('[Stake2Page] Neither vaultContract.previewRedeem nor vaultContract.previewWithdraw is available for unstaking estimate.');
          setEstimatedReceiveAmount('N/A');
        }
      }
    } catch (error) {
      console.error('[Stake2Page] Error fetching estimate:', error);
      setEstimatedReceiveAmount('Error');
    }
  }, [amount, isStakingMode, getProvider]);

  useEffect(() => {
    if (isConnected && AAaddress && AAaddress !== '0x') {
      fetchNativeBalance();
      fetchShareBalance();
    } else {
      setNativeBalance('0');
      setShareBalance('0');
    }
  }, [isConnected, AAaddress, fetchNativeBalance, fetchShareBalance]);
  
  useEffect(() => {
    if (parseFloat(amount) > 0) {
        fetchEstimates();
    } else {
        setEstimatedReceiveAmount('0.0');
    }
  }, [amount, isStakingMode, fetchEstimates]);

  useEffect(() => {
    let intervalId: number | null = null;
    const pollStatus = async () => {
      if (!userOpHash || !isPollingStatus || !currentAction) return;
      try {
        setTxStatus(`Confirming ${currentAction}...`);
        const statusResult = await checkUserOpStatus(userOpHash);
        let successful = false;
        let failed = false;

        if (typeof statusResult === 'boolean') {
          if (statusResult === true) successful = true;
        } else if (statusResult && typeof statusResult === 'object') {
          const result = statusResult as any;
          if (result.mined === true || result.executed === true || result.success === 'true' || result.success === true) {
            successful = true;
          } else if (result.failed === true || result.success === 'false' || result.success === false) {
            failed = true;
          }
        }
        
        const actionVerb = currentAction === 'stake' ? 'Staking' : 'Unstaking';

        if (successful) {
          console.log(`[Stake2Page] ${actionVerb} successful for UserOpHash: ${userOpHash}`);
          toast({ title: `${actionVerb} Successful!`, description: `Your ${currentAction} operation was completed.` });
          setTxStatus(`${actionVerb} successful!`);
          setIsPollingStatus(false);
          if (sendUserOpCtx) sendUserOpCtx.setIsWalletPanel(false);
          if (paymasterCtx) paymasterCtx.clearToken();
          fetchNativeBalance();
          fetchShareBalance();
          setUserOpHash(null);
          setCurrentAction(null);
          setAmount('');
          setEstimatedReceiveAmount('0.0');
        } else if (failed) {
          console.log(`[Stake2Page] ${actionVerb} failed for UserOpHash: ${userOpHash}`);
          toast({ title: `${actionVerb} Failed`, description: `Your ${currentAction} operation failed.`, variant: 'destructive' });
          setTxStatus(`${actionVerb} failed.`);
          setIsPollingStatus(false);
          setCurrentAction(null);
        } else {
          setTxStatus('UserOp submitted, awaiting confirmation...');
        }
      } catch (error) {
        console.error(`[Stake2Page] Error polling ${currentAction} status for UserOpHash ${userOpHash}:`, error);
        toast({ title: 'Polling Error', description: `Error checking ${currentAction} status.`, variant: 'destructive' });
        setTxStatus(`Error polling ${currentAction} status.`);
        setIsPollingStatus(false);
        setCurrentAction(null);
      } finally {
        if (!isPollingStatus) {
            setIsProcessingTx(false); 
        }
      }
    };

    if (userOpHash && isPollingStatus && currentAction) {
      intervalId = window.setInterval(pollStatus, 5000) as unknown as number;
      pollStatus();
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [userOpHash, isPollingStatus, checkUserOpStatus, fetchNativeBalance, fetchShareBalance, currentAction, toast, sendUserOpCtx, paymasterCtx]);

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleMaxClick = () => {
    const balanceToSet = isStakingMode ? nativeBalance : shareBalance;
    if (balanceToSet !== 'Error' && balanceToSet !== 'Provider Error') {
      setAmount(balanceToSet);
    } else {
      setAmount('0');
       toast({ title: 'Error', description: 'Cannot set max due to balance error.', variant: 'destructive'});
    }
  };

  const toggleMode = () => {
    setIsStakingMode(!isStakingMode);
    setAmount('');
    setEstimatedReceiveAmount('0.0');
    setTxStatus('');
    setUserOpHash(null);
    setIsProcessingTx(false);
    setIsPollingStatus(false);
    setCurrentAction(null);
  };

 const commonTxValidations = () => {
    if (!isConnected || !AAaddress || AAaddress === '0x') {
      toast({ title: 'Wallet Not Connected', description: 'Please connect your wallet.', variant: 'destructive' });
      return false;
    }
    if (!STNERO_ADDRESS) {
      toast({ title: 'Configuration Error', description: 'Staking contract address is not configured.', variant: 'destructive' });
      return false;
    }
    if (!EasyStakeVaultABI || EasyStakeVaultABI.length === 0) {
      toast({ title: 'Configuration Error', description: 'Staking contract ABI is not configured.', variant: 'destructive' });
      return false;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: 'Invalid Amount', description: `Please enter a valid amount of ${inputTokenSymbol}.`, variant: 'destructive'});
      return false;
    }
    const currentBalance = parseFloat(isStakingMode ? nativeBalance : shareBalance);
    if (isNaN(currentBalance) || numericAmount > currentBalance) {
      toast({ title: 'Insufficient Balance', description: `You do not have enough ${inputTokenSymbol}.`, variant: 'destructive'});
      return false;
    }
    return true;
  };

 const handleSubmit = async () => {
    if (!commonTxValidations()) return;
    if (!AAaddress || AAaddress === '0x') { 
        toast({ title: 'Account Error', description: 'Smart account address not available.', variant: 'destructive' });
        return;
    }

    const amountToProcess = parseFloat(amount);
    const action = isStakingMode ? 'stake' : 'unstake'; 
    setCurrentAction(action);
    setIsProcessingTx(true);
    setUserOpHash(null);
    setTxStatus(`Preparing to ${action}...`);
    setIsPollingStatus(false);
    
    if (sendUserOpCtx) sendUserOpCtx.setIsWalletPanel(true);

    try {
      let functionName: string;
      let params: any[];
      let txValue: BigNumberish;

      if (isStakingMode) { // Staking NERO
        functionName = 'depositEth';
        // As confirmed by runtime error and stake/page.tsx, depositEth in STAKING_ABI takes 0 args from caller.
        // The actual NERO amount is sent as the transaction value.
        params = []; 
        txValue = ethersUtils.parseEther(amountToProcess.toString());
      } else { // Unstaking stNERO
        functionName = 'redeem'; // Assuming 'redeem' is the correct function in STAKING_ABI for stake2/page.tsx
        const sharesToRedeem = ethersUtils.parseUnits(amountToProcess.toString(), VAULT_DECIMALS);
        // Parameters for redeem(uint256 shares, address receiver, address owner)
        params = [sharesToRedeem, AAaddress, AAaddress]; 
        txValue = '0'; // No ETH value sent for redeem operation itself
      }
      
      if (paymasterCtx && paymasterCtx.selectedPaymasterType && paymasterCtx.selectedToken) {
        console.log('[Stake2Page] Paymaster options from context (used internally by useSendUserOp):', {
            type: paymasterCtx.selectedPaymasterType,
            token: paymasterCtx.selectedToken,
        });
      } else {
        console.log('[Stake2Page] No paymaster token/type selected in context.');
      }

      console.log(`[Stake2Page] Calling execute for ${action} with:`, {
        functionName,
        target: STNERO_ADDRESS,
        abi: "EasyStakeVaultABI (not logging full ABI)",
        value: txValue.toString(),
        params,
      });
      
      const result = await execute({
        functionName,
        target: STNERO_ADDRESS, 
        abi: EasyStakeVaultABI,          
        value: txValue, 
        params: params,    
      }) as UserOperationResultInterface; // Added type assertion as in stake/page.tsx

      if (result && result.userOpHash && !result.error && (result as any).result !== false) { // Added (result as any).result check like in stake/page.tsx
        setUserOpHash(result.userOpHash);
        setTxStatus(`UserOperation submitted: ${result.userOpHash}`);
        setIsPollingStatus(true);
      } else {
        const errorMessage = result?.error || (result?.userOpHash ? 'Operation may have failed or was not mined.' : 'Submission failed or hash missing.');
        toast({ title: `${action === 'stake' ? 'Staking' : 'Unstaking'} Failed`, description: errorMessage, variant: 'destructive' });
        setTxStatus(`${action === 'stake' ? 'Staking' : 'Unstaking'} Failed: ${errorMessage}`);
        setUserOpHash(result?.userOpHash || null);
        setIsPollingStatus(false); // Ensure polling stops on failure
        if (sendUserOpCtx) sendUserOpCtx.setIsWalletPanel(false); // Close panel on failure too
      }

    } catch (error: any) {
      console.error(`[Stake2Page] Error during ${action}:`, error);
      toast({ title: `${isStakingMode ? 'Staking' : 'Unstaking'} Failed`, description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
      setTxStatus(`Error during ${action}: ${error.message || 'Unknown error'}`);
      setIsProcessingTx(false); // Ensure loading state is reset
      setCurrentAction(null);
      if (sendUserOpCtx) sendUserOpCtx.setIsWalletPanel(false);
    } finally {
       // isProcessingTx is primarily controlled by pollingStatus now for success cases
       // For direct error or non-polling failure, it should be reset in catch or specific else blocks
       // if (!isPollingStatus) { // This might prematurely set isProcessingTx to false if polling just started
       //   setIsProcessingTx(false);
       // }
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center px-4 md:px-6">
      <Card className="shadow-lg w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Repeat2 className="h-6 w-6 text-primary" />
                {isStakingMode ? 'Stake NERO, Get stNERO' : 'Unstake stNERO, Get NERO'}
              </CardTitle>
              <CardDescription>
                {isStakingMode 
                  ? 'Stake your NERO to receive stNERO and earn rewards.' 
                  : 'Unstake your stNERO to receive NERO.'}
                {(!isConnected || !AAaddress || AAaddress === "0x") && " Please connect your wallet to proceed."}
              </CardDescription>
            </div>
            <CustomConnectButton />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* <div className="flex justify-end">
            <Button variant="outline" onClick={toggleMode} size="sm" className="gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Switch to {isStakingMode ? 'Unstake stNERO' : 'Stake NERO'}
            </Button>
          </div> */}

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <Label htmlFor="amount-input">Amount to {isStakingMode ? 'Stake' : 'Unstake'} ({inputTokenSymbol})</Label>
               <span className="text-sm text-muted-foreground">
                 Balance: {isLoadingNativeBalance || isLoadingShareBalance ? "Loading..." : (isStakingMode ? nativeBalance : shareBalance)} {inputTokenSymbol}
               </span>
            </div>
            <div className="relative">
              <Input
                id="amount-input"
                type="text"
                placeholder="0.0"
                value={amount}
                onChange={handleAmountChange}
                className="pr-16"
                inputMode="decimal"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
              >
                Max
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center text-muted-foreground">
            <Button variant="outline" onClick={toggleMode} size="sm" className="gap-2">
                <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimate-output">Estimated {outputTokenSymbol} Received</Label>
            <Input
              id="estimate-output"
              type="text"
              readOnly
              value={estimatedReceiveAmount !== 'Error' && parseFloat(estimatedReceiveAmount) > 0 ? `≈ ${parseFloat(estimatedReceiveAmount).toFixed(4)}` : '0.0'}
              className="bg-muted border-muted cursor-not-allowed"
            />
            {estimatedReceiveAmount === 'Error' && (
              <p className="text-xs text-destructive">Could not fetch estimate.</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {txStatus || (userOpHash && `UserOp: ${userOpHash.substring(0,10)}...`)}
            </p>
          </div>

          <div className="border-t pt-4 mt-4">
             <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Wallet className="h-4 w-4" />
                Your {outputTokenSymbol} Balance: {isLoadingNativeBalance || isLoadingShareBalance ? "Loading..." : (isStakingMode ? shareBalance : nativeBalance)} {outputTokenSymbol}
            </p>
          </div>

        </CardContent>
        <CardFooter>
          <Button
             className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
             onClick={handleSubmit}
             disabled={!isConnected || isProcessingTx || parseFloat(amount) <= 0 || isNaN(parseFloat(amount)) || (isStakingMode && parseFloat(amount) > parseFloat(nativeBalance)) || (!isStakingMode && parseFloat(amount) > parseFloat(shareBalance)) }
          >
             {isProcessingTx 
                ? `${currentAction === 'stake' ? 'Staking' : 'Unstaking'}...` 
                : `${isStakingMode ? 'Stake' : 'Unstake'} ${inputTokenSymbol}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
