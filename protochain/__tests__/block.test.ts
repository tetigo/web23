import { beforeAll, describe, expect, test } from "@jest/globals";
import Block from "../src/lib/block";

describe("Block Tests", () => {
  let genesis: Block;

  beforeAll(() => {
    genesis = new Block({
      index: 0,
      previousHash: "",
      data: "Genesis Block",
    } as Block);
  });

  test("Should be valid first block (Genensis Block)", () => {
    expect(genesis.data).toEqual("Genesis Block");
  });
  test("Should be valid (New Block after Genesis)", () => {
    const block1 = new Block({
      index: genesis.index + 1,
      previousHash: genesis.hash,
      data: "abc",
    } as Block);
    const valid = block1.isValid(genesis.hash, genesis.index);
    expect(valid.success).toEqual(true);
  });
  test("Should be valid (New Block2 after Block1 and Genesis)", () => {
    const block1 = new Block({
      index: genesis.index + 1,
      previousHash: genesis.hash,
      data: "abc",
    } as Block);
    const block2 = new Block({
      index: block1.index + 1,
      previousHash: block1.hash,
      data: "def",
    } as Block);
    const valid = block2.isValid(block1.hash, block1.index);
    expect(valid.success).toEqual(true);
  });
  test("Should be valid first block (No Previous Block)", () => {
    expect(genesis.previousHash).toEqual("");
  });
  test("Should be valid first block (Index)", () => {
    expect(genesis.index).toEqual(0);
  });
  test("Should be valid first block (Fallbacks)", () => {
    const block1 = new Block();
    const valid = block1.isValid(genesis.hash, genesis.index);
    expect(valid.success).toBeFalsy();
  });
  test("Should NOT be valid (previous hash)", () => {
    const block1 = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "abc",
    } as Block);
    block1.previousHash = "wrong previous hash";
    block1.hash = block1.getHash();
    const valid = block1.isValid(genesis.hash, genesis.index);
    expect(valid.success).toEqual(false);
  });
  test("Should NOT be valid (index)", () => {
    const block1 = new Block({
      index: -1,
      previousHash: genesis.hash,
      data: "abc",
    } as Block);
    const valid = block1.isValid(genesis.hash, genesis.index);
    expect(valid.success).toEqual(false);
  });
  test("Should NOT be valid (hash)", () => {
    const block1 = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "abc",
    } as Block);
    block1.hash = "";
    const valid = block1.isValid(genesis.hash, genesis.index);
    expect(valid.success).toEqual(false);
  });
  test("Should NOT be valid (timestamp)", () => {
    const block1 = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "abc",
    } as Block);
    block1.timestamp = -1;
    block1.hash = block1.getHash();
    const valid = block1.isValid(genesis.hash, genesis.index);
    expect(valid.success).toEqual(false);
  });
  test("Should NOT be valid (data)", () => {
    const block1 = new Block({
      index: 1,
      previousHash: genesis.hash,
      data: "abc",
    } as Block);
    block1.data = "";
    block1.hash = block1.getHash();
    const valid = block1.isValid(genesis.hash, genesis.index);
    expect(valid.success).toEqual(false);
  });
});
