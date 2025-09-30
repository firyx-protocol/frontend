import { Network } from "@aptos-labs/ts-sdk";

export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";

export const NETWORK: Network = process.env.NEXT_PUBLIC_NETWORK as Network || Network.MAINNET;
export const APTOS_EXPLORER_URL = `https://explorer.aptoslabs.com`;
export const APTOS_GRAPHQL_ENDPOINT = NETWORK === Network.MAINNET
    ? "https://api.mainnet.aptoslabs.com/v1/graphql"
    : "https://api.testnet.aptoslabs.com/v1/graphql";
export const HYPERION_API_KEY = process.env.NEXT_PUBLIC_APTOS_API_KEY || "";

export * from "./core";
export * from "./contract";