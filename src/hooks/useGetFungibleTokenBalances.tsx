import { UseQueryHook } from "@/types";
import { aptos } from "@/utils/aptos";
import { GetCurrentFungibleAssetBalancesResponse } from "@aptos-labs/ts-sdk";
import { useQuery } from "@tanstack/react-query"

type UseGetFungibleTokenBalancesPayload = {
    asset_types: string[];
    owner: string;
}
export type GetFungibleTokenBalancesResponse = GetCurrentFungibleAssetBalancesResponse;

export const useGetFungibleTokenBalances: UseQueryHook<UseGetFungibleTokenBalancesPayload, GetFungibleTokenBalancesResponse> = (props) => {
    const { payload, options } = props || {};
    const { asset_types, owner } = payload || {};

    const getFungibleTokenBalances = async () => {
        if (!asset_types) {
            throw new Error("asset_type is required");
        }

        const res = await aptos.getCurrentFungibleAssetBalances({
            options: {
                where:{
                    owner_address: {
                        _eq: owner
                    },
                    asset_type_v2: {
                        _in: asset_types || []
                    }
                }
            }
        })

        // return Number(res[0].amount);
        return res;
    }

    return useQuery({
        queryKey: ['aptos', 'getFungibleTokenBalance', asset_types, owner],
        queryFn: getFungibleTokenBalances,
        enabled: !!asset_types?.length && asset_types.length > 0 && !!owner,
        ...options,
    })
}