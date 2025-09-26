import { toCamelCase } from "@/libs/helpers";
import { UseQueryHook } from "@/types";
import { aptos } from "@/utils/aptos";
import { hyperion } from "@/utils/hyperion"
import { FeeTierIndex } from "@hyperionxyz/sdk";
import { useQuery } from "@tanstack/react-query"

type UseHyperionGetPoolByIdPayload = {
    id: string;
}

export type PoolResourceData = {
    feeGrowthGlobalA: string;
    feeGrowthGlobalB: string;
    feeProtocol: string;
    feeRate: string;
    lastUpdateTimestamp: string;
    liquidity: string;
    lpTokenRefs: {
        burnRef: {
            metadata: {
                inner: string;
            };
        };
        extendRef: {
            self: string;
        };
        mintRef: {
            metadata: {
                inner: string;
            };
        };
        transferRef: {
            metadata: {
                inner: string;
            };
        };
    };
    maxLiquidityPerTick: string;
    observationCardinality: string;
    observationCardinalityNext: string;
    observationIndex: string;
    positionBlacklist: {
        addresses: {
            bigVec: {
                vec: unknown[];
            };
            bucketSize: {
                vec: unknown[];
            };
            inlineCapacity: {
                vec: unknown[];
            };
            inlineVec: unknown[];
        };
    };
    protocolFees: {
        tokenA: {
            inner: string;
        };
        tokenB: {
            inner: string;
        };
    };
    rewarderManager: {
        lastUpdatedTime: string;
        pause: boolean;
        rewarders: unknown[];
    };
    secondsPerLiquidityIncentive: string;
    secondsPerLiquidityOracle: string;
    sqrtPrice: string;
    tick: {
        bits: number;
    };
    tickInfo: {
        buckets: {
            inner: {
                handle: string;
            };
            length: string;
        };
        level: number;
        numBuckets: string;
        size: string;
        splitLoadThreshold: number;
        targetBucketSize: string;
    };
    tickMap: {
        map: {
            handle: string;
        };
    };
    tickSpacing: number;
    tokenAFee: {
        inner: string;
    };
    tokenALiquidity: {
        inner: string;
    };
    tokenBFee: {
        inner: string;
    };
    tokenBLiquidity: {
        inner: string;
    };
    unlocked: boolean;
}

export type GetPoolByIdResponse = PoolResourceData;

export const useHyperionGetPoolResource: UseQueryHook<UseHyperionGetPoolByIdPayload, GetPoolByIdResponse> = (props) => {
    const { payload, options } = props || {};
    const { id } = payload || {};

    const handelGetPoolResource = async () => {
        if (!id) {
            throw new Error("id is required");
        }
        const res = await aptos.getAccountResource({
            accountAddress: id,
            resourceType: `${hyperion.sdkOptions.contractAddress}::pool_v3::LiquidityPoolV3`
        });

        return toCamelCase(res) as GetPoolByIdResponse;
    }

    return useQuery({
        queryKey: ['hyperion', 'getPoolResource', id],
        queryFn: handelGetPoolResource,
        enabled: !!id,
        ...options,
    })
}