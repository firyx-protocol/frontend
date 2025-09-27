import { toCamelCase } from "@/libs/helpers";
import { UseQueryHook } from "@/types";
import { aptos } from "@/utils/aptos";
import { hyperion } from "@/utils/hyperion"
import { FeeTierIndex } from "@hyperionxyz/sdk";
import { useQuery } from "@tanstack/react-query"

type UseHyperionGetPositionByIdPayload = {
    id: string;
}

export type PositionResourceData = {
    feeGrowthInsideALast: string;
    feeGrowthInsideBLast: string;
    feeOwedA: string;
    feeOwedB: string;
    feeTier: number;
    initialized: boolean;
    liquidity: string;
    rewards: unknown[];
    tickLower: {
        bits: number;
    };
    tickUpper: {
        bits: number;
    };
    tokenA: {
        inner: string;
    };
    tokenB: {
        inner: string;
    };
}

export type GetPositionByIdResponse = PositionResourceData;

export const useHyperionGetPositionResource: UseQueryHook<UseHyperionGetPositionByIdPayload, GetPositionByIdResponse> = (props) => {
    const { payload, options } = props || {};
    const { id } = payload || {};

    const handelGetPositionResource = async () => {
        if (!id) {
            throw new Error("id is required");
        }
        const res = await aptos.getAccountResource({
            accountAddress: id,
            resourceType: `${hyperion.sdkOptions.contractAddress}::position_v3::Info`
        });

        return toCamelCase(res) as GetPositionByIdResponse;
    }

    return useQuery({
        queryKey: ['hyperion', 'getPositionResource', id],
        queryFn: handelGetPositionResource,
        enabled: !!id,
        ...options,
    })
}