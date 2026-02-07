import { vi } from 'vitest';

type Session = {
    user: {
        id: string;
        name: string;
        email: string;
    };
    session: {
        id: string;
        userId: string;
    };
};

export function mockSession(userId = 'test-user-id'): Session {
    return {
        user: {
            id: userId,
            name: 'Test User',
            email: 'test@example.com',
        },
        session: {
            id: 'test-session-id',
            userId,
        },
    };
}

export function createAuthMock(session: Session | null = null) {
    return {
        auth: {
            api: {
                getSession: vi.fn().mockResolvedValue(session),
            },
        },
    };
}
