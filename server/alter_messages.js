import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function alterTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'padpu_db'
    });
    
    console.log('Adding status column to messages table...');
    await connection.query("ALTER TABLE messages ADD COLUMN status VARCHAR(20) DEFAULT 'unread'");
    console.log('Column added successfully!');
    
    await connection.end();
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists.');
    } else {
      console.error(err);
    }
  }
}
alterTable();
