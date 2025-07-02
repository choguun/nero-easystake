"use client";

import * as React from "react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
} from "@/contexts";
import { useScreenManager } from "@/hooks";
import ScreenRenderer from "@/components/ScreenRenderer";
import "@rainbow-me/rainbowkit/styles.css";
import config from "@/nerowallet.config";

// Import potential providers like ThemeProvider, QueryClientProvider, etc.

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a stable QueryClient instance that persists across renders
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Increase stale time to reduce refetching
            staleTime: 60 * 1000, // 1 minute
            // Keep data in cache longer (renamed from cacheTime in v5)
            gcTime: 5 * 60 * 1000, // 5 minutes
            // Don't refetch on window focus to prevent wallet disconnections
            refetchOnWindowFocus: false,
            // Retry failed queries
            retry: 1,
          },
        },
      })
  );

  // Inner component to access screen manager context for ScreenRenderer
  const AppWithScreenRenderer = () => {
    const { currentScreen } = useScreenManager();
    return (
      <>
        {children}
        <ScreenRenderer currentScreen={currentScreen} data-oid="ibixmfg" />
      </>
    );
  };

  return (
    <>
      <ConfigProvider config={config} data-oid="q49yg25">
        <WrapWagmiProvider data-oid="nw2iozg">
          <QueryClientProvider client={queryClient} data-oid="5:r74wb">
            <RainbowKitProvider modalSize="compact" data-oid="y3d7f.f">
              <SignatureProvider data-oid="i.afw.e">
                <ScreenManagerProvider data-oid="2s4nihb">
                  <PaymasterProvider data-oid="vjce9tc">
                    <TokenProvider data-oid="qc5a7m3">
                      <NFTProvider data-oid="oyf.45-">
                        <SendProvider data-oid="6kjafev">
                          <MultiSendProvider data-oid="few54n1">
                            <ClientProvider data-oid=".cejj3e">
                              <SendUserOpProvider data-oid="i9iqz90">
                                <TransactionProvider data-oid="jwpfuea">
                                  <AppWithScreenRenderer data-oid="zb86:h:" />
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
    </>
  );

  // Return children directly if no providers are needed yet
}
