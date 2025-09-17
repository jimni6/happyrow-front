/// <reference types="vitest" />
import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: process.env.GITHUB_PAGES === 'true' ? '/happyrow-front/' : '/',
    server: {
        proxy: {
            '/api': {
                target: 'https://happyrow-core.onrender.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./vitest.setup.ts",
    },
})
