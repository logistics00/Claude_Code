import { Database, type SQLQueryBindings } from "bun:sqlite";
import { join } from "path";

const DB_PATH = join(process.cwd(), "data", "app.db");

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    db = new Database(DB_PATH, { create: true });
    db.run("PRAGMA journal_mode = WAL;");
    initializeTables(db);
  }
  return db;
}

function initializeTables(database: Database): void {
  // better-auth core tables
  database.run(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      emailVerified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expiresAt TEXT NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES user(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      accountId TEXT NOT NULL,
      providerId TEXT NOT NULL,
      accessToken TEXT,
      refreshToken TEXT,
      accessTokenExpiresAt TEXT,
      refreshTokenExpiresAt TEXT,
      scope TEXT,
      idToken TEXT,
      password TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES user(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Application tables
  database.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content_json TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      public_slug TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user(id)
    )
  `);

  // Indexes
  database.run(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public)`);
}

// Query helpers
export function query<T>(sql: string, params?: SQLQueryBindings[]): T[] {
  const database = getDb();
  const stmt = database.prepare(sql);
  return (params ? stmt.all(...params) : stmt.all()) as T[];
}

export function get<T>(sql: string, params?: SQLQueryBindings[]): T | undefined {
  const database = getDb();
  const stmt = database.prepare(sql);
  return (params ? stmt.get(...params) : stmt.get()) as T | undefined;
}

export function run(sql: string, params?: SQLQueryBindings[]): void {
  const database = getDb();
  const stmt = database.prepare(sql);
  if (params) {
    stmt.run(...params);
  } else {
    stmt.run();
  }
}
