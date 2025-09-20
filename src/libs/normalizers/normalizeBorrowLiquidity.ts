import { BorrowLiquidityResult } from "@/hooks/useBorrowLiquidity";

/**
 * Normalizes the response from the liquidity borrow transaction.
 * @param transaction - The transaction data to normalize.
 * @returns The normalized data or null if normalization fails.
 */
export const normalizeLiquidityBorrow = (transaction: any): BorrowLiquidityResult | null => {
  try {
    if (!transaction.events) return null;

    // Find LiquidityBorrowed event from the smart contract
    const liquidityBorrowedEvent = transaction.events.find((event: any) => 
      event.type.includes('LiquidityBorrowed')
    );

    if (!liquidityBorrowedEvent?.data) return null;

    const eventData = liquidityBorrowedEvent.data;

    return {
      positionAddress: eventData.position,
      borrowerAddress: eventData.borrower,
      loanSlotAddress: eventData.loan_slot,
      borrowAmount: eventData.amount?.toString() || '0',
      reserveAmount: eventData.reserve?.toString() || '0',
      durationIndex: eventData.duration_idx || 0,
      debtIndexAtBorrow: eventData.debt_idx_at_borrow?.toString() || '0',
      newUtilization: eventData.new_utilization?.toString() || '0',
      totalBorrowed: eventData.total_borrowed?.toString() || '0',
      availableBorrow: eventData.available_borrow?.toString() || '0',
      transactionHash: transaction.hash,
      timestamp: eventData.timestamp || transaction.timestamp,
      gasUsed: transaction.gas_used,
      success: transaction.success || transaction.vm_status === 'Executed successfully',
    };
  } catch (error) {
    console.error('Error normalizing liquidity borrow:', error);
    return null;
  }
};
