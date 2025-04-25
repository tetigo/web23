import Block from "../block";
import Validation from "../validation";

/**
 * Mocked Blockchain class
 */
export default class Blockchain {
  blocks: Block[] = [];
  nextIndex: number = 0;

  /**
   *  Creates a new mocked blockchain
   */
  constructor() {
    this.blocks = [
      new Block({
        index: 0,
        hash: "abc",
        previousHash: "",
        data: "Genesis Block",
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

  addBlock(block: Block): Validation {
    if (block.index < 0) return new Validation(false, "Invalid mock block");
    this.blocks.push(block);
    this.nextIndex++;
    return new Validation();
  }

  isValid(): Validation {
    return new Validation();
  }
}
