import { CONTRACT_ADDRESS } from "@/constants";
import { toCamelCase } from "@/libs/helpers";
import { UseQueryHook } from "@/types";
import { LoanPosition } from "@/types/core";
import { aptos } from "@/utils/aptos";
import { hyperion } from "@/utils/hyperion"
import { FeeTierIndex } from "@hyperionxyz/sdk";
import { useQuery } from "@tanstack/react-query"

type UseGetLoanPositionByIdPayload = {
    id: string;
}

export type GetLoanPositionByIdResponse = LoanPosition;

export const useGetLoanPositionById: UseQueryHook<UseGetLoanPositionByIdPayload, GetLoanPositionByIdResponse> = (props) => {
    const { payload, options } = props || {};
    const { id } = payload || {};

    const handelGetGetLoanPositionById = async () => {
        if (!id) {
            throw new Error("id is required");
        }
        const res = await aptos.getAccountResource({
            accountAddress: id,
            resourceType: `${CONTRACT_ADDRESS}::loan_position::LoanPosition`
        });

        return toCamelCase(res) as GetLoanPositionByIdResponse;
    }

    return useQuery({
        queryKey: ['hyperion', 'getGetLoanPositionById', id],
        queryFn: handelGetGetLoanPositionById,
        enabled: !!id,
        ...options,
    })
}