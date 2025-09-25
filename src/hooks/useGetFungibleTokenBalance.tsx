import { UseQueryHook } from "@/types";
import { aptos } from "@/utils/aptos";
import { useQuery } from "@tanstack/react-query"

type UseGetFungibleTokenBalancePayload = {
    asset_type: string;
    owner: string;
}
export type GetFungibleTokenBalanceResponse = number;

export const useGetFungibleTokenBalance: UseQueryHook<UseGetFungibleTokenBalancePayload, GetFungibleTokenBalanceResponse> = (props) => {
    const { payload, options } = props || {};
    const { asset_type, owner } = payload || {};

    const getFungibleTokenBalance = async () => {
        if (!asset_type) {
            throw new Error("asset_type is required");
        }

        const res = await aptos.getCurrentFungibleAssetBalances({
            options: {
                where:{
                    owner_address: {
                        _eq: owner
                    },
                    asset_type_v2: {
                        _eq: asset_type
                    }
                }
            }
        })

        return Number(res[0].amount);
    }

    return useQuery({
        queryKey: ['aptos', 'getFungibleTokenBalance', asset_type],
        queryFn: getFungibleTokenBalance,
        enabled: !!asset_type && !!owner,
        ...options,
    })
}