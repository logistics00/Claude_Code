import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockRun, mockGet, mockQuery } from '../../mocks/db';

// Mock the db module before importing notes
vi.mock('@/lib/db', () => ({
    run: mockRun,
    get: mockGet,
    query: mockQuery,
}));

import {
    validateContentJson,
    createNote,
    getNoteById,
    getNotesByUserId,
    updateNote,
    deleteNote,
    toggleNoteSharing,
    getPublicNoteBySlug,
    type Note,
} from '@/lib/notes';

describe('validateContentJson', () => {
    it('returns valid for a valid JSON object', () => {
        const result = validateContentJson('{"type":"doc","content":[]}');
        expect(result).toEqual({ valid: true });
    });

    it('returns error for invalid JSON', () => {
        const result = validateContentJson('not valid json');
        expect(result).toEqual({ valid: false, error: 'Content is not valid JSON' });
    });

    it('returns error for content exceeding 500KB', () => {
        const largeContent = JSON.stringify({ data: 'x'.repeat(500 * 1024) });
        const result = validateContentJson(largeContent);
        expect(result).toEqual({
            valid: false,
            error: 'Content exceeds maximum size of 500KB',
        });
    });

    it('accepts JSON array (implementation allows arrays)', () => {
        // Note: current implementation accepts arrays since typeof [] === 'object'
        const result = validateContentJson('[]');
        expect(result).toEqual({ valid: true });
    });

    it('returns error for JSON null', () => {
        const result = validateContentJson('null');
        expect(result).toEqual({ valid: false, error: 'Content must be a valid JSON object' });
    });

    it('returns error for JSON primitive', () => {
        const result = validateContentJson('"hello"');
        expect(result).toEqual({ valid: false, error: 'Content must be a valid JSON object' });
    });
});

describe('createNote', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns a UUID and calls run with correct SQL', () => {
        mockRun.mockReturnValue(1);

        const id = createNote('user-123', 'Test Title', '{"type":"doc"}');

        expect(id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );
        expect(mockRun).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO notes'),
            expect.arrayContaining(['user-123', 'Test Title', '{"type":"doc"}']),
        );
    });
});

describe('getNoteById', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns note when found', () => {
        const mockNote: Note = {
            id: 'note-1',
            user_id: 'user-123',
            title: 'Test Note',
            content_json: '{}',
            is_public: 0,
            public_slug: null,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        };
        mockGet.mockReturnValue(mockNote);

        const result = getNoteById('note-1', 'user-123');

        expect(result).toEqual(mockNote);
        expect(mockGet).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM notes WHERE id = ? AND user_id = ?'),
            ['note-1', 'user-123'],
        );
    });

    it('returns undefined when not found', () => {
        mockGet.mockReturnValue(undefined);

        const result = getNoteById('nonexistent', 'user-123');

        expect(result).toBeUndefined();
    });
});

describe('getNotesByUserId', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns array of notes', () => {
        const mockNotes: Note[] = [
            {
                id: 'note-1',
                user_id: 'user-123',
                title: 'Note 1',
                content_json: '{}',
                is_public: 0,
                public_slug: null,
                created_at: '2024-01-01',
                updated_at: '2024-01-02',
            },
            {
                id: 'note-2',
                user_id: 'user-123',
                title: 'Note 2',
                content_json: '{}',
                is_public: 0,
                public_slug: null,
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
        ];
        mockQuery.mockReturnValue(mockNotes);

        const result = getNotesByUserId('user-123');

        expect(result).toEqual(mockNotes);
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM notes WHERE user_id = ?'),
            ['user-123'],
        );
    });

    it('returns empty array when no notes', () => {
        mockQuery.mockReturnValue([]);

        const result = getNotesByUserId('user-123');

        expect(result).toEqual([]);
    });
});

describe('updateNote', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns true when note is updated', () => {
        mockRun.mockReturnValue(1);

        const result = updateNote('note-1', 'user-123', 'New Title', '{"updated":true}');

        expect(result).toBe(true);
        expect(mockRun).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE notes SET title = ?'),
            ['New Title', '{"updated":true}', 'note-1', 'user-123'],
        );
    });

    it('returns false when no changes made', () => {
        mockRun.mockReturnValue(0);

        const result = updateNote('nonexistent', 'user-123', 'Title', '{}');

        expect(result).toBe(false);
    });
});

describe('deleteNote', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns true when note is deleted', () => {
        mockRun.mockReturnValue(1);

        const result = deleteNote('note-1', 'user-123');

        expect(result).toBe(true);
        expect(mockRun).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM notes WHERE id = ?'),
            ['note-1', 'user-123'],
        );
    });

    it('returns false when no note deleted', () => {
        mockRun.mockReturnValue(0);

        const result = deleteNote('nonexistent', 'user-123');

        expect(result).toBe(false);
    });
});

describe('toggleNoteSharing', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns failure when note not found', () => {
        mockGet.mockReturnValue(undefined);

        const result = toggleNoteSharing('nonexistent', 'user-123', true);

        expect(result).toEqual({ success: false, slug: null });
    });

    it('clears slug when disabling sharing', () => {
        const mockNote: Note = {
            id: 'note-1',
            user_id: 'user-123',
            title: 'Test',
            content_json: '{}',
            is_public: 1,
            public_slug: 'abc123',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        };
        mockGet.mockReturnValue(mockNote);
        mockRun.mockReturnValue(1);

        const result = toggleNoteSharing('note-1', 'user-123', false);

        expect(result).toEqual({ success: true, slug: null });
        expect(mockRun).toHaveBeenCalledWith(
            expect.stringContaining('is_public = 0, public_slug = NULL'),
            ['note-1', 'user-123'],
        );
    });

    it('generates slug when enabling sharing', () => {
        const mockNote: Note = {
            id: 'note-1',
            user_id: 'user-123',
            title: 'Test',
            content_json: '{}',
            is_public: 0,
            public_slug: null,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        };
        mockGet.mockReturnValue(mockNote);
        mockRun.mockReturnValue(1);

        const result = toggleNoteSharing('note-1', 'user-123', true);

        expect(result.success).toBe(true);
        expect(result.slug).toMatch(/^[a-zA-Z0-9]{8}$/);
        expect(mockRun).toHaveBeenCalledWith(
            expect.stringContaining('is_public = 1, public_slug = ?'),
            expect.arrayContaining([expect.any(String), 'note-1', 'user-123']),
        );
    });
});

describe('getPublicNoteBySlug', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns note when found and public', () => {
        const mockNote: Note = {
            id: 'note-1',
            user_id: 'user-123',
            title: 'Public Note',
            content_json: '{}',
            is_public: 1,
            public_slug: 'abc123XY',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        };
        mockGet.mockReturnValue(mockNote);

        const result = getPublicNoteBySlug('abc123XY');

        expect(result).toEqual(mockNote);
        expect(mockGet).toHaveBeenCalledWith(
            expect.stringContaining('WHERE public_slug = ? AND is_public = 1'),
            ['abc123XY'],
        );
    });

    it('returns undefined when slug not found', () => {
        mockGet.mockReturnValue(undefined);

        const result = getPublicNoteBySlug('nonexistent');

        expect(result).toBeUndefined();
    });
});
