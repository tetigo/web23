import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import Blockchain from "../lib/blockchain";
import Block from "../lib/block";
import Validation from "../lib/validation";
import Transaction from "../lib/transaction";
const PORT: number = parseInt(`${process.env.BLOCHCHAIN_PORT}`) || 3002;

const app = express();

/* c8 ignore start */
if (process.argv.includes("--run")) app.use(morgan("tiny"));
/* c8 ignore end */

app.use(express.json());

const blockchain = new Blockchain();

app.get("/status", (req, res, next) => {
  res.json({
    mempool: blockchain.mempool.length,
    blocks: blockchain.blocks.length,
    isValid: blockchain.isValid(),
    lastBlock: blockchain.getLastBlock(),
  });
});

app.get("/blocks/next", (req, res): any => {
  return res.json(blockchain.getNextBlock());
});

app.get("/blocks/:indexOrHash", (req, res): any => {
  let foundBlock: Block | undefined = blockchain.getBlock(
    req.params.indexOrHash
  );

  if (!foundBlock) return res.sendStatus(404);
  return res.json({ block: foundBlock });
});

app.post("/blocks", (req, res): any => {
  if (req.body.hash === undefined) return res.sendStatus(422);

  const newBlock: Block = new Block(req.body as Block);

  const validation: Validation = blockchain.addBlock(newBlock);

  if (validation.success) return res.status(201).json(newBlock);

  return res.status(400).json(validation);
});

app.get("/transactions/:hash", (req, res): any => {
  if (req.params.hash === undefined) return res.sendStatus(422);

  const foundTransaction = blockchain.getTransaction(req.params.hash);

  return res.status(200).json(foundTransaction);
});

app.get("/transactions", (req, res): any => {
  return res.status(200).json({
    next: blockchain.mempool.slice(0, Blockchain.TX_PER_BLOCK),
    total: blockchain.mempool.length,
  });
});

app.post("/transactions", (req, res): any => {
  if (req.body.hash === undefined) return res.sendStatus(422);

  const tx = new Transaction(req.body as Transaction);
  const validation = blockchain.addTransaction(tx);

  if (validation.success) return res.status(201).json(tx);

  return res.status(400).json(validation);
});

/* c8 ignore start */
if (process.argv.includes("--run")) {
  app.listen(PORT, () => {
    console.log(">>> Blockchain server is running at port: ", PORT);
  });
}
/* c8 ignore end */

export { app };
