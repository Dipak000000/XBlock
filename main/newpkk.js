const fs = require('fs');
const ethers = require('ethers');
const axios = require('axios');

// Replace 'YOUR_INFURA_PROJECT_ID' with your actual Infura Project ID
const infuraProjectId = '9aa3d95b3bc440fa88ea12eaa4456161';
const url = `https://mainnet.infura.io/v3/${infuraProjectId}`;

// Function to read private key from private.txt
function readPrivateKey() {
    try {
        const data = fs.readFileSync('private.txt', 'utf8');
        let match = data.match(/0x[a-fA-F0-9]{64}/g);
        if (!match) {
            match = data.match(/[a-fA-F0-9]{64}/g);
        }
        if (match && match.length > 0) {
            return match[0];
        } else {
            console.error("No private key found in private.txt");
            return null;
        }
    } catch (err) {
        console.error(`Error reading private.txt: ${err}`);
        return null;
    }
}

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
        const balance = balHex * 1e-18;
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

// Read private key from private.txt
const privateKey = readPrivateKey();

if (privateKey) {
    console.log(`Private Key: ${privateKey}`);
} else {
    console.error("Private key could not be retrieved. Exiting...");
    process.exit(1);
}

// Run the checkBalances function every second
setInterval(checkBalances, 10);