import { CONTRACT_ADDRESS } from "@/config";
import { aptos } from "@/utils/aptos";

interface UseViewLoanPosition {
  getFeeGrowthGlobal: (loanPositionAddress: string) => Promise<any>;
  getPositionInfo: (loanPositionAddress: string) => Promise<any>;
  lendingPosition: (loanPositionAddress: string) => Promise<any>;
}

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
