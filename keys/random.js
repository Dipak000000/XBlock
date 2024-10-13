const fs = require('fs');
const ethers = require('ethers');
const bip39 = require('bip39');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');

// Create bip32 instance using tiny-secp256k1
const bip32 = BIP32Factory(ecc);

// Function to generate a random mnemonic
function generateRandomMnemonic() {
    return bip39.generateMnemonic(); // Generates a random 12-word mnemonic
}

// Function to convert mnemonic to private key in hex
async function mnemonicToPrivateKeyHex(mnemonic) {
    try {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const root = bip32.fromSeed(seed);
        const child = root.derivePath("m/44'/60'/0'/0/0"); // Standard derivation path for Ethereum
        const privateKeyArray = Array.from(child.privateKey);
        return convertArrayToHex(privateKeyArray);
    } catch (error) {
        console.error('Error generating private key:', error);
        return null;
    }
}

// Function to convert the private key array to a 64-character hexadecimal string
function convertArrayToHex(privateKeyArray) {
    let hexString = privateKeyArray.map(num => num.toString(16).padStart(2, '0')).join('');
    if (hexString.length < 64) {
        hexString = hexString.padStart(64, '0');
    }
    return hexString;
}

// Function to generate wallet details and log them
async function logWalletDetails() {
    const mnemonic = generateRandomMnemonic();
    const privateKeyHex = await mnemonicToPrivateKeyHex(mnemonic);

    if (privateKeyHex) {
        const wallet = new ethers.Wallet(privateKeyHex);
        const address = wallet.address;

        console.log(`Mnemonic: ${mnemonic}`);
        console.log(`Private Key: ${privateKeyHex}`);
        console.log(`Address: ${address}`);

        // Save the details to a file
        const data = `Mnemonic: ${mnemonic}, Private Key: ${privateKeyHex}, Address: ${address}\n`;
        fs.appendFileSync('randomwallets.txt', data, 'utf8');
        console.log("Saved to randomwallets.txt");
    }
}

// Function to start generating wallets
async function startGeneratingWallets() {
    setInterval(() => {
        logWalletDetails().catch(error => {
            console.error('Error in logWalletDetails:', error.message);
        });
    }, 1000); // Run every second
}

// Export the function to start generating wallets
module.exports = startGeneratingWallets;