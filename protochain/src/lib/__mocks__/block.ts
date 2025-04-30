import BlockInfo from "../blockInfo";
import Transaction from "../transaction";
import Validation from "../validation";

/**
 * Mocked Block class
 */
export default class Block {
  index: number;
  timestamp: number;
  hash: string;
  previousHash: string;
  transactions: Transaction[];

  /**
   * Creates a new mock block
   * @param block The mock block data
   */
  constructor(block?: Block) {
    this.index = block?.index || 0;
    this.timestamp = block?.timestamp || Date.now();
    this.previousHash = block?.previousHash || "";
    this.transactions = block?.transactions
      ? block.transactions.map((tx) => new Transaction(tx))
      : ([] as Transaction[]);
    this.hash = block?.hash || this.getHash();
  }

  getHash(): string {
    return this.hash || "abc";
  }

  /**
   * Validates the mock block
   * @returns Returns true if the mock block is valid
   */
  isValid(previousHash: string, previousIndex: number): Validation {
    if (!previousHash || previousIndex < 0 || this.index < 0)
      return new Validation(false, "Invalid mock block");

    if (previousHash !== this.previousHash)
      return new Validation(false, "Invalid mock block");

    return new Validation();
  }
  static fromBlockInfo(blockInfo: BlockInfo): Block {
    const block = new Block();
    block.index = blockInfo.index;
    block.previousHash = blockInfo.previousHash;
    block.transactions = blockInfo.transactions;
    return block;
  }
}
