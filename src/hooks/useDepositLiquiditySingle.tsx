import { CONTRACT_ADDRESS } from "@/config";
import { UseMutationHook } from "@/types";
import { aptos } from "@/utils/aptos";
import { normalizeDepositLiquiditySingle } from "@/libs/normalizers";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  useMutation,
} from "@tanstack/react-query";

type DepositLiquiditySinglePayload = {
  positionAddress: string;
  fromA: string;
  toB: string;
  amountIn: number;
  slippageNumerators: string;
  slippageDenominator: string;
  thresholdNumerator: string;
  thresholdDenominator: string;
};

export type DepositLiquiditySingleResult = {
  positionAddress: string;
  lenderAddress: string;
  depositSlotAddress: string;
  liquidityAmount: string;
  shares: string;
  totalLiquidity: string;
  totalShares: string;
  utilization: string;
  transactionHash: string;
  timestamp: string;
  gasUsed: string;
  success: boolean;
};


/**
 * Custom hook to deposit liquidity into a single-sided loan position.
 * @param options - Optional mutation options.
 * @returns Mutation result containing the status and data of the operation.
 */
export const useDepositLiquiditySingle: UseMutationHook<
  DepositLiquiditySinglePayload,
  DepositLiquiditySingleResult
> = (options) => {
  const { signAndSubmitTransaction } = useWallet();

  const mutationFn = async (
    payload: DepositLiquiditySinglePayload
  ): Promise<DepositLiquiditySingleResult> => {
    const transaction: InputTransactionData = {
      data: {
        function: `${CONTRACT_ADDRESS}::loan_position::deposit_liquidity_single`,
        functionArguments: Object.values(payload),
      },
    };
    console.log("Submitting transaction:", transaction);
    const response = await signAndSubmitTransaction(transaction);
    const executedTxn = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });
    console.log("Raw transaction response:", response);

    const normalizedResponse = normalizeDepositLiquiditySingle(executedTxn);
    if (!normalizedResponse) {
      throw new Error("Failed to normalize deposit liquidity single response");
    }
    return normalizedResponse;
  };

  return useMutation<DepositLiquiditySingleResult, Error, DepositLiquiditySinglePayload>({
    mutationKey: ["depositLiquiditySingle"],
    mutationFn,
    ...options,
  });
};
