import { DepositLiquiditySingleResult } from "@/hooks/useDepositLiquiditySingle";
import { CommittedTransactionResponse } from "@aptos-labs/ts-sdk";
import { TransactionTypeResolver } from "./transactionTypeResolver";

/**
 * Normalizes the response from the deposit liquidity single transaction.
 * @param transaction - The transaction data to normalize.
 * @returns The normalized data or null if normalization fails.
 */
export const normalizeDepositLiquiditySingle = (transaction: CommittedTransactionResponse): DepositLiquiditySingleResult | null => {
  try {
    if (!transaction) return null; 

    transaction = TransactionTypeResolver.toUserTransaction(transaction);

    // Find LiquidityDeposited event from the smart contract
    const liquidityDepositedEvent = transaction.events.find((event) => 
      event.type.includes('LiquidityDeposited')
    );

    if (!liquidityDepositedEvent?.data) return null;

    const eventData = liquidityDepositedEvent.data;

    return {
      positionAddress: eventData.position,
      lenderAddress: eventData.lender,
      depositSlotAddress: eventData.deposit_slot,
      liquidityAmount: eventData.amount?.toString() || '0',
      shares: eventData.shares?.toString() || '0',
      totalLiquidity: eventData.total_liquidity?.toString() || '0',
      totalShares: eventData.total_shares?.toString() || '0',
      utilization: eventData.utilization?.toString() || '0',
      transactionHash: transaction.hash,
      timestamp: eventData.timestamp || transaction.timestamp,
      gasUsed: transaction.gas_used,
      success: transaction.success || transaction.vm_status === 'Executed successfully',
    };
  } catch (error) {
    console.error('Error normalizing deposit liquidity single:', error);
    return null;
  }
};
