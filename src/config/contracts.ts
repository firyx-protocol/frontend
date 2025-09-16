const network = process.env.NETWORK ?? 'testnet';

const CONTRACT_ADDRESS_MAINNET = process.env.CONTRACT_ADDRESS_MAINNET;
const CONTRACT_ADDRESS_TESTNET = process.env.CONTRACT_ADDRESS_TESTNET;

if (!CONTRACT_ADDRESS_MAINNET || !CONTRACT_ADDRESS_TESTNET) {
  throw new Error('Missing contract address in environment variables.');
}

export const CONTRACT_ADDRESS =
  network === 'mainnet'
    ? CONTRACT_ADDRESS_MAINNET
    : CONTRACT_ADDRESS_TESTNET;
