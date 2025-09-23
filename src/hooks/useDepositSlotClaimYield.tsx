import { CONTRACT_ADDRESS } from "@/config";
import { UseMutationHook } from "@/types";
import { aptos } from "@/utils/aptos";
import { normalizeDepositSlotClaimYield } from "@/utils/normalizers";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";

type DepositSlotClaimYieldPayload = {
  positionAddress: string;
  depositSlotAddress: string;
};

export type DepositSlotClaimYieldResult = {
  positionAddress: string;
  ownerAddress: string;
  depositSlotAddress: string;
  yieldAmount: string;
  amountFeeAssetA: string;
  amountFeeAssetB: string;
  rewardAssetsCount: string;
  lastUpdateTs: string;
  transactionHash: string;
  timestamp: string;
  gasUsed: string;
  success: boolean;
};

type UseDepositSlotClaimYieldOptions = UseMutationOptions<
  DepositSlotClaimYieldResult,
  Error,
  DepositSlotClaimYieldPayload
>;

type UseDepositSlotClaimYieldResult = UseMutationResult<
  DepositSlotClaimYieldResult,
  Error,
  DepositSlotClaimYieldPayload
>;

/**
 * Custom hook to claim yield from a deposit slot.
 * @param options - Optional mutation options.
 * @returns Mutation result containing the status and data of the operation.
 */
export const useDepositSlotClaimYield: UseMutationHook<
  UseDepositSlotClaimYieldOptions,
  UseDepositSlotClaimYieldResult
> = (options) => {
  const { signAndSubmitTransaction } = useWallet();

  const mutationFn = async (
    payload: DepositSlotClaimYieldPayload
  ): Promise<DepositSlotClaimYieldResult> => {
    const transaction: InputTransactionData = {
      data: {
        function: `${CONTRACT_ADDRESS}::loan_position::deposit_slot_claim_yield`,
        functionArguments: Object.values(payload),
      },
    };

    const response = await signAndSubmitTransaction(transaction);
    const executedTxn = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });
    console.log("Raw transaction response:", response);

    const normalizedResponse = normalizeDepositSlotClaimYield(executedTxn);
    if (!normalizedResponse) {
      throw new Error("Failed to normalize deposit slot claim yield response");
    }
    return normalizedResponse;
  };

  return useMutation<
    DepositSlotClaimYieldResult,
    Error,
    DepositSlotClaimYieldPayload
  >({
    mutationKey: ["depositSlotClaimYield"],
    mutationFn,
    ...options,
  });
};
