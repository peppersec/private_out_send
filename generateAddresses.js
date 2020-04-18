#!/usr/bin/env node
const Web3 = require('web3')
const web3 = new Web3()
for (let i = 0; i < 3000; i++) {
  const acc = web3.eth.accounts.create()
  console.log(`${acc.address},${acc.privateKey.substr(2)}`)
}
