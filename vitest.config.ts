import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
            include: ['lib/**/*.ts', 'app/api/**/*.ts'],
        },
    },
    resolve: {
        alias: { '@': resolve(__dirname, './') },
    },
});
