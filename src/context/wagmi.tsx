"use client";

import { config, metadata, projectId } from "@/configs/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, createConfig, fallback, http } from "wagmi";
import { DEFAULT_CHAIN_ID } from '@/configs';
import { RainbowKitProvider, connectorsForWallets, darkTheme } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  okxWallet,
  bitgetWallet,
  binanceWallet,
  injectedWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createClient } from "viem";
import { mainnet, monadTestnet } from "viem/chains";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

const connectors: any = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        okxWallet,
        bitgetWallet,
        binanceWallet,
        injectedWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: metadata.name,
    projectId,
  }
);

const wagmiConfig = createConfig({
  ...config,
  connectors,
  client: ({ chain }) => {
    if (chain.id === monadTestnet.id) {
      return createClient({
        chain,
        transport: http("https://testnet-rpc.monad.xyz"),
      });
    }
    if (chain.id === mainnet.id) {
      return createClient({
        chain,
        transport: http("https://eth.merkle.io"),
      });
    }
    return createClient({
      chain,
      transport: http()
    });
  }
});

function ContextProvider({
  children,
  cookies
}: {
  children: ReactNode;
  cookies?: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiConfig,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiConfig}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          locale="en-US"
          initialChain={DEFAULT_CHAIN_ID}
          theme={darkTheme()}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
