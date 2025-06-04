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
  const { AAaddress: aaAddressFromHook } = useSignature()

  const [eoaIsConnected, setEoaIsConnected] = useState(false)
  const [currentEoaAddress, setCurrentEoaAddress] = useState<string | null>(null)

  const getAASessionLocalStorageKey = (eoaAddress: string): string => {
    return `siwe_aa_session_for_${eoaAddress}`
  }

  useEffect(() => {
    if (eoaIsConnected && currentEoaAddress) {
      if (aaAddressFromHook && aaAddressFromHook !== '0x') {
        localStorage.setItem(getAASessionLocalStorageKey(currentEoaAddress), aaAddressFromHook)
      } else {
        localStorage.removeItem(getAASessionLocalStorageKey(currentEoaAddress))
      }
    }
  }, [eoaIsConnected, currentEoaAddress, aaAddressFromHook])

  useEffect(() => {
    if (!eoaIsConnected) {
      setIsWalletPanel(false)
    }
  }, [eoaIsConnected, setIsWalletPanel])

  const renderButton = (openConnectModal: () => void) => (
    <WalletConnectSidebar onClick={openConnectModal} variant='Connect' />
  )

  return (
    <div>
      <RainbowConnectButton.Custom>
        {({ account, chain, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
          const rkReady = mounted && authenticationStatus !== 'loading'

          const rkConnected = Boolean(
            rkReady &&
              account &&
              chain &&
              (!authenticationStatus || authenticationStatus === 'authenticated'),
          )

          if (eoaIsConnected !== rkConnected) {
            setEoaIsConnected(rkConnected)
          }
          if (rkConnected && account?.address && currentEoaAddress !== account.address) {
            setCurrentEoaAddress(account.address)
          } else if (!rkConnected && currentEoaAddress !== null) {
            if (currentEoaAddress) {
              localStorage.removeItem(getAASessionLocalStorageKey(currentEoaAddress))
            }
            setCurrentEoaAddress(null)
          }
          
          if (!rkReady) return null

          if (chain?.unsupported) {
            return <WalletConnectSidebar variant='Connect' onClick={openChainModal} />
          }

          if (mode === 'button') {
            if (rkConnected) {
              return (
                <WalletConnectRoundedButton
                  onClick={() => setIsWalletPanel(!isWalletPanel)}
                  AAaddress={aaAddressFromHook}
                  isConnected={rkConnected}
                />
              )
            }
            return (
              <WalletConnectRoundedButton
                onClick={openConnectModal}
                AAaddress={aaAddressFromHook}
                isConnected={rkConnected}
              />
            )
          }

          if (mode === 'sidebar') {
            if (rkConnected) {
              return (
                <ToggleWalletVisibilityButton
                  onClick={() => setIsWalletPanel(!isWalletPanel)}
                  size={'sm'}
                  isWalletPanel={isWalletPanel}
                />
              )
            }
            return renderButton(openConnectModal)
          }
          return null
        }}
      </RainbowConnectButton.Custom>
    </div>
  )
}

export default CustomConnectButton
