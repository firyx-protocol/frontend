import { UseQueryHook } from "@/types";
import { hyperion } from "@/utils/hyperion"
import { useQuery } from "@tanstack/react-query"

type UseHyperionGetPoolByIdPayload = {
    id: string;
}
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

export type GetPoolByIdResponse = {
    id: string;
    dailyVolumeUSD: string;
    feesUSD: string;
    tvlUSD: string;
    feeAPR: string;
    farmAPR: string;
    pool: Pool;
}

export const useHyperionGetPoolById: UseQueryHook<UseHyperionGetPoolByIdPayload, GetPoolByIdResponse> = (props) => {
    const { payload, options } = props || {};
    const { id } = payload || {};
    const handelGetPoolById = async () => {
        if (!id) {
            throw new Error("id is required");
        }

        const pools: GetPoolByIdResponse[] = await hyperion.Pool.fetchPoolById({ poolId: id });

        if (pools.length === 0) {
            throw new Error("No pool found");
        }

        return pools[0];
    }

    return useQuery({
        queryKey: ['hyperion', 'getPoolById', id],
        queryFn: handelGetPoolById,
        enabled: !!id,
        ...options,
    })
}