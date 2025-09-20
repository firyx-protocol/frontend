import { CreateLoanPositionResult } from "@/hooks/useCreateLoanPosition";
import { extractTokenInfo } from "./extractTokenInfo";
import { CommittedTransactionResponse } from "@aptos-labs/ts-sdk";
import { TransactionTypeResolver } from "./transactionTypeResolver";

/**
 * Normalizes the response from the loan position creation transaction.
 * @param transaction - The transaction data to normalize.
 * @returns The normalized data or null if normalization fails.
 */
export const normalizeLoanPositionCreation = (
  transaction: CommittedTransactionResponse
): CreateLoanPositionResult | null => {
  try {
    if (!transaction) return null;

    transaction = TransactionTypeResolver.toUserTransaction(transaction);

    // Find LoanPositionCreated event
    const loanPositionEvent = transaction.events.find((event: any) =>
      event.type.includes("LoanPositionCreated")
    );

    // Find CreatePositionEvent for additional info
    const createPositionEvent = transaction.events.find((event: any) =>
      event.type.includes("CreatePositionEvent")
    );

    if (!loanPositionEvent?.data) {
      console.error("No loan position event data found");
      return null;
    }

    const eventData = loanPositionEvent.data;
    const positionData = createPositionEvent?.data;

    const result = {
      positionAddress: eventData.position,
      transactionHash: transaction.hash,
      poolId: positionData?.pool_id,
      tokenA: extractTokenInfo(eventData.token_a),
      tokenB: extractTokenInfo(eventData.token_b),
      tokenFee: extractTokenInfo(eventData.token_fee),
      parameters: {
        feeTier: eventData.fee_tier || positionData?.fee_tier || 1,
        tickLower: eventData.tick_lower || positionData?.tick_lower?.bits || 0,
        tickUpper: eventData.tick_upper || positionData?.tick_upper?.bits || 0,
        slopeBeforeKink: eventData.slope_before_kink || "0",
        slopeAfterKink: eventData.slope_after_kink || "0",
        kinkUtilization: eventData.kink_utilization || "0",
        riskFactor: eventData.risk_factor || 0,
      },
      timestamps: {
        createdAt: eventData.created_at_ts || transaction.timestamp,
        blockTimestamp: transaction.timestamp,
      },
      gasUsed: transaction.gas_used,
      success:
        transaction.success ||
        transaction.vm_status === "Executed successfully",
    };

    return result;
  } catch (error) {
    console.error("Error normalizing loan position creation:", error);
    return null;
  }
};
