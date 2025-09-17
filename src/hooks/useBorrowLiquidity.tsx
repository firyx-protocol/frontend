import { CONTRACT_ADDRESS } from "@/config";
import { UseHookPayload, UseMutationHook, UseQueryHook } from "@/types";
import { aptos } from "@/utils/aptos";
import { normalizeLoanPositionCreation } from "@/utils/normalizers";
import { normalizeLiquidityBorrow } from "@/utils/normalizers/normalizeBorrowLiquidity";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

type BorrowLiquidityPayload = {
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

type UseBorrowLiquidityOptions = UseMutationOptions<
  BorrowLiquidityResult,
  Error,
  BorrowLiquidityPayload
>;

type UseBorrowLiquidityResult = UseMutationResult<
  BorrowLiquidityResult,
  Error,
  BorrowLiquidityPayload
>;

/**
 * Hook to borrow liquidity from a loan position
 * @param options Mutation options from react-query
 * @returns {UseBorrowLiquidityResult} result of the mutation
 */
export const useBorrowLiquidity: UseMutationHook<
  UseBorrowLiquidityOptions,
  UseBorrowLiquidityResult
> = (options) => {
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
        functionArguments: Object.values(payload),
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
