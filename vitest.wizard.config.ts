/**
 * Vitest Configuration for Wizard Framework Tests
 * Optimized configuration for comprehensive wizard testing
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        // Test environment
        environment: 'jsdom',

        // Global setup
        setupFiles: ['./jest.setup.js'],

        // Test patterns
        include: [
            'components/wizard/**/*.test.{ts,tsx}',
            'hooks/wizard/**/*.test.{ts,tsx}',
            'lib/wizard/**/*.test.{ts,tsx}',
            'lib/actions/**/*wizard*.test.{ts,tsx}',
        ],

        // Exclude patterns
        exclude: [
            'node_modules/**',
            'dist/**',
            '.next/**',
            'coverage/**',
        ],

        // Timeouts
        testTimeout: 30000,
        hookTimeout: 10000,

        // Reporters
        reporters: ['verbose', 'json', 'html'],

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: './coverage/wizard',
            include: [
                'components/wizard/**/*.{ts,tsx}',
                'hooks/wizard/**/*.{ts,tsx}',
                'lib/wizard/**/*.{ts,tsx}',
                'lib/actions/**/*wizard*.{ts,tsx}',
            ],
            exclude: [
                '**/*.d.ts',
                '**/*.test.{ts,tsx}',
                '**/__tests__/**',
                '**/node_modules/**',
            ],
            thresholds: {
                global: {
                    branches: 80,
                    functions: 80,
                    lines: 80,
                    statements: 80,
                },
                // Specific thresholds for critical components
                'components/wizard/core/': {
                    branches: 90,
                    functions: 90,
                    lines: 90,
                    statements: 90,
                },
                'hooks/wizard/': {
                    branches: 85,
                    functions: 85,
                    lines: 85,
                    statements: 85,
                },
                'lib/wizard/': {
                    branches: 85,
                    functions: 85,
                    lines: 85,
                    statements: 85,
                },
            },
        },

        // Globals
        globals: true,

        // Watch options
        watch: false,

        // Parallel execution
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: false,
                maxThreads: 4,
                minThreads: 1,
            },
        },

        // Retry configuration
        retry: 2,

        // Bail on first failure in CI
        bail: process.env.CI ? 1 : 0,

        // Performance monitoring
        logHeapUsage: true,

        // Test isolation
        isolate: true,

        // Mock configuration
        clearMocks: true,
        restoreMocks: true,

        // Snapshot configuration
        resolveSnapshotPath: (testPath, snapExtension) => {
            return path.join(
                path.dirname(testPath),
                '__snapshots__',
                path.basename(testPath) + snapExtension
            );
        },
    },

    // Path resolution
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        },
    },

    // Define configuration
    define: {
        'process.env.NODE_ENV': '"test"',
        'process.env.NEXT_PUBLIC_APP_URL': '"http://localhost:3000"',
    },

    // Esbuild configuration for TypeScript
    esbuild: {
        target: 'node14',
    },
});