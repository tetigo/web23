import express from "express";
import morgan from "morgan";
import Blockchain from "../lib/blockchain";
import Block from "../lib/block";
import Validation from "../lib/validation";
const PORT: number = 3002;

const app = express();

if (process.argv.includes("--run")) app.use(morgan("tiny"));

app.use(express.json());

const blockchain = new Blockchain();

app.get("/status", (req, res, next) => {
  res.json({
    numberOfBlocks: blockchain.blocks.length,
    isValid: blockchain.isValid(),
    lastBlock: blockchain.getLastBlock(),
  });
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

if (process.argv.includes("--run")) {
  app.listen(PORT, () => {
    console.log(">>> Blockchain server is running at port: ", PORT);
  });
}

export { app };
