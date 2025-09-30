import { CONTRACT_ADDRESS } from "@/constants";
import { toCamelCase } from "@/libs/helpers";
import { UseQueryHook } from "@/types";
import { DepositSlot } from "@/types/core";
import { aptos } from "@/utils/aptos";
import { useQuery } from "@tanstack/react-query"

type UseGetDepositSlotByIdPayload = {
    id: string;
}

export type GetDepositSlotByIdResponse = DepositSlot;

export const useGetDepositSlotById: UseQueryHook<UseGetDepositSlotByIdPayload, GetDepositSlotByIdResponse> = (props) => {
    const { payload, options } = props || {};
    const { id } = payload || {};

    const handelGetGetDepositSlotById = async () => {
        if (!id) {
            throw new Error("id is required");
        }
        const res = await aptos.getAccountResource({
            accountAddress: id,
            resourceType: `${CONTRACT_ADDRESS}::deposit_slot::DepositSlot`
        });

        return toCamelCase(res) as GetDepositSlotByIdResponse;
    }

    return useQuery({
        queryKey: ['hyperion', 'getGetDepositSlotById', id],
        queryFn: handelGetGetDepositSlotById,
        enabled: !!id,
        ...options,
    })
}