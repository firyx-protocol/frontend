import { UseQueryHook } from "@/types";
import { hyperion } from "@/utils/hyperion"
import { useQuery } from "@tanstack/react-query"

type UseHyperionGetPoolInfoPayload = {
    address: string;
    positionId: string;
}

export type GetPositionByIdResponse = {
    objectId: string;
    poolId: string;
    txnTimestamp: string;
    currentAmount: number;
    position: {
        tickLower: number;
        tickUpper: number;
    };
    pool: Array<{
        currentTick: number;
        feeRate: number;
        feeTier: number;
        poolId: string;
        senderAddress: string;
        sqrtPrice: number;
        token1: string;
        token2: string;
        token1Info: {
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
            websiteUrl: string;
        };
        token2Info: {
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
            websiteUrl: string;
        };
    }>;
}

export const useHyperionGetPosition: UseQueryHook<UseHyperionGetPoolInfoPayload, GetPositionByIdResponse> = (props) => {
    const { payload, options } = props || {};
    const { address, positionId } = payload || {};

    const handelGetPositionInfo = async () => {
        if (!address || !positionId) {
            throw new Error("address and positionId are required");
        }

        const positions: GetPositionByIdResponse[] = await hyperion.Position.fetchPositionById({ positionId: positionId, address})
        if (positions.length === 0) {
            throw new Error("Position not found");
        }

        console.log("positions", positions);
        return positions[0];
    }

    return useQuery({
        queryKey: ['hyperion', 'getPosition', address, positionId],
        queryFn: handelGetPositionInfo,
        enabled: !!address && !!positionId,
        ...options,
    })
}