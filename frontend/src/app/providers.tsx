'use client';

import * as React from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  ClientProvider,
  ConfigProvider,
  MultiSendProvider,
  NFTProvider,
  PaymasterProvider,
  ScreenManagerProvider,
  SendProvider,
  SendUserOpProvider,
  SignatureProvider,
  TokenProvider,
  TransactionProvider,
  WrapWagmiProvider,
} from '@/contexts'
import { useScreenManager } from '@/hooks'
import ScreenRenderer from '@/components/ScreenRenderer'
import '@rainbow-me/rainbowkit/styles.css'
import config from '@/nerowallet.config'

// Import potential providers like ThemeProvider, QueryClientProvider, etc.

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()
  
  // Inner component to access screen manager context for ScreenRenderer
  const AppWithScreenRenderer = () => {
    const { currentScreen } = useScreenManager();
    return (
      <>
        {children}
        <ScreenRenderer currentScreen={currentScreen} />
      </>
    );
  };

  return <>
  <ConfigProvider config={config}>
      <WrapWagmiProvider>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider modalSize='compact'>
            <SignatureProvider>
              <ScreenManagerProvider>
                <PaymasterProvider>
                  <TokenProvider>
                    <NFTProvider>
                      <SendProvider>
                        <MultiSendProvider>
                          <ClientProvider>
                            <SendUserOpProvider>
                              <TransactionProvider>
                                <AppWithScreenRenderer />
                              </TransactionProvider>
                            </SendUserOpProvider>
                          </ClientProvider>
                        </MultiSendProvider>
                      </SendProvider>
                    </NFTProvider>
                  </TokenProvider>
                </PaymasterProvider>
              </ScreenManagerProvider>
            </SignatureProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WrapWagmiProvider>
    </ConfigProvider>
  </>; // Return children directly if no providers are needed yet
}
