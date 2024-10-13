// main/newrdm.js

const fs = require('fs');
const ethers = require('ethers');
const axios = require('axios');

// Replace 'YOUR_INFURA_PROJECT_ID' with your actual Infura Project ID
const infuraProjectId = '9aa3d95b3bc440fa88ea12eaa4456161';
const url = `https://mainnet.infura.io/v3/${infuraProjectId}`;

// Function to generate a new wallet
async function generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
        privateKey: wallet.privateKey,
        address: wallet.address
    };
}

// Function to get balance using Infura's JSON-RPC endpoint
async function getBalance(address) {
    const payload = {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
    };

    try {
        const response = await axios.post(url, payload);
        const balHex = parseInt(response.data.result, 16);
        const balance = balHex * 1e-18; // Convert balance to ETH
        return balance;
    } catch (error) {
        console.error(`Error fetching balance for address ${address}:`, error);
        return 0;
    }
}

// Function to generate a wallet, check its balance, and save it if the balance meets the threshold
async function checkBalances() {
    const { privateKey, address } = await generateWallet();
    const balance = await getBalance(address);

    console.log(`Address: ${address}, Balance: ${balance.toFixed(18)} ETH`);

    if (balance >= 0.00001) {
        const data = `Private Key: ${privateKey}, Address: ${address}, Balance: ${balance.toFixed(18)} ETH\n`;
        fs.appendFileSync('newrandom.txt', data, 'utf8');
        console.log("Saved to newrandom.txt");
    }
}

// Export the checkBalances function
async function start() {
    setInterval(checkBalances, 0); // Check balances every 5 seconds
}

module.exports = start; // Export the start function