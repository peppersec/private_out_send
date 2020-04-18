require("dotenv").config();
const Web3 = require("web3");
const { numberToHex, toHex, toWei } = require("web3-utils");
const fs = require("fs");
const SXP_ABI = require("./SXP.abi.json");

const { GAS_PRICE, RPC_URL, TARGET_ADDRESS } = process.env;

const web3 = new Web3(RPC_URL, null, { transactionConfirmationBlocks: 1 });

const sxpToken = new web3.eth.Contract(SXP_ABI, '0x8CE9137d39326AD0cD6491fb5CC0CbA0e089b6A9');

async function main() {
  const file =
    "[" + fs.readFileSync("./storage/unfulfilled_requests").slice(0, -2) + "]";
  const txs = JSON.parse(file);
  let nonce = await web3.eth.getTransactionCount(account.address);
  console.log("nonce", nonce);
  for (let i = 0; i < txs.length; i++) {
    const args = txs[i];
    const data = oracle.methods.fulfillOracleRequest(...args).encodeABI();
    try {
      const gas = await oracle.methods
        .fulfillOracleRequest(...args)
        .estimateGas();
      console.log(gas);
      const tx = {
        from: web3.eth.defaultAccount,
        value: "0x00",
        gas: numberToHex(500000), // please make sure its above `MINIMUM_CONSUMER_GAS_LIMIT` in your Oracle.sol
        gasPrice: toHex(toWei(GAS_PRICE, "gwei")),
        to: oracle._address,
        netId: 1,
        data,
        nonce
      };
      console.log("sending ...", tx);
      let signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
      let result;
      if (i % 50 === 0) {
        result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(`A new successfully sent tx ${result.transactionHash}`);
      } else {
        result = web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        result
          .once("transactionHash", function (txHash) {
            console.log(`A new successfully sent tx ${txHash}`);
          })
          .on("error", async function (e) {
            console.log("error", e.message);
          });
      }
      nonce++;
    } catch (e) {
      console.error("skipping tx ", txs[i], e);
      continue;
    }
  }
}

async function sxp() {
  const file = fs.readFileSync("./test.csv")
  const records = parse(file, {
    ltrim: true,
    rtrim: true,
    quote: false,
    skip_empty_lines: true,
    trim: true,
    cast: async (value, context) => {
      try {
        if (context.column === 0) {
        } else if (context.column === 1) {
          const privateKey = value
          console.log(privateKey)
          // const account = web3.eth.accounts.privateKeyToAccount("0x" + PRIVATE_KEY);
          // web3.eth.accounts.wallet.add("0x" + PRIVATE_KEY);
          // web3.eth.defaultAccount = account.address;
        } else {
          throw new Error('error')
        }
      } catch (e) {
        console.error(e)
      }
    }
  })
  // const txs = JSON.parse(file);
  console.log(records)
}
sxp()
// main();
