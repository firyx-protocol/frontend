import { CONTRACT_ADDRESS } from "@/config";
import { aptos } from "@/utils/aptos";
import { snakeToCamel } from "@/utils/convert";
import { MoveResource, PaginationArgs } from "@aptos-labs/ts-sdk";

export interface GetLoanSlotsResult {
  decodedKey: string;
  decodedValue?: string[];
  key: string;
  transactionVersion: string;
}

export interface UseViewLoanSlot {
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
  getView: (loanSlotAddress: string) => Promise<MoveResource[]>;
  getLoanSlots: (options?: {
    options?: PaginationArgs | undefined;
    accountAddress?: string;
  }) => Promise<GetLoanSlotsResult[]>;
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
  arrearsStartTs: unknown;
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

  const getLoanSlotInfo = async (
    loanSlotAddress: string
  ): Promise<LoanSlotInfo> => {
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

  const getView = async (loanSlotAddress: string): Promise<MoveResource[]> => {
    if (!loanSlotAddress) {
      throw new Error("Loan slot address is required");
    }
    const resources = await aptos.getAccountResources({
      accountAddress: loanSlotAddress,
    });
    const convertedResources = snakeToCamel(resources) as MoveResource[];
    return convertedResources;
  };

  const getLoanSlots = async (options?: {
    options?: PaginationArgs | undefined;
    accountAddress?: string;
  }): Promise<GetLoanSlotsResult[]> => {
    const resources = await aptos.getAccountResource({
      accountAddress: CONTRACT_ADDRESS,
      resourceType: `${CONTRACT_ADDRESS}::loan_slot::LoanSlotRegistry`,
    });
    const convertedResources = snakeToCamel(resources) as MoveResource;

    type LoanSlotRegistryData = {
      ownerSlots?: { handle: string };
    };
    const data = convertedResources as LoanSlotRegistryData;
    const allPositions = await aptos.getTableItemsData({
      options: {
        where: {
          table_handle: { _eq: String(data?.ownerSlots?.handle) },
          ...(options?.accountAddress
            ? { key: { _eq: options.accountAddress } }
            : {}),
        },
        ...options?.options,
      },
    });
    const convertedAllPositions = snakeToCamel(allPositions);
    console.log("All Positions Data:", convertedAllPositions);
    return convertedAllPositions as GetLoanSlotsResult[];
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
    getView,
    getLoanSlots,
  };
};

const mappedLoanSlotInfo = (loanSlotInfo: unknown): LoanSlotInfo => {
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
  ] = loanSlotInfo as unknown[]; // raw tuple

  const mapped: LoanSlotInfo = {
    loanPosAddr: String(loanPosAddr),
    originalPrincipal: String(originalPrincipal),
    principal: String(principal),
    share: String(share),
    reserve: String(reserve),
    debtIdxAtBorrow: String(debtIdxAtBorrow),
    feeGrowthDebtA: String(feeGrowthDebtA),
    feeGrowthDebtB: String(feeGrowthDebtB),
    active: Boolean(active),
    createdAtTs: String(createdAtTs),
    withdrawnAmount: String(withdrawnAmount),
    availableWithdraw: String(availableWithdraw),
    lastPaymentTs: String(lastPaymentTs),
    arrearsStartTs: arrearsStartTs,
  };
  return mapped;
};
