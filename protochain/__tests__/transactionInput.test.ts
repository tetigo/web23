import { beforeAll, describe, expect, test } from "@jest/globals";
import TransactionInput from "../src/lib/transactionInput";
import Wallet from "../src/lib/wallet";

describe("TransactionInput Tests", () => {
  let alice: Wallet;
  let bob: Wallet;

  beforeAll(() => {
    alice = new Wallet();
    bob = new Wallet();
  });

  test("Should be valid", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
    } as TransactionInput);

    txInput.sign(alice.privateKey);

    const valid = txInput.isValid();

    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (defaults)", () => {
    const txInput = new TransactionInput();

    txInput.sign(alice.privateKey);

    const valid = txInput.isValid();

    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (empty signature)", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
    } as TransactionInput);

    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });
  test("Should NOT be valid (negative amount)", () => {
    const txInput = new TransactionInput({
      amount: -10,
      fromAddress: alice.publicKey,
    } as TransactionInput);

    txInput.sign(alice.privateKey);
    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });
  test("Should NOT be valid (invalid signature)", () => {
    const txInput = new TransactionInput({
      amount: -10,
      fromAddress: alice.publicKey,
    } as TransactionInput);

    txInput.sign(bob.privateKey);
    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });
  test("Should NOT be valid (invalid hash)", () => {
    const txInput = new TransactionInput({
      amount: 10,
      fromAddress: alice.publicKey,
    } as TransactionInput);

    txInput.sign(alice.privateKey);
    txInput.amount = 100;
    const valid = txInput.isValid();
    expect(valid.success).toBeFalsy();
  });
});
