import { LoanSlotClaimYieldAndRepayResult } from "@/hooks/useLoanSlotClaimYieldAndRepay";
import { CommittedTransactionResponse } from "@aptos-labs/ts-sdk";
import { TransactionTypeResolver } from "./transactionTypeResolver";

/**
 * Normalizes the response from the loan slot claim yield and repay transaction.
 * @param transaction - The transaction data to normalize.
 * @returns The normalized data or null if normalization fails.
 */
export const normalizeLoanSlotClaimYieldAndRepay = (
  transaction: CommittedTransactionResponse
): LoanSlotClaimYieldAndRepayResult | null => {
  try {
    if (!transaction) return null;

    transaction = TransactionTypeResolver.toUserTransaction(transaction);

    // Find multiple events that can occur during this operation
    const yieldClaimedEvent = transaction.events.find((event) =>
      event.type.includes("YieldClaimed")
    );

    const loanRepaidEvent = transaction.events.find((event) =>
      event.type.includes("LoanRepaid")
    );

    const debtIndexUpdatedEvent = transaction.events.find((event) =>
      event.type.includes("DebtIndexUpdated")
    );

    // Need at least one of these events
    if (!yieldClaimedEvent?.data && !loanRepaidEvent?.data) return null;

    const yieldData = yieldClaimedEvent?.data;
    const repayData = loanRepaidEvent?.data;
    const debtData = debtIndexUpdatedEvent?.data;

    return {
      positionAddress: yieldData?.position || repayData?.position || "",
      claimerAddress: yieldData?.claimer || repayData?.borrower || "",
      loanSlotAddress: yieldData?.loan_slot || repayData?.loan_slot || "",

      // Yield information
      yieldAmount: yieldData?.yield_amount?.toString() || "0",
      feeAssetAAmount: yieldData?.fee_asset_a_amount?.toString() || "0",
      feeAssetBAmount: yieldData?.fee_asset_b_amount?.toString() || "0",
      totalRewardAssets: yieldData?.total_reward_assets?.toString() || "0",

      // Repayment information
      repayAmount: repayData?.amount?.toString() || "0",
      principalPortion: repayData?.principal_portion?.toString() || "0",
      interestPortion: repayData?.interest_portion?.toString() || "0",
      remainingPrincipal: repayData?.remaining_principal?.toString() || "0",
      loanFullyRepaid: repayData?.loan_fully_repaid || false,

      // Debt index information
      oldDebtIndex: debtData?.old_debt_idx?.toString() || "0",
      newDebtIndex: debtData?.new_debt_idx?.toString() || "0",
      apr: debtData?.apr?.toString() || "0",
      timeElapsed: debtData?.time_elapsed?.toString() || "0",

      transactionHash: transaction.hash,
      timestamp:
        yieldData?.timestamp ||
        repayData?.timestamp ||
        debtData?.timestamp ||
        transaction.timestamp,
      gasUsed: transaction.gas_used,
      success:
        transaction.success ||
        transaction.vm_status === "Executed successfully",
    };
  } catch (error) {
    console.error("Error normalizing loan slot claim yield and repay:", error);
    return null;
  }
};
