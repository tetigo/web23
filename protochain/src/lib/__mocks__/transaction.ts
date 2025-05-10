import TransationType from "../transactionType";
import Validation from "../validation";
import TransactionInput from "../transactionInput";

/**
 * Transaction class
 */
export default class Transaction {
  type: TransationType;
  timestamp: number;
  hash: string;
  to: string;
  txInput: TransactionInput | undefined;

  constructor(tx?: Transaction) {
    this.type = tx?.type || TransationType.REGULAR;
    this.timestamp = tx?.timestamp || Date.now();
    this.to = tx?.to || "carteiraTO";
    if (tx && tx.txInput) this.txInput = new TransactionInput(tx.txInput);
    else this.txInput = new TransactionInput();
    this.hash = tx?.hash || this.getHash();
  }

  getHash(): string {
    return "abc";
  }

  isValid(): Validation {
    if (!this.to) return new Validation(false, "Invalid mock transaction to");

    if (!this.txInput?.isValid().success)
      return new Validation(false, "Invalid mock transaction txInput");

    return new Validation();
  }
}
