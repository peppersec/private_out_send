require("dotenv").config()
const Web3 = require("web3")
const { toBN, toWei, fromWei } = require("web3-utils");
const fs = require("fs")
const SXP_ABI = require("./SXP.abi.json")

const { GAS_PRICE, RPC_URL, TARGET_ADDRESS } = process.env
const web3 = new Web3(RPC_URL, null, { transactionConfirmationBlocks: 1 }) // todo: more confirmation block
const sxpToken = new web3.eth.Contract(SXP_ABI, '0xFab46E002BbF0b4509813474841E0716E6730136')

let success = 0
let error = 0
let zero = 0
let sum = toBN("0")

async function readKeys() {
  const lines = fs.readFileSync("./test.csv").toString().split(/\r?\n/)
  return lines.map(a => a.trim()).filter(a => a.length > 0 && a.includes(',')).map(a => a.split(',')[1].trim())
}

async function send(privateKey, index) {
  let account
  try {
    account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey)
    web3.eth.accounts.wallet.add('0x' + privateKey)
  } catch {
    error++
    console.log(`Account ${privateKey} has invalid format`)
  }
  try {
    const balance = await sxpToken.methods.balanceOf(account.address).call()
    // console.log(`Balance of ${account.address} = ${fromWei(balance)} SXP`)
    if (balance > 0) {
      let gas = await sxpToken.methods.transfer(TARGET_ADDRESS, balance).estimateGas({from: account.address})
      let receipt = await sxpToken.methods.transfer(TARGET_ADDRESS, balance).send({
        from: account.address,
        gas,
        gasPrice: toWei(GAS_PRICE, 'gwei')
      })
      success++
      sum = sum.add(toBN(balance))
      console.log(`${index + 1}: Withdrawn ${fromWei(balance)} SXP from ${account.address}, tx hash:\nhttps://kovan.etherscan.io/tx/${receipt.transactionHash}`)
    } else {
      zero++
      console.log(`${index + 1}: Account ${account.address} has zero balance, skipping`)
    }
  } catch (e) {
    error++
    console.log(`${index + 1}: Error withdrawing from account ${account.address}: ${e.message}`)
  }
}

async function sendAll(keys) {
  let promises = []
  for (let i = 0; i < keys.length; i++) {
    promises.push(send(keys[i], i))
    await delay(100)
  }
  await Promise.all(promises)
  console.log(`\n\nCompleted`)
  console.log(`Success: ${success}`)
  console.log(`Error: ${error}`)
  console.log(`Zero balance: ${zero}`)
  console.log(`Total amount: ${fromWei(sum.toString())}`)
}

async function main() {
  const keys = await readKeys()
  console.log(`Got ${keys.length} keys`)
  await sendAll(keys)
}

const delay = (time) => new Promise(resolve => setTimeout(resolve, time))

main()
