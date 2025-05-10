import Block from "../block";
import BlockInfo from "../blockInfo";
import Transaction from "../transaction";
import TransactionInput from "./transactionInput";
import TransactionSearch from "../transactionSearch";
import TransationType from "../transactionType";
import Validation from "../validation";

/**
 * Mocked Blockchain class
 */
export default class Blockchain {
  blocks: Block[] = [];
  nextIndex: number = 0;
  mempool: Transaction[];

  /**
   *  Creates a new mocked blockchain
   */
  constructor() {
    this.mempool = [];

    this.blocks = [
      new Block({
        index: 0,
        hash: "abc",
        previousHash: "",
        transactions: [
          new Transaction({
            type: TransationType.FEE,
            txInput: new TransactionInput(),
          } as Transaction),
        ],
        timestamp: Date.now(),
      } as Block),
    ];
    this.nextIndex++;
  }

  getLastBlock(): Block {
    return this.blocks[this.blocks.length - 1];
  }

  getBlock(indexOrHash: string): Block | undefined {
    if (/^[0-9]+$/.test(indexOrHash)) return this.blocks[parseInt(indexOrHash)];
    return this.blocks.find((b) => b.hash === indexOrHash);
  }
  getDifficulty(): number {
    return Math.ceil(this.blocks.length / 5);
  }

  addBlock(block: Block): Validation {
    if (block.index < 0) return new Validation(false, "Invalid mock block");
    this.blocks.push(block);
    const newMempool = this.mempool;
    this.mempool = newMempool;

    this.nextIndex++;
    return new Validation();
  }

  isValid(): Validation {
    return new Validation();
  }

  getFeePerTx(): number {
    return 1;
  }

  getNextBlock(): BlockInfo {
    return {
      index: 1,
      previousHash: this.getLastBlock().hash,
      difficulty: 1,
      maxDifficulty: 62,
      feePerTx: this.getFeePerTx(),
      transactions: [
        new Transaction({ txInput: new TransactionInput() } as Transaction),
      ],
    } as BlockInfo;
  }

  addTransaction(transaction: Transaction): Validation {
    const validation = transaction.isValid();
    if (!validation.success) return validation;

    this.mempool.push(transaction);
    return new Validation(true, transaction.hash);
  }

  getTransaction(hash: string): TransactionSearch {
    return {
      mempoolIndex: 0,
      transaction: {
        hash,
      },
    } as TransactionSearch;
  }
}
