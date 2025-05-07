'use client';

import React, { useState, useEffect, useCallback } from 'react'
import { useSignature, useSendUserOp } from '@/hooks'
import { ethers, utils as ethersUtils } from 'ethers'
import { STAKING_ABI } from '@/constants/abi'

const TESTNET_RPC_URL = 'https://rpc-testnet.nerochain.io';

// --- PLACEHOLDERS - REPLACE THESE (if necessary, though address is now set) --- 
const EASYSTAKE_VAULT_ADDRESS = '0x577937D20415183c7C50F5773A0C02D5B8aa344c' 
const EasyStakeVaultABI = STAKING_ABI;
const VAULT_DECIMALS = 18; 
// --- END PLACEHOLDERS ---

const StakePage = () => {
  const { AAaddress, isConnected, provider: aaProviderFromHook } = useSignature()
  const { execute, waitForUserOpResult, checkUserOpStatus } = useSendUserOp()

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
  const [currentAction, setCurrentAction] = useState<'stake' | 'redeem' | null>(null)

  // Function to get a provider, prioritizing the one from the hook
  const getProvider = useCallback(() => {
    if (aaProviderFromHook) {
      return aaProviderFromHook;
    }
    console.warn('AA Provider not available from useSignature hook. Using fallback RPC provider for read-only operations.');
    return new ethers.providers.JsonRpcProvider(TESTNET_RPC_URL);
  }, [aaProviderFromHook]);

  const fetchNativeBalance = useCallback(async () => {
    const provider = getProvider();
    if (AAaddress && AAaddress !== '0x' && provider) {
      setIsLoadingNativeBalance(true)
      try {
        const balance = await provider.getBalance(AAaddress)
        setNativeBalance(ethersUtils.formatEther(balance))
      } catch (error) {
        console.error('Error fetching native balance:', error)
        setNativeBalance('Error')
      } finally {
        setIsLoadingNativeBalance(false)
      }
    } else if (!provider && isConnected && AAaddress && AAaddress !== '0x'){
        setNativeBalance('Provider Error');
    }
  }, [AAaddress, isConnected, getProvider])

  const fetchShareBalance = useCallback(async () => {
    const provider = getProvider();
    if (AAaddress && AAaddress !== '0x' && provider && EASYSTAKE_VAULT_ADDRESS) {
      setIsLoadingShareBalance(true)
      try {
        const vaultContract = new ethers.Contract(EASYSTAKE_VAULT_ADDRESS, EasyStakeVaultABI, provider)
        const balance = await vaultContract.balanceOf(AAaddress)
        setShareBalance(ethersUtils.formatUnits(balance, VAULT_DECIMALS))
      } catch (error) {
        console.error('Error fetching share balance:', error)
        setShareBalance('Error')
      } finally {
        setIsLoadingShareBalance(false)
      }
    } else if (!provider && isConnected && AAaddress && AAaddress !== '0x'){
        setShareBalance('Provider Error');
    }
  }, [AAaddress, isConnected, getProvider])

  useEffect(() => {
    if (isConnected && AAaddress && AAaddress !== '0x') {
      fetchNativeBalance()
      fetchShareBalance()
    }
  }, [isConnected, AAaddress, fetchNativeBalance, fetchShareBalance])

  useEffect(() => {
    let intervalId: number | null = null
    const pollStatus = async () => {
      if (!userOpHash || !isPollingStatus) return
      try {
        setTxStatus(`Confirming ${currentAction}...`);
        const statusResult = await checkUserOpStatus(userOpHash)
        let successful = false;
        let failed = false;

        if (typeof statusResult === 'boolean') {
          if (statusResult === true) successful = true;
          else failed = true;
        } else if (statusResult && typeof statusResult === 'object') {
          if ((statusResult as any).mined === true || (statusResult as any).executed === true) successful = true;
          else if ((statusResult as any).failed === true) failed = true;
        }

        if (successful) {
          setTxStatus(`${currentAction === 'stake' ? 'Staking' : 'Redemption'} successful!`)
          setIsPollingStatus(false)
          fetchNativeBalance()
          fetchShareBalance()
          setUserOpHash(null) 
          setCurrentAction(null)
        } else if (failed) {
          setTxStatus(`${currentAction === 'stake' ? 'Staking' : 'Redemption'} failed.`)
          setIsPollingStatus(false)
          setCurrentAction(null)
        } else {
          setTxStatus('Transaction submitted, awaiting confirmation...');
        }
      } catch (error) {
        console.error(`Error polling ${currentAction} status:`, error)
        setTxStatus(`Error polling ${currentAction} status.`)
        setIsPollingStatus(false)
        setCurrentAction(null)
      }
    }
    if (userOpHash && isPollingStatus) {
      intervalId = window.setInterval(pollStatus, 5000) as unknown as number
      pollStatus()
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [userOpHash, isPollingStatus, checkUserOpStatus, fetchNativeBalance, fetchShareBalance, currentAction])

  const commonTxValidations = () => {
    const providerForChecks = getProvider();
    if (!isConnected || !AAaddress || AAaddress === '0x' || !providerForChecks) {
      alert('Please connect your wallet and ensure provider is available.');
      return false;
    }
    if (!EASYSTAKE_VAULT_ADDRESS) {
      alert('Staking contract address is not configured.');
      return false;
    }
    if (!EasyStakeVaultABI || EasyStakeVaultABI.length === 0) {
      alert('Staking contract ABI is not configured.');
      return false;
    }
    return true;
  };

  const handleStake = async () => {
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
    setUserOpHash(null)
    setTxStatus('Preparing to stake...')
    setIsPollingStatus(false)
    try {
      const amountToStake = ethersUtils.parseEther(stakeAmount)
      await execute({
        function: 'depositEth',
        contractAddress: EASYSTAKE_VAULT_ADDRESS,
        abi: EasyStakeVaultABI,
        value: amountToStake,
        params: [], 
      })
      const result = await waitForUserOpResult()
      setUserOpHash(result.userOpHash)
      
      if (result.userOpHash) { 
        setTxStatus(`Stake UserOp submitted: ${result.userOpHash}. Polling for confirmation...`)
        setIsPollingStatus(true)
      } else {
         setTxStatus(`Stake UserOp submission may have failed or is pending without immediate hash.`)
      }
    } catch (error: any) {
      console.error('Staking error:', error)
      setTxStatus(`Staking error: ${error.message || 'Unknown error'}`)
      setCurrentAction(null)
    } finally {
        setIsProcessingTx(false)
    }
  }

  const handleRedeem = async () => {
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
    try {
      const sharesToRedeem = ethersUtils.parseUnits(redeemAmount, VAULT_DECIMALS)
      await execute({
        function: 'redeemEth',
        contractAddress: EASYSTAKE_VAULT_ADDRESS,
        abi: EasyStakeVaultABI,
        value: '0',
        params: [sharesToRedeem, AAaddress], 
      })
      const result = await waitForUserOpResult()
      setUserOpHash(result.userOpHash)

      if (result.userOpHash) { 
        setTxStatus(`Redeem UserOp submitted: ${result.userOpHash}. Polling for confirmation...`)
        setIsPollingStatus(true)
      } else {
         setTxStatus(`Redeem UserOp submission may have failed or is pending without immediate hash.`)
      }
    } catch (error: any) {
      console.error('Redemption error:', error)
      setTxStatus(`Redemption error: ${error.message || 'Unknown error'}`)
      setCurrentAction(null)
    } finally {
        setIsProcessingTx(false)
    }
  }

  const getButtonText = (actionType: 'stake' | 'redeem') => {
    if (currentAction === actionType) {
      if (isProcessingTx) {
        return actionType === 'stake' ? 'Staking...' : 'Redeeming...';
      }
      if (isPollingStatus) {
        return txStatus || (actionType === 'stake' ? 'Processing Stake...' : 'Processing Redeem...');
      }
    }
    return actionType === 'stake' ? 'Stake NERO' : 'Redeem Shares';
  };

  return (
    <div className="container mx-auto p-4 pt-10 min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">AA Stake & Redeem NERO</h1>

      {isConnected && AAaddress && AAaddress !== '0x' ? (
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 mb-8 max-w-md mx-auto">
          <p className="text-lg mb-1 text-gray-300">AA Wallet: <span className="font-mono text-sm text-purple-300 break-all">{AAaddress}</span></p>
          <p className="text-lg mb-1 text-gray-300">
            NERO Balance: {isLoadingNativeBalance ? 'Loading...' : <span className="font-semibold text-purple-300">{nativeBalance} NERO</span>}
          </p>
          <p className="text-lg mb-2 text-gray-300">
            Vault Shares (stNERO): {isLoadingShareBalance ? 'Loading...' : <span className="font-semibold text-purple-300">{shareBalance}</span>}
          </p>
          <button 
            onClick={() => { fetchNativeBalance(); fetchShareBalance(); }}
            disabled={isLoadingNativeBalance || isLoadingShareBalance || isProcessingTx || isPollingStatus}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-500 transition-colors"
          >
            Refresh Balances
          </button>
        </div>
      ) : (
        <p className="text-center text-xl text-gray-400 mb-8">Please connect your AA wallet.</p>
      )}

      {isConnected && AAaddress && AAaddress !== '0x' && (
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 mb-4 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-3 text-center text-purple-300">Stake NERO</h2>
          <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder="Amount of NERO to stake" disabled={isProcessingTx || isPollingStatus} className="w-full mb-3 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <button onClick={handleStake} disabled={isProcessingTx || isPollingStatus || !stakeAmount || parseFloat(stakeAmount) <= 0 || nativeBalance === 'Error' || parseFloat(nativeBalance) < parseFloat(stakeAmount)} className="w-full px-6 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors">
            {getButtonText('stake')}
          </button>
        </div>
      )}

      {isConnected && AAaddress && AAaddress !== '0x' && (
        <div className="bg-gray-800 shadow-xl rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold mb-3 text-center text-purple-300">Redeem Vault Shares</h2>
          <input type="number" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} placeholder="Amount of shares to redeem" disabled={isProcessingTx || isPollingStatus} className="w-full mb-3 px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <button onClick={handleRedeem} disabled={isProcessingTx || isPollingStatus || !redeemAmount || parseFloat(redeemAmount) <= 0 || shareBalance === 'Error' || parseFloat(shareBalance) < parseFloat(redeemAmount)} className="w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {getButtonText('redeem')}
          </button>
        </div>
      )}

      {userOpHash && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-xl max-w-md mx-auto text-center">
          <p className="text-md font-semibold text-purple-300 mb-1">Transaction Status:</p>
          <p className="text-xs text-gray-400 mb-1 break-all">UserOp Hash: <span className="font-mono text-purple-300">{userOpHash}</span></p>
          <p className={`text-sm font-medium ${txStatus.includes('successful') ? 'text-green-400' : txStatus.includes('failed') || txStatus.includes('Error') ? 'text-red-400' : 'text-blue-400'}`}>
            Status: {txStatus || 'Waiting...'}
          </p>
        </div>
      )}
    </div>
  )
}

export default StakePage
