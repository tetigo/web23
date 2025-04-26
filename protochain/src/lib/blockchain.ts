import Block from "./block";
import BlockInfo from "./blockInfo";
import Validation from "./validation";

/**
 * Blockchain class
 */
export default class Blockchain {
  blocks: Block[] = [];
  nextIndex: number = 0;
  static readonly DIFFICULTY_FACTOR = 5;
  static readonly MAX_DIFFICULTY = 62;

  /**
   *  Creates a new blockchain
   */
  constructor() {
    this.blocks = [
      new Block({
        index: this.nextIndex,
        previousHash: "",
        data: "Genesis Block",
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
    return Math.ceil(this.blocks.length / Blockchain.DIFFICULTY_FACTOR);
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
    this.blocks.push(block);
    this.nextIndex++;
    return new Validation();
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

  getNextBlock(): BlockInfo {
    return {
      data: new Date().toString(),
      difficulty: this.getDifficulty(),
      previousHash: this.getLastBlock().hash,
      index: this.blocks.length,
      feePerTx: this.getFeePerTx(),
      maxDifficulty: Blockchain.MAX_DIFFICULTY,
    } as BlockInfo;
  }
}
