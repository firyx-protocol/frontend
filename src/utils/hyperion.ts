import { HYPERION_API_KEY, NETWORK } from '@/constants'
import { Network } from '@aptos-labs/ts-sdk'
import { initHyperionSDK } from '@hyperionxyz/sdk'

export const hyperion = initHyperionSDK({
    network: NETWORK as Network.MAINNET | Network.TESTNET, 
    APTOS_API_KEY: HYPERION_API_KEY
})