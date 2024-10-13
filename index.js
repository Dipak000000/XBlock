const readline = require('readline');

// Import your JavaScript files
const script1 = require('./main/new+1.js'); // Script in the main folder
const script2 = require('./main/newadd.js');
const script3 = require('./main/newrdm.js');
const convertScript = require('./keys/convert.js'); // Path to convert.js
const randomScript = require('./keys/random.js');   // Path to random.js

// Create a readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Print your name before starting
console.log('Made By Mrdipak');

// Function to display options and handle user input
function askQuestion() {
    console.log('\nSelect a script to run:');
    console.log('1. Find Key +1 balance');
    console.log('2. Find address balance');
    console.log('3. Find random wallets');
    console.log('4. Convert private keys');
    console.log('5. Generate random wallets');  // Updated option for random wallets
    console.log('0. Exit'); // Changed exit option to 0

    rl.question('Enter the number of your choice: ', async (answer) => {
        switch (answer) {
            case '1':
                console.log('Running: new+1.js');
                script1(); // Call the start function from new+1.js
                break;
            case '2':
                console.log('Running: newadd.js');
                script2(); // Call the start function from newadd.js
                break;
            case '3':
                console.log('Running: newrdm.js');
                script3(); // Call the start function from newrdm.js
                break;
            case '4':
                console.log('Running: convert.js');
                await convertScript(); // Call the function from convert.js
                break;
            case '5':
                console.log('Running: random.js');
                await randomScript(); // Call the function from random.js
                break;
            case '0': // Changed exit option to 0
                console.log('Exiting...');
                rl.close();
                return;
            default:
                console.log('Invalid choice, please try again.');
        }
        askQuestion(); // Ask again after executing
    });
}

// Start the prompt
askQuestion();