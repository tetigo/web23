import sha256 from "crypto-js/sha256";
import TransationType from "../transactionType";
import Validation from "../validation";

/**
 * Transaction class
 */
export default class Transaction {
  type: TransationType;
  timestamp: number;
  hash: string;
  data: string;

  constructor(tx?: Transaction) {
    this.type = tx?.type || TransationType.REGULAR;
    this.timestamp = tx?.timestamp || Date.now();
    this.data = tx?.data || "";
    this.hash = tx?.hash || this.getHash();
  }

  getHash(): string {
    return "abc";
  }

  isValid(): Validation {
    if (!this.data)
      return new Validation(false, "Invalid mock transaction data");

    return new Validation();
  }
}
