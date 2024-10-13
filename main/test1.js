const fs = require('fs');
const ethers = require('ethers');
const axios = require('axios');
const bip39 = require('bip39');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');

// Replace 'YOUR_INFURA_PROJECT_ID' with your actual Infura Project ID
const infuraProjectId = '9aa3d95b3bc440fa88ea12eaa4456161';
const url = `https://mainnet.infura.io/v3/${infuraProjectId}`;

// Create bip32 instance using tiny-secp256k1
const bip32 = BIP32Factory(ecc);

// Function to generate a random mnemonic
function generateRandomMnemonic() {
    return bip39.generateMnemonic(); // Generates a random 12-word mnemonic
}

// Function to convert mnemonic to private key in hex
async function mnemonicToPrivateKeyHex(mnemonic) {
    try {
        // Step 1: Generate seed from mnemonic
        const seed = await bip39.mnemonicToSeed(mnemonic);
        
        // Step 2: Generate root key from seed
        const root = bip32.fromSeed(seed);
        
        // Step 3: Derive the private key (you can specify the derivation path here)
        const child = root.derivePath("m/44'/60'/0'/0/0"); // Standard derivation path for Ethereum
        
        // Convert the derived private key to a hexadecimal string
        const privateKeyArray = Array.from(child.privateKey); // Convert Buffer to array
        const privateKeyHex = convertArrayToHex(privateKeyArray);

        return privateKeyHex;
    } catch (error) {
        console.error('Error generating private key:', error);
        return null; // Return null if there's an error
    }
}

// Function to convert the private key array to a 64-character hexadecimal string
function convertArrayToHex(privateKeyArray) {
    // Convert each number to a two-digit hexadecimal string
    let hexString = privateKeyArray.map(num => num.toString(16).padStart(2, '0')).join('');

    // Ensure the final string is 64 characters long by padding with leading zeros if necessary
    if (hexString.length < 64) {
        hexString = hexString.padStart(64, '0');
    }

    return hexString;
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
        const balHex = response.data.result;
        if (balHex === "0x") return 0; // Handle case where balance is zero
        const balance = parseInt(balHex, 16) * 1e-18; // Convert Wei to Ether
        return balance;
    } catch (error) {
        console.error(`Error fetching balance for address ${address}:`, error.message);
        return 0; // Return 0 if there's an error
    }
}

// Counter for checkBalances function calls
let checkCount = 0;

// Function to generate a wallet from a mnemonic, check its balance, and save it if the balance meets the threshold
async function checkBalances() {
    checkCount++; // Increment the count for each execution
    console.log(`Check Balances Count: ${checkCount}`); // Log the count

    const mnemonic = generateRandomMnemonic();
    const privateKeyHex = await mnemonicToPrivateKeyHex(mnemonic);
    
    if (privateKeyHex) {
        const wallet = new ethers.Wallet(privateKeyHex);
        const address = wallet.address;
        const balance = await getBalance(address);

        console.log(`Mnemonic: ${mnemonic}`);
        console.log(`Private Key: ${privateKeyHex}`);
        console.log(`Address: ${address}, Balance: ${balance.toFixed(18)} ETH`);

        if (balance >= 0.00001) {
            const data = `Mnemonic: ${mnemonic}, Private Key: ${privateKeyHex}, Address: ${address}, Balance: ${balance.toFixed(18)} ETH\n`;
            fs.appendFileSync('newrandom.txt', data, 'utf8');
            console.log("Saved to newrandom.txt");
        }
    }
}

// Run the checkBalances function every second
setInterval(() => {
    checkBalances().catch(error => {
        console.error('Error in checkBalances:', error.message);
    });
}, 0); // Run every second