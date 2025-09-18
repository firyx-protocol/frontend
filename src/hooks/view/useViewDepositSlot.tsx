import { CONTRACT_ADDRESS } from "@/config";
import { UseQueryHook } from "@/types";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useQuery } from "@tanstack/react-query";
import { aptos } from "@/utils/aptos";

interface UseViewDepositSlot {
  originalPrincipal: (depositSlotAddress: string) => Promise<string>;
  share: (depositSlotAddress: string) => Promise<string>;
  accumulatedDeposits: (depositSlotAddress: string) => Promise<string>;
  activeDeposits: () => Promise<number>;
  feeGrowthDebtA: (depositSlotAddress: string) => Promise<string>;
  feeGrowthDebtB: (depositSlotAddress: string) => Promise<string>;
  getDepositSlotInfo: (depositSlotAddress: string) => Promise<any>;
  isActive: (depositSlotAddress: string) => Promise<boolean>;
  lastDepositTimestamp: (depositSlotAddress: string) => Promise<string>;
  lastWithdrawTimestamp: (depositSlotAddress: string) => Promise<string>;
  lenderAddress: (depositSlotAddress: string) => Promise<string>;
  loanPositionAddress: (depositSlotAddress: string) => Promise<string>;
  timestampCreated: (depositSlotAddress: string) => Promise<string>;
  totalDeposits: () => Promise<string>;
}

export const useViewDepositSlot = (): UseViewDepositSlot => {
  const originalPrincipal = async (
    depositSlotAddress: string
  ): Promise<string> => {
    if (!depositSlotAddress) {
      throw new Error("Deposit slot address is required");
    }
    const [originalPrincipal] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::original_principal`,
        functionArguments: [depositSlotAddress],
      },
    });
    return String(originalPrincipal);
  };

  const share = async (depositSlotAddress: string): Promise<string> => {
    if (!depositSlotAddress) {
      throw new Error("Deposit slot address is required");
    }
    const [share] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::share`,
        functionArguments: [depositSlotAddress],
      },
    });
    return String(share);
  };

  const accumulatedDeposits = async (
    depositSlotAddress: string
  ): Promise<string> => {
    if (!depositSlotAddress) {
      throw new Error("Deposit slot address is required");
    }
    const [accumulatedDeposits] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::accumulated_deposits`,
        functionArguments: [depositSlotAddress],
      },
    });
    return String(accumulatedDeposits);
  };

  const activeDeposits = async (): Promise<number> => {
    const [activeDeposits] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::active_deposits`,
      },
    });
    return Number(activeDeposits);
  };

  const feeGrowthDebtA = async (
    depositSlotAddress: string
  ): Promise<string> => {
    if (!depositSlotAddress) {
      throw new Error("Deposit slot address is required");
    }
    const [feeGrowthDebtA] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::fee_growth_debt_a`,
        functionArguments: [depositSlotAddress],
      },
    });
    return String(feeGrowthDebtA);
  };

  const feeGrowthDebtB = async (
    depositSlotAddress: string
  ): Promise<string> => {
    if (!depositSlotAddress) {
      throw new Error("Deposit slot address is required");
    }
    const [feeGrowthDebtB] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::fee_growth_debt_b`,
        functionArguments: [depositSlotAddress],
      },
    });
    return String(feeGrowthDebtB);
  };

  const getDepositSlotInfo = async (depositSlotAddress: string) => {
    if (!depositSlotAddress) {
      throw new Error("Deposit slot address is required");
    }
    const depositSlotInfo = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::get_deposit_slot_info`,
        functionArguments: [depositSlotAddress],
      },
    });
    console.log("Deposit Slot Info:", depositSlotInfo);
    return depositSlotInfo;
  };

  const isActive = async (depositSlotAddress: string): Promise<boolean> => {
    if (!depositSlotAddress) {
      throw new Error("Deposit slot address is required");
    }
    const [active] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::is_active`,
        functionArguments: [depositSlotAddress],
      },
    });
    return Boolean(active);
  };

  const lastDepositTimestamp = async (
    depositSlotAddress: string
  ): Promise<string> => {
    if (!depositSlotAddress) {
      throw new Error("Deposit slot address is required");
    }
    const [lastDepositTimestamp] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::last_deposit_timestamp`,
        functionArguments: [depositSlotAddress],
      },
    });
    return String(lastDepositTimestamp);
  };

  const lastWithdrawTimestamp = async (
    depositSlotAddress: string
  ): Promise<string> => {
    if (!depositSlotAddress) {
      throw new Error("Deposit slot address is required");
    }
    const [lastWithdrawTimestamp] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::last_withdraw_timestamp`,
        functionArguments: [depositSlotAddress],
      },
    });
    return String(lastWithdrawTimestamp);
  };

  const lenderAddress = async (depositSlotAddress: string): Promise<string> => {
    if (!depositSlotAddress) {
      throw new Error("Deposit slot address is required");
    }
    const [lenderAddress] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::lender_address`,
        functionArguments: [depositSlotAddress],
      },
    });
    return String(lenderAddress);
  };

  const loanPositionAddress = async (
    depositSlotAddress: string
  ): Promise<string> => {
    if (!depositSlotAddress) {
      throw new Error("Deposit slot address is required");
    }
    const [loanPositionAddress] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::loan_position_address`,
        functionArguments: [depositSlotAddress],
      },
    });
    return String(loanPositionAddress);
  };

  const timestampCreated = async (
    depositSlotAddress: string
  ): Promise<string> => {
    if (!depositSlotAddress) {
      throw new Error("Deposit slot address is required");
    }
    const [timestampCreated] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::timestamp_created`,
        functionArguments: [depositSlotAddress],
      },
    });
    return String(timestampCreated);
  };

  const totalDeposits = async (): Promise<string> => {
    const [totalDeposits] = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::deposit_slot::total_deposits`,
      },
    });
    return String(totalDeposits);
  };

  return {
    originalPrincipal,
    share,
    accumulatedDeposits,
    activeDeposits,
    feeGrowthDebtA,
    feeGrowthDebtB,
    getDepositSlotInfo,
    isActive,
    lastDepositTimestamp,
    lastWithdrawTimestamp,
    lenderAddress,
    loanPositionAddress,
    timestampCreated,
    totalDeposits,
  };
};
