// main/new+1.js

const { ethers } = require("ethers");
const axios = require('axios');
const fs = require('fs');

let lastPrivateKey = '0000000000000000000000000000000000000000000000000000000000000000';

async function loadLastPrivateKey() {
    try {
        lastPrivateKey = fs.readFileSync('last_private_key.txt', 'utf8').trim();
    } catch (error) {
        console.log("No last private key found. Starting from default value.");
    }
}

function incrementPrivateKey(hexKey) {
    const nextPrivateKeyInt = BigInt('0x' + hexKey) + BigInt(1);
    let nextPrivateKeyHex = nextPrivateKeyInt.toString(16);
    return nextPrivateKeyHex.padStart(64, '0');
}

async function checkBalances() {
    // Increment private key
    lastPrivateKey = incrementPrivateKey(lastPrivateKey);

    // Save the new private key to file
    fs.writeFileSync('last_private_key.txt', lastPrivateKey);

    // Derive the address from the private key
    const wallet = new ethers.Wallet(lastPrivateKey);
    const address = wallet.address;

    // Print generated private key and address
    console.log(`Generated Private Key: ${lastPrivateKey}`);
    console.log(`Generated Address: ${address}`);

    // Fetch balance using Infura
    await getBalanceUsingInfura(lastPrivateKey, address);
}

async function getBalanceUsingInfura(privateKey, address) {
    const infuraApiKey = "9aa3d95b3bc440fa88ea12eaa4456161";
    const url = `https://mainnet.infura.io/v3/${infuraApiKey}`;
    const payload = {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1
    };

    try {
        const response = await axios.post(url, payload);
        const balHex = parseInt(response.data.result, 16);
        const balance = balHex * 1e-18; // Convert balance to ETH
        console.log(`Address: ${address}, Balance: ${balance.toFixed(18)}`);

        if (balance > 0.00000000001) {
            const data = `Private Key: ${privateKey}, Address: ${address}, Balance: ${balance.toFixed(18)}\n`;
            fs.appendFileSync('+1balance.txt', data);
        }
    } catch (error) {
        console.error(`Error fetching balance for address ${address}:`, error);
    }
}

// Export the start function to initiate the process
async function start() {
    await loadLastPrivateKey();
    setInterval(checkBalances, 0); // Check balances every 5 seconds
}

module.exports = start; // Export the start function