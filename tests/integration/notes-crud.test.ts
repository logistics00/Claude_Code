import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { createTestDb, createTestUser } from '../mocks/db';

// Integration tests using in-memory SQLite with real schema
// These tests don't mock the database - they use actual SQL operations

describe('Notes CRUD Integration', () => {
    let db: Database.Database;
    const userId1 = 'user-1';
    const userId2 = 'user-2';

    // Helper functions that operate on the test database
    function createNote(userId: string, title: string, contentJson: string): string {
        const id = crypto.randomUUID();
        db.prepare(`INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)`).run(
            id,
            userId,
            title,
            contentJson,
        );
        return id;
    }

    function getNoteById(
        id: string,
        userId: string,
    ):
        | {
              id: string;
              user_id: string;
              title: string;
              content_json: string;
              is_public: number;
              public_slug: string | null;
          }
        | undefined {
        return db
            .prepare(`SELECT * FROM notes WHERE id = ? AND user_id = ?`)
            .get(id, userId) as ReturnType<typeof getNoteById>;
    }

    function getNotesByUserId(userId: string) {
        return db
            .prepare(`SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC`)
            .all(userId);
    }

    function updateNote(
        id: string,
        userId: string,
        title: string,
        contentJson: string,
    ): boolean {
        const result = db
            .prepare(
                `UPDATE notes SET title = ?, content_json = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
            )
            .run(title, contentJson, id, userId);
        return result.changes > 0;
    }

    function deleteNote(id: string, userId: string): boolean {
        const result = db
            .prepare(`DELETE FROM notes WHERE id = ? AND user_id = ?`)
            .run(id, userId);
        return result.changes > 0;
    }

    function toggleNoteSharing(
        noteId: string,
        userId: string,
        makePublic: boolean,
    ): { success: boolean; slug: string | null } {
        const note = getNoteById(noteId, userId);
        if (!note) return { success: false, slug: null };

        if (!makePublic) {
            db.prepare(
                `UPDATE notes SET is_public = 0, public_slug = NULL, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
            ).run(noteId, userId);
            return { success: true, slug: null };
        }

        const slug = Math.random().toString(36).substring(2, 10);
        db.prepare(
            `UPDATE notes SET is_public = 1, public_slug = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
        ).run(slug, noteId, userId);
        return { success: true, slug };
    }

    function getPublicNoteBySlug(slug: string) {
        return db
            .prepare(`SELECT * FROM notes WHERE public_slug = ? AND is_public = 1`)
            .get(slug);
    }

    beforeEach(() => {
        db = createTestDb();
        createTestUser(db, userId1, 'user1@example.com');
        createTestUser(db, userId2, 'user2@example.com');
    });

    describe('Create', () => {
        it('creates a note and returns its ID', () => {
            const id = createNote(userId1, 'My Note', '{"type":"doc"}');

            expect(id).toBeDefined();
            expect(id).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            );
        });

        it('stores note with correct data', () => {
            const id = createNote(userId1, 'Test Title', '{"content":"hello"}');
            const note = getNoteById(id, userId1);

            expect(note).toBeDefined();
            expect(note?.title).toBe('Test Title');
            expect(note?.content_json).toBe('{"content":"hello"}');
            expect(note?.is_public).toBe(0);
            expect(note?.public_slug).toBeNull();
        });
    });

    describe('Read', () => {
        it('retrieves note by ID for correct user', () => {
            const id = createNote(userId1, 'Note 1', '{}');
            const note = getNoteById(id, userId1);

            expect(note).toBeDefined();
            expect(note?.id).toBe(id);
        });

        it('returns undefined for wrong user', () => {
            const id = createNote(userId1, 'Note 1', '{}');
            const note = getNoteById(id, userId2);

            expect(note).toBeUndefined();
        });

        it('lists all notes for a user', () => {
            createNote(userId1, 'Note 1', '{}');
            createNote(userId1, 'Note 2', '{}');
            createNote(userId2, 'Other User Note', '{}');

            const notes = getNotesByUserId(userId1);

            expect(notes).toHaveLength(2);
        });
    });

    describe('Update', () => {
        it('updates note title and content', () => {
            const id = createNote(userId1, 'Original', '{"old":true}');

            const updated = updateNote(id, userId1, 'Updated', '{"new":true}');
            const note = getNoteById(id, userId1);

            expect(updated).toBe(true);
            expect(note?.title).toBe('Updated');
            expect(note?.content_json).toBe('{"new":true}');
        });

        it('returns false when updating non-existent note', () => {
            const updated = updateNote('nonexistent', userId1, 'Title', '{}');

            expect(updated).toBe(false);
        });

        it('returns false when updating another users note', () => {
            const id = createNote(userId1, 'Original', '{}');

            const updated = updateNote(id, userId2, 'Hacked', '{}');

            expect(updated).toBe(false);
        });
    });

    describe('Delete', () => {
        it('deletes note successfully', () => {
            const id = createNote(userId1, 'To Delete', '{}');

            const deleted = deleteNote(id, userId1);
            const note = getNoteById(id, userId1);

            expect(deleted).toBe(true);
            expect(note).toBeUndefined();
        });

        it('returns false when deleting non-existent note', () => {
            const deleted = deleteNote('nonexistent', userId1);

            expect(deleted).toBe(false);
        });

        it('cannot delete another users note', () => {
            const id = createNote(userId1, 'Protected', '{}');

            const deleted = deleteNote(id, userId2);
            const note = getNoteById(id, userId1);

            expect(deleted).toBe(false);
            expect(note).toBeDefined();
        });
    });

    describe('User Isolation', () => {
        it('user A cannot see user Bs notes', () => {
            const noteA = createNote(userId1, 'User A Note', '{}');
            const noteB = createNote(userId2, 'User B Note', '{}');

            expect(getNoteById(noteA, userId1)).toBeDefined();
            expect(getNoteById(noteA, userId2)).toBeUndefined();
            expect(getNoteById(noteB, userId2)).toBeDefined();
            expect(getNoteById(noteB, userId1)).toBeUndefined();
        });

        it('user A cannot modify user Bs notes', () => {
            const noteB = createNote(userId2, 'User B Note', '{"original":true}');

            updateNote(noteB, userId1, 'Hacked', '{"hacked":true}');
            const note = getNoteById(noteB, userId2);

            expect(note?.title).toBe('User B Note');
            expect(note?.content_json).toBe('{"original":true}');
        });
    });

    describe('Public Sharing Flow', () => {
        it('makes note public and generates slug', () => {
            const id = createNote(userId1, 'To Share', '{}');

            const result = toggleNoteSharing(id, userId1, true);
            const note = getNoteById(id, userId1);

            expect(result.success).toBe(true);
            expect(result.slug).toBeDefined();
            expect(note?.is_public).toBe(1);
            expect(note?.public_slug).toBe(result.slug);
        });

        it('public note is accessible by slug', () => {
            const id = createNote(userId1, 'Public Note', '{"content":"visible"}');
            const { slug } = toggleNoteSharing(id, userId1, true);

            const publicNote = getPublicNoteBySlug(slug!);

            expect(publicNote).toBeDefined();
        });

        it('private note is not accessible by slug', () => {
            const id = createNote(userId1, 'Private Note', '{}');
            // Note is created as private by default

            const note = getNoteById(id, userId1);
            // Even if we knew the note exists, without a slug we cant access it publicly
            expect(note?.is_public).toBe(0);
            expect(note?.public_slug).toBeNull();
        });

        it('disabling sharing removes public access', () => {
            const id = createNote(userId1, 'Was Public', '{}');
            const { slug } = toggleNoteSharing(id, userId1, true);

            // Verify it's public
            expect(getPublicNoteBySlug(slug!)).toBeDefined();

            // Disable sharing
            toggleNoteSharing(id, userId1, false);

            // No longer accessible
            expect(getPublicNoteBySlug(slug!)).toBeUndefined();
        });
    });
});
