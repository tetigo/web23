import sha256 from "crypto-js/sha256";
import Validation from "./validation";
import BlockInfo from "./blockInfo";
import Transaction from "./transaction";
import TransationType from "./transactionType";

/**
 * Block class
 */
export default class Block {
  index: number;
  timestamp: number;
  hash: string;
  previousHash: string;
  transactions: Transaction[];
  nonce: number;
  miner: string;

  /**
   * Creates a new block
   * @param block The block data
   */
  constructor(block?: Block) {
    this.index = block?.index || 0;
    this.timestamp = block?.timestamp || Date.now();
    this.previousHash = block?.previousHash || "";

    this.transactions = block?.transactions
      ? block.transactions.map((tx) => new Transaction(tx))
      : ([] as Transaction[]);

    this.nonce = block?.nonce || 0;
    this.miner = block?.miner || "";
    this.hash = block?.hash || this.getHash(); //precisa ser a ultima linha do construtor, pois inclui tudo pra gerar hash
  }

  getHash(): string {
    const txs =
      this.transactions && this.transactions.length > 0
        ? this.transactions.map((tx) => tx.hash).reduce((a, b) => a + b)
        : "";
    return sha256(
      this.index +
        txs +
        this.timestamp +
        this.previousHash +
        this.nonce +
        this.miner
    ).toString();
  }

  /**
   * Generates a new valid hash for this block with the specified difficulty
   * @param difficulty The blockchain current difficulty
   * @param miner The miner wallet address
   */
  mine(difficulty: number, miner: string) {
    this.miner = miner;
    const prefix = this.getPrefix(difficulty);
    do {
      this.nonce++;
      this.hash = this.getHash();
    } while (!this.hash.startsWith(prefix));
  }

  getPrefix(difficulty: number) {
    let prefix = "";
    for (let index = 0; index < difficulty + 1; index++) {
      prefix += "0";
    }
    return prefix;
  }

  /**
   * Validates the block
   * @param previousHash The previous block hash
   * @param previousIndex The previous block index
   * @param difficulty The blockchain current difficulty
   * @returns Returns true if the block is valid
   */
  isValid(
    previousHash: string,
    previousIndex: number,
    difficulty: number
  ): Validation {
    if (this.transactions && this.transactions.length > 0) {
      if (
        this.transactions.filter((tx) => tx.type === TransationType.FEE)
          .length > 1
      ) {
        return new Validation(
          false,
          "Invalid block due to invalid tx: Too many fees"
        );
      }
      const validations = this.transactions.map((tx) => tx.isValid());
      const errors = validations
        .filter((v) => !v.success)
        .map((e) => e.message);
      if (errors.length > 0) {
        return new Validation(
          false,
          "Invalid block due to invalid tx: " +
            errors.reduce((a, b) => `${a} ${b} `)
        );
      }
    }

    if (previousIndex !== this.index - 1)
      return new Validation(false, "Invalid Index");

    if (this.timestamp < 1) return new Validation(false, "Invalid Timestamp");

    if (this.previousHash !== previousHash)
      return new Validation(false, "Invalid Previous Hash");

    if (!this.nonce || !this.miner) return new Validation(false, "Not mined");

    const prefix = this.getPrefix(difficulty);

    if (this.hash !== this.getHash() || !this.hash.startsWith(prefix))
      return new Validation(false, "Invalid Hash");

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
