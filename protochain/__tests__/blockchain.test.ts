import { describe, expect, test, jest } from "@jest/globals";
import Blockchain from "../src/lib/blockchain";
import Block from "../src/lib/block";
import Transaction from "../src/lib/transaction";
import TransationType from "../src/lib/transactionType";
import BlockInfo from "../src/lib/blockInfo";

//com essa linha, estamos falando qual a classe que queremos mocar
//o jest deve ter uma pasta __mocks__ com arquivo de mesmo nome da classe a ser mocada
//em todos os lugares onde fizer referencia da classe original, o jest vai substituir pela classe Mock (Block nesse caso)
jest.mock("../src/lib/block");
jest.mock("../src/lib/transaction");

describe("Blockchain Tests", () => {
  test("Should contains the Genesis Block", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks).toHaveLength(1);
  });
  test("Should has the Data Genesis", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks[0].transactions[0].data).toEqual("Genesis Block");
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
    const tx = new Transaction({ data: "test" } as Transaction);
    blockchain.mempool.push(tx);
    const lastBlock: Block = blockchain.getLastBlock();
    const block1 = new Block({
      index: lastBlock.index + 1,
      previousHash: lastBlock.hash,
      transactions: [tx],
    } as Block);
    const result = blockchain.addBlock(block1);
    expect(result.success).toEqual(true);
    expect(blockchain.getLastBlock()).toEqual(block1);
  });
  test("Should NOT add a new Block in the Chain", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({ data: "test" } as Transaction);
    blockchain.mempool.push(tx);
    const lastBlock: Block = blockchain.getLastBlock();
    const block1 = new Block({
      index: lastBlock.index + 1,
      previousHash: lastBlock.hash,
      transactions: [tx],
    } as Block);
    block1.index = -1;
    const result = blockchain.addBlock(block1);
    expect(result.success).toEqual(false);
  });
  test("Should NOT add a new Block in the Chain (different tx in mempool)", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({ data: "test" } as Transaction);
    blockchain.mempool.push(tx);
    const lastBlock: Block = blockchain.getLastBlock();
    const block1 = new Block({
      index: lastBlock.index + 1,
      previousHash: lastBlock.hash,
      transactions: [tx, tx],
    } as Block);
    const result = blockchain.addBlock(block1);
    expect(result.success).toEqual(false);
  });
  test("Should validate TRUE the entire blockchain", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({ data: "test" } as Transaction);
    blockchain.mempool.push(tx);
    const lastBlock: Block = blockchain.getLastBlock();
    const block1 = new Block({
      index: lastBlock.index + 1,
      previousHash: lastBlock.hash,
      transactions: [tx],
    } as Block);
    const result = blockchain.addBlock(block1);
    expect(result.success).toEqual(true);
    expect(blockchain.getLastBlock()).toEqual(block1);
    expect(blockchain.isValid().success).toEqual(true);
  });
  test("Should validate FALSE the entire blockchain", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({ data: "test" } as Transaction);
    blockchain.mempool.push(tx);
    const lastBlock: Block = blockchain.getLastBlock();
    const block1 = new Block({
      index: lastBlock.index + 1,
      previousHash: lastBlock.hash,
      transactions: [tx],
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

  test("Should get next block info", () => {
    const blockchain = new Blockchain();
    blockchain.mempool.push(new Transaction());
    const info = blockchain.getNextBlock();
    expect(info ? info.transactions.length : 0).toEqual(1);
  });
  test("Should NOT get next block info", () => {
    const blockchain = new Blockchain();
    const info = blockchain.getNextBlock();
    expect(info).toBeNull();
  });
  test("Should get transaction from mempool", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({ data: "test", hash: "123abc" } as Transaction);
    blockchain.mempool.push(tx);
    const foundTransaction = blockchain.getTransaction("123abc");
    expect(foundTransaction.mempoolIndex).toEqual(0);
    expect(foundTransaction.transaction.hash).toEqual("123abc");
  });

  test("Should get transaction from block", () => {
    const blockchain = new Blockchain();
    const foundTransaction = blockchain.getTransaction(
      blockchain.blocks[0].transactions[0].hash
    );
    expect(foundTransaction.blockIndex).toEqual(0);
    expect(foundTransaction.transaction.data).toEqual("Genesis Block");
  });

  test("Should NOT get transaction from mempool or block", () => {
    const blockchain = new Blockchain();
    const foundTransaction = blockchain.getTransaction("testing");
    expect(foundTransaction.blockIndex).toEqual(-1);
    expect(foundTransaction.mempoolIndex).toEqual(-1);
  });
  test("Should add a transaction in blockchain mempool", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({
      data: "test",
      hash: "abctest",
    } as Transaction);
    const validation = blockchain.addTransaction(tx);
    expect(validation.success).toEqual(true);
  });
  test("Should NOT add a transaction (invalid tx)", () => {
    const blockchain = new Blockchain();
    const tx = new Transaction({ hash: "123" } as Transaction);
    const validation = blockchain.addTransaction(tx);
    expect(validation.success).toEqual(false);
  });
  test("Should NOT add a transaction (duplicated tx in mempool)", () => {
    const blockchain = new Blockchain();
    const tx1 = new Transaction({ data: "test", hash: "123" } as Transaction);
    const tx2 = new Transaction({ data: "test", hash: "123" } as Transaction);
    let validation = blockchain.addTransaction(tx1);
    expect(validation.success).toEqual(true);
    validation = blockchain.addTransaction(tx2);
    expect(validation.success).toEqual(false);
  });
  test("Should NOT add a transaction (duplicated tx in block txs)", () => {
    const blockchain = new Blockchain();
    const tx1 = new Transaction({ data: "test", hash: "123" } as Transaction);
    const tx2 = new Transaction({ data: "test", hash: "123" } as Transaction);
    let validation = blockchain.addTransaction(tx1);
    expect(validation.success).toEqual(true);
    const nextBlockInfo = blockchain.getNextBlock();
    const block = Block.fromBlockInfo(nextBlockInfo as BlockInfo);
    validation = blockchain.addBlock(block);
    expect(validation.success).toEqual(true);
    validation = blockchain.addTransaction(tx2);
    expect(validation.success).toEqual(false);
  });
});
