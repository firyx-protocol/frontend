import { CONTRACT_ADDRESS } from "@/config";
import { aptos } from "@/utils/aptos";

interface UseViewLoanSlot {
  principal: (loanSlotAddress: string) => Promise<string>;
  reserve: (loanSlotAddress: string) => Promise<string>;
  debtIndexAtBorrow: (loanSlotAddress: string) => Promise<string>;
  originalPrincipal: (loanSlotAddress: string) => Promise<string>;
  share: (loanSlotAddress: string) => Promise<string>;
  feeGrowthDebtA: (loanSlotAddress: string) => Promise<string>;
  feeGrowthDebtB: (loanSlotAddress: string) => Promise<string>;
  isActive: (loanSlotAddress: string) => Promise<boolean>;
  currentDebt: (
    loanSlotAddress: string,
    curDebtIndex: string
  ) => Promise<string>;
  getLoanSlotInfo: (loanSlotAddress: string) => Promise<LoanSlotInfo>;
}

interface LoanSlotInfo {
  loanPosAddr: string;
  originalPrincipal: string;
  principal: string;
  share: string;
  reserve: string;
  debtIdxAtBorrow: string;
  feeGrowthDebtA: string;
  feeGrowthDebtB: string;
  active: boolean;
  createdAtTs: string;
  withdrawnAmount: string;
  availableWithdraw: string;
  lastPaymentTs: string;
  arrearsStartTs: any;
}

export const useViewLoanSlot = (): UseViewLoanSlot => {
  const principal = async (loanSlotAddress: string): Promise<string> => {
    if (!loanSlotAddress) {
      throw new Error("Loan slot address is required");
    }
    const [principal] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_slot::principal`,
        functionArguments: [loanSlotAddress],
      },
    });
    return String(principal);
  };

  const reserve = async (loanSlotAddress: string): Promise<string> => {
    if (!loanSlotAddress) {
      throw new Error("Loan slot address is required");
    }
    const [reserve] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_slot::reserve`,
        functionArguments: [loanSlotAddress],
      },
    });
    return String(reserve);
  };

  const debtIndexAtBorrow = async (
    loanSlotAddress: string
  ): Promise<string> => {
    if (!loanSlotAddress) {
      throw new Error("Loan slot address is required");
    }
    const [debtIndexAtBorrow] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_slot::debt_index_at_borrow`,
        functionArguments: [loanSlotAddress],
      },
    });
    return String(debtIndexAtBorrow);
  };

  const originalPrincipal = async (
    loanSlotAddress: string
  ): Promise<string> => {
    if (!loanSlotAddress) {
      throw new Error("Loan slot address is required");
    }
    const [originalPrincipal] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_slot::original_principal`,
        functionArguments: [loanSlotAddress],
      },
    });
    return String(originalPrincipal);
  };

  const share = async (loanSlotAddress: string): Promise<string> => {
    if (!loanSlotAddress) {
      throw new Error("Loan slot address is required");
    }
    const [share] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_slot::share`,
        functionArguments: [loanSlotAddress],
      },
    });
    return String(share);
  };

  const feeGrowthDebtA = async (loanSlotAddress: string): Promise<string> => {
    if (!loanSlotAddress) {
      throw new Error("Loan slot address is required");
    }
    const [feeGrowthDebtA] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_slot::fee_growth_debt_a`,
        functionArguments: [loanSlotAddress],
      },
    });
    return String(feeGrowthDebtA);
  };

  const feeGrowthDebtB = async (loanSlotAddress: string): Promise<string> => {
    if (!loanSlotAddress) {
      throw new Error("Loan slot address is required");
    }
    const [feeGrowthDebtB] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_slot::fee_growth_debt_b`,
        functionArguments: [loanSlotAddress],
      },
    });
    return String(feeGrowthDebtB);
  };

  const isActive = async (loanSlotAddress: string): Promise<boolean> => {
    if (!loanSlotAddress) {
      throw new Error("Loan slot address is required");
    }
    const [isActive] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_slot::is_active`,
        functionArguments: [loanSlotAddress],
      },
    });
    return Boolean(isActive);
  };

  const currentDebt = async (
    loanSlotAddress: string,
    curDebtIndex: string
  ): Promise<string> => {
    if (!loanSlotAddress) {
      throw new Error("Loan slot address is required");
    }
    if (!curDebtIndex) {
      throw new Error("Current debt index is required");
    }
    const [currentDebt] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_slot::current_debt`,
        functionArguments: [loanSlotAddress, curDebtIndex],
      },
    });
    return String(currentDebt);
  };

  const getLoanSlotInfo = async (loanSlotAddress: string): Promise<LoanSlotInfo> => {
    if (!loanSlotAddress) {
      throw new Error("Loan slot address is required");
    }
    const loanSlotInfo = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::loan_slot::get_loan_slot_info`,
        functionArguments: [loanSlotAddress],
      },
    });

    return mappedLoanSlotInfo(loanSlotInfo);
  };

  return {
    principal,
    reserve,
    debtIndexAtBorrow,
    originalPrincipal,
    share,
    feeGrowthDebtA,
    feeGrowthDebtB,
    isActive,
    currentDebt,
    getLoanSlotInfo,
  };
};

const mappedLoanSlotInfo = (loanSlotInfo: any): LoanSlotInfo => {
  const [
    loanPosAddr,
    originalPrincipal,
    principal,
    share,
    reserve,
    debtIdxAtBorrow,
    feeGrowthDebtA,
    feeGrowthDebtB,
    active,
    createdAtTs,
    withdrawnAmount,
    availableWithdraw,
    lastPaymentTs,
    arrearsStartTs,
  ] = loanSlotInfo as any[]; // raw tuple

  const mapped: LoanSlotInfo = {
    loanPosAddr,
    originalPrincipal,
    principal,
    share,
    reserve,
    debtIdxAtBorrow,
    feeGrowthDebtA,
    feeGrowthDebtB,
    active,
    createdAtTs,
    withdrawnAmount,
    availableWithdraw,
    lastPaymentTs,
    arrearsStartTs,
  };
  return mapped;
};
