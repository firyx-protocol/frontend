import { CONTRACT_ADDRESS } from "@/constants";
import { toCamelCase } from "@/libs/helpers";
import { UseQueryHook } from "@/types";
import { LoanSlot } from "@/types/core";
import { aptos } from "@/utils/aptos";
import { useQuery } from "@tanstack/react-query"

type UseGetLoanSlotByIdPayload = {
    id: string;
}

export type GetLoanSlotByIdResponse = LoanSlot;

export const useGetLoanSlotById: UseQueryHook<UseGetLoanSlotByIdPayload, GetLoanSlotByIdResponse> = (props) => {
    const { payload, options } = props || {};
    const { id } = payload || {};

    const handelGetGetLoanSlotById = async () => {
        if (!id) {
            throw new Error("id is required");
        }
        const res = await aptos.getAccountResource({
            accountAddress: id,
            resourceType: `${CONTRACT_ADDRESS}::loan_slot::LoanSlot`
        });

        return toCamelCase(res) as GetLoanSlotByIdResponse;
    }

    return useQuery({
        queryKey: ['hyperion', 'getGetLoanSlotById', id],
        queryFn: handelGetGetLoanSlotById,
        enabled: !!id,
        ...options,
    })
}