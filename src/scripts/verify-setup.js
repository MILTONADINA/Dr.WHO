const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('Verifying project setup...\n');

let allGood = true;

// Check .env file exists
const envPath = path.join(__dirname, '../../.env');
if (!fs.existsSync(envPath)) {
  console.log('[ERROR] .env file not found. Please create it from .env.example');
  allGood = false;
} else {
  console.log('[OK] .env file exists');

  // Check required environment variables
  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter(key => !process.env[key] || process.env[key].includes('your_'));

  if (missing.length > 0) {
    console.log(`[WARN] Please update these in .env: ${missing.join(', ')}`);
    allGood = false;
  } else {
    console.log('[OK] Environment variables configured');
  }
}

// Check node_modules
const nodeModulesPath = path.join(__dirname, '../../node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('[ERROR] node_modules not found. Run: npm install');
  allGood = false;
} else {
  console.log('[OK] Dependencies installed');
}

// Check database connection
async function testConnection() {
  try {
    const sequelize = require('../db/sequelize');
    await sequelize.authenticate();
    console.log('[OK] Database connection successful');

    // Check if database exists
    const [results] = await sequelize.query('SELECT DATABASE() as current_db');
    const currentDb = results[0]?.current_db;
    if (currentDb) {
      console.log(`[OK] Connected to database: ${currentDb}`);
    }

    await sequelize.close();
    return true;
  } catch (error) {
    console.log(`[ERROR] Database connection failed: ${error.message}`);
    console.log('   Make sure MySQL is running and credentials are correct');
    return false;
  }
}

// Check if models directory exists
const modelsPath = path.join(__dirname, '../models');
if (!fs.existsSync(modelsPath)) {
  console.log('[ERROR] Models directory not found');
  allGood = false;
} else {
  const modelFiles = fs.readdirSync(modelsPath).filter(f => f.endsWith('.js') && f !== 'index.js');
  console.log(`[OK] Found ${modelFiles.length} model files`);
}

// Check if public directory exists
const publicPath = path.join(__dirname, '../../public');
if (!fs.existsSync(publicPath)) {
  console.log('[WARN] Public directory not found (frontend may not work)');
} else {
  console.log('[OK] Public directory exists (frontend ready)');
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('[SUCCESS] Basic setup looks good!');
  console.log('\nNext steps:');
  console.log('1. Update .env with your MySQL credentials');
  console.log('2. Create MySQL database: CREATE DATABASE doctor_who_db;');
  console.log('3. Run: npm run db:sync');
  console.log('4. Run: npm run db:objects');
  console.log('5. Run: npm run db:seed');
  console.log('6. Run: npm start');
} else {
  console.log('[WARN] Please fix the issues above before proceeding');
}
console.log('='.repeat(50));

// Test database connection if .env is configured
if (allGood && process.env.DB_PASSWORD && !process.env.DB_PASSWORD.includes('your_')) {
  testConnection().then(connected => {
    if (connected) {
      console.log('\n[READY] Ready to sync database! Run: npm run db:sync');
    }
    process.exit(connected ? 0 : 1);
  });
} else {
  process.exit(allGood ? 0 : 1);
}

