import Block from "./block";
import BlockInfo from "./blockInfo";
import Transaction from "./transaction";
import TransactionInput from "./transactionInput";
import TransactionSearch from "./transactionSearch";
import TransationType from "./transactionType";
import Validation from "./validation";

/**
 * Blockchain class
 */
export default class Blockchain {
  blocks: Block[] = [];
  mempool: Transaction[];
  nextIndex: number = 0;
  static readonly DIFFICULTY_FACTOR = 5;
  static readonly TX_PER_BLOCK = 2;
  static readonly MAX_DIFFICULTY = 62;

  /**
   *  Creates a new blockchain
   */
  constructor() {
    this.mempool = [];
    this.blocks = [
      new Block({
        index: this.nextIndex,
        previousHash: "",
        transactions: [
          new Transaction({
            type: TransationType.FEE,
            txInput: new TransactionInput(),
          } as Transaction),
        ],
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

  getTransaction(hash: string): TransactionSearch {
    const mempoolIndex = this.mempool.findIndex((tx) => tx.hash === hash);
    if (mempoolIndex !== -1)
      return {
        mempoolIndex,
        transaction: this.mempool[mempoolIndex],
      } as TransactionSearch;
    const blockIndex = this.blocks.findIndex((b) =>
      b.transactions.some((tx) => tx.hash === hash)
    );
    if (blockIndex !== -1)
      return {
        blockIndex,
        transaction: this.blocks[blockIndex].transactions.find(
          (tx) => tx.hash === hash
        ),
      } as TransactionSearch;
    return {
      blockIndex: -1,
      mempoolIndex: -1,
    } as TransactionSearch;
  }

  getDifficulty(): number {
    return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR) + 1;
  }

  addTransaction(transaction: Transaction): Validation {
    if (transaction.txInput) {
      const from = transaction.txInput.fromAddress;
      const pendingTx = this.mempool
        .map((tx) => tx.txInput)
        .filter((txi) => txi!.fromAddress === from);
      if (pendingTx && pendingTx.length > 0)
        return new Validation(false, "This wallet has a pending transaction");

      //TODO: validar a origem dos fundos
    }

    const validation = transaction.isValid();
    if (!validation.success) {
      return new Validation(false, "Invalid tx: " + validation.message);
    }
    if (
      this.blocks.some((b) =>
        b.transactions.some((tx) => tx.hash === transaction.hash)
      )
    ) {
      return new Validation(false, "Duplicated tx in blockchain");
    }

    this.mempool.push(transaction);
    return new Validation(true, transaction.hash);
  }

  addBlock(block: Block): Validation {
    const lastBlock: Block = this.getLastBlock();
    const validation = block.isValid(
      lastBlock.hash,
      lastBlock.index,
      this.getDifficulty()
    );
    if (!validation.success)
      return new Validation(false, `Invalid Block: ${validation.message}`);

    const txs = block.transactions
      .filter((tx) => tx.type !== TransationType.FEE)
      .map((tx) => tx.hash);
    const newMempool = this.mempool.filter((tx) => !txs.includes(tx.hash));

    if (newMempool.length + txs.length !== this.mempool.length) {
      return new Validation(false, "Invalid tx in block: mempool");
    }
    this.mempool = newMempool;
    this.blocks.push(block);
    this.nextIndex++;

    return new Validation(true, block.hash);
  }

  isValid(): Validation {
    for (let i = this.blocks.length - 1; i > 0; i--) {
      const currentBlock = this.blocks[i];
      const previousBlock = this.blocks[i - 1];
      const validation = currentBlock.isValid(
        previousBlock.hash,
        previousBlock.index,
        this.getDifficulty()
      );
      if (!validation.success)
        return new Validation(
          false,
          `Invalid Block #${currentBlock.index}: ${validation.message}`
        );
    }
    return new Validation();
  }

  getFeePerTx(): number {
    return 1;
  }

  getNextBlock(): BlockInfo | null {
    if (!this.mempool || !this.mempool.length) {
      return null;
    }
    return {
      transactions: this.mempool.slice(0, Blockchain.TX_PER_BLOCK),
      difficulty: this.getDifficulty(),
      previousHash: this.getLastBlock().hash,
      index: this.blocks.length,
      feePerTx: this.getFeePerTx(),
      maxDifficulty: Blockchain.MAX_DIFFICULTY,
    } as BlockInfo;
  }
}
