'use client';

import React, { useState, useEffect, useCallback, useContext } from 'react'
import { useSignature, useSendUserOp, useConfig, usePaymasterContext } from '@/hooks'
import { ethers, utils as ethersUtils, Contract, Signer as EthersSigner } from 'ethers'
import { STAKING_ABI } from '@/constants/abi'
import { UserOperationResultInterface } from '@/types'
import { SendUserOpContext } from '@/contexts'
import { CustomConnectButton } from '@/components/features/connect';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { STNERO_ADDRESS } from '@/constants/contracts';

const TESTNET_RPC_URL = 'https://rpc-testnet.nerochain.io';

const EasyStakeVaultABI = STAKING_ABI;
const VAULT_DECIMALS = 18;

const ENTRYPOINT_ABI_DEPOSIT_TO = ['function depositTo(address account) external payable'];
const EOA_FUNDING_AMOUNT = ethersUtils.parseEther("0.1");

const StakePage = () => {
  const { AAaddress, isConnected, signer: aaSignerDetails } = useSignature()
  const { execute, checkUserOpStatus } = useSendUserOp()
  const { entryPoint: entryPointAddress, rpcUrl: configRpcUrl } = useConfig();
  const sendUserOpCtx = useContext(SendUserOpContext);
  const paymasterCtx = usePaymasterContext();

  const eoaSigner = aaSignerDetails as EthersSigner | undefined;

  const [nativeBalance, setNativeBalance] = useState<string>('0')
  const [isLoadingNativeBalance, setIsLoadingNativeBalance] = useState(false)
  const [shareBalance, setShareBalance] = useState<string>('0')
  const [isLoadingShareBalance, setIsLoadingShareBalance] = useState(false)
  
  const [stakeAmount, setStakeAmount] = useState<string>('')
  const [redeemAmount, setRedeemAmount] = useState<string>('')

  const [isProcessingTx, setIsProcessingTx] = useState(false)
  const [userOpHash, setUserOpHash] = useState<string | null>(null)
  const [txStatus, setTxStatus] = useState<string>('')
  const [isPollingStatus, setIsPollingStatus] = useState(false)
  const [currentAction, setCurrentAction] = useState<'stake' | 'redeem' | 'eoa_fund' | null>(null)

  const [eoaFundingTxHash, setEoaFundingTxHash] = useState<string | null>(null);
  const [eoaFundingStatus, setEoaFundingStatus] = useState<string>('');
  const [isProcessingEoaFunding, setIsProcessingEoaFunding] = useState(false);

  const [sendToAddress, setSendToAddress] = useState<string>('');
  const [sendAmount, setSendAmount] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<string>('');

  const getProvider = useCallback(() => {
    if (eoaSigner && eoaSigner.provider) {
      return eoaSigner.provider;
    }
    console.warn('[StakePage] EOA Signer or provider not available from useSignature. Using fallback RPC provider for read-only operations.');
    return new ethers.providers.JsonRpcProvider(configRpcUrl || TESTNET_RPC_URL);
  }, [eoaSigner, configRpcUrl]);

  const fetchNativeBalance = useCallback(async () => {
    const provider = getProvider();
    if (AAaddress && AAaddress !== '0x' && provider) {
      setIsLoadingNativeBalance(true)
      try {
        const balance = await provider.getBalance(AAaddress)
        setNativeBalance(ethersUtils.formatEther(balance))
      } catch (error) {
        console.error('[StakePage] Error fetching native balance:', error)
        setNativeBalance('Error')
      } finally {
        setIsLoadingNativeBalance(false)
      }
    } else if (!provider && isConnected && AAaddress && AAaddress !== '0x'){
        console.warn('[StakePage] Native Balance: provider not available for AA address.')
        setNativeBalance('Provider Error');
    }
  }, [AAaddress, isConnected, getProvider])

  const fetchShareBalance = useCallback(async () => {
    const provider = getProvider();
    if (AAaddress && AAaddress !== '0x' && provider && STNERO_ADDRESS) {
      setIsLoadingShareBalance(true)
      try {
        const vaultContract = new Contract(STNERO_ADDRESS, EasyStakeVaultABI, provider)
        const balance = await vaultContract.balanceOf(AAaddress)
        setShareBalance(ethersUtils.formatUnits(balance, VAULT_DECIMALS))
      } catch (error) {
        console.error('[StakePage] Error fetching share balance:', error)
        setShareBalance('Error')
      } finally {
        setIsLoadingShareBalance(false)
      }
    } else if (!provider && isConnected && AAaddress && AAaddress !== '0x'){
        console.warn('[StakePage] Share Balance: provider not available for AA address shares.')
        setShareBalance('Provider Error');
    }
  }, [AAaddress, isConnected, getProvider])

  useEffect(() => {
    if (isConnected && AAaddress && AAaddress !== '0x') {
      console.log('[StakePage] Connected. AA Address available. Fetching balances...');
      fetchNativeBalance()
      fetchShareBalance()
    }
  }, [isConnected, AAaddress, fetchNativeBalance, fetchShareBalance])

  useEffect(() => {
    let intervalId: number | null = null
    const pollStatus = async () => {
      if (!userOpHash || !isPollingStatus || currentAction === 'eoa_fund') return // Don't poll for EOA tx here
      try {
        setTxStatus(`Confirming ${currentAction}...`);
        const statusResult = await checkUserOpStatus(userOpHash)
        let successful = false;
        let failed = false;

        if (typeof statusResult === 'boolean') {
          if (statusResult === true) successful = true;
          // else failed = true; // checkUserOpStatus might return false for pending
        } else if (statusResult && typeof statusResult === 'object') {
          if ((statusResult as any).mined === true || (statusResult as any).executed === true) successful = true;
          else if ((statusResult as any).failed === true) failed = true;
        }


        if (successful) {
          console.log(`[StakePage] ${currentAction} successful for UserOpHash: ${userOpHash}`);
          setTxStatus(`${currentAction === 'stake' ? 'Staking' : currentAction === 'redeem' ? 'Redemption' : 'UserOp'} successful!`)
          setIsPollingStatus(false)
          if (sendUserOpCtx) sendUserOpCtx.setIsWalletPanel(false);
          if (paymasterCtx) paymasterCtx.clearToken();
          fetchNativeBalance()
          fetchShareBalance()
          setUserOpHash(null) 
          setCurrentAction(null)
        } else if (failed) {
          console.log(`[StakePage] ${currentAction} failed for UserOpHash: ${userOpHash}`);
          setTxStatus(`${currentAction === 'stake' ? 'Staking' : currentAction === 'redeem' ? 'Redemption' : 'UserOp'} failed.`)
          setIsPollingStatus(false)
          setCurrentAction(null)
        } else {
          setTxStatus('UserOp submitted, awaiting confirmation...');
        }
      } catch (error) {
        console.error(`[StakePage] Error polling ${currentAction} status for UserOpHash ${userOpHash}:`, error)
        setTxStatus(`Error polling ${currentAction} status.`)
        setIsPollingStatus(false)
        setCurrentAction(null)
      }
    }
    if (userOpHash && isPollingStatus && currentAction !== 'eoa_fund') {
      intervalId = window.setInterval(pollStatus, 5000) as unknown as number
      pollStatus() 
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [userOpHash, isPollingStatus, checkUserOpStatus, fetchNativeBalance, fetchShareBalance, currentAction, sendUserOpCtx, paymasterCtx])

  const commonTxValidations = () => {
    const providerForChecks = getProvider();
    if (!isConnected || !AAaddress || AAaddress === '0x' || !providerForChecks) {
      alert('Please connect your wallet and ensure provider is available.');
      return false;
    }
    if (!STNERO_ADDRESS) {
      alert('Staking contract address is not configured.');
      return false;
    }
    if (!EasyStakeVaultABI || EasyStakeVaultABI.length === 0) {
      alert('Staking contract ABI is not configured.');
      return false;
    }
    return true;
  };

  const handleDirectFundAA = async () => {
    if (!eoaSigner) {
      alert('EOA Signer not available. Please ensure your wallet (e.g., MetaMask) is connected.');
      return;
    }
    if (!entryPointAddress) {
      alert('EntryPoint address is not configured.');
      return;
    }
    if (!AAaddress || AAaddress === '0x') {
      alert('AA Wallet address is not determined.');
      return;
    }

    setCurrentAction('eoa_fund');
    setIsProcessingEoaFunding(true);
    setEoaFundingStatus(`Funding AA wallet (${ethersUtils.formatEther(EOA_FUNDING_AMOUNT)} NERO) at EntryPoint...`);
    setEoaFundingTxHash(null);

    try {
      const entryPointInterface = new ethers.utils.Interface(ENTRYPOINT_ABI_DEPOSIT_TO);
      const data = entryPointInterface.encodeFunctionData('depositTo', [AAaddress]);

      console.log(`[StakePage] Sending EOA transaction to EntryPoint (${entryPointAddress}) for AA (${AAaddress}) with value ${ethersUtils.formatEther(EOA_FUNDING_AMOUNT)} NERO`);
      
      const tx = await eoaSigner.sendTransaction({
        to: entryPointAddress,
        value: EOA_FUNDING_AMOUNT,
        data: data,
      });

      setEoaFundingTxHash(tx.hash);
      setEoaFundingStatus(`EOA Funding tx submitted: ${tx.hash}. Awaiting confirmation...`);
      console.log('[StakePage] EOA Funding transaction sent:', tx);

      await tx.wait(1); // Wait for 1 confirmation

      setEoaFundingStatus(`AA Wallet funding successful! Tx: ${tx.hash}`);
      console.log('[StakePage] EOA Funding transaction confirmed:', tx);
      // Optionally, refresh AA native balance or EntryPoint balance for AA here if needed,
      // though the main effect is on the EntryPoint's internal balance for the AA.

    } catch (error: any) {
      console.error('[StakePage] EOA Funding error:', error);
      setEoaFundingStatus(`EOA Funding failed: ${error.message || 'Unknown error'}`);
      setEoaFundingTxHash(null);
    } finally {
      setIsProcessingEoaFunding(false);
      // Do not reset setCurrentAction here, so status remains visible for eoa_fund
    }
  };

  const handleStake = async () => {
    console.log('[StakePage] handleStake called.');
    if (!commonTxValidations()) return;
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert('Please enter a valid amount to stake.')
      return
    }
    if (parseFloat(stakeAmount) > parseFloat(nativeBalance)) {
      alert('Insufficient NERO balance to stake this amount.');
      return;
    }
    
    setCurrentAction('stake');
    setIsProcessingTx(true) 
    setUserOpHash(null) // Clear previous UserOp hashes
    setTxStatus('Preparing to stake...')
    setIsPollingStatus(false)
    console.log('[StakePage] Stake: Set isProcessingTx=true. Current state:', { stakeAmount, AAaddress });

    let finalStakeResult: UserOperationResultInterface | null = null;
    try {
      const amountToStake = ethersUtils.parseEther(stakeAmount)
      console.log('[StakePage] Stake: Calling execute with amount:', stakeAmount);
      finalStakeResult = await execute({
        functionName: 'depositEth',
        target: STNERO_ADDRESS,
        abi: EasyStakeVaultABI,
        value: amountToStake,
        params: [],
      }) as UserOperationResultInterface;
      console.log('[StakePage] Stake: execute() promise resolved. Result:', finalStakeResult);

      if (finalStakeResult && finalStakeResult.userOpHash && !finalStakeResult.error && finalStakeResult.result !== false) {
          setUserOpHash(finalStakeResult.userOpHash);
          setTxStatus(`Stake UserOp submitted: ${finalStakeResult.userOpHash}. Polling for confirmation...`);
          setIsPollingStatus(true);
          console.log('[StakePage] Stake: Polling started for UserOpHash:', finalStakeResult.userOpHash);
      } else {
          const errorMessage = finalStakeResult?.error || 'Stake submission failed or hash missing.';
          setTxStatus(`Staking Failed: ${errorMessage}`);
          console.log('[StakePage] Stake: Execute completed with failure/error, not polling. Result:', finalStakeResult);
          setUserOpHash(finalStakeResult?.userOpHash || null);
          setIsPollingStatus(false);
      }

    } catch (error: any) {
      console.error('[StakePage] Staking error caught by StakePage:', error)
      setTxStatus(`Staking error: ${error.message || 'Unknown error'}`)
      setIsPollingStatus(false);
      setUserOpHash(null);
    } finally {
        setIsProcessingTx(false) 
        console.log('[StakePage] Stake: Finally block. Set isProcessingTx=false.');
    }
  }

  const handleRedeem = async () => {
    console.log('[StakePage] handleRedeem called.');
    if (!commonTxValidations()) return;
    if (!redeemAmount || parseFloat(redeemAmount) <= 0) {
      alert('Please enter a valid amount of shares to redeem.')
      return
    }
    if (parseFloat(redeemAmount) > parseFloat(shareBalance)) {
      alert('Insufficient share balance to redeem this amount.');
      return;
    }

    setCurrentAction('redeem');
    setIsProcessingTx(true)
    setUserOpHash(null)
    setTxStatus('Preparing to redeem...')
    setIsPollingStatus(false)
    console.log('[StakePage] Redeem: Set isProcessingTx=true. Current state:', { redeemAmount, AAaddress });
    let finalResult: UserOperationResultInterface | null = null;
    try {
      const sharesToRedeem = ethersUtils.parseUnits(redeemAmount, VAULT_DECIMALS)
      console.log('[StakePage] Redeem: Calling execute with shares:', redeemAmount);
      finalResult = await execute({
        functionName: 'redeemEth',
        target: STNERO_ADDRESS,
        abi: EasyStakeVaultABI,
        value: '0',
        params: [sharesToRedeem, AAaddress],
      }) as UserOperationResultInterface;
      console.log('[StakePage] Redeem: execute() promise resolved. Result:', finalResult);

      if (finalResult && finalResult.userOpHash && !finalResult.error && finalResult.result !== false) {
          setUserOpHash(finalResult.userOpHash);
          setTxStatus(`Redeem UserOp submitted: ${finalResult.userOpHash}. Polling for confirmation...`);
          setIsPollingStatus(true);
          console.log('[StakePage] Redeem: Polling started for UserOpHash:', finalResult.userOpHash);
      } else {
          const errorMessage = finalResult?.error || 'Redeem submission failed or hash missing.';
          setTxStatus(`Redemption Failed: ${errorMessage}`);
          console.log('[StakePage] Redeem: Execute completed with failure/error, not polling. Result:', finalResult);
          setUserOpHash(finalResult?.userOpHash || null);
          setIsPollingStatus(false);
      }

    } catch (error: any) {
      console.error('[StakePage] Redemption error caught by StakePage:', error)
      setTxStatus(`Redemption error: ${error.message || 'Unknown error'}`)
      setIsPollingStatus(false);
      setUserOpHash(null);
    } finally {
        setIsProcessingTx(false)
        console.log('[StakePage] Redeem: Finally block. Set isProcessingTx=false.');
    }
  }

  const handleSendVaultToken = async () => {
    if (!sendToAddress || !ethers.utils.isAddress(sendToAddress)) {
      alert('Please enter a valid recipient address.');
      return;
    }
    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      alert('Please enter a valid amount to send.');
      return;
    }
    setIsSending(true);
    setSendStatus('Preparing to send...');
    try {
      const amountToSend = ethers.utils.parseUnits(sendAmount, VAULT_DECIMALS);
      const result = await execute({
        functionName: 'transfer',
        target: STNERO_ADDRESS,
        abi: EasyStakeVaultABI,
        value: '0',
        params: [sendToAddress, amountToSend],
      }) as UserOperationResultInterface;
      if (result && result.userOpHash && !result.error && result.result !== false) {
        setSendStatus(`Send UserOp submitted: ${result.userOpHash}.`);
      } else {
        setSendStatus(`Send failed: ${result?.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      setSendStatus(`Send error: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  const getButtonText = (actionType: 'stake' | 'redeem') => {
    if (currentAction === actionType) { // Only show specific status if it's for this button's action
      if (isProcessingTx && (actionType === 'stake' || actionType === 'redeem') ) { 
        return actionType === 'stake' ? 'Staking...' : 'Redeeming...';
      }
      // For UserOps, txStatus will show prefund status, then staking status
      // isPollingStatus will be true for the actual stake/redeem UserOp
      if (isPollingStatus && (actionType === 'stake' || actionType === 'redeem')) { 
        return txStatus.startsWith('Confirming') || txStatus.startsWith('UserOp submitted') || txStatus.startsWith('Status: Still processing') 
               ? (txStatus || 'Polling...') 
               : (actionType === 'stake' ? 'Stake NERO' : 'Redeem Shares');
      }
      // If not polling but still processing (e.g. prefund step, or error occurred before polling)
      if (isProcessingTx && txStatus) {
          return txStatus;
      }
    }
    return actionType === 'stake' ? 'Stake NERO' : 'Redeem Shares';
  };

  return (
    <div className="container mx-auto p-4 pt-10 min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">AA Stake & Redeem NERO</h1>

      {!isConnected && (
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      )}

      {isConnected && AAaddress && AAaddress !== '0x' ? (
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 mb-8 max-w-md mx-auto">
          <p className="text-lg mb-1 text-gray-300">AA Wallet: <span className="font-mono text-sm text-purple-300 break-all">{AAaddress}</span></p>
          <p className="text-lg mb-1 text-gray-300">
            NERO Balance (AA Wallet): {isLoadingNativeBalance ? 'Loading...' : <span className="font-semibold text-purple-300">{nativeBalance} NERO</span>}
          </p>
          <p className="text-lg mb-2 text-gray-300">
            Vault Shares (stNERO): {isLoadingShareBalance ? 'Loading...' : <span className="font-semibold text-purple-300">{shareBalance}</span>}
          </p>
          <button 
            onClick={() => { fetchNativeBalance(); fetchShareBalance(); }}
            disabled={isLoadingNativeBalance || isLoadingShareBalance || isProcessingTx || isPollingStatus || isProcessingEoaFunding}
            className="w-full px-4 py-2 mb-3 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-500 transition-colors"
          >
            Refresh Balances
          </button>
          {eoaSigner && entryPointAddress && AAaddress && AAaddress !== '0x' && (
            <div className="mt-2 pt-3 border-t border-gray-700">
              {/* <button 
                onClick={handleDirectFundAA}
                disabled={isProcessingEoaFunding || isProcessingTx || isPollingStatus}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-500 transition-colors"
              >
                {isProcessingEoaFunding ? 'Funding AA via EOA...' : `Fund AA at EntryPoint (${ethersUtils.formatEther(EOA_FUNDING_AMOUNT)} NERO via EOA)`}
              </button> */}
              {eoaFundingStatus && (
                <p className={`text-xs mt-2 text-center ${eoaFundingStatus.includes('failed') || eoaFundingStatus.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  EOA Funding Status: {eoaFundingStatus}
                  {eoaFundingTxHash && <span> (Tx: <a href={`https://testnet.neroscan.io/tx/${eoaFundingTxHash}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-300">{eoaFundingTxHash.substring(0,6)}...{eoaFundingTxHash.substring(eoaFundingTxHash.length - 4)}</a>)</span>}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-xl text-gray-400 mb-8">Please connect your wallet (e.g., MetaMask for EOA, then link/create AA).</p>
      )}

      {isConnected && AAaddress && AAaddress !== '0x' && (
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 mb-4 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-3 text-center text-purple-300">Stake NERO</h2>
          <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder="Amount of NERO to stake" disabled={isProcessingTx || isPollingStatus || isProcessingEoaFunding} className="w-full mb-3 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <button onClick={handleStake} disabled={isProcessingTx || isPollingStatus || isProcessingEoaFunding || !stakeAmount || parseFloat(stakeAmount) <= 0 || nativeBalance === 'Error' || parseFloat(nativeBalance) < parseFloat(stakeAmount)} className="w-full px-6 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors">
            {getButtonText('stake')}
          </button>
        </div>
      )}

      {isConnected && AAaddress && AAaddress !== '0x' && (
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-3 text-center text-purple-300">Redeem Vault Shares</h2>
          <input type="number" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} placeholder="Amount of shares to redeem" disabled={isProcessingTx || isPollingStatus || isProcessingEoaFunding} className="w-full mb-3 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <button onClick={handleRedeem} disabled={isProcessingTx || isPollingStatus || isProcessingEoaFunding || !redeemAmount || parseFloat(redeemAmount) <= 0 || shareBalance === 'Error' || parseFloat(shareBalance) < parseFloat(redeemAmount)} className="w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {getButtonText('redeem')}
          </button>
        </div>
      )}

      {isConnected && AAaddress && AAaddress !== '0x' && (
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 max-w-md mx-auto mt-6">
          <h2 className="text-2xl font-semibold mb-3 text-center text-purple-300">Send stNERO</h2>
          <input
            type="text"
            value={sendToAddress}
            onChange={e => setSendToAddress(e.target.value)}
            placeholder="Recipient address"
            disabled={isSending}
            className="w-full mb-3 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="number"
            value={sendAmount}
            onChange={e => setSendAmount(e.target.value)}
            placeholder="Amount of stNERO to send"
            disabled={isSending}
            className="w-full mb-3 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSendVaultToken}
            disabled={isSending || !sendToAddress || !sendAmount}
            className="w-full px-6 py-3 font-semibold text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 transition-colors"
          >
            {isSending ? 'Sending...' : 'Send stNERO'}
          </button>
          {sendStatus && (
            <p className={`mt-2 text-center text-sm ${sendStatus.includes('error') || sendStatus.includes('failed') ? 'text-red-400' : 'text-blue-400'}`}>
              {sendStatus}
            </p>
          )}
        </div>
      )}

      {(userOpHash || (currentAction === 'stake' && txStatus && !isPollingStatus && !isProcessingTx)) &&  ( // Show status for UserOps
        <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-xl max-w-md mx-auto text-center">
          <p className="text-md font-semibold text-purple-300 mb-1">UserOperation Status:</p>
          {userOpHash && <p className="text-xs text-gray-400 mb-1 break-all">UserOp Hash: <span className="font-mono text-purple-300">{userOpHash}</span></p>}
          <p className={`text-sm font-medium ${txStatus.includes('successful') ? 'text-green-400' : txStatus.includes('failed') || txStatus.includes('Error') ? 'text-red-400' : 'text-blue-400'}`}>
            Status: {txStatus || 'Waiting...'}
          </p>
        </div>
      )}
    </div>
  )
}

export default StakePage
