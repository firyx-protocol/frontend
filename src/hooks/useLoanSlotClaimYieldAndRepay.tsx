import { UseHookPayload, UseMutationHook } from "@/types";
import { aptos } from "@/utils/aptos";
import { normalizeLoanSlotClaimYieldAndRepay } from "@/utils/normalizers";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";

type LoanSlotClaimYieldAndRepayPayload = {
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

type UseLoanSlotClaimYieldAndRepayOptions = UseMutationOptions<
  LoanSlotClaimYieldAndRepayResult,
  Error,
  LoanSlotClaimYieldAndRepayPayload
>;

type UseLoanSlotClaimYieldAndRepayResult = UseMutationResult<
  LoanSlotClaimYieldAndRepayResult,
  Error,
  LoanSlotClaimYieldAndRepayPayload
>;

/**
 * Custom hook to claim yield and repay a loan slot in a loan position.
 * @param options - Optional mutation options.
 * @returns Mutation result containing the status and data of the operation.
 */
export const useLoanSlotClaimYieldAndRepay: UseMutationHook<
  UseLoanSlotClaimYieldAndRepayOptions,
  UseLoanSlotClaimYieldAndRepayResult
> = (options) => {
  const { signAndSubmitTransaction } = useWallet();

  const mutationFn = async (
    payload: LoanSlotClaimYieldAndRepayPayload
  ): Promise<LoanSlotClaimYieldAndRepayResult> => {
    const contractAddress =
      "0xe6f3d412f70a33dc85f431671afa237db4f9b3602e46aaa8850ba37e8a3cd729";
    const transaction: InputTransactionData = {
      data: {
        function: `${contractAddress}::loan_position::loan_slot_claim_yield_and_repay`,
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
      throw new Error("Failed to normalize loan slot claim yield and repay response");
    }
    return normalizedResponse;
  };

  return useMutation<LoanSlotClaimYieldAndRepayResult, Error, LoanSlotClaimYieldAndRepayPayload>({
    mutationKey: ["loanSlotClaimYieldAndRepay"],
    mutationFn,
    ...options,
  });
};
