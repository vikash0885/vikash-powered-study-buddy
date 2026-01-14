import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL === '1';
const dbPath = process.env.DATABASE_PATH || (isVercel
  ? path.join('/tmp', 'database.sqlite')
  : path.join(__dirname, '..', 'database.sqlite'));

let SQL;
let db;

// Initialize database
async function initDatabase() {
  const wasmPath = path.join(__dirname, '..', 'sql-wasm.wasm');
  SQL = await initSqlJs({
    locateFile: file => wasmPath
  });

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      education_level TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: Add avatar column if it doesn't exist
  try {
    db.run('ALTER TABLE users ADD COLUMN avatar TEXT');
  } catch (err) {
    // Column likely already exists, ignore error
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT,
      subject TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ Database initialized successfully');

  // Save database to file
  saveDatabase();
}

// Save database to file
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Wrapper class to mimic better-sqlite3 API
class DatabaseWrapper {
  async ensureInit() {
    if (!db) {
      await initDatabase();
    }
  }

  prepare(sql) {
    return {
      run: async (...params) => {
        await this.ensureInit();
        const stmt = db.prepare(sql);
        stmt.bind(params);
        stmt.step();
        const lastInsertRowid = db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0];
        const changes = db.getRowsModified();
        stmt.free();
        saveDatabase();
        return { lastInsertRowid, changes };
      },
      get: async (...params) => {
        await this.ensureInit();
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const result = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return result;
      },
      all: async (...params) => {
        await this.ensureInit();
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    };
  }
}

// Export pre-initialized for now but handle async in methods
export default new DatabaseWrapper();

