import { Network } from "@aptos-labs/ts-sdk";

export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";

export const NETWORK: Network = process.env.NEXT_PUBLIC_NETWORK as Network || Network.MAINNET;
export const APTOS_EXPORER_URL = `https://explorer.aptoslabs.com?network=${NETWORK}`;

export const HYPERION_API_KEY = process.env.NEXT_PUBLIC_HYPERION_API_KEY || "";