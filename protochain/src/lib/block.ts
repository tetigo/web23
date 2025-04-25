import sha256 from "crypto-js/sha256";
import Validation from "./validation";

/**
 * Block class
 */
export default class Block {
  index: number;
  timestamp: number;
  hash: string;
  previousHash: string;
  data: string;

  /**
   * Creates a new block
   * @param block The block data
   */
  // constructor(index: number, previousHash: string, data: string){
  constructor(block?: Block) {
    this.index = block?.index || 0;
    this.timestamp = block?.timestamp || Date.now();
    this.previousHash = block?.previousHash || "";
    this.data = block?.data || "";
    this.hash = block?.hash || this.getHash();
  }

  getHash(): string {
    return sha256(
      this.index + this.data + this.timestamp + this.previousHash
    ).toString();
  }

  /**
   * Validates the block
   * @returns Returns true if the block is valid
   */
  isValid(previousHash: string, previousIndex: number): Validation {
    if (previousIndex !== this.index - 1)
      return new Validation(false, "Invalid Index");
    if (this.hash !== this.getHash())
      return new Validation(false, "Invalid Hash");
    if (!this.data) return new Validation(false, "Invalid Data");
    if (this.timestamp < 1) return new Validation(false, "Invalid Timestamp");
    if (this.previousHash !== previousHash)
      return new Validation(false, "Invalid Previous Hash");
    return new Validation();
  }
}
