import { CommittedTransactionResponse, TransactionResponseType, UserTransactionResponse } from "@aptos-labs/ts-sdk";

export class TransactionTypeResolver {
    static toUserTransaction(transaction: CommittedTransactionResponse): UserTransactionResponse {
        if (this.isUserTransaction(transaction)) {
            return transaction as UserTransactionResponse;
        } else {
            throw new Error("Transaction is not a UserTransaction");
        }
    }

    static isUserTransaction(transaction: CommittedTransactionResponse): boolean {
        return transaction.type === TransactionResponseType.User;
    }
}