import { CONTRACT_ADDRESS } from "@/constants";
import { UseMutationHook } from "@/types";
import { aptos } from "@/utils/aptos";
import { normalizeLiquidityBorrow } from "@/libs/normalizers";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { useMutation } from "@tanstack/react-query";

export type BorrowLiquidityPayload = {
  positionAddress: string;
  tokenFee: string;
  amount: number;
  durationIndex: number;
};

export type BorrowLiquidityResult = {
  positionAddress: string;
  borrowerAddress: string;
  loanSlotAddress: string;
  borrowAmount: string;
  reserveAmount: string;
  durationIndex: number;
  debtIndexAtBorrow: string;
  newUtilization: string;
  totalBorrowed: string;
  availableBorrow: string;
  transactionHash: string;
  timestamp: string;
  gasUsed: string;
  success: boolean;
};

/**
 * Hook to borrow liquidity from a loan position
 * @param options Mutation options from react-query
 * @returns Mutation result containing the status and data of the operation.
 */
export const useBorrowLiquidity: UseMutationHook<
  BorrowLiquidityPayload,
  BorrowLiquidityResult
> = ({ options }) => {
  const { signAndSubmitTransaction } = useWallet();

  /**
   * Mutation function to borrow liquidity
   * @param payload - parameters required to borrow liquidity
   * @returns {Promise<BorrowLiquidityResult>} result of the mutation
   */
  const mutationFn = async (
    payload: BorrowLiquidityPayload
  ): Promise<BorrowLiquidityResult> => {
    const transaction: InputTransactionData = {
      data: {
        function: `${CONTRACT_ADDRESS}::loan_position::borrow_liquidity`,
        functionArguments: [
          payload.positionAddress,
          payload.tokenFee,
          payload.amount.toString(),
          payload.durationIndex.toString(),
        ],
      },
    };
    const response = await signAndSubmitTransaction(transaction);
    const executedTxn = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });
    console.log("Raw transaction response:", response);
    const normalizedResponse = normalizeLiquidityBorrow(executedTxn);
    if (!normalizedResponse) {
      throw new Error("Failed to normalize loan position creation response");
    }
    return normalizedResponse;
  };

  return useMutation<BorrowLiquidityResult, Error, BorrowLiquidityPayload>({
    mutationKey: ["borrowLiquidity"],
    mutationFn,
    ...options,
  });
};
