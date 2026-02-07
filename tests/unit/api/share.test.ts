import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock modules before importing the route - use inline factory functions
vi.mock('next/headers', () => ({
    headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/lib/auth', () => ({
    auth: {
        api: {
            getSession: vi.fn(),
        },
    },
}));

vi.mock('@/lib/notes', () => ({
    getNoteById: vi.fn(),
    toggleNoteSharing: vi.fn(),
}));

// Import after mocking
import { POST } from '@/app/api/notes/[id]/share/route';
import { auth } from '@/lib/auth';
import { getNoteById, toggleNoteSharing } from '@/lib/notes';

// Get mock references
const mockGetSession = vi.mocked(auth.api.getSession);
const mockGetNoteById = vi.mocked(getNoteById);
const mockToggleNoteSharing = vi.mocked(toggleNoteSharing);

function createRequest(body: unknown): NextRequest {
    return new NextRequest('http://localhost/api/notes/test-id/share', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });
}

function createInvalidRequest(): NextRequest {
    return new NextRequest('http://localhost/api/notes/test-id/share', {
        method: 'POST',
        body: 'invalid json{',
        headers: { 'Content-Type': 'application/json' },
    });
}

describe('POST /api/notes/[id]/share', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 when no session', async () => {
        mockGetSession.mockResolvedValue(null);

        const response = await POST(createRequest({ public: true }), {
            params: Promise.resolve({ id: 'test-id' }),
        });

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe('Unauthorized');
    });

    it('returns 404 when note not found', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user-123' } } as never);
        mockGetNoteById.mockReturnValue(undefined);

        const response = await POST(createRequest({ public: true }), {
            params: Promise.resolve({ id: 'nonexistent' }),
        });

        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.error).toBe('Note not found');
    });

    it('returns 400 for invalid JSON body', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user-123' } } as never);
        mockGetNoteById.mockReturnValue({
            id: 'test-id',
            user_id: 'user-123',
        } as never);

        const response = await POST(createInvalidRequest(), {
            params: Promise.resolve({ id: 'test-id' }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe('Invalid request body');
    });

    it('returns 400 for missing public field', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user-123' } } as never);
        mockGetNoteById.mockReturnValue({
            id: 'test-id',
            user_id: 'user-123',
        } as never);

        const response = await POST(createRequest({ something: 'else' }), {
            params: Promise.resolve({ id: 'test-id' }),
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe("Missing 'public' field");
    });

    it('returns 200 with slug when enabling sharing', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user-123' } } as never);
        mockGetNoteById.mockReturnValue({
            id: 'test-id',
            user_id: 'user-123',
        } as never);
        mockToggleNoteSharing.mockReturnValue({ success: true, slug: 'abc123XY' });

        const response = await POST(createRequest({ public: true }), {
            params: Promise.resolve({ id: 'test-id' }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual({
            is_public: true,
            public_slug: 'abc123XY',
            public_url: '/p/abc123XY',
        });
    });

    it('returns 200 with null slug when disabling sharing', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user-123' } } as never);
        mockGetNoteById.mockReturnValue({
            id: 'test-id',
            user_id: 'user-123',
        } as never);
        mockToggleNoteSharing.mockReturnValue({ success: true, slug: null });

        const response = await POST(createRequest({ public: false }), {
            params: Promise.resolve({ id: 'test-id' }),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual({
            is_public: false,
            public_slug: null,
            public_url: null,
        });
    });

    it('returns 500 when toggleNoteSharing fails', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'user-123' } } as never);
        mockGetNoteById.mockReturnValue({
            id: 'test-id',
            user_id: 'user-123',
        } as never);
        mockToggleNoteSharing.mockReturnValue({ success: false, slug: null });

        const response = await POST(createRequest({ public: true }), {
            params: Promise.resolve({ id: 'test-id' }),
        });

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe('Failed to update sharing');
    });
});
