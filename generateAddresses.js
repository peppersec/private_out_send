#!/usr/bin/env node
const fs = require('fs')
const Web3 = require('web3')
const web3 = new Web3()
try {
  fs.unlinkSync('list.csv')
  fs.unlinkSync('multisender.csv')
} catch (e) {

}
const count = process.argv[2] || 3000
for (let i = 0; i < count; i++) {
  const acc = web3.eth.accounts.create()
  console.log(`${acc.address},${acc.privateKey.substr(2)}`)
  fs.appendFileSync('list.csv', `${acc.address},${acc.privateKey.substr(2)}\n`)
  fs.appendFileSync('multisender.csv', `${acc.address},0.0002\n`)
}
