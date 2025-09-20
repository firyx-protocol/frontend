import { CONTRACT_ADDRESS } from "@/config";
import { UseHookPayload, UseMutationHook, UseQueryHook } from "@/types";
import { normalizeLoanPositionCreation } from "@/libs/normalizers";
import {
  InputTransactionData,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { aptos } from "@/utils/aptos";

type CreateLoanPositionPayload = {
  tokenA: string;
  tokenB: string;
  tokenFee: string;
  feeTier: number;
  tickLower: number;
  tickUpper: number;
  slopeBeforeKink: number;
  slopeAfterKink: number;
  kinkUtilization: number;
  riskFactor: number;
};

export type CreateLoanPositionResult = {
  transactionHash: string;
  positionAddress: string;
  poolId?: string;
  tokenA: {
    address: string;
    objectAddress: string;
  };
  tokenB: {
    address: string;
    objectAddress: string;
  };
  tokenFee: {
    address: string;
    objectAddress: string;
  };
  parameters: {
    feeTier: number;
    tickLower: number;
    tickUpper: number;
    slopeBeforeKink: string;
    slopeAfterKink: string;
    kinkUtilization: string;
    riskFactor: number;
  };
  timestamps: {
    createdAt: string;
    blockTimestamp: string;
  };
  gasUsed?: string;
  success: boolean;
};

type UseCreateLoanPositionOptions = UseMutationOptions<
  CreateLoanPositionResult,
  Error,
  CreateLoanPositionPayload
>;

type UseCreateLoanPositionResult = UseMutationResult<
  CreateLoanPositionResult,
  Error,
  CreateLoanPositionPayload
>;

/**
 * Custom hook to create a new loan position.
 * @param options - Optional mutation options.
 * @returns Mutation result containing the status and data of the operation.
 */
export const useCreateLoanPosition: UseMutationHook<
  UseCreateLoanPositionOptions,
  UseCreateLoanPositionResult
> = (options) => {
  const { signAndSubmitTransaction } = useWallet();

  const mutationFn = async (
    payload: CreateLoanPositionPayload
  ): Promise<CreateLoanPositionResult> => {
    const transaction: InputTransactionData = {
      data: {
        function: `${CONTRACT_ADDRESS}::loan_position::create_loan_position`,
        functionArguments: Object.values(payload),
      },
    };

    // Submit the transaction and get the hash
    const response = await signAndSubmitTransaction(transaction);
    console.log("Raw transaction response:", response);

    const executedTxn = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    const normalizedResponse = normalizeLoanPositionCreation(executedTxn);
    console.log("Normalized response:", normalizedResponse);
    if (!normalizedResponse) {
      console.error("Normalization failed for transaction:", executedTxn);
      throw new Error("Failed to normalize loan position creation response");
    }
    return normalizedResponse;
  };

  return useMutation<
    CreateLoanPositionResult,
    Error,
    CreateLoanPositionPayload
  >({
    mutationKey: ["createLoanPosition"],
    mutationFn,
    ...options,
  });
};
