import { useViewDepositSlot } from "./useViewDepositSlot";
import { useViewLoanSlot } from "./useViewLoanSlot";

type ViewAccountInfo = {
    depositSlots: unknown;
    loanSlots: unknown;
}

export interface UseViewAccount {
    /**
     * Get combined deposit and loan slot information for a specific account address.
     * @param accountAddress - The address of the account.
     * @returns An object containing the combined deposit and loan slot information.
     */
    getInfo: (accountAddress: string) => Promise<ViewAccountInfo>;
}

export const useViewAccount = (): UseViewAccount => {
    const { getDepositSlots } = useViewDepositSlot();
    const { getLoanSlots } = useViewLoanSlot();

    const getInfo = async (accountAddress: string): Promise<ViewAccountInfo> => {
        if (!accountAddress) {
            throw new Error("Account address is required");
        }
        const [data] = await getDepositSlots({ accountAddress }) || [];
        const [loanData] = await getLoanSlots({ accountAddress }) || [];
        console.log("Deposit Slots Data:", data);
        console.log("Loan Slots Data:", loanData);

        return {
            depositSlots: data || {},
            loanSlots: loanData || {},
        };
    }

    return {
        getInfo,
    };
}