import { CONTRACT_ADDRESS } from "@/config";
import { aptos } from "@/utils/aptos";

interface UseViewLoanPosition {
  /**
   * Get the global fee growth for a specific loan position address.
   * @param loanPositionAddress - The address of the loan position.
   * @returns The global fee growth.
   */
  getFeeGrowthGlobal: (loanPositionAddress: string) => Promise<any>;

  /**
   * Get the position information for a specific loan position address.
   * @param loanPositionAddress - The address of the loan position.
   * @returns The position information.
   */
  getPositionInfo: (loanPositionAddress: string) => Promise<any>;

  /**
   * Get the lending position information for a specific loan position address.
   * @param loanPositionAddress - The address of the loan position.
   * @returns The lending position information.
   */
  lendingPosition: (loanPositionAddress: string) => Promise<any>;
}

/**
 * Custom hook to view loan position details.
 * @returns A set of functions to view loan position details.
 */
export const useViewLoanPosition = (): UseViewLoanPosition => {
  const getFeeGrowthGlobal = async (
    loanPositionAddress: string
  ): Promise<any> => {
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

  const getPositionInfo = async (loanPositionAddress: string): Promise<any> => {
    if (!loanPositionAddress) {
      throw new Error("Loan position address is required");
    }
    const [positionInfo] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_position::get_position_info`,
        functionArguments: [loanPositionAddress],
      },
    });
    return positionInfo;
  };

  const lendingPosition = async (loanPositionAddress: string): Promise<any> => {
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

  return {
    getFeeGrowthGlobal,
    getPositionInfo,
    lendingPosition,
  };
};
