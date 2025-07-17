"use client";

import { cookieStorage, createStorage, fallback, http } from "wagmi";
import chains from "./chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { DEFAULT_CHAIN_ID } from '@/configs/index';
import { mainnet, monadTestnet } from "viem/chains";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

if (!projectId) {
  throw new Error("Project ID is not defined");
}

console.log("projectId: %o", projectId);

export const metadata = {
  name: "MonadX",
  description: "MonadX",
  // origin must match your domain & subdomain
  url: "https://www.nadsa.space",
  icons: ["/favicon.ico"]
};

export const networks: any = Object.values(chains);

export const config = getDefaultConfig({
  appName: metadata.name,
  appDescription: metadata.description,
  appUrl: metadata.url,
  appIcon: metadata.icons[0],
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId: projectId,
  chains: [monadTestnet, mainnet],
  transports: {
    [DEFAULT_CHAIN_ID]: http("https://testnet-rpc.monad.xyz"),
    [mainnet.id]: http("https://eth.merkle.io"),
  },
});
