'use client'

import React, { createContext, useCallback, useEffect, useState, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
// SIWE is no longer needed for this simpler approach
// import { SiweMessage } from 'siwe'
import { getPaymaster } from '@/helper/getPaymaster'
import { SimpleAccount } from '@/helper/simpleAccount'
import { useEthersSigner, useConfig } from '@/hooks'
import { SignatureContextProps, ProviderProps } from '@/types'

export const SignatureContext = createContext<SignatureContextProps | undefined>(undefined)

// We only need to store the AA address now.
const AA_ADDRESS_KEY_PREFIX = 'aa_address_for_eoa_'

export const SignatureProvider: React.FC<ProviderProps> = ({ children }) => {
  const { rpcUrl, bundlerUrl, entryPoint, accountFactory } = useConfig()
  const [loading, setLoading] = useState(true)
  const [AAaddress, setAAaddress] = useState<`0x${string}`>('0x')
  const [simpleAccountInstance, setSimpleAccountInstance] = useState<SimpleAccount | undefined>(
    undefined,
  )
  const [sessionEoaAddress, setSessionEoaAddress] = useState<`0x${string}` | null>(null);
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
    // Use the sessionEoaAddress from state, which is more stable than the hook's value during transitions.
    console.log("[SignatureContext] resetSignature called. EOA from state:", sessionEoaAddress);
    setLoading(false) 
    setAAaddress('0x')
    setSimpleAccountInstance(undefined)
    setAaNeroBalance(null)
    if (sessionEoaAddress) {
      localStorage.removeItem(`${AA_ADDRESS_KEY_PREFIX}${sessionEoaAddress}`);
      console.log("[SignatureContext] AA session cleared from localStorage for EOA:", sessionEoaAddress);
    }
    setSessionEoaAddress(null); // Clear the session EOA address
  }, [sessionEoaAddress])

  // This is the new, simpler connection function.
  const connectAA = useCallback(
    async (pm?: 'token' | 'verifying' | 'legacy-token') => {
      if (!signer || !eoaAddress) {
        console.error('[SignatureContext] connectAA: Signer or EOA address is not available.');
        return false;
      }
      console.log('[SignatureContext] connectAA: Initializing AA wallet for EOA:', eoaAddress);
      setLoading(true);
      try {
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
        // Save the derived address to localStorage to persist the session.
        localStorage.setItem(`${AA_ADDRESS_KEY_PREFIX}${eoaAddress}`, derivedAAaddress);
        // Also save the EOA that created this session to our state.
        setSessionEoaAddress(eoaAddress);
        console.log("[SignatureContext] AA session stored for EOA:", eoaAddress, "with AA:", derivedAAaddress);
        return true;
      } catch (e) {
        console.error('[SignatureContext] Error during AA wallet connection:', e);
        // Clean up on failure
        if(eoaAddress) {
            localStorage.removeItem(`${AA_ADDRESS_KEY_PREFIX}${eoaAddress}`);
        }
        setAAaddress('0x');
        setSimpleAccountInstance(undefined);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [signer, rpcUrl, bundlerUrl, entryPoint, accountFactory, eoaAddress],
  );
  
  // The automatic disconnection logic has been removed. 
  // The AA session lifecycle is now tied directly to the EOA's connected status,
  // which is handled by the session restoration effect below.

  // Simplified session restoration useEffect
  useEffect(() => {
    // If a session is already active in the state, we don't need to do anything.
    // This prevents the restoration logic from re-running unnecessarily on page changes.
    if (AAaddress && AAaddress !== '0x') {
      if (loading) setLoading(false); // Ensure loading is false if we bail early.
      return;
    }

    if (isEoaWalletConnected && signer && eoaAddress && chain) {
      const storedAaAddress = localStorage.getItem(`${AA_ADDRESS_KEY_PREFIX}${eoaAddress}`) as `0x${string}` | null;
      // If we find an address in storage, we try to restore the session.
      if (storedAaAddress && storedAaAddress !== '0x') {
        console.log("[SignatureContext] Found stored AA session for EOA:", eoaAddress, "with AA:", storedAaAddress);
        setLoading(true);
        SimpleAccount.init(signer, rpcUrl, {
          entryPoint: entryPoint,
          overrideBundlerRpc: bundlerUrl,
          factory: accountFactory,
        }).then(async (saInstance) => {
          const derivedSender = await saInstance.getSender() as `0x${string}`;
          // We verify that the current signer can derive the same address we have in storage.
          if (derivedSender === storedAaAddress) {
            console.log("[SignatureContext] Restored AA session matches derived AA.");
            setSimpleAccountInstance(saInstance);
            setAAaddress(derivedSender);
            // When restoring a session, also restore the EOA address that owns it.
            setSessionEoaAddress(eoaAddress);
          } else {
            console.warn("[SignatureContext] Stored AA address mismatch. Clearing stored session.");
            resetSignature();
          }
        }).catch(err => {
          console.error("[SignatureContext] Error re-initializing SimpleAccount for session restore:", err);
          setLoading(false);
          resetSignature();
        }).finally(() => {
          setLoading(false);
        });
      } else {
        // No address found in storage, so we're not logged into an AA wallet.
        setLoading(false); 
      }
    } else {
      // If conditions aren't met, we are done loading.
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEoaWalletConnected, signer, eoaAddress, chain]);


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
    connectAA, // Export the new simpler function
    resetSignature,
    getPaymasterMiddleware,
  }), [loading, AAaddress, isConnected, signer, simpleAccountInstance, aaNeroBalance, connectAA, resetSignature]);

  return (
    <SignatureContext.Provider value={contextValue}>
      {children}
    </SignatureContext.Provider>
  )
}
