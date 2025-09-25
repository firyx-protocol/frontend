"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { Network } from "@aptos-labs/ts-sdk";
import { Provider as UIProvider } from "@/components/ui/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const WalletProvider = ({ children }: PropsWithChildren) => {

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network: Network.MAINNET,
        aptosApiKeys: {
          mainnet: process.env.APTOS_API_KEY_MAINNET,
        }
      }}
      onError={(error) => {
        console.log("error", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};

export const Provider = ({ children }: PropsWithChildren) => {
  return (
    <UIProvider forcedTheme="light">
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </QueryClientProvider>
    </UIProvider>
  );
};