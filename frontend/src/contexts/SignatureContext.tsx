'use client'

import React, { createContext, useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import { getPaymaster } from '@/helper/getPaymaster'
import { SimpleAccount } from '@/helper/simpleAccount'
import { useEthersSigner, useConfig } from '@/hooks'
import { SignatureContextProps, ProviderProps } from '@/types'

export const SignatureContext = createContext<SignatureContextProps | undefined>(undefined)

export const SignatureProvider: React.FC<ProviderProps> = ({ children }) => {
  const { rpcUrl, bundlerUrl, entryPoint, accountFactory } = useConfig()
  const [loading, setLoading] = useState(false)
  const [AAaddress, setAAaddress] = useState<`0x${string}`>('0x')
  const [simpleAccountInstance, setSimpleAccountInstance] = useState<SimpleAccount | undefined>(
    undefined,
  )
  const [aaNeroBalance, setAaNeroBalance] = useState<string | null>(null)
  const signer = useEthersSigner()
  const { isConnected: isWalletConnected } = useAccount()
  const isConnected = AAaddress !== '0x' && isWalletConnected

  const getProvider = useCallback(() => {
    if (signer?.provider) {
      return signer.provider;
    }
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return new ethers.providers.Web3Provider((window as any).ethereum);
    }
    console.warn("No Ethereum provider available for balance fetching.");
    return null;
  }, [signer]);

  const fetchAANeroBalance = useCallback(async () => {
    const provider = getProvider();
    if (AAaddress && AAaddress !== '0x' && provider) {
      try {
        const balanceWei = await provider.getBalance(AAaddress);
        const balanceNer = ethers.utils.formatEther(balanceWei);
        const formattedBalance = parseFloat(balanceNer).toFixed(4);
        setAaNeroBalance(`${formattedBalance} NERO`);
      } catch (error) {
        console.error("Error fetching AA NERO balance:", error);
        setAaNeroBalance(null); 
      }
    } else {
      setAaNeroBalance(null); 
    }
  }, [AAaddress, getProvider]);

  useEffect(() => {
    fetchAANeroBalance();
    const intervalId = setInterval(fetchAANeroBalance, 15000);
    return () => clearInterval(intervalId);
  }, [fetchAANeroBalance]);

  const signMessage = useCallback(
    async (pm?: 'token' | 'verifying' | 'legacy-token') => {
      if (!signer) {
        console.error('Signer is not available')
        return
      }

      const paymaster = pm ? getPaymaster(pm) : undefined
      try {
        setLoading(true)
        const simpleAccount = await SimpleAccount.init(signer, rpcUrl, {
          entryPoint: entryPoint,
          overrideBundlerRpc: bundlerUrl,
          factory: accountFactory,
          paymasterMiddleware: paymaster,
        })
        setSimpleAccountInstance(simpleAccount)
        const address = await simpleAccount.getSender()
        setAAaddress(address as `0x${string}`)
      } catch (e) {
        console.error('Error initializing SimpleAccount', e)
      } finally {
        setLoading(false)
      }
    },
    [signer, rpcUrl, bundlerUrl, entryPoint, accountFactory],
  )

  const resetSignature = useCallback(() => {
    setLoading(false)
    setAAaddress('0x')
    setSimpleAccountInstance(undefined)
    setAaNeroBalance(null)
  }, [])

  const getPaymasterMiddleware = (pm?: 'token' | 'verifying' | 'legacy-token') => {
    return pm ? getPaymaster(pm) : undefined
  }

  useEffect(() => {
    if (!signer) return
    resetSignature()
  }, [signer, resetSignature])

  useEffect(() => {
    if (AAaddress === '0x' && signer && isWalletConnected) {
      signMessage()
    }
  }, [AAaddress, signMessage, signer, isWalletConnected])

  return (
    <SignatureContext.Provider
      value={{
        loading,
        AAaddress,
        isConnected,
        signer,
        simpleAccountInstance,
        aaNeroBalance,
        signMessage,
        resetSignature,
        getPaymasterMiddleware,
      }}
    >
      {children}
    </SignatureContext.Provider>
  )
}
