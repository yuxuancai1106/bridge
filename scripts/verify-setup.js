#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if all required environment variables are configured
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log('\n🔍 Verifying Bridge Backend Setup...\n');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envPath)) {
  console.log(`${RED}✗${RESET} .env.local file not found!`);
  console.log(`${YELLOW}→${RESET} Please create .env.local from .env.example\n`);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse .env file
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    envVars[key.trim()] = value;
  }
});

const checks = [
  {
    name: 'Firebase Client Config',
    vars: [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ],
    required: true
  },
  {
    name: 'Firebase Admin SDK',
    vars: [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY'
    ],
    required: true
  },
  {
    name: 'Fetch.ai API',
    vars: ['NEXT_PUBLIC_FETCH_AI_API_KEY'],
    required: true
  },
  {
    name: 'Elasticsearch',
    vars: [
      'ELASTICSEARCH_NODE',
      'ELASTICSEARCH_USERNAME'
    ],
    required: false
  }
];

let allPassed = true;
let warnings = [];

checks.forEach(check => {
  const missing = check.vars.filter(varName => !envVars[varName] || envVars[varName] === '');

  if (missing.length === 0) {
    console.log(`${GREEN}✓${RESET} ${check.name}`);
  } else if (check.required) {
    console.log(`${RED}✗${RESET} ${check.name}`);
    console.log(`  ${YELLOW}Missing:${RESET} ${missing.join(', ')}`);
    allPassed = false;
  } else {
    console.log(`${YELLOW}⚠${RESET} ${check.name}`);
    console.log(`  ${YELLOW}Missing (optional):${RESET} ${missing.join(', ')}`);
    warnings.push(check.name);
  }
});

console.log('\n' + '─'.repeat(50) + '\n');

if (allPassed && warnings.length === 0) {
  console.log(`${GREEN}✓ All environment variables configured!${RESET}\n`);
  console.log('Next steps:');
  console.log('1. Start Elasticsearch: docker run -p 9200:9200 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:8.11.0');
  console.log('2. Run the app: npm run dev');
  console.log('3. Test signup: See API_DOCUMENTATION.md\n');
} else if (allPassed) {
  console.log(`${GREEN}✓ Required configuration complete!${RESET}\n`);
  console.log(`${YELLOW}⚠ Optional warnings:${RESET}`);
  warnings.forEach(w => console.log(`  - ${w} not fully configured`));
  console.log('\nYou can still run the app, but some features may not work.\n');
} else {
  console.log(`${RED}✗ Setup incomplete!${RESET}\n`);
  console.log('Please complete the missing configuration:');
  console.log('See QUICK_SETUP.md for detailed instructions.\n');
  process.exit(1);
}

// Additional checks
console.log('Additional checks:\n');

// Check if node_modules exists
if (fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
  console.log(`${GREEN}✓${RESET} Dependencies installed`);
} else {
  console.log(`${YELLOW}⚠${RESET} Dependencies not installed - run: npm install`);
}

// Check if Firebase is initialized
if (fs.existsSync(path.join(__dirname, '..', 'firebase.json'))) {
  console.log(`${GREEN}✓${RESET} Firebase configuration found`);
} else {
  console.log(`${YELLOW}⚠${RESET} Firebase not initialized - run: firebase init`);
}

console.log('');
