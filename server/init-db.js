import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config();

const initialCategories = ['Pure Honey', 'Forest Honey', 'Flavoured Honey', 'Gift Packs'];

const initialProducts = [
  {
    id: 1,
    slug: 'wildflower-honey',
    name: 'Wildflower Honey',
    shortDescription: 'Rich, complex flavour from diverse wildflowers across pristine meadows.',
    description: 'Our Wildflower Honey is harvested from bees that roam freely across vast meadows filled with hundreds of wildflower varieties. The result is a complex, nuanced honey with floral notes, subtle sweetness, and a rich amber colour. Every jar tells the story of the season it was harvested — a true expression of nature\'s bounty. Cold-extracted to preserve all natural enzymes, antioxidants, and beneficial compounds.',
    price: 349,
    originalPrice: 449,
    category: 'Pure Honey',
    tags: ['bestseller', 'pure', 'wildflower', 'raw'],
    images: ['/images/300G MULTI.png', '/images/400 G MULTI.png'],
    weightOptions: [
      { label: '250g', price: 349, grams: 250 },
      { label: '500g', price: 649, grams: 500 },
      { label: '1kg', price: 1199, grams: 1000 },
    ],
    inStock: true,
    stockQuantity: 150,
    rating: 4.9,
    reviewCount: 342,
    featured: true,
    badge: null,
  },
  {
    id: 2,
    slug: 'western-ghats-forest-honey',
    name: 'Western Ghats Forest Honey',
    shortDescription: 'Dark, robust honey from the rich forests of the Western Ghats. Rare & prized.',
    description: 'Sourced from wild bee colonies in the biodiverse Western Ghats, this rare honey carries the essence of medicinal plants, forest blossoms, and native trees. Its dark amber colour and robust, slightly bitter-sweet taste make it unlike any other honey. Rich in antioxidants and minerals, it is harvested with care to preserve its natural purity.',
    price: 599,
    originalPrice: 799,
    category: 'Forest Honey',
    tags: ['premium', 'western-ghats', 'forest', 'rare', 'natural'],
    images: ['/images/beehive-forest.png', '/images/400 G MULTI.png'],
    weightOptions: [
      { label: '250g', price: 599, grams: 250 },
      { label: '500g', price: 1099, grams: 500 },
      { label: '1kg', price: 1999, grams: 1000 },
    ],
    inStock: true,
    stockQuantity: 45,
    rating: 4.8,
    reviewCount: 187,
    featured: true,
    badge: null,
  },
  {
    id: 3,
    slug: 'ginger-infused-honey',
    name: 'Ginger Infused Honey',
    shortDescription: 'Pure honey blended with fresh ginger for immunity & digestion.',
    description: 'A powerful combination of pure wildflower honey and fresh organic ginger root. This infusion creates a warming, spicy-sweet blend that supports immunity, aids digestion, and soothes sore throats. Perfect for morning tonics, tea sweetener, or drizzled over toast. Each batch is carefully made to preserve the potency of both honey and ginger.',
    price: 399,
    originalPrice: 499,
    category: 'Flavoured Honey',
    tags: ['ginger', 'immunity', 'flavoured', 'wellness'],
    images: ['/images/gift pep honey.png'],
    weightOptions: [
      { label: '250g', price: 399, grams: 250 },
      { label: '500g', price: 749, grams: 500 },
    ],
    inStock: true,
    stockQuantity: 89,
    rating: 4.7,
    reviewCount: 156,
    featured: true,
    badge: null,
  },
  {
    id: 4,
    slug: 'tulsi-honey',
    name: 'Tulsi Sacred Honey',
    shortDescription: 'Holy basil infused honey — ancient Ayurvedic remedy for wellness.',
    description: 'Tulsi, known as Holy Basil, is one of the most sacred plants in Ayurvedic medicine. Our Tulsi Honey infuses pure wildflower honey with fresh tulsi leaves, creating a uniquely aromatic and therapeutic blend. Known for its stress-relieving, antibacterial, and adaptogenic properties, this honey is a daily wellness ritual in one beautiful jar.',
    price: 449,
    originalPrice: 549,
    category: 'Flavoured Honey',
    tags: ['tulsi', 'ayurvedic', 'sacred', 'wellness', 'flavoured'],
    images: ['/images/300G MULTI.png'],
    weightOptions: [
      { label: '250g', price: 449, grams: 250 },
      { label: '500g', price: 849, grams: 500 },
    ],
    inStock: true,
    stockQuantity: 67,
    rating: 4.8,
    reviewCount: 203,
    featured: false,
    badge: null,
  },
  {
    id: 5,
    slug: 'combo-pack',
    name: 'Trio Honey Gift Pack',
    shortDescription: 'Three premium varieties — Wildflower, Western Ghats Forest & Ginger in gift packaging.',
    description: 'Our curated Trio Gift Pack brings together three of our finest honeys — Wildflower, Western Ghats Forest, and Ginger Infused — in beautiful premium packaging. Perfect for gifting or for the discerning honey lover who wants to experience the full range of Padpu Farms\' offerings. Each 250g jar is carefully packed in a handcrafted wooden gift box.',
    price: 1299,
    originalPrice: 1697,
    category: 'Gift Packs',
    tags: ['gift', 'combo', 'trio', 'premium', 'bestseller'],
    images: ['/images/50g 4 pack.png', '/images/1 gift.png'],
    weightOptions: [
      { label: '3×250g', price: 1299, grams: 750 },
      { label: '3×500g', price: 2399, grams: 1500 },
    ],
    inStock: true,
    stockQuantity: 32,
    rating: 5.0,
    reviewCount: 98,
    featured: true,
    badge: null,
  },
  {
    id: 6,
    slug: 'luxury-gift-box',
    name: 'Royal Luxury Gift Box',
    shortDescription: 'All 5 varieties in an exquisite hand-crafted wooden box with honey dipper.',
    description: 'The pinnacle of honey gifting — our Royal Luxury Gift Box contains all five signature Padpu Farms honeys in a stunning hand-crafted wooden box, accompanied by a traditional honey dipper, recipe cards, and a personalized note. This is the ultimate gift for anyone who appreciates the finest natural products. Perfect for corporate gifting, weddings, and special occasions.',
    price: 2499,
    originalPrice: 3199,
    category: 'Gift Packs',
    tags: ['luxury', 'gift', 'royal', 'premium', 'corporate'],
    images: ['/images/comb gift.png', '/images/1 gift.png'],
    weightOptions: [
      { label: 'Complete Set', price: 2499, grams: 1250 },
    ],
    inStock: true,
    stockQuantity: 15,
    rating: 5.0,
    reviewCount: 47,
    featured: false,
    badge: null,
  },
  {
    id: 7,
    slug: 'mustard-honey',
    name: 'Mustard Blossom Honey',
    shortDescription: 'Light, creamy honey from mustard fields — naturally crystallizes beautifully.',
    description: 'Harvested during the golden mustard season in the Punjab plains, this honey is distinctively light, creamy, and mild in flavour. It naturally crystallizes into a smooth, spreadable consistency — a sign of pure, unadulterated honey. Excellent as a bread spread, in baking, or as a natural face mask ingredient. Loved by health enthusiasts for its gentle taste.',
    price: 299,
    originalPrice: 379,
    category: 'Pure Honey',
    tags: ['mustard', 'creamy', 'crystallized', 'pure', 'mild'],
    images: ['/images/400 G MULTI.png'],
    weightOptions: [
      { label: '250g', price: 299, grams: 250 },
      { label: '500g', price: 549, grams: 500 },
      { label: '1kg', price: 999, grams: 1000 },
    ],
    inStock: true,
    stockQuantity: 200,
    rating: 4.6,
    reviewCount: 134,
    featured: false,
    badge: null,
  },
  {
    id: 8,
    slug: 'cinnamon-honey',
    name: 'Cinnamon Spice Honey',
    shortDescription: 'Ceylon cinnamon blended with pure honey for warmth and wellness.',
    description: 'True Ceylon cinnamon — the finest in the world — is carefully blended with our pure wildflower honey to create this warming, aromatic delight. The combination is known to support blood sugar regulation, heart health, and provide anti-inflammatory benefits. The sweet floral notes of our honey perfectly complement the gentle warmth of premium cinnamon.',
    price: 429,
    originalPrice: 529,
    category: 'Flavoured Honey',
    tags: ['cinnamon', 'spice', 'wellness', 'flavoured', 'warm'],
    images: ['/images/300G MULTI.png'],
    weightOptions: [
      { label: '250g', price: 429, grams: 250 },
      { label: '500g', price: 799, grams: 500 },
    ],
    inStock: false,
    stockQuantity: 0,
    rating: 4.9,
    reviewCount: 211,
    featured: false,
    badge: null,
  },
];

const initialGallery = [
  {
    title: 'Premium Multi-floral Honey',
    description: 'Fresh from the harvest',
    category: 'Products',
    image: '/images/300G MULTI.png',
  },
  {
    title: 'Golden Honey Jar',
    description: 'Pure and unfiltered',
    category: 'Products',
    image: '/images/400 G MULTI.png',
  },
  {
    title: 'The Farm',
    description: 'Our organic farm nestled in the foothills of the Himalayas',
    category: 'Farm',
    image: '/images/beehive-forest.png',
  },
  {
    title: 'Mini Gift Pack',
    description: 'Perfect sampler set',
    category: 'Gift Packs',
    image: '/images/50g 4 pack.png',
  },
  {
    title: 'Premium Gift Set',
    description: 'The ideal gift for your loved ones',
    category: 'Gift Packs',
    image: '/images/1 gift.png',
  },
  {
    title: 'Honeycomb Box',
    description: 'Fresh honeycomb straight from the hive',
    category: 'Harvest',
    image: '/images/comb gift.png',
  },
];

async function columnExists(connection, dbName, tableName, columnName) {
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME 
     FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [dbName, tableName, columnName]
  );
  return rows.length > 0;
}

async function addColumnIfNotExists(connection, dbName, tableName, columnName, columnDefinition) {
  const exists = await columnExists(connection, dbName, tableName, columnName);
  if (!exists) {
    console.log(`[Migration] Adding column ${columnName} to ${tableName}...`);
    await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnDefinition}`);
    console.log(`[Migration] Added column ${columnName} to ${tableName}`);
  }
}

async function initDB() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'padpu_db';

  console.log(`\n========================================`);
  console.log(`  PADPU DATABASE INITIALIZER & MIGRATOR `);
  console.log(`========================================`);
  console.log(`Connecting to MySQL server at ${host} as ${user}...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      user,
      password,
      multipleStatements: true,
    });
    console.log('Successfully connected to MySQL server.');

    // 1. Create DB if not exists
    console.log(`Ensuring database '${dbName}' exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);
    console.log(`Database '${dbName}' is ready.`);

    // 2. Run init.sql to ensure all base tables exist
    console.log('Running init.sql schema...');
    const sqlPath = path.join(process.cwd(), 'init.sql');
    const sqlScript = await fs.readFile(sqlPath, 'utf8');
    await connection.query(sqlScript);
    console.log('Base schema verified.');

    // 3. Migrate columns for all tables
    console.log('\n--- Checking & Migrating Table Columns ---');

    // cart_items migrations
    await addColumnIfNotExists(connection, dbName, 'cart_items', 'weight_grams', 'INT DEFAULT 0 AFTER weight_label');

    // products migrations
    await addColumnIfNotExists(connection, dbName, 'products', 'stockQuantity', 'INT DEFAULT 0 AFTER inStock');
    await addColumnIfNotExists(connection, dbName, 'products', 'rating', 'DECIMAL(2,1) DEFAULT 5.0 AFTER stockQuantity');
    await addColumnIfNotExists(connection, dbName, 'products', 'reviewCount', 'INT DEFAULT 0 AFTER rating');
    await addColumnIfNotExists(connection, dbName, 'products', 'tags', 'JSON AFTER reviewCount');
    await addColumnIfNotExists(connection, dbName, 'products', 'badge', 'VARCHAR(100) AFTER tags');

    // orders migrations
    await addColumnIfNotExists(connection, dbName, 'orders', 'razorpay_order_id', 'VARCHAR(255) AFTER orderStatus');
    await addColumnIfNotExists(connection, dbName, 'orders', 'razorpay_payment_id', 'VARCHAR(255) AFTER razorpay_order_id');
    await addColumnIfNotExists(connection, dbName, 'orders', 'user_id', 'INT NULL AFTER razorpay_payment_id');
    await addColumnIfNotExists(connection, dbName, 'orders', 'discount', 'DECIMAL(10,2) DEFAULT 0 AFTER shippingCharge');

    // users migrations
    await addColumnIfNotExists(connection, dbName, 'users', 'location', 'VARCHAR(255) AFTER password');
    await addColumnIfNotExists(connection, dbName, 'users', 'role', "VARCHAR(50) DEFAULT 'user' AFTER location");

    // messages migrations
    await addColumnIfNotExists(connection, dbName, 'messages', 'status', "VARCHAR(20) DEFAULT 'unread' AFTER message");

    console.log('All table columns migrated and up-to-date.');

    // 4. Seeding Initial Data
    console.log('\n--- Seeding Initial Data (if not present) ---');

    // Categories
    for (const cat of initialCategories) {
      await connection.query(
        'INSERT IGNORE INTO categories (name) VALUES (?)',
        [cat]
      );
    }
    console.log(`Categories verified (${initialCategories.length} categories).`);

    // Products
    const [existingProducts] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (existingProducts[0].count === 0) {
      console.log('Seeding initial products...');
      for (const p of initialProducts) {
        await connection.query(
          `INSERT INTO products 
           (id, slug, name, shortDescription, description, category_name, price, originalPrice, inStock, stockQuantity, rating, reviewCount, tags, badge, featured, weightOptions, images)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id, p.slug, p.name, p.shortDescription, p.description, p.category,
            p.price, p.originalPrice, p.inStock, p.stockQuantity, p.rating, p.reviewCount,
            JSON.stringify(p.tags), p.badge, p.featured,
            JSON.stringify(p.weightOptions), JSON.stringify(p.images)
          ]
        );
      }
      console.log(`Seeded ${initialProducts.length} initial products.`);
    } else {
      console.log(`Products already present (${existingProducts[0].count} products).`);
    }

    // Gallery
    const [existingGallery] = await connection.query('SELECT COUNT(*) as count FROM gallery');
    if (existingGallery[0].count === 0) {
      console.log('Seeding initial gallery images...');
      for (const g of initialGallery) {
        await connection.query(
          'INSERT INTO gallery (title, description, category, image) VALUES (?, ?, ?, ?)',
          [g.title, g.description, g.category, g.image]
        );
      }
      console.log(`Seeded ${initialGallery.length} gallery images.`);
    } else {
      console.log(`Gallery images already present (${existingGallery[0].count} images).`);
    }

    // Settings
    const [existingSettings] = await connection.query('SELECT COUNT(*) as count FROM settings');
    if (existingSettings[0].count === 0) {
      console.log('Seeding initial store settings...');
      await connection.query(
        'INSERT INTO settings (id, email, phone, address) VALUES (1, ?, ?, ?)',
        ['hello@padpufarms.com', '+91 98765 43210', 'Padpu Farms, Dakshina Kannada, Karnataka, India']
      );
      console.log('Store settings seeded.');
    } else {
      console.log('Store settings already present.');
    }

    // Admin User
    const [existingAdmin] = await connection.query('SELECT id FROM users WHERE email = ?', ['admin@padpu.com']);
    if (existingAdmin.length === 0) {
      console.log('Creating default admin account (admin@padpu.com / admin123)...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await connection.query(
        'INSERT INTO users (name, phonenumber, email, password, role) VALUES (?, ?, ?, ?, ?)',
        ['Admin', '9876543210', 'admin@padpu.com', hashedPassword, 'admin']
      );
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin account already exists.');
    }

    console.log(`\n========================================`);
    console.log(`  DATABASE INITIALIZATION COMPLETE!      `);
    console.log(`========================================\n`);

    await connection.end();
  } catch (error) {
    console.error('\nDatabase initialization failed:', error);
    if (connection) await connection.end().catch(() => {});
    process.exit(1);
  }
}

initDB();
