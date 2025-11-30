const sequelize = require('../db/sequelize');
const fs = require('fs');
const path = require('path');

async function createDatabaseObjects() {
  try {
    console.log('Reading database_objects.sql...');
    const sqlFile = path.join(__dirname, '../../database_objects.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by delimiter and execute each statement
    const statements = sql
      .split('DELIMITER //')
      .map(s => s.split('//'))
      .flat()
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s.length > 0);

    console.log('Creating VIEWs and STORED PROCEDUREs...');

    // Execute each statement
    for (const statement of statements) {
      if (statement.includes('CREATE') || statement.includes('ALTER')) {
        try {
          await sequelize.query(statement);
          console.log(`[OK] Executed: ${statement.substring(0, 50)}...`);
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists') && !error.message.includes('Duplicate')) {
            console.log(`[WARN] Warning: ${error.message}`);
          }
        }
      }
    }

    console.log('\n[SUCCESS] Database objects created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating database objects:', error);
    process.exit(1);
  }
}

createDatabaseObjects();

