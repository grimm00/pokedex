import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: ['../src/__tests__/test-utils/setup.ts'],
        globals: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '../src'),
        },
    },
})
