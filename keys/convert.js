const fs = require('fs');
const ethers = require('ethers');

// Function to process private keys
async function processPrivateKeys() {
    // Read private keys from p.txt line by line
    const privateKeys = fs.readFileSync('./keys/p.txt', 'utf-8').trim().split('\n');

    // Process each private key
    for (const privateKey of privateKeys) {
        try {
            // Create a wallet instance from the private key
            const wallet = new ethers.Wallet(privateKey.trim());

            // Get the Ethereum address associated with the wallet
            const address = wallet.address;

            // Save private key and address to h.txt
            const data = `Private Key: ${privateKey.trim()}\nEthereum Address: ${address}\n`;
            fs.appendFileSync('h.txt', data);
        } catch (error) {
            // Skip invalid private keys
            console.error(`Skipping invalid private key: ${privateKey.trim()}`);
        }
    }

    console.log('Private Keys and Ethereum Addresses saved to h.txt');
}

// Export the function to process private keys
module.exports = processPrivateKeys;