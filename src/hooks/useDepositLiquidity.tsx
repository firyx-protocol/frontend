import { CONTRACT_ADDRESS } from "@/config";
import { UseMutationHook } from "@/types";
import { aptos } from "@/utils/aptos";
import { normalizeLiquidityDeposit } from "@/libs/normalizers";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  useMutation,
} from "@tanstack/react-query";

type DepositLiquidityPayload = {
  positionAddress: string;
  tokenA: string;
  tokenB: string;
  amountA: number;
  amountB: number;
  amountAMin: number;
  amountBMin: number;
};

export type DepositLiquidityResult = {
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
 * Custom hook to deposit liquidity into a loan position.
 * @param options - Optional mutation options.
 * @returns Mutation result containing the status and data of the operation.
 */
export const useDepositLiquidity: UseMutationHook<
  DepositLiquidityPayload,
  DepositLiquidityResult
> = (options) => {
  const { signAndSubmitTransaction } = useWallet();

  const mutationFn = async (
    payload: DepositLiquidityPayload
  ): Promise<DepositLiquidityResult> => {
    const transaction: InputTransactionData = {
      data: {
        function: `${CONTRACT_ADDRESS}::loan_position::deposit_liquidity`,
        functionArguments: Object.values(payload),
      },
    };
    const response = await signAndSubmitTransaction(transaction);
    const executedTxn = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });
    console.log("Raw transaction response:", response);
    const normalizedResponse = normalizeLiquidityDeposit(executedTxn);
    if (!normalizedResponse) {
      throw new Error("Failed to normalize deposit liquidity response");
    }
    return normalizedResponse;
  };

  return useMutation<DepositLiquidityResult, Error, DepositLiquidityPayload>({
    mutationKey: ["depositLiquidity"],
    mutationFn,
    ...options,
  });
};
