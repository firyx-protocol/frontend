import { NETWORK } from ".";

const sc_addr = process.env[`NEXT_PUBLIC_CONTRACT_ADDRESS_${NETWORK.toUpperCase()}`];

if (!sc_addr) {
  throw new Error(
    "Smart contract address is not defined in environment variables"
  );
}
console.log("Network:", NETWORK);

export const CONTRACT_ADDRESS = sc_addr;
