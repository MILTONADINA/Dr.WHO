const sequelize = require('../db/sequelize');
const fs = require('fs');
const path = require('path');

async function createDatabaseObjects() {
  try {
    console.log('Reading database_objects.sql...');
    const sqlFile = path.join(__dirname, '../../database_objects.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Parse SQL file handling DELIMITER statements
    // Strategy: Split into sections before/after DELIMITER $$, then parse each section appropriately
    const statements = [];

    // Find the first DELIMITER $$ to separate VIEWs from PROCEDUREs
    const firstDelimiterIndex = sql.indexOf('DELIMITER $$');

    if (firstDelimiterIndex > 0) {
      // Parse VIEWs (everything before first DELIMITER $$)
      const viewsSection = sql.substring(0, firstDelimiterIndex);

      // Use regex to find complete CREATE VIEW statements (handles multi-line)
      const viewRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+[\s\S]*?;/gi;
      const viewMatches = viewsSection.match(viewRegex);

      if (viewMatches) {
        for (const viewStmt of viewMatches) {
          const cleaned = viewStmt.trim();
          if (cleaned && !cleaned.startsWith('--')) {
            statements.push({ sql: cleaned, delimiter: ';' });
          }
        }
      }
    } else {
      // No DELIMITER $$ found, treat entire file as VIEWs
      const viewRegex = /CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+[\s\S]*?;/gi;
      const viewMatches = sql.match(viewRegex);

      if (viewMatches) {
        for (const viewStmt of viewMatches) {
          const cleaned = viewStmt.trim();
          if (cleaned && !cleaned.startsWith('--')) {
            statements.push({ sql: cleaned, delimiter: ';' });
          }
        }
      }
    }

    // Parse PROCEDUREs (everything after first DELIMITER $$)
    // Extract procedure blocks between DELIMITER $$ and DELIMITER ;
    const proceduresSection = sql.substring(firstDelimiterIndex);
    const procedureBlocks = proceduresSection.split(/DELIMITER\s+\$\$/gi);

    for (let i = 1; i < procedureBlocks.length; i++) {
      const block = procedureBlocks[i];
      // Find the END $$ and DELIMITER ; that follows
      const endIndex = block.indexOf('END $$');
      if (endIndex > 0) {
        const procedureBody = block.substring(0, endIndex + 6); // Include "END $$"
        const procedureMatch = procedureBody.match(/CREATE\s+PROCEDURE\s+(\w+)/i);
        if (procedureMatch) {
          // Remove the $$ delimiter from the end
          const cleanProcedure = procedureBody.replace(/\$\$/g, '').trim();
          statements.push({ sql: cleanProcedure, delimiter: '$$' });
        }
      }
    }

    console.log('Creating VIEWs and STORED PROCEDUREs...');

    // Execute each statement
    for (const { sql: statement, delimiter } of statements) {
      // Skip comments and empty statements
      if (!statement || statement.trim().startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      // For procedures, we need to drop them first if they exist (MySQL doesn't support CREATE OR REPLACE PROCEDURE)
      if (statement.includes('CREATE PROCEDURE')) {
        const procedureMatch = statement.match(/CREATE\s+PROCEDURE\s+(\w+)/i);
        if (procedureMatch) {
          const procedureName = procedureMatch[1];
          try {
            await sequelize.query(`DROP PROCEDURE IF EXISTS ${procedureName}`);
            console.log(`[OK] Dropped existing procedure: ${procedureName}`);
          } catch (error) {
            // Ignore errors when dropping
          }
        }
      }

      // For views, MySQL supports CREATE OR REPLACE, so we can execute directly
      try {
        await sequelize.query(statement);
        const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
        console.log(`[OK] Executed: ${preview}...`);
      } catch (error) {
        // Ignore "already exists" errors for views
        if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
          // Silent - views are replaced automatically
        } else {
          console.log(`[WARN] Warning: ${error.message.substring(0, 100)}`);
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

