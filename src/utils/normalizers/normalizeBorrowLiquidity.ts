import { BorrowLiquidityResult } from "@/hooks/useBorrowLiquidity";
import {
  CommittedTransactionResponse,
} from "@aptos-labs/ts-sdk";
import { TransactionTypeResolver } from "./transactionTypeResolver";

/**
 * Normalizes the response from the liquidity borrow transaction.
 * @param transaction - The transaction data to normalize.
 * @returns The normalized data or null if normalization fails.
 */
export const normalizeLiquidityBorrow = (
  transaction: CommittedTransactionResponse
): BorrowLiquidityResult | null => {
  try {
    if (!transaction) return null;

    transaction = TransactionTypeResolver.toUserTransaction(transaction);

    const liquidityBorrowedEvent = transaction.events.find((event) =>
      event.type.includes("LiquidityBorrowed")
    );

    if (!liquidityBorrowedEvent?.data) return null;

    const eventData = liquidityBorrowedEvent.data;

    return {
      positionAddress: eventData.position,
      borrowerAddress: eventData.borrower,
      loanSlotAddress: eventData.loan_slot,
      borrowAmount: eventData.amount?.toString() || "0",
      reserveAmount: eventData.reserve?.toString() || "0",
      durationIndex: eventData.duration_idx || 0,
      debtIndexAtBorrow: eventData.debt_idx_at_borrow?.toString() || "0",
      newUtilization: eventData.new_utilization?.toString() || "0",
      totalBorrowed: eventData.total_borrowed?.toString() || "0",
      availableBorrow: eventData.available_borrow?.toString() || "0",
      transactionHash: transaction.hash,
      timestamp: eventData.timestamp || transaction.timestamp,
      gasUsed: transaction.gas_used,
      success:
        transaction.success ||
        transaction.vm_status === "Executed successfully",
    };
  } catch (error) {
    console.error("Error normalizing liquidity borrow:", error);
    return null;
  }
};
