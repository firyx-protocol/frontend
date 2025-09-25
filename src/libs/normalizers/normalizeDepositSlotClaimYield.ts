import { CommittedTransactionResponse } from "@aptos-labs/ts-sdk";
import { TransactionTypeResolver } from "./transactionTypeResolver";
import { DepositSlotClaimYieldResult } from "@/hooks/useDepositSlotClaimYield";

/**
 * Normalizes the response from the deposit slot claim yield transaction.
 * @param transaction - The transaction data to normalize.
 * @returns The normalized data or null if normalization fails.
 */
export const normalizeDepositSlotClaimYield = (
  transaction: CommittedTransactionResponse
): DepositSlotClaimYieldResult | null => {
  try {
    if (!transaction) return null;

    transaction = TransactionTypeResolver.toUserTransaction(transaction);

    // Find YieldClaimed event
    const yieldClaimedEvent = transaction.events.find((event) =>
      event.type.includes("YieldClaimed")
    );

    if (!yieldClaimedEvent?.data) {
      console.error("No yield claimed event data found");
      return null;
    }

    const eventData = yieldClaimedEvent.data;

    const result = {
      positionAddress: eventData.position,
      transactionHash: transaction.hash,
      ownerAddress: eventData.owner,
      depositSlotAddress: eventData.deposit_slot,
      yieldAmount: eventData.yield_amount?.toString() || "0",
      amountFeeAssetA: eventData.fee_asset_a_amount?.toString() || "0",
      amountFeeAssetB: eventData.fee_asset_b_amount?.toString() || "0",
      rewardAssetsCount: eventData.total_reward_assets?.toString() || "0",
      lastUpdateTs: eventData.last_update_ts?.toString() || "0",
      timestamp: transaction.timestamp,
      gasUsed: transaction.gas_used,
      success:
        transaction.success ||
        transaction.vm_status === "Executed successfully",
    };

    return result;
  } catch (error) {
    console.error("Error normalizing deposit slot claim yield:", error);
    return null;
  }
};
