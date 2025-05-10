import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import readline from "readline/promises";
import Wallet from "../lib/wallet";
import Transaction from "../lib/transaction";
import TransationType from "../lib/transactionType";
import TransactionInput from "../lib/transactionInput";

const BLOCKCHAIN_SERVER = process.env.BLOCKCHAIN_SERVER;

let myWalletPub = "";
let myWalletPriv = "";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function menu() {
  setTimeout(async () => {
    console.clear();
    if (myWalletPub) console.log(`You are logged as ${myWalletPub}\n`);
    else console.log(`You are not logged in\n`);
    console.log("1 - Create Wallet");
    console.log("2 - Recover Wallet");
    console.log("3 - Balance");
    console.log("4 - Send tx");
    console.log("5 - Search tx");
    console.log("6 - Exit");
    const answer = await rl.question("\nChoose your option: ");
    switch (answer) {
      case "1":
        console.log("1");
        createWallet();
        break;
      case "2":
        console.log("2");
        recoverWallet();
        break;
      case "3":
        console.log("3");
        getBalance();
        break;
      case "4":
        console.log("4");
        sendTx();
        break;
      case "5":
        console.log("5");
        searchTx();
        break;
      case "6":
        rl.close();
        console.clear();
        process.exit();
      default: {
        console.log("Wrong option");
        menu();
      }
    }
  }, 1000);
}

function preMenu() {
  rl.question(`Press any key to continue... `)
    .then(() => menu())
    .catch((err) => console.log(err));
}

function createWallet() {
  console.clear();
  const wallet = new Wallet();
  console.log(`Your new wallet:`);
  console.log(wallet);
  myWalletPub = wallet.publicKey;
  myWalletPriv = wallet.privateKey;
  preMenu();
}

function recoverWallet() {
  console.clear();
  rl.question("What is your private key of WIF? ")
    .then((wifOrPrivateKey) => {
      const wallet = new Wallet(wifOrPrivateKey);
      console.log(`Your recovered wallet: `);
      console.log(wallet);
      myWalletPub = wallet.publicKey;
      myWalletPriv = wallet.privateKey;
      preMenu();
    })
    .catch((err) => console.log(err));
}

function getBalance() {
  console.clear();
  if (!myWalletPub) {
    console.log(`You don't have a wallet yet\n`);
    return preMenu();
  }

  //TODO: get balance via API
  preMenu();
}

function sendTx() {
  console.clear();
  if (!myWalletPub) {
    console.log(`You don't have a wallet yet\n`);
    return preMenu();
  }

  console.log(`Your wallet is: ${myWalletPub}`);
  rl.question(`To Wallet: `).then((toWallet) => {
    if (toWallet.length < 66) {
      console.log(`Invalid wallet`);
      return preMenu();
    }
    rl.question(`Amount: `).then(async (amountStr) => {
      const amount = parseInt(amountStr);
      if (!amount) {
        console.log(`Invalid amount`);
        return preMenu();
      }
      //TODO: balance validation

      const tx = new Transaction();
      tx.timestamp = Date.now();
      tx.to = toWallet;
      tx.type = TransationType.REGULAR;
      tx.txInput = new TransactionInput({
        amount,
        fromAddress: myWalletPub,
      } as TransactionInput);

      tx.txInput.sign(myWalletPriv);
      tx.hash = tx.getHash();
      try {
        const txResponse = await axios.post(
          `${BLOCKCHAIN_SERVER}/transactions`,
          tx
        );
        console.log(`Transaction accepted. Waiting the miners!`);
        console.log(txResponse.data.hash);
      } catch (err: any) {
        console.error(err.response ? err.response.data : err.message);
      }
      return preMenu();
    });
  });
  preMenu();
}

function searchTx() {
  console.clear();
  rl.question(`Your tx hash: `).then(async (hash) => {
    const response = await axios.get(
      `${BLOCKCHAIN_SERVER}/transactions/${hash}`
    );
    console.log(response.data);
    return preMenu();
  });
}

menu();

// const wallet = new Wallet(
//   "b6bc6ad2b2aa8b684dfdd5679c886095b2dd17cb5d8dab9080f07dcf24bbfc63"
// );
// console.log(">>>", wallet);
