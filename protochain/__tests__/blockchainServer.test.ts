import { describe, expect, test, jest } from "@jest/globals";
import request from "supertest";
import { app } from "../src/server/blockchainServer";
import Block from "../src/lib/block";
import Transaction from "../src/lib/transaction";
import TransactionInput from "../src/lib/transactionInput";

jest.mock("../src/lib/block");
jest.mock("../src/lib/blockchain");
jest.mock("../src/lib/transaction");
jest.mock("../src/lib/transactionInput");

describe("BlockchainServer Tests", () => {
  test("GET /status - Should return status", async () => {
    const response = await request(app).get("/status");
    expect(response.status).toEqual(200);
    expect(response.body.isValid.success).toEqual(true);
    expect(response.body.blocks).toEqual(1);
  });
  test("GET /blocks/:index - Should get Genesis Block", async () => {
    const response = await request(app).get("/blocks/0");
    expect(response.status).toEqual(200);
    expect(response.body.block.index).toEqual(0);
  });
  test("GET /blocks/next - Should get Next Block Info", async () => {
    const response = await request(app).get("/blocks/next");
    expect(response.status).toEqual(200);
    expect(response.body.index).toEqual(1);
  });
  test("GET /blocks/:index - Should NOT get Genesis Block", async () => {
    const response = await request(app).get("/blocks/-1");
    expect(response.status).toEqual(404);
  });
  test("GET /blocks/:hash - Should get Genesis Block", async () => {
    const response = await request(app).get("/blocks/abc");
    expect(response.status).toEqual(200);
    expect(response.body.block.index).toEqual(0);
    expect(response.body.block.hash).toEqual("abc");
  });
  test("POST /blocks - Should add new Block in Blockchain", async () => {
    const block = new Block({
      index: 1,
      previousHash: "",
      transactions: [
        new Transaction({ txInput: new TransactionInput() } as Transaction),
      ],
      hash: "abc",
    } as Block);
    const response = await request(app).post("/blocks").send(block);
    expect(response.status).toEqual(201);
    expect(response.body.index).toEqual(1);
    expect(response.body.hash).toEqual("abc");
  });
  test("POST /blocks - Should NOT add new Block in Blockchain (invalid)", async () => {
    const response = await request(app).post("/blocks").send({
      index: -1,
      previousHash:
        "fbca433aa464511194948972335a8e4e164be3fad126f402479e3efc5bbe00b7",
      data: "block 2",
      hash: "",
    });
    expect(response.status).toEqual(400);
    expect(response.body.success).toEqual(false);
    expect(response.body.message).toEqual("Invalid mock block");
  });
  test("POST /blocks - Should NOT add new Block in Blockchain (empty)", async () => {
    const response = await request(app).post("/blocks").send({});
    expect(response.status).toEqual(422);
  });
  test("GET /transactions/:hash - Should get Transaction", async () => {
    const response = await request(app).get("/transactions/abc");
    expect(response.status).toEqual(200);
    expect(response.body.mempoolIndex).toEqual(0);
  });
  test("POST /transactions - Should add new TX", async () => {
    const tx = new Transaction({
      txInput: new TransactionInput(),
      to: "carteiraTO",
    } as Transaction);
    const response = await request(app).post("/transactions").send(tx);
    expect(response.status).toEqual(201);
  });
});
