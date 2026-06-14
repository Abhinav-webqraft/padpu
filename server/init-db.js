import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

async function initDB() {
  try {
    console.log('Connecting to MySQL server...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('Connected. Running init.sql script...');
    
    // Read the init.sql file
    const sqlPath = path.join(process.cwd(), 'init.sql');
    const sqlScript = await fs.readFile(sqlPath, 'utf8');

    // Split script by semicolons to execute statements individually, 
    // since mysql2 execute doesn't natively support multiple statements without special flags
    const statements = sqlScript.split(';').filter(stmt => stmt.trim() !== '');

    for (let stmt of statements) {
      if (stmt.trim()) {
        console.log(`Executing: ${stmt.trim().substring(0, 50)}...`);
        await connection.query(stmt);
      }
    }

    console.log('Database initialized successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDB();
