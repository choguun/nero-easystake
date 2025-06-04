'use client'

import React, { createContext, useCallback, useEffect, useState, ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { SiweMessage } from 'siwe'
import { getPaymaster } from '@/helper/getPaymaster'
import { SimpleAccount } from '@/helper/simpleAccount'
import { useEthersSigner, useConfig } from '@/hooks'
import { SignatureContextProps, ProviderProps } from '@/types'
import { Signer } from 'ethers'

const SIWE_SESSION_TOKEN_KEY = 'siweSessionToken'

export const SignatureContext = createContext<SignatureContextProps | undefined>(undefined)

export const SignatureProvider: React.FC<ProviderProps> = ({ children }) => {
  const { rpcUrl, bundlerUrl, entryPoint, accountFactory } = useConfig()
  const [loading, setLoading] = useState(false)
  const [AAaddress, setAAaddress] = useState<`0x${string}`>('0x')
  const [simpleAccountInstance, setSimpleAccountInstance] = useState<SimpleAccount | undefined>(
    undefined,
  )
  const signer = useEthersSigner()
  const { address: eoaAddress, isConnected: eoaIsConnected } = useAccount()
  const [siweToken, setSiweToken] = useState<string | null>(null)
  const isConnected = AAaddress !== '0x' && eoaIsConnected && !!siweToken

  const attemptSilentAuth = useCallback(async () => {
    if (!signer || !eoaAddress) {
      console.log('[SignatureProvider] EOA signer or address not available for silent auth.')
      return false
    }
    const tokenFromStorage = localStorage.getItem(SIWE_SESSION_TOKEN_KEY)
    if (!tokenFromStorage) {
      console.log('[SignatureProvider] No SIWE token in storage for silent auth.')
      setSiweToken(null)
      return false
    }

    console.log('[SignatureProvider] Attempting silent SIWE auth with token from storage.')
    setLoading(true)
    try {
      console.warn("[SignatureProvider] attemptSilentAuth: Using MOCK validation. Replace with actual backend verification.")
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate async call
      const simpleAccount = await SimpleAccount.init(signer, rpcUrl, {
        entryPoint: entryPoint,
        overrideBundlerRpc: bundlerUrl,
        factory: accountFactory,
      })
      const mockRestoredAAAddress = await simpleAccount.getSender()
      setSiweToken(tokenFromStorage)
      setAAaddress(mockRestoredAAAddress as `0x${string}`)
      setSimpleAccountInstance(simpleAccount)
      console.log('[SignatureProvider] SIWE session (MOCKED) restored for AA:', mockRestoredAAAddress)
      setLoading(false)
      return true // Mock silent auth successful
    } catch (error) {
      console.error('[SignatureProvider] Error during silent SIWE auth attempt:', error)
      localStorage.removeItem(SIWE_SESSION_TOKEN_KEY)
      setSiweToken(null)
      setLoading(false)
      return false // Silent auth failed
    }
  }, [signer, eoaAddress, rpcUrl, entryPoint, bundlerUrl, accountFactory])

  const signMessage = useCallback(
    async (pm?: 'token' | 'verifying' | 'legacy-token') => {
      if (!signer || !eoaAddress) {
        console.error('[SignatureProvider] EOA Signer or address not available for signMessage');
        return;
      }
      setLoading(true);
      try {
        // --- ACTUAL SIWE LOGIC --- 
        console.log("[SignatureProvider] signMessage: Initiating ACTUAL SIWE flow.");

        // 1. Get nonce from backend (example)
        // const nonceResponse = await fetch('/api/auth/siwe-nonce'); // Replace with your actual endpoint
        // if (!nonceResponse.ok) throw new Error('Failed to fetch SIWE nonce');
        // const nonce = await nonceResponse.text();
        const nonce = Math.random().toString(36).substring(2); // Replace with server-side nonce in production

        // 2. Create SIWE message object
        const message = new SiweMessage({
          domain: window.location.host,
          address: eoaAddress,
          statement: 'Sign in with Ethereum to the app.',
          uri: window.location.origin,
          version: '1',
          chainId: await signer.getChainId(), 
          nonce: nonce,
        });
        const messageToSign = message.prepareMessage();

        // 3. EOA signs the message
        console.log("[SignatureProvider] Requesting EOA signature for SIWE message...");
        const eoaSignature = await signer.signMessage(messageToSign);
        console.log("[SignatureProvider] EOA signature obtained.");
        
        // --- Fallback to MOCK for backend part --- 
        console.warn("[SignatureProvider] signMessage: EOA signature obtained. Using MOCK for backend verification and AA setup.");
        const paymaster = pm ? getPaymaster(pm) : undefined;
        const simpleAccount = await SimpleAccount.init(signer, rpcUrl, {
          entryPoint: entryPoint,
          overrideBundlerRpc: bundlerUrl,
          factory: accountFactory,
          paymasterMiddleware: paymaster,
        });
        const newAaAddress = await simpleAccount.getSender();
        const mockNewToken = "mockSiweJwtToken_" + Date.now() + "_for_" + newAaAddress.substring(2,10);
        localStorage.setItem(SIWE_SESSION_TOKEN_KEY, mockNewToken);
        setSiweToken(mockNewToken);
        setAAaddress(newAaAddress as `0x${string}`);
        setSimpleAccountInstance(simpleAccount);
        console.log('[SignatureProvider] SIWE EOA Sign (actual) + Backend (mocked), AA session established:', newAaAddress);

      } catch (e) {
        console.error('[SignatureProvider] Error in signMessage (SIWE or SimpleAccount.init):', e);
      } finally {
        setLoading(false);
      }
    },
    [signer, eoaAddress, rpcUrl, bundlerUrl, entryPoint, accountFactory],
  );

  const resetSignature = useCallback(() => {
    setLoading(true)
    localStorage.removeItem(SIWE_SESSION_TOKEN_KEY)
    setSiweToken(null)
    setAAaddress('0x')
    setSimpleAccountInstance(undefined)
    setLoading(false)
    console.log('[SignatureProvider] AA session signed out, token cleared.')
  }, [])

  const getPaymasterMiddleware = useCallback(
    (pm?: 'token' | 'verifying' | 'legacy-token') => {
      return pm ? getPaymaster(pm) : undefined
    },
    [],
  )

  useEffect(() => {
    if (eoaIsConnected && signer && eoaAddress) {
      if (!siweToken && !loading) {
        attemptSilentAuth().then(success => {
          if (!success) {
            console.log('[SignatureProvider] Silent auth failed. User may need to sign in explicitly.')
          }
        })
      }
    } else if (!eoaIsConnected) {
      resetSignature()
    }
  }, [eoaIsConnected, signer, eoaAddress, siweToken, loading, attemptSilentAuth, resetSignature])

  const contextValue: SignatureContextProps = {
    loading,
    AAaddress,
    isConnected,
    signer,
    simpleAccountInstance,
    signMessage,
    resetSignature,
    getPaymasterMiddleware,
  }

  return (
    <SignatureContext.Provider value={contextValue}>
      {children}
    </SignatureContext.Provider>
  )
}
