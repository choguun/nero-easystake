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
  const {
    AAaddress: aaAddressFromHook,
    aaNeroBalance,
    signer: eoaSignerDetails,
    initiateSiweAndAAConnection,
    resetSignature,
    loading: sigContextLoading,
  } = useSignature()
  // entryPointAddress from useConfig is no longer needed for direct transfer
  // const { entryPoint: entryPointAddress } = useConfig() 
  const { toast } = useToast();

  const [eoaIsConnected, setEoaIsConnected] = useState(false)
  const [currentEoaAddress, setCurrentEoaAddress] = useState<string | null>(null)
  const [isFunding, setIsFunding] = useState(false);
  const [fundingStatus, setFundingStatus] = useState<string>('');
  const [isConnectingAA, setIsConnectingAA] = useState(false);

  useEffect(() => {
    if (!eoaIsConnected) {
      setIsWalletPanel(false)
    }
  }, [eoaIsConnected, setIsWalletPanel]);

  const handleFundAAWallet = async () => {
    if (!eoaSignerDetails) {
      toast({ title: "EOA Wallet Error", description: "EOA signer not available.", variant: "destructive" });
      return;
    }
    if (!aaAddressFromHook || aaAddressFromHook === '0x') {
      toast({ title: "AA Wallet Error", description: "AA Wallet address is not determined.", variant: "destructive" });
      return;
    }
    setIsFunding(true);
    setFundingStatus(`Funding AA wallet (${ethersUtils.formatEther(EOA_FUNDING_AMOUNT)} NERO)...`);
    try {
      console.log(`[CustomConnectButton] Sending EOA transaction directly to AA Wallet (${aaAddressFromHook}) with value ${ethersUtils.formatEther(EOA_FUNDING_AMOUNT)} NERO`);
      const tx = await eoaSignerDetails.sendTransaction({ 
        to: aaAddressFromHook, 
        value: EOA_FUNDING_AMOUNT,
      });
      setFundingStatus(`Funding tx submitted: ${tx.hash.substring(0,10)}... Waiting...`);
      toast({ title: "Funding Submitted", description: `Transaction ${tx.hash} sent. Waiting for confirmation.`});
      await tx.wait(1); 
      setFundingStatus(`AA Wallet funding successful! Tx: ${tx.hash.substring(0,10)}...`);
      toast({ title: "Funding Successful", description: `AA Wallet funded successfully. Tx: ${tx.hash}`});
    } catch (error: any) {
      console.error('[CustomConnectButton] EOA Funding error:', error);
      const errorMessage = error.reason || error.message || 'Unknown funding error';
      setFundingStatus(`Funding failed: ${errorMessage}`);
      toast({ title: "Funding Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsFunding(false);
    }
  };

  const renderButton = (openConnectModal: () => void, rkAccount?: any) => {
    if (rkAccount && (aaAddressFromHook === '0x' || !aaAddressFromHook) && !isConnectingAA && !sigContextLoading) {
      return (
        <WalletConnectSidebar 
            onClick={async () => {
                setIsConnectingAA(true);
                await initiateSiweAndAAConnection();
                setIsConnectingAA(false);
            }}
            variant='Connect AA Wallet'
            disabled={isConnectingAA || sigContextLoading}
         />
      );
    }
    return <WalletConnectSidebar onClick={openConnectModal} variant='Connect' disabled={isConnectingAA || sigContextLoading} />;
  };

  return (
    <div className='inline-flex flex-col space-y-2 items-end'>
      <RainbowConnectButton.Custom>
        {({ account, chain, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
          const rkReady = mounted && authenticationStatus !== 'loading' && !sigContextLoading;

          const rkConnected = Boolean(
            rkReady &&
              account &&
              chain &&
              (!authenticationStatus || authenticationStatus === 'authenticated'),
          );

          useEffect(() => {
            setEoaIsConnected(rkConnected);
            if (rkConnected && account?.address) {
              setCurrentEoaAddress(account.address);
            } else if (!rkConnected) {
              setCurrentEoaAddress(null);
            }
          }, [rkConnected, account?.address, resetSignature]);

          if (!rkReady) {
            return <WalletConnectRoundedButton onClick={openConnectModal} isConnected={false} AAaddress={'0x'} disabled={sigContextLoading} isLoading={sigContextLoading}/>;
          }

          if (chain?.unsupported) {
            return <WalletConnectSidebar variant='Connect' onClick={openChainModal} />
          }
          
          const displayAddress = aaAddressFromHook && aaAddressFromHook !== '0x' ? aaAddressFromHook : account?.address;
          const displayBalance = aaAddressFromHook && aaAddressFromHook !== '0x' ? aaNeroBalance : undefined;
          const effectiveIsConnected = aaAddressFromHook && aaAddressFromHook !== '0x' ? true : rkConnected;

          if (mode === 'button') {
            if (effectiveIsConnected) {
              return (
                <div className="flex flex-col items-end space-y-1">
                  <WalletConnectRoundedButton
                    onClick={() => {
                        if (aaAddressFromHook && aaAddressFromHook !== '0x') {
                            setIsWalletPanel(!isWalletPanel);
                        } else if (rkConnected && !isConnectingAA) {
                            setIsConnectingAA(true);
                            initiateSiweAndAAConnection().finally(() => setIsConnectingAA(false));
                        }
                      }}
                    AAaddress={displayAddress as string}
                    isConnected={effectiveIsConnected}
                    aaNeroBalance={displayBalance}
                    isLoading={isConnectingAA || sigContextLoading}
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
                  {rkConnected && (
                    <Link href={FAUCET_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        Nero Faucet <ExternalLink size={12} />
                    </Link>
                  )}
                  {isFunding && fundingStatus && <p className='text-xs text-muted-foreground text-right'>{fundingStatus}</p>}
                  {isConnectingAA && <p className='text-xs text-muted-foreground text-right'>Connecting AA Wallet...</p>}
                </div>
              )
            }
            return (
              <WalletConnectRoundedButton
                onClick={openConnectModal} 
                AAaddress={aaAddressFromHook}
                isConnected={false}
                aaNeroBalance={aaNeroBalance}
                isLoading={isConnectingAA || sigContextLoading}
              />
            )
          }

          if (mode === 'sidebar') {
            if (rkConnected) {
              if (aaAddressFromHook && aaAddressFromHook !== '0x') {
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
                    </div>
                );
              } else {
                return (
                    <div className="flex flex-col items-end space-y-1">
                        <WalletConnectSidebar 
                            onClick={async () => {
                                if (typeof initiateSiweAndAAConnection === 'function') {
                                    setIsConnectingAA(true);
                                    await initiateSiweAndAAConnection();
                                    setIsConnectingAA(false);
                                } else {
                                    console.error("initiateSiweAndAAConnection is not a function")
                                }
                            }}
                            variant='Connect AA Wallet'
                            disabled={isConnectingAA || sigContextLoading}
                        />
                        <Link href={FAUCET_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                            Nero Faucet <ExternalLink size={12} />
                        </Link>
                        {isConnectingAA && <p className='text-xs text-muted-foreground text-right'>Connecting AA Wallet...</p>}
                    </div>
                );
              }
            }
            return renderButton(openConnectModal, account)
          }
          return null
        }}
      </RainbowConnectButton.Custom>
    </div>
  )
}

export default CustomConnectButton
