import { CONTRACT_ADDRESS } from "@/config";
import { aptos } from "@/utils/aptos";
import { snakeToCamel } from "@/utils/convert";
import {
  LedgerVersionArg,
  MoveResource,
  MoveValue,
} from "@aptos-labs/ts-sdk";

export type GetAllPositionsResult = {
  positions: MoveValue[];
  totalActiveLoans: number;
  totalLiquidity: number;
};

interface UseViewLoanPosition {
  /**
   * Get the global fee growth for a specific loan position address.
   * @param loanPositionAddress - The address of the loan position.
   * @returns The global fee growth.
   */
  getFeeGrowthGlobal: (loanPositionAddress: string) => Promise<MoveValue>;

  /**
   * Get the position information for a specific loan position address.
   * @param loanPositionAddress - The address of the loan position.
   * @returns The position information.
   */
  getPositionInfo: (loanPositionAddress: string) => Promise<MoveValue>;

  /**
   * Get the lending position information for a specific loan position address.
   * @param loanPositionAddress - The address of the loan position.
   * @returns The lending position information.
   */
  lendingPosition: (loanPositionAddress: string) => Promise<MoveValue>;

  /**
   * Get the view resources for a specific loan position address.
   * @param loanPositionAddress - The address of the loan position.
   * @returns A list of Move resources.
   */
  getView: (loanPositionAddress: string) => Promise<MoveResource[]>;

  /**
   * Get all loan positions.
   * @returns A list of all loan positions.
   */
  getAllPositions: () => Promise<GetAllPositionsResult>;
}

/**
 * Custom hook to view loan position details.
 * @returns A set of functions to view loan position details.
 */
export const useViewLoanPosition = (): UseViewLoanPosition => {
  const getFeeGrowthGlobal = async (
    loanPositionAddress: string
  ): Promise<MoveValue> => {
    if (!loanPositionAddress) {
      throw new Error("Loan position address is required");
    }
    const [feeGrowthGlobal] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_position::get_fee_growth_global`,
        functionArguments: [loanPositionAddress],
      },
    });
    return feeGrowthGlobal;
  };

  const getPositionInfo = async (
    loanPositionAddress: string
  ): Promise<MoveValue> => {
    if (!loanPositionAddress) {
      throw new Error("Loan position address is required");
    }
    const [positionInfo] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_position::get_position_info`,
        functionArguments: [loanPositionAddress],
      },
    });
    const convertedPositionInfo = snakeToCamel(positionInfo) as MoveValue;
    return convertedPositionInfo;
  };

  const lendingPosition = async (
    loanPositionAddress: string
  ): Promise<MoveValue> => {
    if (!loanPositionAddress) {
      throw new Error("Loan position address is required");
    }
    const [lendingPosition] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_position::lending_position`,
        functionArguments: [loanPositionAddress],
      },
    });
    return lendingPosition;
  };

  const getView = async (
    loanPositionAddress: string
  ): Promise<MoveResource[]> => {
    if (!loanPositionAddress) {
      throw new Error("Loan position address is required");
    }
    const resources = await aptos.getAccountResources({
      accountAddress: CONTRACT_ADDRESS,
    });
    const convertedResources = snakeToCamel(resources) as MoveResource[];
    return convertedResources;
  };

  const getAllPositions = async (
    options?: (LedgerVersionArg) | undefined
  ): Promise<GetAllPositionsResult> => {
    const positions = await aptos.getAccountResource({
      accountAddress: CONTRACT_ADDRESS,
      resourceType: `${CONTRACT_ADDRESS}::loan_position::LoanPositionRegistry`,
      options: options,
    });
    const convertedPositions = snakeToCamel(positions) as GetAllPositionsResult;
    return convertedPositions;
  };

  return {
    getFeeGrowthGlobal,
    getPositionInfo,
    lendingPosition,
    getView,
    getAllPositions,
  };
};
