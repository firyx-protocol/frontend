import { HYPERION_API_KEY as APTOS_API_KEY, NETWORK } from "@/constants";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";

const config = new AptosConfig({
    network: NETWORK,
    clientConfig: {
        API_KEY: APTOS_API_KEY
    }
})
export const aptos = new Aptos(config);