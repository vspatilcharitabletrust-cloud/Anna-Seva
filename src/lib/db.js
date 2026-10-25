import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';
import dns from 'dns';

// Force Node.js to prefer IPv4 resolution to prevent ENETUNREACH errors on networks with incomplete IPv6 support
dns.setDefaultResultOrder('ipv4first');

const { Pool } = pg;

let usePostgres = !!process.env.DATABASE_URL;
let pgPool = null;
let db = null;

function setupSqlite() {
  const RENDER_DISK_PATH = '/opt/render/project/src/data';
  const LOCAL_DB_DIR = path.resolve(process.cwd(), 'data');
  const DB_DIR = process.env.DB_DIR_PATH
    || (process.env.NODE_ENV === 'production' && fs.existsSync(RENDER_DISK_PATH)
      ? RENDER_DISK_PATH
      : LOCAL_DB_DIR);

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const DB_PATH = path.join(DB_DIR, 'food_seva.db');
  console.log(`[Anna Seva] SQLite database path: ${DB_PATH}`);
  db = new DatabaseSync(DB_PATH);
  
  db.exec('PRAGMA busy_timeout = 10000;');
  db.exec('PRAGMA journal_mode = WAL;');
}

if (usePostgres) {
  console.log('[Anna Seva] Attempting to use Supabase/PostgreSQL database.');
} else {
  setupSqlite();
}

// Helper to hash passwords
export function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// SQL translator to map SQLite syntax/placeholders to Postgres
export function translateSql(sql) {
  let paramIndex = 1;
  let translated = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (char === "'" && !inDoubleQuote && !inBacktick) {
      inSingleQuote = !inSingleQuote;
      translated += char;
    } else if (char === '"' && !inSingleQuote && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
      translated += char;
    } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
      translated += char;
    } else if (char === '?' && !inSingleQuote && !inDoubleQuote && !inBacktick) {
      translated += `$${paramIndex++}`;
    } else {
      translated += char;
    }
  }

  // Replace SQLite specific datetime function with Postgres CURRENT_TIMESTAMP
  translated = translated.replace(/datetime\('now',\s*'localtime'\)/gi, 'CURRENT_TIMESTAMP');
  
  // Convert SQLite LIKE to case-insensitive Postgres ILIKE
  translated = translated.replace(/\bLIKE\b/gi, 'ILIKE');

  // Handle special INSERT OR IGNORE for state seeding
  if (/INSERT\s+OR\s+IGNORE\s+INTO\s+states\s+\(name\)\s+VALUES\s+\((.*?)\)/i.test(translated)) {
    translated = translated.replace(
      /INSERT\s+OR\s+IGNORE\s+INTO\s+states\s+\(name\)\s+VALUES\s+\((.*?)\)/i,
      'INSERT INTO states (name) VALUES ($1) ON CONFLICT (name) DO NOTHING'
    );
  }

  return translated;
}

let dbInitialized = false;
let dbInitializationPromise = null;

export async function ensureDbInitialized() {
  if (dbInitialized) return;
  if (dbInitializationPromise) {
    return dbInitializationPromise;
  }

  dbInitializationPromise = (async () => {
    try {
      await initDB();
      dbInitialized = true;
      console.log('[Anna Seva] Database initialization finished.');
    } catch (error) {
      dbInitializationPromise = null; // Reset to allow retry
      console.error('[Anna Seva] Failed to initialize database:', error);
      throw error;
    }
  })();

  return dbInitializationPromise;
}

// Database helper functions (asynchronous wrapper)
export const query = {
  async exec(sql) {
    await ensureDbInitialized();
    if (usePostgres) {
      return await pgPool.query(translateSql(sql));
    } else {
      return db.exec(sql);
    }
  },
  
  async all(sql, params = []) {
    await ensureDbInitialized();
    if (usePostgres) {
      const pgSql = translateSql(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows;
    } else {
      const rows = db.prepare(sql).all(...params);
      return Array.isArray(rows) ? rows.map(r => ({ ...r })) : [];
    }
  },

  async get(sql, params = []) {
    await ensureDbInitialized();
    if (usePostgres) {
      const pgSql = translateSql(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows[0] || null;
    } else {
      const row = db.prepare(sql).get(...params);
      return row ? { ...row } : null;
    }
  },

  async run(sql, params = []) {
    await ensureDbInitialized();
    if (usePostgres) {
      let pgSql = translateSql(sql);
      const isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
      if (isInsert && !pgSql.trim().toUpperCase().includes('RETURNING')) {
        pgSql += ' RETURNING id';
      }
      const res = await pgPool.query(pgSql, params);
      const lastInsertRowid = res.rows[0]?.id || null;
      return { lastInsertRowid, changes: res.rowCount };
    } else {
      return db.prepare(sql).run(...params);
    }
  }
};

// Initialize tables and seed data
export async function initDB() {
  if (usePostgres) {
    try {
      console.log('[Anna Seva] Initializing PostgreSQL tables...');
      
      if (!pgPool) {
        let connectionString = process.env.DATABASE_URL;
        
        try {
          const dbUrl = new URL(connectionString);
          const hostname = dbUrl.hostname;
          
          if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) && !hostname.includes(':')) {
            if (hostname.startsWith('db.') && (hostname.endsWith('.supabase.co') || hostname.endsWith('.supabase.net'))) {
              console.warn('[Anna Seva] WARNING: You are using a direct connection URL (db.*.supabase.co) which is IPv6-only. Render\'s network does not support IPv6 outbound traffic, which will cause ENETUNREACH. Please update your DATABASE_URL in Render to use the connection pooler URL (e.g., *.pooler.supabase.com) which supports IPv4.');
            }
            console.log(`[Anna Seva] Resolving database hostname ${hostname} to IPv4...`);
            const { address } = await dns.promises.lookup(hostname, { family: 4 });
            console.log(`[Anna Seva] Resolved database hostname ${hostname} to IPv4: ${address}`);
            dbUrl.hostname = address;
            connectionString = dbUrl.toString();
          }
        } catch (dnsError) {
          console.warn('[Anna Seva] Database hostname resolution to IPv4 failed, using default hostname:', dnsError.message);
        }

        const poolConfig = {
          connectionString,
          connectionTimeoutMillis: 4000, // Timeout after 4 seconds to prevent long hangs
        };
        
        if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL.includes('supabase.co') || process.env.DATABASE_URL.includes('supabase')) {
          poolConfig.ssl = {
            rejectUnauthorized: false
          };
        }
        
        pgPool = new Pool(poolConfig);
        
        // Register an error listener to prevent unhandled process crashes from idle pool clients
        pgPool.on('error', (err) => {
          console.error('[Anna Seva] Unexpected error on idle PostgreSQL client:', err.message);
        });
      }
      
      // Test connection with a simple query first (will throw if DNS/connection fails)
      await pgPool.query('SELECT 1');
      
      await initPostgresDB();
      console.log('[Anna Seva] PostgreSQL tables initialized and seeded successfully.');
    } catch (error) {
      console.warn('[Anna Seva] PostgreSQL connection/initialization failed:', error.message);
      console.log('[Anna Seva] Falling back to local SQLite database...');
      
      if (pgPool) {
        try {
          await pgPool.end();
        } catch (endErr) {
          console.error('[Anna Seva] Error ending PostgreSQL pool:', endErr.message);
        }
        pgPool = null;
      }
      
      usePostgres = false;
      setupSqlite();
      await initSQLiteDB();
    }
  } else {
    await initSQLiteDB();
  }
}

// PostgreSQL tables setup
async function initPostgresDB() {
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS states (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS cities (
      id SERIAL PRIMARY KEY,
      state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK(role IN ('donor', 'admin')),
      mobile VARCHAR(20),
      address TEXT,
      state_id INTEGER REFERENCES states(id) ON DELETE SET NULL,
      city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      plain_password VARCHAR(255),
      reset_token VARCHAR(255),
      reset_token_expiry TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  try {
    await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS plain_password VARCHAR(255)');
    await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)');
    await pgPool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP WITH TIME ZONE');
  } catch (e) {
    console.log('[Anna Seva] PostgreSQL users table alter skipped or already applied:', e.message);
  }

  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS food_listings (
      id SERIAL PRIMARY KEY,
      donor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      contact_person VARCHAR(255) NOT NULL,
      mobile VARCHAR(20) NOT NULL,
      food_items TEXT NOT NULL,
      description TEXT,
      address TEXT NOT NULL,
      state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'claimed', 'expired', 'approved')),
      photos TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  try {
    await pgPool.query('ALTER TABLE food_listings ADD COLUMN IF NOT EXISTS photos TEXT');
  } catch (e) {
    console.log('[Anna Seva] PostgreSQL food_listings photos alter skipped or already applied:', e.message);
  }

  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS requests (
      id SERIAL PRIMARY KEY,
      listing_id INTEGER NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
      requester_name VARCHAR(255) NOT NULL,
      requester_mobile VARCHAR(20) NOT NULL,
      address TEXT NOT NULL,
      state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      quantity VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'approved', 'rejected', 'completed')),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      mobile VARCHAR(20) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'read')),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id VARCHAR(50) PRIMARY KEY,
      about_text TEXT NOT NULL,
      contact_text TEXT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS annadan_sankalps (
      id SERIAL PRIMARY KEY,
      donor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      donor_name VARCHAR(255) NOT NULL,
      donor_email VARCHAR(255) NOT NULL,
      donor_mobile VARCHAR(25) NOT NULL,
      occasion_type VARCHAR(50) NOT NULL,
      honoree_name VARCHAR(255) NOT NULL,
      honoree_relation VARCHAR(100),
      honoree_photo TEXT,
      event_date DATE NOT NULL,
      meals_target INTEGER NOT NULL DEFAULT 50,
      meal_type VARCHAR(100) DEFAULT 'Festive Thali & Sweets',
      state_id INTEGER REFERENCES states(id) ON DELETE SET NULL,
      city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
      preferred_beneficiary VARCHAR(150),
      dedication_message TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pledged',
      conducted_date DATE,
      meals_served INTEGER,
      drive_location_name VARCHAR(255),
      drive_photos TEXT,
      certificate_code VARCHAR(100) UNIQUE NOT NULL,
      whatsapp_sent INTEGER NOT NULL DEFAULT 0,
      email_sent INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);

  // --- SEED DATA ---
  const adminCheck = await pgPool.query("SELECT id FROM users WHERE role = 'admin'");
  if (adminCheck.rows.length === 0) {
    await pgPool.query(
      "INSERT INTO users (name, email, password, plain_password, role, mobile, address, status) VALUES ($1, $2, $3, 'Hriday@1234', 'admin', '9999999999', 'Admin HQ, New Delhi', 'approved')",
      ['System Admin', 'admin@annaseva.org', hashPassword('Hriday@1234')]
    );
  } else {
    try {
      await pgPool.query("UPDATE users SET password = $1, plain_password = 'Hriday@1234', status = 'approved' WHERE role = 'admin'", [hashPassword('Hriday@1234')]);
    } catch (e) {}
  }

  const pagesCheck = await pgPool.query("SELECT id FROM pages WHERE id = 'main'");
  if (pagesCheck.rows.length === 0) {
    await pgPool.query(
      "INSERT INTO pages (id, about_text, contact_text) VALUES ($1, $2, $3)",
      [
        'main',
        'Anna Seva is a non-profit initiative dedicated to reducing food waste and hunger. We connect generous donors who have surplus food with people, shelters, and NGOs who need it. Our system coordinates logistics, city coverage, and verification to make sure meals are delivered safely and efficiently.',
        'You can reach the Anna Seva helpline at info@annaseva.org, or visit our central coordination office at Seva Bhawan, New Delhi. Mobile: +91 1800-111-222.'
      ]
    );
  }

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry', 
    'Chandigarh', 'Andaman and Nicobar Islands', 'Ladakh'
  ];
  for (const s of states) {
    await pgPool.query('INSERT INTO states (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [s]);
  }

  const citiesData = [
    { state: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati'] },
    { state: 'Arunachal Pradesh', cities: ['Itanagar', 'Naharlagun', 'Tawang'] },
    { state: 'Assam', cities: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat'] },
    { state: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'] },
    { state: 'Chhattisgarh', cities: ['Raipur', 'Bhilai', 'Bilaspur'] },
    { state: 'Goa', cities: ['Panaji', 'Margao', 'Vasco da Gama'] },
    { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'] },
    { state: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'] },
    { state: 'Himachal Pradesh', cities: ['Shimla', 'Dharamshala', 'Solan'] },
    { state: 'Jammu and Kashmir', cities: ['Srinagar', 'Jammu', 'Anantnag'] },
    { state: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'] },
    { state: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi'] },
    { state: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'] },
    { state: 'Madhya Pradesh', cities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'] },
    { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Kolhapur', 'Latur', 'Solapur'] },
    { state: 'Manipur', cities: ['Imphal', 'Thoubal'] },
    { state: 'Meghalaya', cities: ['Shillong', 'Tura'] },
    { state: 'Mizoram', cities: ['Aizawl', 'Lunglei'] },
    { state: 'Nagaland', cities: ['Kohima', 'Dimapur'] },
    { state: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur'] },
    { state: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'] },
    { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'] },
    { state: 'Sikkim', cities: ['Gangtok', 'Namchi'] },
    { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'] },
    { state: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam'] },
    { state: 'Tripura', cities: ['Agartala', 'Udaipur'] },
    { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Agra', 'Varanasi', 'Allahabad', 'Aligarh', 'Meerut'] },
    { state: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Haldwani', 'Roorkee'] },
    { state: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'] },
    { state: 'Delhi', cities: ['New Delhi', 'Dwarka', 'Rohini', 'Saket'] },
    { state: 'Puducherry', cities: ['Puducherry', 'Karaikal'] },
    { state: 'Chandigarh', cities: ['Chandigarh'] },
    { state: 'Andaman and Nicobar Islands', cities: ['Port Blair'] },
    { state: 'Ladakh', cities: ['Leh', 'Kargil'] }
  ];

  for (const item of citiesData) {
    const stateRes = await pgPool.query("SELECT id FROM states WHERE name = $1", [item.state]);
    if (stateRes.rows.length === 0) continue;
    const stateId = stateRes.rows[0].id;

    for (const c of item.cities) {
      const cityCheck = await pgPool.query("SELECT id FROM cities WHERE state_id = $1 AND name = $2", [stateId, c]);
      if (cityCheck.rows.length === 0) {
        await pgPool.query("INSERT INTO cities (state_id, name) VALUES ($1, $2)", [stateId, c]);
      }
    }
  }

  // Seed Donors
  const donorCountRes = await pgPool.query("SELECT COUNT(*) as count FROM users WHERE role = 'donor'");
  const donorCount = parseInt(donorCountRes.rows[0].count, 10);
  if (donorCount === 0) {
    const mhRes = await pgPool.query("SELECT id FROM states WHERE name = 'Maharashtra'");
    const mh = mhRes.rows[0]?.id;
    
    let pune;
    let latur;

    const puneRes = await pgPool.query("SELECT id FROM cities WHERE name = 'Pune'");
    if (puneRes.rows.length > 0) {
      pune = puneRes.rows[0].id;
    } else if (mh) {
      const insertCityRes = await pgPool.query('INSERT INTO cities (state_id, name) VALUES ($1, $2) RETURNING id', [mh, 'Pune']);
      pune = insertCityRes.rows[0].id;
    }

    const laturRes = await pgPool.query("SELECT id FROM cities WHERE name = 'Latur'");
    if (laturRes.rows.length > 0) {
      latur = laturRes.rows[0].id;
    } else if (mh) {
      const insertCityRes = await pgPool.query('INSERT INTO cities (state_id, name) VALUES ($1, $2) RETURNING id', [mh, 'Latur']);
      latur = insertCityRes.rows[0].id;
    }

    if (mh && pune && latur) {
      await pgPool.query(`
        INSERT INTO users (name, email, password, plain_password, role, mobile, address, state_id, city_id, status)
        VALUES ($1, $2, $3, 'Hriday@1234', 'donor', $4, $5, $6, $7, 'approved')
      `, ['Hridaynath Patil', 'hriday@donor.com', hashPassword('Hriday@1234'), '7666484077', 'Vanaz Metro Station, Kothrud', mh, pune]);

      await pgPool.query(`
        INSERT INTO users (name, email, password, plain_password, role, mobile, address, state_id, city_id, status)
        VALUES ($1, $2, $3, 'Hriday@1234', 'donor', $4, $5, $6, $7, 'approved')
      `, ['Bhagwat Patil', 'bhagwat@donor.com', hashPassword('Hriday@1234'), '9420434447', 'Matoshree Empire, Latur', mh, latur]);
    }
  } else {
    try {
      await pgPool.query("UPDATE users SET password = $1, plain_password = 'Hriday@1234', status = 'approved' WHERE email = 'hriday@donor.com'", [hashPassword('Hriday@1234')]);
      await pgPool.query("UPDATE users SET password = $1, plain_password = 'Hriday@1234', status = 'approved' WHERE email = 'bhagwat@donor.com'", [hashPassword('Hriday@1234')]);
    } catch (e) {}
  }

  // Seed Food Listings
  const listingCountRes = await pgPool.query('SELECT COUNT(*) as count FROM food_listings');
  const listingCount = parseInt(listingCountRes.rows[0].count, 10);
  if (listingCount === 0) {
    const hridayRes = await pgPool.query("SELECT * FROM users WHERE email = 'hriday@donor.com'");
    const bhagwatRes = await pgPool.query("SELECT * FROM users WHERE email = 'bhagwat@donor.com'");
    const hriday = hridayRes.rows[0];
    const bhagwat = bhagwatRes.rows[0];

    if (hriday && bhagwat) {
      await pgPool.query(`
        INSERT INTO food_listings (donor_id, contact_person, mobile, food_items, description, address, state_id, city_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [hriday.id, hriday.name, hriday.mobile, 'Chapati', 'For 100 People (Quantity: 100)', hriday.address, hriday.state_id, hriday.city_id, 'approved']);
      
      await pgPool.query(`
        INSERT INTO food_listings (donor_id, contact_person, mobile, food_items, description, address, state_id, city_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [hriday.id, hriday.name, hriday.mobile, 'Icecream', 'For 100 People (Quantity: 100)', hriday.address, hriday.state_id, hriday.city_id, 'approved']);
      
      await pgPool.query(`
        INSERT INTO food_listings (donor_id, contact_person, mobile, food_items, description, address, state_id, city_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [hriday.id, hriday.name, hriday.mobile, 'Dalkhicdi', 'For 100 People (Quantity: 100)', hriday.address, hriday.state_id, hriday.city_id, 'claimed']);

      await pgPool.query(`
        INSERT INTO food_listings (donor_id, contact_person, mobile, food_items, description, address, state_id, city_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [bhagwat.id, bhagwat.name, bhagwat.mobile, 'Thali', 'For 100 People (Quantity: 100)', bhagwat.address, bhagwat.state_id, bhagwat.city_id, 'approved']);
      
      await pgPool.query(`
        INSERT INTO food_listings (donor_id, contact_person, mobile, food_items, description, address, state_id, city_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [bhagwat.id, bhagwat.name, bhagwat.mobile, 'Veg Pulav', 'For 100 People (Quantity: 100)', bhagwat.address, bhagwat.state_id, bhagwat.city_id, 'claimed']);
    }
  }

  // Seed Requests
  const requestCountRes = await pgPool.query('SELECT COUNT(*) as count FROM requests');
  const requestCount = parseInt(requestCountRes.rows[0].count, 10);
  if (requestCount === 0) {
    const mhRes = await pgPool.query("SELECT id FROM states WHERE name = 'Maharashtra'");
    const puneRes = await pgPool.query("SELECT id FROM cities WHERE name = 'Pune'");
    const laturRes = await pgPool.query("SELECT id FROM cities WHERE name = 'Latur'");

    const mh = mhRes.rows[0]?.id;
    const pune = puneRes.rows[0]?.id;
    const latur = laturRes.rows[0]?.id;

    const chapatiRes = await pgPool.query("SELECT id FROM food_listings WHERE food_items = 'Chapati'");
    const icecreamRes = await pgPool.query("SELECT id FROM food_listings WHERE food_items = 'Icecream'");
    const dalkhicdiRes = await pgPool.query("SELECT id FROM food_listings WHERE food_items = 'Dalkhicdi'");
    const thaliRes = await pgPool.query("SELECT id FROM food_listings WHERE food_items = 'Thali'");
    const vegPulavRes = await pgPool.query("SELECT id FROM food_listings WHERE food_items = 'Veg Pulav'");

    const chapati = chapatiRes.rows[0]?.id;
    const icecream = icecreamRes.rows[0]?.id;
    const dalkhicdi = dalkhicdiRes.rows[0]?.id;
    const thali = thaliRes.rows[0]?.id;
    const vegPulav = vegPulavRes.rows[0]?.id;

    if (mh && pune && latur && chapati && icecream && dalkhicdi && thali && vegPulav) {
      await pgPool.query(`
        INSERT INTO requests (listing_id, requester_name, requester_mobile, address, state_id, city_id, reason, quantity, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [chapati, 'Sewa Foundation', '9876543210', 'Near Kothrud Depot, Pune', mh, pune, 'Distribution to roadside dwellers', '80 plates', 'approved']);
      
      await pgPool.query(`
        INSERT INTO requests (listing_id, requester_name, requester_mobile, address, state_id, city_id, reason, quantity, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [icecream, 'Hope Orphanage', '9822334455', 'Senapati Bapat Road, Pune', mh, pune, 'Dessert for kids after dinner drive', '100 cups', 'approved']);
      
      await pgPool.query(`
        INSERT INTO requests (listing_id, requester_name, requester_mobile, address, state_id, city_id, reason, quantity, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [dalkhicdi, 'Annapurna Kitchen', '9158000999', 'Deccan Gymkhana, Pune', mh, pune, 'Senior citizen home dinner distribution', '90 packs', 'completed']);

      await pgPool.query(`
        INSERT INTO requests (listing_id, requester_name, requester_mobile, address, state_id, city_id, reason, quantity, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [thali, 'Latur Relief NGO', '9405001122', 'Gandhi Chowk, Latur', mh, latur, 'Free meals for patients relatives at civil hospital', '100 Thalis', 'approved']);
      
      await pgPool.query(`
        INSERT INTO requests (listing_id, requester_name, requester_mobile, address, state_id, city_id, reason, quantity, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [vegPulav, 'Samarpan Trust', '9850123456', 'Ausa Road, Latur', mh, latur, 'Slum area feeding program', '100 plates', 'completed']);
    }
  }

  // Seed sample Enquiry
  const enquiryCountRes = await pgPool.query('SELECT COUNT(*) as count FROM enquiries');
  const enquiryCount = parseInt(enquiryCountRes.rows[0].count, 10);
  if (enquiryCount === 0) {
    await pgPool.query(`
      INSERT INTO enquiries (name, email, mobile, message, status, created_at)
      VALUES ($1, $2, $3, $4, 'new', $5)
    `, ['Amit Sharma', 'amit@gmail.com', '9898989898', 'I would like to volunteer as a delivery partner in Mumbai.', new Date('2026-06-03 14:00:00')]);
  }

  // Seed Annadan Sankalps (Commemorative Meal Dedications)
  const sankalpCountRes = await pgPool.query('SELECT COUNT(*) as count FROM annadan_sankalps');
  const sankalpCount = parseInt(sankalpCountRes.rows[0].count, 10);
  if (sankalpCount === 0) {
    const hridayRes = await pgPool.query("SELECT id FROM users WHERE email = 'hriday@donor.com'");
    const bhagwatRes = await pgPool.query("SELECT id FROM users WHERE email = 'bhagwat@donor.com'");
    const hridayId = hridayRes.rows[0]?.id;
    const bhagwatId = bhagwatRes.rows[0]?.id;

    const mhRes = await pgPool.query("SELECT id FROM states WHERE name = 'Maharashtra'");
    const puneRes = await pgPool.query("SELECT id FROM cities WHERE name = 'Pune'");
    const laturRes = await pgPool.query("SELECT id FROM cities WHERE name = 'Latur'");

    const mh = mhRes.rows[0]?.id;
    const pune = puneRes.rows[0]?.id;
    const latur = laturRes.rows[0]?.id;

    await pgPool.query(`
      INSERT INTO annadan_sankalps (
        donor_id, donor_name, donor_email, donor_mobile, occasion_type, honoree_name, honoree_relation,
        event_date, meals_target, meal_type, state_id, city_id, preferred_beneficiary,
        dedication_message, status, conducted_date, meals_served, drive_location_name,
        certificate_code, whatsapp_sent, email_sent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 0, 0)
    `, [
      bhagwatId, 'Bhagwat Patil', 'bhagwat@donor.com', '9420434447', 'birthday',
      'Aarav Patil (चि. आरव - 5वा वाढदिवस)', 'Son', '2026-11-10', 100,
      'Nutritious Khichdi, Fruits & Sweets', mh, pune, 'Orphanage / Children Shelters',
      'Praying for long life, great wisdom, and vibrant health for Aarav on his 5th Birthday with nourishing meals for underprivileged children.',
      'confirmed', null, null, 'Hope Children Home & Orphanage, Pune',
      'AS-SANKALP-2026-1002'
    ]);
  }
}

// SQLite schemas and seeds
async function initSQLiteDB() {
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY(state_id) REFERENCES states(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('donor', 'admin')),
      mobile TEXT,
      address TEXT,
      state_id INTEGER,
      city_id INTEGER,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      plain_password TEXT,
      reset_token TEXT,
      reset_token_expiry TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY(state_id) REFERENCES states(id) ON DELETE SET NULL,
      FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE SET NULL
    );
  `);

  try {
    db.exec("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected'));");
  } catch (e) {}
  try {
    db.exec("UPDATE users SET status = 'approved' WHERE role = 'admin';");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE users ADD COLUMN plain_password TEXT;");
  } catch (e) {}
  try {
    db.exec("UPDATE users SET plain_password = 'Hriday@1234' WHERE email IN ('hriday@donor.com', 'bhagwat@donor.com');");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE users ADD COLUMN reset_token TEXT;");
  } catch (e) {}
  try {
    db.exec("ALTER TABLE users ADD COLUMN reset_token_expiry TEXT;");
  } catch (e) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS food_listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id INTEGER NOT NULL,
      contact_person TEXT NOT NULL,
      mobile TEXT NOT NULL,
      food_items TEXT NOT NULL,
      description TEXT,
      address TEXT NOT NULL,
      state_id INTEGER NOT NULL,
      city_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'claimed', 'expired', 'approved')),
      photos TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY(donor_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(state_id) REFERENCES states(id) ON DELETE CASCADE,
      FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE CASCADE
    );
  `);

  try {
    db.exec("ALTER TABLE food_listings ADD COLUMN photos TEXT;");
  } catch (e) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      requester_name TEXT NOT NULL,
      requester_mobile TEXT NOT NULL,
      address TEXT NOT NULL,
      state_id INTEGER NOT NULL,
      city_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      quantity TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'approved', 'rejected', 'completed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY(listing_id) REFERENCES food_listings(id) ON DELETE CASCADE,
      FOREIGN KEY(state_id) REFERENCES states(id) ON DELETE CASCADE,
      FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'read')),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      about_text TEXT NOT NULL,
      contact_text TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS annadan_sankalps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id INTEGER,
      donor_name TEXT NOT NULL,
      donor_email TEXT NOT NULL,
      donor_mobile TEXT NOT NULL,
      occasion_type TEXT NOT NULL,
      honoree_name TEXT NOT NULL,
      honoree_relation TEXT,
      honoree_photo TEXT,
      event_date TEXT NOT NULL,
      meals_target INTEGER NOT NULL DEFAULT 50,
      meal_type TEXT DEFAULT 'Festive Thali & Sweets',
      state_id INTEGER,
      city_id INTEGER,
      preferred_beneficiary TEXT,
      dedication_message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pledged',
      conducted_date TEXT,
      meals_served INTEGER,
      drive_location_name TEXT,
      drive_photos TEXT,
      certificate_code TEXT UNIQUE NOT NULL,
      whatsapp_sent INTEGER NOT NULL DEFAULT 0,
      email_sent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY(donor_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY(state_id) REFERENCES states(id) ON DELETE SET NULL,
      FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE SET NULL
    );
  `);

  const adminCheck = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
  if (!adminCheck) {
    const insertAdmin = db.prepare(`
      INSERT INTO users (name, email, password, plain_password, role, mobile, address, status)
      VALUES (?, ?, ?, 'Hriday@1234', 'admin', '9999999999', 'Admin HQ, New Delhi', 'approved')
    `);
    insertAdmin.run('System Admin', 'admin@annaseva.org', hashPassword('Hriday@1234'));
  } else {
    try {
      db.prepare("UPDATE users SET password = ?, plain_password = 'Hriday@1234', status = 'approved' WHERE role = 'admin'").run(hashPassword('Hriday@1234'));
    } catch (e) {}
  }

  const pagesCheck = db.prepare("SELECT id FROM pages WHERE id = 'main'").get();
  if (!pagesCheck) {
    const insertPages = db.prepare(`
      INSERT INTO pages (id, about_text, contact_text)
      VALUES (?, ?, ?)
    `);
    insertPages.run(
      'main',
      'Anna Seva is a non-profit initiative dedicated to reducing food waste and hunger. We connect generous donors who have surplus food with people, shelters, and NGOs who need it. Our system coordinates logistics, city coverage, and verification to make sure meals are delivered safely and efficiently.',
      'You can reach the Anna Seva helpline at info@annaseva.org, or visit our central coordination office at Seva Bhawan, New Delhi. Mobile: +91 1800-111-222.'
    );
  }

  const statesList = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry', 
    'Chandigarh', 'Andaman and Nicobar Islands', 'Ladakh'
  ];
  const insertState = db.prepare('INSERT OR IGNORE INTO states (name) VALUES (?)');
  for (const s of statesList) {
    insertState.run(s);
  }

  const citiesData = [
    { state: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati'] },
    { state: 'Arunachal Pradesh', cities: ['Itanagar', 'Naharlagun', 'Tawang'] },
    { state: 'Assam', cities: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat'] },
    { state: 'Bihar', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'] },
    { state: 'Chhattisgarh', cities: ['Raipur', 'Bhilai', 'Bilaspur'] },
    { state: 'Goa', cities: ['Panaji', 'Margao', 'Vasco da Gama'] },
    { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'] },
    { state: 'Haryana', cities: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'] },
    { state: 'Himachal Pradesh', cities: ['Shimla', 'Dharamshala', 'Solan'] },
    { state: 'Jammu and Kashmir', cities: ['Srinagar', 'Jammu', 'Anantnag'] },
    { state: 'Jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'] },
    { state: 'Karnataka', cities: ['Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi'] },
    { state: 'Kerala', cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'] },
    { state: 'Madhya Pradesh', cities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'] },
    { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Kolhapur', 'Latur', 'Solapur'] },
    { state: 'Manipur', cities: ['Imphal', 'Thoubal'] },
    { state: 'Meghalaya', cities: ['Shillong', 'Tura'] },
    { state: 'Mizoram', cities: ['Aizawl', 'Lunglei'] },
    { state: 'Nagaland', cities: ['Kohima', 'Dimapur'] },
    { state: 'Odisha', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur'] },
    { state: 'Punjab', cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'] },
    { state: 'Rajasthan', cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'] },
    { state: 'Sikkim', cities: ['Gangtok', 'Namchi'] },
    { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'] },
    { state: 'Telangana', cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam'] },
    { state: 'Tripura', cities: ['Agartala', 'Udaipur'] },
    { state: 'Uttar Pradesh', cities: ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad', 'Agra', 'Varanasi', 'Allahabad', 'Aligarh', 'Meerut'] },
    { state: 'Uttarakhand', cities: ['Dehradun', 'Haridwar', 'Haldwani', 'Roorkee'] },
    { state: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'] },
    { state: 'Delhi', cities: ['New Delhi', 'Dwarka', 'Rohini', 'Saket'] },
    { state: 'Puducherry', cities: ['Puducherry', 'Karaikal'] },
    { state: 'Chandigarh', cities: ['Chandigarh'] },
    { state: 'Andaman and Nicobar Islands', cities: ['Port Blair'] },
    { state: 'Ladakh', cities: ['Leh', 'Kargil'] }
  ];

  const insertCity = db.prepare('INSERT INTO cities (state_id, name) VALUES (?, ?)');
  for (const item of citiesData) {
    const stateRow = db.prepare("SELECT id FROM states WHERE name = ?").get(item.state);
    if (!stateRow) continue;
    const stateId = stateRow.id;

    for (const c of item.cities) {
      const cityCheck = db.prepare("SELECT id FROM cities WHERE state_id = ? AND name = ?").get(stateId, c);
      if (!cityCheck) {
        insertCity.run(stateId, c);
      }
    }
  }

  // Seed Donors
  try {
    const donorCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'donor'").get()?.count;
    if (donorCount === 0) {
      const mh = db.prepare("SELECT id FROM states WHERE name = 'Maharashtra'").get()?.id;
      
      let pune;
      let latur;

      const puneRow = db.prepare("SELECT id FROM cities WHERE name = 'Pune'").get();
      if (puneRow) {
        pune = puneRow.id;
      } else if (mh) {
        const insertCity = db.prepare('INSERT INTO cities (state_id, name) VALUES (?, ?)');
        insertCity.run(mh, 'Pune');
        pune = db.prepare("SELECT id FROM cities WHERE name = 'Pune'").get()?.id;
      }

      const laturRow = db.prepare("SELECT id FROM cities WHERE name = 'Latur'").get();
      if (laturRow) {
        latur = laturRow.id;
      } else if (mh) {
        const insertCity = db.prepare('INSERT INTO cities (state_id, name) VALUES (?, ?)');
        insertCity.run(mh, 'Latur');
        latur = db.prepare("SELECT id FROM cities WHERE name = 'Latur'").get()?.id;
      }

      if (mh && pune && latur) {
        const insertDonor = db.prepare(`
          INSERT INTO users (name, email, password, plain_password, role, mobile, address, state_id, city_id, status)
          VALUES (?, ?, ?, 'Hriday@1234', 'donor', ?, ?, ?, ?, 'approved')
        `);

        insertDonor.run('Hridaynath Patil', 'hriday@donor.com', hashPassword('Hriday@1234'), '7666484077', 'Vanaz Metro Station, Kothrud', mh, pune);
        insertDonor.run('Bhagwat Patil', 'bhagwat@donor.com', hashPassword('Hriday@1234'), '9420434447', 'Matoshree Empire, Latur', mh, latur);
      }
    } else {
      try {
        db.prepare("UPDATE users SET password = ?, plain_password = 'Hriday@1234', status = 'approved' WHERE email = 'hriday@donor.com'").run(hashPassword('Hriday@1234'));
        db.prepare("UPDATE users SET password = ?, plain_password = 'Hriday@1234', status = 'approved' WHERE email = 'bhagwat@donor.com'").run(hashPassword('Hriday@1234'));
      } catch (e) {}
    }
  } catch (e) {
    console.error('Failed to seed donors:', e.message);
  }

  // Seed Food Listings
  try {
    const listingCount = db.prepare('SELECT COUNT(*) as count FROM food_listings').get()?.count;
    if (listingCount === 0) {
      const hriday = db.prepare("SELECT * FROM users WHERE email = 'hriday@donor.com'").get();
      const bhagwat = db.prepare("SELECT * FROM users WHERE email = 'bhagwat@donor.com'").get();

      if (hriday && bhagwat) {
        const insertListing = db.prepare(`
          INSERT INTO food_listings (donor_id, contact_person, mobile, food_items, description, address, state_id, city_id, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertListing.run(hriday.id, hriday.name, hriday.mobile, 'Chapati', 'For 100 People (Quantity: 100)', hriday.address, hriday.state_id, hriday.city_id, 'approved');
        insertListing.run(hriday.id, hriday.name, hriday.mobile, 'Icecream', 'For 100 People (Quantity: 100)', hriday.address, hriday.state_id, hriday.city_id, 'approved');
        insertListing.run(hriday.id, hriday.name, hriday.mobile, 'Dalkhicdi', 'For 100 People (Quantity: 100)', hriday.address, hriday.state_id, hriday.city_id, 'claimed');

        insertListing.run(bhagwat.id, bhagwat.name, bhagwat.mobile, 'Thali', 'For 100 People (Quantity: 100)', bhagwat.address, bhagwat.state_id, bhagwat.city_id, 'approved');
        insertListing.run(bhagwat.id, bhagwat.name, bhagwat.mobile, 'Veg Pulav', 'For 100 People (Quantity: 100)', bhagwat.address, bhagwat.state_id, bhagwat.city_id, 'claimed');
      }
    }
  } catch (e) {
    console.error('Failed to seed food listings:', e.message);
  }

  // Seed Requests
  try {
    const requestCount = db.prepare('SELECT COUNT(*) as count FROM requests').get()?.count;
    if (requestCount === 0) {
      const mh = db.prepare("SELECT id FROM states WHERE name = 'Maharashtra'").get()?.id;
      const pune = db.prepare("SELECT id FROM cities WHERE name = 'Pune'").get()?.id;
      const latur = db.prepare("SELECT id FROM cities WHERE name = 'Latur'").get()?.id;

      const chapati = db.prepare("SELECT id FROM food_listings WHERE food_items = 'Chapati'").get()?.id;
      const icecream = db.prepare("SELECT id FROM food_listings WHERE food_items = 'Icecream'").get()?.id;
      const dalkhicdi = db.prepare("SELECT id FROM food_listings WHERE food_items = 'Dalkhicdi'").get()?.id;
      const thali = db.prepare("SELECT id FROM food_listings WHERE food_items = 'Thali'").get()?.id;
      const vegPulav = db.prepare("SELECT id FROM food_listings WHERE food_items = 'Veg Pulav'").get()?.id;

      if (mh && pune && latur && chapati && icecream && dalkhicdi && thali && vegPulav) {
        const insertRequest = db.prepare(`
          INSERT INTO requests (listing_id, requester_name, requester_mobile, address, state_id, city_id, reason, quantity, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertRequest.run(chapati, 'Sewa Foundation', '9876543210', 'Near Kothrud Depot, Pune', mh, pune, 'Distribution to roadside dwellers', '80 plates', 'approved');
        insertRequest.run(icecream, 'Hope Orphanage', '9822334455', 'Senapati Bapat Road, Pune', mh, pune, 'Dessert for kids after dinner drive', '100 cups', 'approved');
        insertRequest.run(dalkhicdi, 'Annapurna Kitchen', '9158000999', 'Deccan Gymkhana, Pune', mh, pune, 'Senior citizen home dinner distribution', '90 packs', 'completed');

        insertRequest.run(thali, 'Latur Relief NGO', '9405001122', 'Gandhi Chowk, Latur', mh, latur, 'Free meals for patients relatives at civil hospital', '100 Thalis', 'approved');
        insertRequest.run(vegPulav, 'Samarpan Trust', '9850123456', 'Ausa Road, Latur', mh, latur, 'Slum area feeding program', '100 plates', 'completed');
      }
    }
  } catch (e) {
    console.error('Failed to seed requests:', e.message);
  }

  // Seed sample Enquiry
  try {
    const enquiryCount = db.prepare('SELECT COUNT(*) as count FROM enquiries').get()?.count;
    if (enquiryCount === 0) {
      const insertEnquiry = db.prepare(`
        INSERT INTO enquiries (name, email, mobile, message, status, created_at)
        VALUES (?, ?, ?, ?, 'new', ?)
      `);
      insertEnquiry.run('Amit Sharma', 'amit@gmail.com', '9898989898', 'I would like to volunteer as a delivery partner in Mumbai.', '2026-06-03 14:00:00');
    }
  } catch (e) {
    console.error('Failed to seed enquiries:', e.message);
  }

  // Seed Annadan Sankalps (Commemorative Meal Dedications)
  try {
    const sankalpCount = db.prepare('SELECT COUNT(*) as count FROM annadan_sankalps').get()?.count;
    if (sankalpCount === 0) {
      const hriday = db.prepare("SELECT id FROM users WHERE email = 'hriday@donor.com'").get()?.id;
      const bhagwat = db.prepare("SELECT id FROM users WHERE email = 'bhagwat@donor.com'").get()?.id;
      const mh = db.prepare("SELECT id FROM states WHERE name = 'Maharashtra'").get()?.id;
      const pune = db.prepare("SELECT id FROM cities WHERE name = 'Pune'").get()?.id;
      const latur = db.prepare("SELECT id FROM cities WHERE name = 'Latur'").get()?.id;

      const insertSankalp = db.prepare(`
        INSERT INTO annadan_sankalps (
          donor_id, donor_name, donor_email, donor_mobile, occasion_type, honoree_name, honoree_relation,
          event_date, meals_target, meal_type, state_id, city_id, preferred_beneficiary,
          dedication_message, status, conducted_date, meals_served, drive_location_name,
          certificate_code, whatsapp_sent, email_sent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertSankalp.run(
        bhagwat, 'Bhagwat Patil', 'bhagwat@donor.com', '9420434447', 'birthday',
        'Aarav Patil (चि. आरव - 5वा वाढदिवस)', 'Son', '2026-11-10', 100,
        'Nutritious Khichdi, Fruits & Sweets', mh, pune, 'Orphanage / Children Shelters',
        'Praying for long life, great wisdom, and vibrant health for Aarav on his 5th Birthday with nourishing meals for underprivileged children.',
        'confirmed', null, null, 'Hope Children Home & Orphanage, Pune',
        'AS-SANKALP-2026-1002', 0, 0
      );

      insertSankalp.run(
        hriday, 'Hridaynath Patil', 'hriday@donor.com', '7666484077', 'anniversary',
        'Smt. & Shri Bhagwat Patil (25वी लग्नगाठ - रौप्य महोत्सव)', 'Parents', '2026-12-04', 150,
        'Special Festive Meal & Kheer Puri', mh, latur, 'Civil Hospital Patient Relatives',
        'Heartiest congratulations to beloved Aai & Baba on their 25th Wedding Anniversary. Dedicated in gratitude with wholesome meals.',
        'pledged', null, null, 'Civil Hospital Food Distribution Drive, Latur',
        'AS-SANKALP-2026-1003', 0, 0
      );
    }
  } catch (e) {
    console.error('Failed to seed annadan_sankalps:', e.message);
  }
}

// Database will be initialized lazily on the first query
// Fallback logic automatically switches to SQLite if PostgreSQL fails
