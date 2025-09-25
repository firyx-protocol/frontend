import { CONTRACT_ADDRESS } from "@/constants";
import { UseMutationHook } from "@/types";
import { aptos } from "@/utils/aptos";
import { normalizeLoanSlotClaimYieldAndRepay } from "@/libs/normalizers";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  useMutation,
} from "@tanstack/react-query";

export type LoanSlotClaimYieldAndRepayPayload = {
  positionAddress: string;
  loanSlotAddress: string;
  amount: number;
};

export type LoanSlotClaimYieldAndRepayResult = {
  positionAddress: string;
  claimerAddress: string;
  loanSlotAddress: string;

  // Yield information
  yieldAmount: string;
  feeAssetAAmount: string;
  feeAssetBAmount: string;
  totalRewardAssets: string;

  // Repayment information
  repayAmount: string;
  principalPortion: string;
  interestPortion: string;
  remainingPrincipal: string;
  loanFullyRepaid: boolean;

  // Debt index information
  oldDebtIndex: string;
  newDebtIndex: string;
  apr: string;
  timeElapsed: string;

  transactionHash: string;
  timestamp: string;
  gasUsed: string;
  success: boolean;
};

/**
 * Custom hook to claim yield and repay a loan slot in a loan position.
 * @param options - Optional mutation options.
 * @returns Mutation result containing the status and data of the operation.
 */
export const useLoanSlotClaimYieldAndRepay: UseMutationHook<
  LoanSlotClaimYieldAndRepayPayload,
  LoanSlotClaimYieldAndRepayResult
> = ({ options }) => {
  const { signAndSubmitTransaction } = useWallet();

  const mutationFn = async (
    payload: LoanSlotClaimYieldAndRepayPayload
  ): Promise<LoanSlotClaimYieldAndRepayResult> => {
    const transaction: InputTransactionData = {
      data: {
        function: `${CONTRACT_ADDRESS}::loan_position::loan_slot_claim_yield_and_repay`,
        functionArguments: Object.values(payload),
      },
    };
    const response = await signAndSubmitTransaction(transaction);
    const executedTxn = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });
    console.log("Raw transaction response:", response);
    const normalizedResponse = normalizeLoanSlotClaimYieldAndRepay(executedTxn);
    if (!normalizedResponse) {
      throw new Error(
        "Failed to normalize loan slot claim yield and repay response"
      );
    }
    return normalizedResponse;
  };

  return useMutation<
    LoanSlotClaimYieldAndRepayResult,
    Error,
    LoanSlotClaimYieldAndRepayPayload
  >({
    mutationKey: ["loanSlotClaimYieldAndRepay"],
    mutationFn,
    ...options,
  });
};
