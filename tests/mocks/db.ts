import { vi } from 'vitest';
import Database from 'better-sqlite3';

// Mock functions for unit tests
export const mockRun = vi.fn<(sql: string, params?: unknown[]) => number>();
export const mockGet = vi.fn<(sql: string, params?: unknown[]) => unknown>();
export const mockQuery = vi.fn<(sql: string, params?: unknown[]) => unknown[]>();

export function createMockedDbModule() {
    return {
        run: mockRun,
        get: mockGet,
        query: mockQuery,
        getDb: vi.fn(),
        resetDb: vi.fn(),
    };
}

// In-memory SQLite factory for integration tests
export function createTestDb(): Database.Database {
    const db = new Database(':memory:');
    db.pragma('foreign_keys = ON');

    // Create schema
    db.exec(`
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

    db.exec(`
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

    db.exec(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public)`);

    return db;
}

// Helper to create test user
export function createTestUser(db: Database.Database, id: string, email: string): void {
    db.prepare(`INSERT INTO user (id, name, email) VALUES (?, ?, ?)`).run(id, 'Test User', email);
}
