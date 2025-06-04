'use client'

import React, { useEffect, useContext, useState } from 'react'
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import {
  WalletConnectSidebar,
  ToggleWalletVisibilityButton,
  WalletConnectRoundedButton,
} from '@/components/features/connect'
import { SendUserOpContext } from '@/contexts'
import { useSignature } from '@/hooks'
import { CustomConnectButtonProps } from '@/types'

const CustomConnectButton: React.FC<CustomConnectButtonProps> = ({ mode }) => {
  const { isWalletPanel, setIsWalletPanel } = useContext(SendUserOpContext)!
  const { 
    AAaddress: aaAddressFromContext, 
    isConnected: aaIsConnected,
    signMessage: initiateSiweAndAAConnection, 
    loading: signatureLoading 
  } = useSignature()

  const [eoaIsConnectedLocal, setEoaIsConnectedLocal] = useState(false)
  const [currentEoaAddressLocal, setCurrentEoaAddressLocal] = useState<string | null>(null)

  console.log("[CustomConnectButton] Render. Mode:", mode, "AA Connected (Context):", aaIsConnected, "Signature Loading:", signatureLoading);

  const getAASessionLocalStorageKey = (eoaAddress: string): string => {
    return `siwe_aa_session_for_${eoaAddress}`
  }

  useEffect(() => {
    console.log("[CustomConnectButton] useEffect for localStorage. EOA Connected Local:", eoaIsConnectedLocal, "Current EOA Local:", currentEoaAddressLocal, "AA Addr Context:", aaAddressFromContext);
    if (eoaIsConnectedLocal && currentEoaAddressLocal) {
      if (aaAddressFromContext && aaAddressFromContext !== '0x') {
        localStorage.setItem(getAASessionLocalStorageKey(currentEoaAddressLocal), aaAddressFromContext)
      } else {
        localStorage.removeItem(getAASessionLocalStorageKey(currentEoaAddressLocal))
      }
    }
  }, [eoaIsConnectedLocal, currentEoaAddressLocal, aaAddressFromContext])

  useEffect(() => {
    console.log("[CustomConnectButton] useEffect for panel visibility. EOA Connected Local:", eoaIsConnectedLocal);
    if (!eoaIsConnectedLocal) {
      setIsWalletPanel(false)
    }
  }, [eoaIsConnectedLocal, setIsWalletPanel])

  return (
    <div>
      <RainbowConnectButton.Custom>
        {({ account, chain, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
          const rkReady = mounted && authenticationStatus !== 'loading'
          const rkConnected = !!(
            rkReady &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === 'authenticated')
          )
          console.log("[CustomConnectButton] RainbowKit.Custom render fn. RKReady:", rkReady, "RKConnected (EOA):", rkConnected, "AuthStatus:", authenticationStatus, "Account:", account?.address);

          useEffect(() => {
            console.log("[CustomConnectButton] useEffect syncing RK state. RKConnected:", rkConnected, "Account Addr:", account?.address );
            setEoaIsConnectedLocal(rkConnected)
            if (rkConnected && account?.address) {
              setCurrentEoaAddressLocal(account.address)
            } else if (!rkConnected) {
              if (currentEoaAddressLocal) {
                localStorage.removeItem(getAASessionLocalStorageKey(currentEoaAddressLocal))
              }
              setCurrentEoaAddressLocal(null)
            }
          }, [rkConnected, account?.address, currentEoaAddressLocal])
          
          if (!rkReady) {
            console.log("[CustomConnectButton] Not rkReady, rendering null.");
            return null
          }

          if (chain?.unsupported) {
            console.log("[CustomConnectButton] Chain unsupported, rendering chain modal trigger.");
            return <WalletConnectSidebar variant='Connect' onClick={openChainModal} />
          }

          console.log(`[CustomConnectButton] Decision Logic: Mode: ${mode}, EOA Connected (Local): ${eoaIsConnectedLocal}, AA Connected (Context): ${aaIsConnected}`);

          if (mode === 'button') {
            if (eoaIsConnectedLocal) {
              if (aaIsConnected) {
                console.log("[CustomConnectButton] Mode 'button': EOA connected, AA connected. Rendering AA panel toggle.");
                return (
                  <WalletConnectRoundedButton
                    onClick={() => setIsWalletPanel(!isWalletPanel)}
                    AAaddress={aaAddressFromContext}
                    isConnected={true}
                  />
                )
              } else {
                console.log("[CustomConnectButton] Mode 'button': EOA connected, AA NOT connected. Rendering original 'Connect AA' button.");
                return (
                  <WalletConnectRoundedButton
                    onClick={() => { 
                      console.log("[CustomConnectButton] 'Connect AA' (WalletConnectRoundedButton) button clicked. SignatureLoading:", signatureLoading);
                      if (!signatureLoading) {
                        console.log("[CustomConnectButton] (WalletConnectRoundedButton) Calling initiateSiweAndAAConnection..."); 
                        initiateSiweAndAAConnection(); 
                      }
                    }}
                    AAaddress={aaAddressFromContext || '0x'}
                    isConnected={false}
                  />
                )
              }
            } else {
              console.log("[CustomConnectButton] Mode 'button': EOA NOT connected. Rendering 'Connect EOA' button.");
              return (
                <WalletConnectRoundedButton
                  onClick={openConnectModal}
                  AAaddress={'0x'}
                  isConnected={false}
                />
              )
            }
          }

          if (mode === 'sidebar') {
            if (eoaIsConnectedLocal) {
              if (aaIsConnected) {
                console.log("[CustomConnectButton] Mode 'sidebar': EOA connected, AA connected. Rendering AA panel toggle (sidebar).");
                return (
                  <ToggleWalletVisibilityButton
                    onClick={() => setIsWalletPanel(!isWalletPanel)}
                    size={'sm'}
                    isWalletPanel={isWalletPanel}
                  />
                )
              } else {
                console.log("[CustomConnectButton] Mode 'sidebar': EOA connected, AA NOT connected. Rendering explicit 'Connect Smart Account' button.");
                return (
                  <button
                    onClick={() => {
                      console.log("[CustomConnectButton] 'Connect Smart Account' (sidebar) button clicked. SignatureLoading:", signatureLoading);
                      initiateSiweAndAAConnection();
                    }}
                    disabled={signatureLoading}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {signatureLoading ? 'Connecting AA...' : 'Connect Smart Account'}
                  </button>
                )
              }
            } else {
              console.log("[CustomConnectButton] Mode 'sidebar': EOA NOT connected. Rendering 'Connect' sidebar button.");
              return <WalletConnectSidebar onClick={openConnectModal} variant='Connect' />
            }
          }
          console.log("[CustomConnectButton] No mode matched or other condition, rendering null.");
          return null
        }}
      </RainbowConnectButton.Custom>
    </div>
  )
}

export default CustomConnectButton
