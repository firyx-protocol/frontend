import { toCamelCase } from "@/libs/helpers";
import { UseQueryHook } from "@/types";
import { TokenMetadata } from "@/types/core";
import { aptos } from "@/utils/aptos";
import { aptosGraphqlClient } from "@/utils/graphql";
import { hyperion } from "@/utils/hyperion"
import { FeeTierIndex } from "@hyperionxyz/sdk";
import { useQuery } from "@tanstack/react-query"

type UseGetFungibleTokenPayload = {
    asset_type: string;
}
export type GetFungibleTokenResponse = TokenMetadata | null;

export const useGetFungibleToken: UseQueryHook<UseGetFungibleTokenPayload, GetFungibleTokenResponse> = (props) => {
    const { payload, options } = props || {};
    const { asset_type } = payload || {};

    const getFungibleAsset = async () => {
        if (!asset_type) {
            throw new Error("asset_type is required");
        }

        const res = await aptos.view({
            payload: {
                function: "0x1::fungible_asset::metadata",
                functionArguments: [asset_type],
                typeArguments: ["0x1::fungible_asset::Metadata"],
            }
        });

        return toCamelCase(res[0]) as TokenMetadata;
    }

    return useQuery({
        queryKey: ['aptos', 'getFungibleToken', asset_type],
        queryFn: getFungibleAsset,
        enabled: !!asset_type,
        ...options,
    })
}