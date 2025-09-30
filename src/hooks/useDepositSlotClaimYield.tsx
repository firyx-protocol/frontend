import { CONTRACT_ADDRESS } from "@/constants";
import { UseMutationHook } from "@/types";
import { aptos } from "@/utils/aptos";
import { normalizeDepositSlotClaimYield } from "@/libs/normalizers";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { useMutation } from "@tanstack/react-query";

export type DepositSlotClaimYieldPayload = {
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

/**
 * Custom hook to claim yield from a deposit slot.
 * @param options - Optional mutation options.
 * @returns Mutation result containing the status and data of the operation.
 */
export const useDepositSlotClaimYield: UseMutationHook<
  DepositSlotClaimYieldPayload,
  DepositSlotClaimYieldResult
> = ({ options }) => {
  const { signAndSubmitTransaction } = useWallet();

  /**
   * Mutation function to claim yield from a deposit slot.
   * @param payload - parameters required to claim yield from a deposit slot
   * @returns {Promise<DepositSlotClaimYieldResult>} result of the mutation
   */
  const mutationFn = async (
    payload: DepositSlotClaimYieldPayload
  ): Promise<DepositSlotClaimYieldResult> => {
    const transaction: InputTransactionData = {
      data: {
        function: `${CONTRACT_ADDRESS}::loan_position::deposit_slot_claim_yield`,
        functionArguments: [
          payload.positionAddress,
          payload.depositSlotAddress,
        ]
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
