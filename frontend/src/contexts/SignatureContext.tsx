'use client'

import React, { createContext, useCallback, useEffect, useState, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import { SiweMessage } from 'siwe'
import { getPaymaster } from '@/helper/getPaymaster'
import { SimpleAccount } from '@/helper/simpleAccount'
import { useEthersSigner, useConfig } from '@/hooks'
import { SignatureContextProps, ProviderProps } from '@/types'

export const SignatureContext = createContext<SignatureContextProps | undefined>(undefined)

const SIWE_SESSION_KEY_PREFIX = 'siwe_session_signature_'
const AA_ADDRESS_KEY_PREFIX = 'aa_address_for_eoa_'

export const SignatureProvider: React.FC<ProviderProps> = ({ children }) => {
  const { rpcUrl, bundlerUrl, entryPoint, accountFactory } = useConfig()
  const [loading, setLoading] = useState(true)
  const [AAaddress, setAAaddress] = useState<`0x${string}`>('0x')
  const [simpleAccountInstance, setSimpleAccountInstance] = useState<SimpleAccount | undefined>(
    undefined,
  )
  const [aaNeroBalance, setAaNeroBalance] = useState<string | null>(null)
  const signer = useEthersSigner()
  const { address: eoaAddress, isConnected: isEoaWalletConnected, chain, status: eoaStatus } = useAccount()
  const isConnected = AAaddress !== '0x' && isEoaWalletConnected

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
    if (isConnected) {
        fetchAANeroBalance();
        const intervalId = setInterval(fetchAANeroBalance, 15000);
        return () => clearInterval(intervalId);
    }
  }, [isConnected, fetchAANeroBalance]);

  const resetSignature = useCallback(() => {
    console.log("[SignatureContext] resetSignature called. Current EOA:", eoaAddress);
    setLoading(false) 
    setAAaddress('0x')
    setSimpleAccountInstance(undefined)
    setAaNeroBalance(null)
    if (eoaAddress) {
      localStorage.removeItem(`${SIWE_SESSION_KEY_PREFIX}${eoaAddress}`);
      localStorage.removeItem(`${AA_ADDRESS_KEY_PREFIX}${eoaAddress}`);
      console.log("[SignatureContext] SIWE session cleared from localStorage for EOA:", eoaAddress);
    }
  }, [eoaAddress])

  const initiateSiweAndAAConnection = useCallback(
    async (pm?: 'token' | 'verifying' | 'legacy-token') => {
      if (AAaddress && AAaddress !== '0x') {
        console.log('[SignatureContext] initiateSiweAndAAConnection: AA Address already exists in context, skipping SIWE initiation. AA:', AAaddress);
        return true;
      }
      if (!signer || !eoaAddress || !chain) {
        console.error('[SignatureContext] initiateSiweAndAAConnection: Signer, EOA address, or chain is not available.');
        return false;
      }
      console.log('[SignatureContext] initiateSiweAndAAConnection: Starting SIWE + AA setup for EOA:', eoaAddress);
      setLoading(true);
      try {
        const domain = window.location.host;
        const origin = window.location.origin;
        const statement = 'Sign in with Ethereum to the app.';
        const siweMessage = new SiweMessage({
          domain,
          address: eoaAddress,
          statement,
          uri: origin,
          version: '1',
          chainId: chain.id,
        });
        const messageToSign = siweMessage.prepareMessage();
        const signature = await signer.signMessage(messageToSign);
        const paymaster = pm ? getPaymaster(pm) : undefined;
        const simpleAccount = await SimpleAccount.init(signer, rpcUrl, {
          entryPoint: entryPoint,
          overrideBundlerRpc: bundlerUrl,
          factory: accountFactory,
          paymasterMiddleware: paymaster,
        });
        const derivedAAaddress = await simpleAccount.getSender() as `0x${string}`;
        setSimpleAccountInstance(simpleAccount);
        setAAaddress(derivedAAaddress);
        localStorage.setItem(`${SIWE_SESSION_KEY_PREFIX}${eoaAddress}`, signature);
        localStorage.setItem(`${AA_ADDRESS_KEY_PREFIX}${eoaAddress}`, derivedAAaddress);
        console.log("[SignatureContext] SIWE session stored for EOA:", eoaAddress, "with AA:", derivedAAaddress);
        return true;
      } catch (e) {
        console.error('[SignatureContext] Error during SIWE + AA Connection:', e);
        if(eoaAddress) {
            localStorage.removeItem(`${SIWE_SESSION_KEY_PREFIX}${eoaAddress}`);
            localStorage.removeItem(`${AA_ADDRESS_KEY_PREFIX}${eoaAddress}`);
        }
        setAAaddress('0x');
        setSimpleAccountInstance(undefined);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [AAaddress, signer, rpcUrl, bundlerUrl, entryPoint, accountFactory, eoaAddress, chain],
  );
  
  useEffect(() => {
    if (eoaStatus === 'disconnected' && AAaddress !== '0x') {
        console.log("[SignatureContext] EOA status is 'disconnected', resetting AA/SIWE session.");
        resetSignature();
    }
  }, [eoaStatus, AAaddress, resetSignature]);

  useEffect(() => {
    console.log("[SignatureContext] Session restore check. EOA Connected:", isEoaWalletConnected, "Signer:", !!signer);
    if (isEoaWalletConnected && signer && eoaAddress && chain) {
      const storedAaAddress = localStorage.getItem(`${AA_ADDRESS_KEY_PREFIX}${eoaAddress}`) as `0x${string}` | null;
      if (storedAaAddress && storedAaAddress !== '0x') {
        console.log("[SignatureContext] Found stored AA session for EOA:", eoaAddress, "with AA:", storedAaAddress);
        setLoading(true);
        SimpleAccount.init(signer, rpcUrl, {
          entryPoint: entryPoint,
          overrideBundlerRpc: bundlerUrl,
          factory: accountFactory,
        }).then(async (saInstance) => {
          const derivedSender = await saInstance.getSender() as `0x${string}`;
          if (derivedSender === storedAaAddress) {
            console.log("[SignatureContext] Restored AA session matches derived AA.");
            setSimpleAccountInstance(saInstance);
            setAAaddress(derivedSender);
          } else {
            console.warn("[SignatureContext] Stored AA address mismatch. Clearing stored session.");
            resetSignature();
          }
        }).catch(err => {
          console.error("[SignatureContext] Error re-initializing SimpleAccount for session restore:", err);
          resetSignature();
        }).finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false); 
      }
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEoaWalletConnected, signer, eoaAddress, chain, rpcUrl, bundlerUrl, entryPoint, accountFactory]);


  const getPaymasterMiddleware = (pm?: 'token' | 'verifying' | 'legacy-token') => {
    return pm ? getPaymaster(pm) : undefined
  }
  
  const contextValue = useMemo(() => ({
    loading,
    AAaddress,
    isConnected,
    signer,
    simpleAccountInstance,
    aaNeroBalance,
    initiateSiweAndAAConnection,
    resetSignature,
    getPaymasterMiddleware,
  }), [loading, AAaddress, isConnected, signer, simpleAccountInstance, aaNeroBalance, initiateSiweAndAAConnection, resetSignature]);

  return (
    <SignatureContext.Provider value={contextValue}>
      {children}
    </SignatureContext.Provider>
  )
}
