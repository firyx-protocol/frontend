import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { Network } from "@aptos-labs/ts-sdk";
import { Provider as UIProvider } from "@/components/ui/provider";
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
    <UIProvider>
      <WalletProvider>
        {children}
      </WalletProvider>
    </UIProvider>
  );
};