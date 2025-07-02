"use client";

import React, { createContext, useState, useEffect } from "react";
import { Client } from "userop";
import { useConfig } from "@/hooks";
import { ProviderProps } from "@/types";

export const ClientContext = createContext<Client | null>(null);

export const ClientProvider: React.FC<ProviderProps> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const { rpcUrl, bundlerUrl, entryPoint, paymasterUrl } = useConfig();

  useEffect(() => {
    const initClient = async () => {
      try {
        const clientInstance = await Client.init(rpcUrl, {
          entryPoint,
          overrideBundlerRpc: bundlerUrl,
          paymasterUrl: paymasterUrl,
        });
        setClient(clientInstance);
      } catch (error) {
        console.error("Failed to initialize client");
      }
    };
    initClient();
  }, [entryPoint, rpcUrl, bundlerUrl, paymasterUrl]);

  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  );
};
