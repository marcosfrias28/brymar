const nextJest = require('next/jest')

const createJestConfig = nextJest({
    dir: './',
})

// Layout-specific Jest configuration
const layoutJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testMatch: [
        '<rootDir>/components/layout/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/components/__tests__/admin-sidebar.test.{js,jsx,ts,tsx}',
        '<rootDir>/components/__tests__/navigation-integration.test.{js,jsx,ts,tsx}',
        '<rootDir>/components/__tests__/responsive-behavior.test.{js,jsx,ts,tsx}',
        '<rootDir>/components/__tests__/visual-regression.test.{js,jsx,ts,tsx}',
    ],
    collectCoverageFrom: [
        'components/layout/**/*.{js,ts,jsx,tsx}',
        'components/admin-sidebar.tsx',
        'components/nav-main.tsx',
        'components/nav-documents.tsx',
        'components/nav-secondary.tsx',
        'components/nav-user.tsx',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
        'components/layout/': {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85,
        },
    },
    coverageReporters: ['text', 'lcov', 'html'],
    testTimeout: 10000,
    verbose: true,
    displayName: 'Layout Components',
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/.next/',
        '<rootDir>/tests/',
    ],
}

module.exports = createJestConfig(layoutJestConfig)