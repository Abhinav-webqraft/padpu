import pool from '../db.js';

export async function up() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('1. Creating user_auth_providers table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_auth_providers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        provider VARCHAR(50) NOT NULL,
        provider_user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_provider_user (provider, provider_user_id),
        KEY idx_user_id (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('2. Modifying users table (allowing NULL for password and phonenumber for OAuth users)...');
    await connection.query(`
      ALTER TABLE users 
      MODIFY COLUMN password VARCHAR(255) NULL,
      MODIFY COLUMN phonenumber VARCHAR(20) NULL;
    `);

    // Add avatar column to users table if it does not already exist
    const [cols] = await connection.query("SHOW COLUMNS FROM users LIKE 'avatar'");
    if (cols.length === 0) {
      console.log('3. Adding avatar column to users table...');
      await connection.query("ALTER TABLE users ADD COLUMN avatar VARCHAR(500) NULL AFTER location;");
    }

    await connection.commit();
    console.log('Migration up completed successfully!');
  } catch (err) {
    await connection.rollback();
    console.error('Migration up failed:', err);
    throw err;
  } finally {
    connection.release();
  }
}

export async function down() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('Reverting user_auth_providers table...');
    await connection.query('DROP TABLE IF EXISTS user_auth_providers;');

    const [cols] = await connection.query("SHOW COLUMNS FROM users LIKE 'avatar'");
    if (cols.length > 0) {
      await connection.query('ALTER TABLE users DROP COLUMN avatar;');
    }

    await connection.commit();
    console.log('Migration down completed successfully!');
  } catch (err) {
    await connection.rollback();
    console.error('Migration down failed:', err);
    throw err;
  } finally {
    connection.release();
  }
}

// Allow running directly: node migrations/20261118_add_google_auth.js up|down
if (process.argv[1]?.endsWith('20261118_add_google_auth.js')) {
  const action = process.argv[2] === 'down' ? down : up;
  action()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
