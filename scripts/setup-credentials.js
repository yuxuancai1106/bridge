#!/usr/bin/env node

/**
 * Firebase Admin SDK Credentials Setup Script
 * This script helps you extract credentials from the Firebase service account JSON
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔐 Firebase Admin SDK Credentials Setup\n');
console.log('This script will help you add Firebase Admin credentials to .env.local\n');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('First, download your service account key:');
  console.log('👉 https://console.firebase.google.com/project/ask-gene-61b15/settings/serviceaccounts/adminsdk\n');
  console.log('Click "Generate new private key" and download the JSON file.\n');

  const jsonPath = await question('Enter the path to your downloaded JSON file (or drag and drop it here): ');
  const cleanPath = jsonPath.trim().replace(/['"]/g, '');

  if (!fs.existsSync(cleanPath)) {
    console.log('\n❌ File not found:', cleanPath);
    console.log('Please check the path and try again.\n');
    rl.close();
    return;
  }

  try {
    const serviceAccount = JSON.parse(fs.readFileSync(cleanPath, 'utf8'));

    if (!serviceAccount.client_email || !serviceAccount.private_key) {
      console.log('\n❌ Invalid service account file. Missing required fields.\n');
      rl.close();
      return;
    }

    // Read current .env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update or add credentials
    const clientEmail = serviceAccount.client_email;
    const privateKey = serviceAccount.private_key;

    if (envContent.includes('FIREBASE_CLIENT_EMAIL=')) {
      envContent = envContent.replace(
        /FIREBASE_CLIENT_EMAIL=.*/,
        `FIREBASE_CLIENT_EMAIL=${clientEmail}`
      );
    } else {
      envContent += `\nFIREBASE_CLIENT_EMAIL=${clientEmail}`;
    }

    if (envContent.includes('FIREBASE_PRIVATE_KEY=')) {
      envContent = envContent.replace(
        /FIREBASE_PRIVATE_KEY=.*/,
        `FIREBASE_PRIVATE_KEY="${privateKey}"`
      );
    } else {
      envContent += `\nFIREBASE_PRIVATE_KEY="${privateKey}"`;
    }

    // Write updated .env.local
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Credentials added to .env.local successfully!\n');
    console.log('Added:');
    console.log('- FIREBASE_CLIENT_EMAIL:', clientEmail);
    console.log('- FIREBASE_PRIVATE_KEY: [hidden for security]\n');

    console.log('You can now run: npm run verify\n');

    // Delete the service account file for security
    const deleteFile = await question('Delete the downloaded JSON file for security? (y/n): ');
    if (deleteFile.toLowerCase() === 'y') {
      fs.unlinkSync(cleanPath);
      console.log('✅ Service account file deleted.\n');
    }

  } catch (error) {
    console.log('\n❌ Error reading service account file:', error.message);
    console.log('Please make sure it\'s a valid JSON file.\n');
  }

  rl.close();
}

main();
