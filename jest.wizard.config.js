const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testMatch: [
        '<rootDir>/components/wizard/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/hooks/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/lib/actions/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/components/wizard/**/*.{test,spec}.{js,jsx,ts,tsx}',
        '<rootDir>/hooks/**/*.{test,spec}.{js,jsx,ts,tsx}',
        '<rootDir>/lib/actions/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    collectCoverageFrom: [
        'components/wizard/**/*.{js,ts,jsx,tsx}',
        'hooks/use-wizard-*.{js,ts}',
        'hooks/use-ai-generation.{js,ts}',
        'lib/actions/wizard-actions.{js,ts}',
        'lib/actions/ai-actions.{js,ts}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/coverage/**',
        '!**/__tests__/**',
        '!**/test-utils.{js,ts,jsx,tsx}'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        },
        'components/wizard/': {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85
        },
        'hooks/use-wizard-*.ts': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        }
    },
    testTimeout: 15000,
    verbose: true,
    displayName: 'Wizard Tests',
    // Performance testing configuration
    globals: {
        'ts-jest': {
            tsconfig: {
                jsx: 'react-jsx',
            },
        },
    },
    // Setup for visual regression tests
    setupFiles: ['<rootDir>/jest.wizard.setup.js'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)