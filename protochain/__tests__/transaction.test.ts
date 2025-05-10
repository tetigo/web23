import { describe, expect, jest, test } from "@jest/globals";
import Transaction from "../src/lib/transaction";
import TransationType from "../src/lib/transactionType";
import TransactionInput from "../src/lib/transactionInput";

jest.mock("../src/lib/transactionInput");

describe("Transactions Tests", () => {
  test("Should be valid (REGULAR default)", () => {
    const tx = new Transaction({
      txInput: new TransactionInput(),
      to: "carteiraTO",
    } as Transaction);
    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Should be valid (not default transaction input)", () => {
    const tx = new Transaction({
      to: "test123",
      txInput: new TransactionInput({ amount: 100 } as TransactionInput),
    } as Transaction);
    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (REGULAR default)", () => {
    const tx = new Transaction({
      txInput: new TransactionInput(),
      to: "carteiraTO",
      type: TransationType.REGULAR,
      timestamp: Date.now(),
      hash: "abc",
    } as Transaction);
    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should be valid (FEE)", () => {
    const tx = new Transaction({
      to: "carteiraTO",
      type: TransationType.FEE,
    } as Transaction);
    tx.txInput = undefined;
    tx.hash = tx.getHash();
    const valid = tx.isValid();
    expect(valid.success).toBeTruthy();
  });

  test("Should NOT be valid (invalid to)", () => {
    const tx = new Transaction();
    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });

  test("Should NOT be valid (invalid txInput)", () => {
    const tx = new Transaction({
      to: "carteiraTO",
      txInput: new TransactionInput({
        amount: -10,
        fromAddress: "carteiraFROM",
        signature: "abc",
      } as TransactionInput),
    } as Transaction);
    const valid = tx.isValid();
    expect(valid.success).toBeFalsy();
  });
});
