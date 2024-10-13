const axios = require('axios');
const fs = require('fs');

const infuraApiKey = "9aa3d95b3bc440fa88ea12eaa4456161";
const infuraUrl = `https://mainnet.infura.io/v3/${infuraApiKey}`;

let addresses = [];

// Function to load addresses from the file
const loadAddresses = () => {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream('./main/h.txt', 'utf8');
        readStream.on('data', (chunk) => {
            // Use regular expression to extract Ethereum addresses
            const regex = /0x[a-fA-F0-9]{40}/g;
            let match;
            while ((match = regex.exec(chunk)) !== null) {
                addresses.push(match[0]);
            }
        });

        readStream.on('end', () => {
            resolve(addresses);
        });

        readStream.on('error', (err) => {
            reject(err);
        });
    });
};

let lastAddress = null;
try {
    lastAddress = fs.readFileSync('./main/last.txt', 'utf8').trim();
} catch (error) {
    console.log('No last address found. Starting from the beginning.');
}

if (lastAddress) {
    const lastAddressIndex = addresses.indexOf(lastAddress);
    if (lastAddressIndex !== -1) {
        addresses = addresses.slice(lastAddressIndex + 1);
    } else {
        console.log('Last address not found. Starting from the beginning.');
    }
}

const delayBetweenLines = 10; // Adjust the delay in milliseconds to process 100 lines per second

async function getBalance(address) {
    const payload = {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
    };

    try {
        const response = await axios.post(infuraUrl, payload);
        const balHex = parseInt(response.data.result, 16);
        const balance = balHex * 1e-18;
        return balance;
    } catch (error) {
        console.error(`Error fetching balance for address ${address}:`, error);
        return 0;
    }
}

async function saveAddress(address, balance) {
    fs.appendFileSync('balances.txt', `${address}: ${balance} ETH\n`);
    console.log(`Address with balance > 0.00001 ETH saved: ${address}, Balance: ${balance} ETH`);
}

async function checkBalances() {
    if (addresses.length === 0) {
        console.log('All addresses processed.');
        return;
    }

    const address = addresses.shift();
    const balance = await getBalance(address);

    if (balance > 0.00001) {
        await saveAddress(address, balance);
    } else {
        console.log(`Skipping address ${address} with balance ${balance} ETH`);
    }

    // Process the next address after the delay
    setTimeout(checkBalances, delayBetweenLines);
}

async function cleanupAndExit() {
    console.log('Process interrupted. Saving last processed address...');
    const lastProcessedAddress = addresses[addresses.length - 1];
    fs.writeFileSync('./main/last.txt', lastProcessedAddress); // Save the last processed address
    console.log('Last processed address saved.');
    process.exit();
}

process.on('SIGINT', cleanupAndExit);
process.on('SIGTERM', cleanupAndExit);

// Main function to start the balance checking process
async function startChecking() {
    await loadAddresses(); // Load addresses before starting to check balances
    console.log('All addresses read. Starting balance check...');
    checkBalances();
}

// Export the startChecking function so it can be called from index.js
module.exports = startChecking;