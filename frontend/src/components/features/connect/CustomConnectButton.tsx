'use client'

import React, { useEffect, useContext, useState } from 'react'
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import {
  WalletConnectSidebar,
  ToggleWalletVisibilityButton,
  WalletConnectRoundedButton,
} from '@/components/features/connect'
import { SendUserOpContext } from '@/contexts'
import { useSignature, useConfig } from '@/hooks'
import { CustomConnectButtonProps } from '@/types'
import { ethers, utils as ethersUtils } from 'ethers'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

// ABI and amount for funding AA wallet - ENTRYPOINT_ABI_DEPOSIT_TO is no longer needed for direct transfer
// const ENTRYPOINT_ABI_DEPOSIT_TO = ['function depositTo(address account) external payable']; 
const EOA_FUNDING_AMOUNT = ethersUtils.parseEther("0.1");
const FAUCET_URL = "https://app.testnet.nerochain.io/faucet";

const CustomConnectButton: React.FC<CustomConnectButtonProps> = ({ mode }) => {
  const { isWalletPanel, setIsWalletPanel } = useContext(SendUserOpContext)!
  const { AAaddress: aaAddressFromHook, aaNeroBalance, signer: eoaSignerDetails } = useSignature()
  // entryPointAddress from useConfig is no longer needed for direct transfer
  // const { entryPoint: entryPointAddress } = useConfig() 
  const { toast } = useToast();

  const [eoaIsConnected, setEoaIsConnected] = useState(false)
  const [currentEoaAddress, setCurrentEoaAddress] = useState<string | null>(null)
  const [isFunding, setIsFunding] = useState(false);
  const [fundingStatus, setFundingStatus] = useState<string>('');

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

  const handleFundAAWallet = async () => {
    if (!eoaSignerDetails) {
      toast({ title: "EOA Wallet Error", description: "EOA signer not available.", variant: "destructive" });
      return;
    }
    // Removed entryPointAddress check as it's not used for direct transfer
    // if (!entryPointAddress) {
    //   toast({ title: "Configuration Error", description: "EntryPoint address is not configured.", variant: "destructive" });
    //   return;
    // }
    if (!aaAddressFromHook || aaAddressFromHook === '0x') {
      toast({ title: "AA Wallet Error", description: "AA Wallet address is not determined.", variant: "destructive" });
      return;
    }

    setIsFunding(true);
    setFundingStatus(`Funding AA wallet (${ethersUtils.formatEther(EOA_FUNDING_AMOUNT)} NERO)...`);

    try {
      // const entryPointInterface = new ethers.utils.Interface(ENTRYPOINT_ABI_DEPOSIT_TO); // Not needed for direct transfer
      // const data = entryPointInterface.encodeFunctionData('depositTo', [aaAddressFromHook]); // Not needed for direct transfer

      console.log(`[CustomConnectButton] Sending EOA transaction directly to AA Wallet (${aaAddressFromHook}) with value ${ethersUtils.formatEther(EOA_FUNDING_AMOUNT)} NERO`);
      
      const tx = await eoaSignerDetails.sendTransaction({ 
        to: aaAddressFromHook, // Send directly to AA address
        value: EOA_FUNDING_AMOUNT,
        // data: data, // No data field for direct NERO transfer
      });

      setFundingStatus(`Funding tx submitted: ${tx.hash.substring(0,10)}... Waiting...`);
      toast({ title: "Funding Submitted", description: `Transaction ${tx.hash} sent. Waiting for confirmation.`});
      await tx.wait(1); 

      setFundingStatus(`AA Wallet funding successful! Tx: ${tx.hash.substring(0,10)}...`);
      toast({ title: "Funding Successful", description: `AA Wallet funded successfully. Tx: ${tx.hash}`});
      // Optionally, trigger a refresh of AA NERO balance here 
      // For example, if useSignature provides a refresh function:
      // if (typeof refreshAaNeroBalance === 'function') refreshAaNeroBalance();
    } catch (error: any) {
      console.error('[CustomConnectButton] EOA Funding error:', error);
      const errorMessage = error.reason || error.message || 'Unknown funding error';
      setFundingStatus(`Funding failed: ${errorMessage}`);
      toast({ title: "Funding Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsFunding(false);
    }
  };

  const renderButton = (openConnectModal: () => void) => (
    <WalletConnectSidebar onClick={openConnectModal} variant='Connect' />
  )

  return (
    <div className='inline-flex flex-col space-y-2 items-end'>
      <RainbowConnectButton.Custom>
        {({ account, chain, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
          const rkReady = mounted && authenticationStatus !== 'loading'

          const rkConnected = Boolean(
            rkReady &&
              account &&
              chain &&
              (!authenticationStatus || authenticationStatus === 'authenticated'),
          )

          // Update EOA connection state and address
          useEffect(() => {
            setEoaIsConnected(rkConnected);
            if (rkConnected && account?.address) {
              setCurrentEoaAddress(account.address);
            } else if (!rkConnected) {
              if (currentEoaAddress) {
                  localStorage.removeItem(getAASessionLocalStorageKey(currentEoaAddress));
              }
              setCurrentEoaAddress(null);
            }
          // eslint-disable-next-line react-hooks/exhaustive-deps
          }, [rkConnected, account?.address]);
          
          if (!rkReady) return null

          if (chain?.unsupported) {
            return <WalletConnectSidebar variant='Connect' onClick={openChainModal} />
          }

          if (mode === 'button') {
            if (rkConnected) {
              return (
                <div className="flex flex-col items-end space-y-1">
                  <WalletConnectRoundedButton
                    onClick={() => setIsWalletPanel(!isWalletPanel)}
                    AAaddress={aaAddressFromHook}
                    isConnected={rkConnected}
                    aaNeroBalance={aaNeroBalance}
                  />
                  {aaAddressFromHook && aaAddressFromHook !== '0x' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleFundAAWallet}
                      disabled={isFunding || !eoaSignerDetails}
                      className="text-xs py-1 px-2 h-auto border-primary text-primary hover:bg-primary/10"
                    >
                      {isFunding ? fundingStatus.substring(0,20)+'...' : `Fund AA (${ethersUtils.formatEther(EOA_FUNDING_AMOUNT)} NERO)`}
                    </Button>
                  )}
                  <Link href={FAUCET_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Nero Faucet <ExternalLink size={12} />
                  </Link>
                  {isFunding && fundingStatus && <p className='text-xs text-muted-foreground text-right'>{fundingStatus}</p>}
                </div>
              )
            }
            return (
              <WalletConnectRoundedButton
                onClick={openConnectModal}
                AAaddress={aaAddressFromHook}
                isConnected={rkConnected}
                aaNeroBalance={aaNeroBalance}
              />
            )
          }

          if (mode === 'sidebar') {
            if (rkConnected) {
              return (
                <div className="flex flex-col items-end space-y-1">
                  <ToggleWalletVisibilityButton
                    onClick={() => setIsWalletPanel(!isWalletPanel)}
                    size={'sm'}
                    isWalletPanel={isWalletPanel}
                  />
                  <Link href={FAUCET_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                    Nero Faucet <ExternalLink size={12} />
                  </Link>
                  {/* TODO: Consider adding fund button for sidebar mode too if needed */}
                </div>
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
