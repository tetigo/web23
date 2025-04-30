import { describe, expect, test } from "@jest/globals";
import Transaction from "../src/lib/transaction";
import TransationType from "../src/lib/transactionType";

describe("Transactions Tests", () => {
  test("should validate - contains default values", () => {
    const transaction = new Transaction();
    expect(transaction.type).toEqual(TransationType.REGULAR);
  });
  test("should be valid - contains default specified values", () => {
    const transaction = new Transaction({
      data: "tx 1",
      type: TransationType.FEE,
    } as Transaction);
    expect(transaction.type).toEqual(TransationType.FEE);
    expect(transaction.data).toEqual("tx 1");
  });
  test("should be valid - contains default specified data value", () => {
    const transaction = new Transaction({
      data: "tx 1",
      type: TransationType.FEE,
    } as Transaction);
    const valid = transaction.isValid();
    expect(valid.success).toEqual(true);
  });
  test("should NOT be valid - contains wrong data", () => {
    const transaction = new Transaction({ data: "test" } as Transaction);
    transaction.data = "";
    transaction.hash = transaction.getHash();
    const validation = transaction.isValid();
    expect(validation.success).toEqual(false);
  });
  test("should NOT validate - invalid hash", () => {
    const transaction = new Transaction({ data: "test" } as Transaction);
    transaction.data = "abc";
    const validation = transaction.isValid();
    expect(validation.success).toEqual(false);
  });
});
