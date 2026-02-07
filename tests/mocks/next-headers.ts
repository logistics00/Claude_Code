import { vi } from 'vitest';

export function createHeadersMock() {
    const headersMap = new Map<string, string>();
    return {
        headers: vi.fn().mockResolvedValue({
            get: (key: string) => headersMap.get(key),
            set: (key: string, value: string) => headersMap.set(key, value),
            has: (key: string) => headersMap.has(key),
            entries: () => headersMap.entries(),
        }),
    };
}
