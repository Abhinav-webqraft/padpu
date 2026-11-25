import pool from '../db.js';

export async function up() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('1. Creating weights table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS weights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(100) NOT NULL UNIQUE,
        grams INT NOT NULL DEFAULT 0,
        default_price DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    console.log('2. Updating cart_items.weight_grams default to 0...');
    const [cols] = await connection.query("SHOW COLUMNS FROM cart_items LIKE 'weight_grams'");
    if (cols.length === 0) {
      await connection.query(
        'ALTER TABLE cart_items ADD COLUMN weight_grams INT DEFAULT 0 AFTER weight_label;'
      );
    } else {
      await connection.query(
        'ALTER TABLE cart_items MODIFY COLUMN weight_grams INT DEFAULT 0 AFTER weight_label;'
      );
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

    console.log('1. Dropping weights table...');
    await connection.query('DROP TABLE IF EXISTS weights;');

    console.log('2. Reverting cart_items.weight_grams default to NULL...');
    const [cols] = await connection.query("SHOW COLUMNS FROM cart_items LIKE 'weight_grams'");
    if (cols.length > 0) {
      await connection.query(
        'ALTER TABLE cart_items MODIFY COLUMN weight_grams INT DEFAULT NULL;'
      );
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

// Allow running directly: node migrations/20261125_add_weights_and_cart_weight_default.js up|down
if (process.argv[1]?.endsWith('20261125_add_weights_and_cart_weight_default.js')) {
  const action = process.argv[2] === 'down' ? down : up;
  action()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
