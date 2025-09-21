import { UseQueryHook } from "@/types";
import { hyperion } from "@/utils/hyperion"
import { FeeTierIndex } from "@hyperionxyz/sdk";
import { useQuery } from "@tanstack/react-query"

type UseHyperionGetPoolInfoPayload = {
    tokenA: string;
    tokenB: string;
    feeTier: FeeTierIndex;
}
export type GetPoolByTokenPairAndFeeTierResponse = {
    currentTick: number;
    token1: string;
    token2: string;
    poolId: string;
}

export const useHyperionGetPoolInfo: UseQueryHook<UseHyperionGetPoolInfoPayload, GetPoolByTokenPairAndFeeTierResponse> = (props) => {
    const { payload, options } = props || {};
    const { tokenA, tokenB, feeTier } = payload || {};

    const handelGetPoolInfo = async () => {
        if (!tokenA || !tokenB || !feeTier) {
            throw new Error("tokenA, tokenB and feeTier are required");
        }

        const poolByTokenPairAndFee: GetPoolByTokenPairAndFeeTierResponse = await hyperion.Pool.getPoolByTokenPairAndFeeTier({ token1: tokenA, token2: tokenB, feeTier: feeTier });

        return poolByTokenPairAndFee;
    }

    return useQuery({
        queryKey: ['hyperion', 'getPoolInfo', tokenA, tokenB, feeTier],
        queryFn: handelGetPoolInfo,
        enabled: !!tokenA && !!tokenB && !!feeTier,
        ...options,
    })
}