import { describe, expect, test, jest } from "@jest/globals";
import Blockchain from "../src/lib/blockchain";
import Block from "../src/lib/block";
import Transaction from "../src/lib/transaction";
import TransactionInput from "../src/lib/transactionInput";

//com essa linha, estamos falando qual a classe que queremos mocar
//o jest deve ter uma pasta __mocks__ com arquivo de mesmo nome da classe a ser mocada
//em todos os lugares onde fizer referencia da classe original, o jest vai substituir pela classe Mock (Block nesse caso)
jest.mock("../src/lib/block");
jest.mock("../src/lib/transaction");
jest.mock("../src/lib/transactionInput");

describe("Blockchain Tests", () => {
  test("Should contains the Genesis Block", () => {
    const blockchain = new Blockchain();
    expect(blockchain.blocks).toHaveLength(1);
  });

  test("Should be valid (genesis)", () => {
    const blockchain = new Blockchain();
    expect(blockchain.isValid().success).toEqual(true);
  });

  test("Should be valid (two blocks)", () => {
    const blockchain = new Blockchain();
    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [
          new Transaction({
            txInput: new TransactionInput(),
          } as Transaction),
        ],
      } as Block)
    );
    expect(blockchain.isValid().success).toEqual(true);
  });

  test("Should NOT be valid", () => {
    const blockchain = new Blockchain();

    const tx = new Transaction({
      txInput: new TransactionInput(),
    } as Transaction);
    blockchain.mempool.push(tx);

    blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [tx],
      } as Block)
    );
    blockchain.blocks[1].index = -1;
    expect(blockchain.isValid().success).toEqual(false);
  });

  test("Should add transaction", () => {
    const blockchain = new Blockchain();

    const tx = new Transaction({
      txInput: new TransactionInput(),
      hash: "xyz",
    } as Transaction);
    const validation = blockchain.addTransaction(tx);
    expect(validation.success).toEqual(true);
  });

  test("Should NOT add transaction (pending tx for this wallet in mempool)", () => {
    const blockchain = new Blockchain();

    const tx = new Transaction({
      txInput: new TransactionInput(),
      hash: "xyz",
    } as Transaction);

    blockchain.addTransaction(tx);

    const tx2 = new Transaction({
      txInput: new TransactionInput(),
      hash: "xyz2",
    } as Transaction);

    const validation = blockchain.addTransaction(tx2);

    expect(validation.success).toBeFalsy();
  });

  test("Should NOT add transaction (invalid tx)", () => {
    const blockchain = new Blockchain();
    const txInput = new TransactionInput();
    txInput.amount = -10;

    const tx = new Transaction({
      txInput,
      hash: "xyz",
    } as Transaction);
    const validation = blockchain.addTransaction(tx);
    expect(validation.success).toEqual(false);
  });

  test("Should NOT add transaction (duplicated in blockchain)", () => {
    const blockchain = new Blockchain();

    const tx = new Transaction({
      txInput: new TransactionInput(),
      hash: "xyz",
    } as Transaction);

    blockchain.blocks.push(
      new Block({
        transactions: [tx],
      } as Block)
    );

    const validation = blockchain.addTransaction(tx);
    expect(validation.success).toEqual(false);
  });

  test("Should get transaction (mempool)", () => {
    const blockchain = new Blockchain();

    const tx = new Transaction({
      txInput: new TransactionInput(),
      hash: "abc",
    } as Transaction);

    blockchain.mempool.push(tx);

    const result = blockchain.getTransaction("abc");
    expect(result.mempoolIndex).toEqual(0);
  });

  test("Should get transaction (blockchain)", () => {
    const blockchain = new Blockchain();

    const tx = new Transaction({
      txInput: new TransactionInput(),
      hash: "xyz",
    } as Transaction);

    blockchain.blocks.push(
      new Block({
        transactions: [tx],
      } as Block)
    );

    const result = blockchain.getTransaction("xyz");
    expect(result.blockIndex).toEqual(1);
  });

  test("Should NOT get transaction", () => {
    const blockchain = new Blockchain();
    const result = blockchain.getTransaction("xyz");

    expect(result.blockIndex).toEqual(-1);
    expect(result.mempoolIndex).toEqual(-1);
  });

  test("Should add block", () => {
    const blockchain = new Blockchain();

    const tx = new Transaction({
      txInput: new TransactionInput(),
      hash: "xyz",
    } as Transaction);

    blockchain.mempool.push(tx);

    const result = blockchain.addBlock(
      new Block({
        index: 1,
        previousHash: blockchain.blocks[0].hash,
        transactions: [tx],
      } as Block)
    );
    expect(result.success).toEqual(true);
  });

  test("Should get block", () => {
    const blockchain = new Blockchain();
    const block = blockchain.getBlock(blockchain.blocks[0].hash);

    expect(block).toBeTruthy();
  });

  test("Should NOT add block", () => {
    const blockchain = new Blockchain();
    const block = new Block({
      index: -1,
      previousHash: blockchain.blocks[0].hash,
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);

    const result = blockchain.addBlock(block);
    expect(result.success).toEqual(false);
  });

  test("Should get next block info", () => {
    const blockchain = new Blockchain();
    blockchain.mempool.push(new Transaction());

    const info = blockchain.getNextBlock();
    expect(info ? info.index : 0).toEqual(1);
  });

  test("Should NOT get next block info", () => {
    const blockchain = new Blockchain();
    const info = blockchain.getNextBlock();
    expect(info).toBeNull();
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
});
