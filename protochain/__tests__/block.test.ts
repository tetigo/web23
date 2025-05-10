import { beforeAll, describe, expect, test, jest } from "@jest/globals";
import Block from "../src/lib/block";
import BlockInfo from "../src/lib/blockInfo";
import Transaction from "../src/lib/transaction";
import TransationType from "../src/lib/transactionType";
import TransactionInput from "../src/lib/transactionInput";

jest.mock("../src/lib/transaction");
jest.mock("../src/lib/transactionInput");

describe("Block Tests", () => {
  const exampleDifficulty = 1;
  const exampleMiner = "tiago";
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block({
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
  });

  test("Should be valid", () => {
    const block = new Block({
      index: genesis.index + 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({ txInput: new TransactionInput() } as Transaction),
      ],
    } as Block);
    block.transactions.push(
      new Transaction({
        type: TransationType.FEE,
        to: exampleMiner,
      } as Transaction)
    );
    block.hash = block.getHash();
    block.mine(exampleDifficulty, exampleMiner);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    console.log(">>", valid.message);
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (no fee)", () => {
    const block = new Block({
      index: genesis.index + 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({ txInput: new TransactionInput() } as Transaction),
      ],
    } as Block);
    block.mine(exampleDifficulty, exampleMiner);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should create from BlockInfo", () => {
    const block1 = Block.fromBlockInfo({
      transactions: [
        new Transaction({ txInput: new TransactionInput() } as Transaction),
      ],
      difficulty: exampleDifficulty,
      feePerTx: 1,
      index: 1,
      maxDifficulty: 62,
      previousHash: genesis.hash,
    } as BlockInfo);
    block1.transactions.push(
      new Transaction({
        type: TransationType.FEE,
        to: exampleMiner,
      } as Transaction)
    );
    block1.hash = block1.getHash();
    block1.mine(exampleDifficulty, exampleMiner);
    const valid = block1.isValid(
      genesis.hash,
      genesis.index,
      exampleDifficulty
    );
    console.log(">>>", valid.message);
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (2 FEE)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({
          type: TransationType.FEE,
          txInput: new TransactionInput(),
        } as Transaction),
        new Transaction({
          type: TransationType.FEE,
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    block.mine(exampleDifficulty, exampleMiner);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (invalid tx)", () => {
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [new Transaction()],
    } as Block);
    block.transactions.push(
      new Transaction({
        type: TransationType.FEE,
        to: exampleMiner,
      } as Transaction)
    );
    block.hash = block.getHash();
    block.mine(exampleDifficulty, exampleMiner);
    block.transactions[0].to = "";
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (fallbacks)", () => {
    const block = new Block();
    block.transactions.push(
      new Transaction({
        type: TransationType.FEE,
        to: exampleMiner,
      } as Transaction)
    );
    block.hash = block.getHash();

    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (previous hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: "abc",
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    block.transactions.push(
      new Transaction({
        type: TransationType.FEE,
        to: exampleMiner,
      } as Transaction)
    );
    block.hash = block.getHash();
    block.mine(exampleDifficulty, exampleMiner);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (timestamp)", () => {
    const block = new Block({
      index: 1,
      previousHash: "abc",
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    block.timestamp = -1;
    block.transactions.push(
      new Transaction({
        type: TransationType.FEE,
        to: exampleMiner,
      } as Transaction)
    );
    block.hash = block.getHash();
    block.mine(exampleDifficulty, exampleMiner);
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (empty hash)", () => {
    const block = new Block({
      index: 1,
      previousHash: "abc",
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    block.transactions.push(
      new Transaction({
        type: TransationType.FEE,
        to: exampleMiner,
      } as Transaction)
    );
    block.hash = block.getHash();

    block.mine(exampleDifficulty, exampleMiner);
    block.hash = "";
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (not mined)", () => {
    const block = new Block({
      index: 1,
      previousHash: "abc",
      transactions: [
        new Transaction({
          txInput: new TransactionInput(),
        } as Transaction),
      ],
    } as Block);
    block.transactions.push(
      new Transaction({
        type: TransationType.FEE,
        to: exampleMiner,
      } as Transaction)
    );
    block.hash = block.getHash();
    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (txInput)", () => {
    const txInput = new TransactionInput();
    txInput.amount = -1;
    const block = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [new Transaction({ txInput } as Transaction)],
    } as Block);
    block.transactions.push(
      new Transaction({
        type: TransationType.FEE,
        to: exampleMiner,
      } as Transaction)
    );
    block.hash = block.getHash();
    block.mine(exampleDifficulty, exampleMiner);

    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (invalid index)", () => {
    const block = new Block({
      index: -1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({ txInput: new TransactionInput() } as Transaction),
      ],
    } as Block);
    block.transactions.push(
      new Transaction({
        type: TransationType.FEE,
        to: exampleMiner,
      } as Transaction)
    );
    block.hash = block.getHash();
    block.mine(exampleDifficulty, exampleMiner);

    const valid = block.isValid(genesis.hash, genesis.index, exampleDifficulty);
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (empty hash)", () => {
    const block1 = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({ txInput: new TransactionInput() } as Transaction),
      ],
    } as Block);
    block1.transactions.push(
      new Transaction({
        type: TransationType.FEE,
        to: exampleMiner,
      } as Transaction)
    );
    block1.hash = block1.getHash();

    block1.mine(exampleDifficulty, exampleMiner);
    block1.hash = "";
    const valid = block1.isValid(
      genesis.hash,
      genesis.index,
      exampleDifficulty
    );
    expect(valid.success).toEqual(false);
  });
  test("Should NOT be valid (not mined)", () => {
    const block1 = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({ txInput: new TransactionInput() } as Transaction),
      ],
    } as Block);
    block1.transactions.push(
      new Transaction({
        type: TransationType.FEE,
        to: exampleMiner,
      } as Transaction)
    );
    block1.hash = block1.getHash();

    block1.hash = "";
    const valid = block1.isValid(
      genesis.hash,
      genesis.index,
      exampleDifficulty
    );
    expect(valid.success).toEqual(false);
  });
  test("Should NOT be valid (not mined nonce)", () => {
    const block1 = new Block({
      index: 1,
      previousHash: genesis.hash,
      transactions: [
        new Transaction({ txInput: new TransactionInput() } as Transaction),
      ],
    } as Block);
    block1.transactions.push(
      new Transaction({
        type: TransationType.FEE,
        to: exampleMiner,
      } as Transaction)
    );
    block1.hash = block1.getHash();
    // block1.mine(exampleDifficulty, exampleMiner);
    block1.nonce = 0;
    block1.miner = "tiago";
    const valid = block1.isValid(
      genesis.hash,
      genesis.index,
      exampleDifficulty
    );
    console.log("<<<", valid.message);
    expect(valid.success).toEqual(false);
  });
});
