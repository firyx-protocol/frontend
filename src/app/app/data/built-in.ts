import { APT_ADDRESS, CAKE_ADDRESS, TAPT_ADDRESS, USDC_ADDRESS } from "@/constants/built-in";

export const BUILT_IN_TOKEN_INFO_LIST: {
    symbol: string; name: string; address: string;
    asset_type_v1?: string;
    asset_type_v2?: string;
    decimals: number; logoUri: string
}[] = [
        {
            symbol: "APT",
            name: "Aptos Coin",
            address: APT_ADDRESS,
            asset_type_v1: "0x1::aptos_coin::AptosCoin",
            asset_type_v2: APT_ADDRESS,
            decimals: 8,
            logoUri: "https://assets.panora.exchange/tokens/aptos/APT.svg",
        }
        , {
            symbol: "USDC",
            name: "USD Coin",
            address: USDC_ADDRESS,
            asset_type_v1: "0x3c27315fb69ba6e4b960f1507d1cefcc9a4247869f26a8d59d6b7869d23782c::test_coins::USDC",
            asset_type_v2: USDC_ADDRESS,
            decimals: 6,
            logoUri: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        },
        {
            symbol: "tAPT",
            name: "Tortuga Staked Aptos",
            address: TAPT_ADDRESS,
            asset_type_v1: "0x3c27315fb69ba6e4b960f1507d1cefcc9a4247869f26a8d59d6b7869d23782c::test_coins::TAPT",
            asset_type_v2: TAPT_ADDRESS,
            decimals: 8,
            logoUri: "https://www.thala.dev/assets/logos/tapt.png",
        },
        {
            symbol: "CAKE",
            name: "Cake Token",
            address: CAKE_ADDRESS,
            asset_type_v2: "0x3c27315fb69ba6e4b960f1507d1cefcc9a4247869f26a8d59d6b7869d23782c::test_coins::CAKE",
            asset_type_v1: CAKE_ADDRESS,
            decimals: 8,
            logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png",
        }

    ]