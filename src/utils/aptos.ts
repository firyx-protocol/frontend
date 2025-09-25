import { NETWORK } from "@/constants";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

const config = new AptosConfig({
    network: NETWORK,
})
export const aptos = new Aptos(config);