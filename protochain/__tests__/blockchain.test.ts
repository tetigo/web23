import { describe, expect, test, jest } from "@jest/globals";
import Blockchain from "../src/lib/blockchain";
import Block from "../src/lib/block";

//com essa linha, estamos falando qual a classe que queremos mocar
//o jest deve ter uma pasta __mocks__ com arquivo de mesmo nome da classe a ser mocada
//em todos os lugares onde fizer referencia da classe original, o jest vai substituir pela classe Mock (Block nesse caso)
jest.mock("../src/lib/block");

describe("Blockchain Tests", () => {
  test("Should contains the Genesis Block", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks).toHaveLength(1);
  });
  test("Should has the Data Genesis", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks[0].data).toEqual("Genesis Block");
  });
  test("Should has the Index 0 for the Genesis", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks[0].index).toEqual(0);
  });
  test("Should return the last Block of the Chain", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks[0]).toEqual(blockchain.getLastBlock());
  });
  test("Should add a new Block in the Chain correctly", () => {
    const blockchain = new Blockchain();
    const lastBlock: Block = blockchain.getLastBlock();
    const block1 = new Block({
      index: lastBlock.index + 1,
      previousHash: lastBlock.hash,
      data: "test",
    } as Block);
    const result = blockchain.addBlock(block1);
    expect(result.success).toEqual(true);
    expect(blockchain.getLastBlock()).toEqual(block1);
  });
  test("Should NOT add a new Block in the Chain", () => {
    const blockchain = new Blockchain();
    const lastBlock: Block = blockchain.getLastBlock();
    const block1 = new Block({
      index: lastBlock.index + 1,
      previousHash: lastBlock.hash,
      data: "test",
    } as Block);
    block1.index = -1;
    const result = blockchain.addBlock(block1);
    expect(result.success).toEqual(false);
  });
  test("Should validate TRUE the entire blockchain", () => {
    const blockchain = new Blockchain();
    const lastBlock: Block = blockchain.getLastBlock();
    const block1 = new Block({
      index: lastBlock.index + 1,
      previousHash: lastBlock.hash,
      data: "test",
    } as Block);
    const result = blockchain.addBlock(block1);
    expect(result.success).toEqual(true);
    expect(blockchain.getLastBlock()).toEqual(block1);
    expect(blockchain.isValid().success).toEqual(true);
  });
  test("Should validate FALSE the entire blockchain", () => {
    const blockchain = new Blockchain();
    const lastBlock: Block = blockchain.getLastBlock();
    const block1 = new Block({
      index: lastBlock.index + 1,
      previousHash: lastBlock.hash,
      data: "test",
    } as Block);
    blockchain.addBlock(block1);
    blockchain.blocks[blockchain.getLastBlock().index - 1].index = -1;
    expect(blockchain.isValid().success).toEqual(false);
  });
  test("Should get a block by Index", () => {
    const blockchain = new Blockchain();
    const block1: Block | undefined = blockchain.getBlock("0");
    expect(block1).toBeDefined();
    expect(block1?.index).toEqual(0);
  });
  test("Should get a block by Hash", () => {
    const blockchain = new Blockchain();
    const block0 = blockchain.getLastBlock();
    const block1: Block | undefined = blockchain.getBlock(block0.getHash());
    expect(block1).toBeDefined();
    expect(block1?.index).toEqual(block0.index);
    expect(block1?.hash).toEqual(block0.hash);
  });
  test("Should NOT get a block that does not exists", () => {
    const blockchain = new Blockchain();
    const block1: Block | undefined = blockchain.getBlock("7");
    expect(block1).not.toBeDefined();
  });
});
