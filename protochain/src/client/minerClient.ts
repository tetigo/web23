import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import BlockInfo from "../lib/blockInfo";
import Block from "../lib/block";

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;
const minerWallet = {
  privateKey: "123456",
  publicKey: process.env.MINER_WALLET as string,
};
console.log(">>> Logged as: " + minerWallet.publicKey);

let totalMined = 0;

async function mine() {
  console.log(">>> Getting next block info...");
  const { data } = await axios.get(`${BLOCKCHAIN_SERVER}/blocks/next`);
  if (!data) {
    console.log("No TX found. Waiting...");
    return setTimeout(() => {
      mine();
    }, 5000);
  }
  const blockInfo = data as BlockInfo;
  console.log(">>>", blockInfo);

  const newBlock: Block = Block.fromBlockInfo(blockInfo);

  //TODO: adicionar tx de recompensa

  console.log(">>> Start mining block #" + blockInfo.index);

  newBlock.mine(blockInfo.difficulty, minerWallet.publicKey);

  console.log(">>> Block mined! Sending it to the Blockchain...");

  try {
    const response = await axios.post(`${BLOCKCHAIN_SERVER}/blocks`, newBlock);
    console.log(">>> Block Sent and Accepted!" + response.data.hash);
    totalMined++;
    console.log(">>> Total mined blocks: " + totalMined);
  } catch (error: any) {
    console.error(error.response ? error.response.data : error.message);
  }

  setTimeout(() => {
    mine();
  }, 1000);
}

mine();
