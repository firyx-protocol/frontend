import { UseQueryHook } from "@/types";
import { hyperion } from "@/utils/hyperion"
import { useQuery } from "@tanstack/react-query"

type UseHyperionGetPoolIdsPayload = object
export type TokenInfo = {
    assetType: string;
    bridge: string | null;
    coinMarketcapId: string;
    coinType: string | null;
    coingeckoId: string;
    decimals: number;
    faType: string;
    hyperfluidSymbol: string;
    logoUrl: string;
    name: string;
    symbol: string;
    isBanned: boolean;
    websiteUrl: string | null;
}

export type Pool = {
    currentTick: number;
    feeRate: string;
    feeTier: number;
    poolId: string;
    senderAddress: string;
    sqrtPrice: string;
    token1: string;
    token2: string;
    token1Info: TokenInfo;
    token2Info: TokenInfo;
}

export type GetPoolIdsResponse = {
    id: string;
    dailyVolumeUSD: string;
    feesUSD: string;
    tvlUSD: string;
    feeAPR: string;
    farmAPR: string;
    pool: Pool;
}[];

export const useHyperionGetPoolIds: UseQueryHook<UseHyperionGetPoolIdsPayload, GetPoolIdsResponse> = (props) => {
    const { options } = props || {};

    const handelGetPoolIds = async () => {
        const pools: GetPoolIdsResponse = await hyperion.Pool.fetchAllPools();
        
        return pools;
    }

    return useQuery({
        queryKey: ['hyperion', 'getPoolIds'],
        queryFn: handelGetPoolIds,
        ...options,
    })
}