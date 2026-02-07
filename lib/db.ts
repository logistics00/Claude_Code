import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'app.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        initializeTables(db);
    }
    return db;
}

function initializeTables(database: Database.Database): void {
    // better-auth core tables
    database.exec(`
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

    database.exec(`
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

    database.exec(`
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

    database.exec(`
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
    database.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content_json TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0,
      public_slug TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
    )
  `);

    // Indexes
    database.exec(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`);
    database.exec(
        `CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug)`,
    );
    database.exec(`CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public)`);
}

// Query helpers
export function query<T>(sql: string, params?: unknown[]): T[] {
    const database = getDb();
    const stmt = database.prepare(sql);
    return (params ? stmt.all(...params) : stmt.all()) as T[];
}

export function get<T>(sql: string, params?: unknown[]): T | undefined {
    const database = getDb();
    const stmt = database.prepare(sql);
    return (params ? stmt.get(...params) : stmt.get()) as T | undefined;
}

export function run(sql: string, params?: unknown[]): number {
    const database = getDb();
    const stmt = database.prepare(sql);
    const result = params ? stmt.run(...params) : stmt.run();
    return result.changes;
}
