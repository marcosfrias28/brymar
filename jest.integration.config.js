const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
})

// Integration test specific configuration
const customJestConfig = {
    displayName: 'Universal Wizard Integration Tests',
    setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
        '<rootDir>/components/wizard/__tests__/integration-setup.js'
    ],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testMatch: [
        '<rootDir>/components/wizard/__tests__/universal-wizard-integration.test.tsx',
        '<rootDir>/components/wizard/__tests__/preview-compatibility.test.tsx',
        '<rootDir>/components/wizard/__tests__/draft-synchronization.test.tsx',
        '<rootDir>/components/wizard/__tests__/end-to-end-workflows.test.tsx'
    ],
    collectCoverageFrom: [
        'components/wizard/**/*.{js,ts,jsx,tsx}',
        'hooks/use-universal-wizard.{js,ts}',
        'hooks/use-wizard-*.{js,ts}',
        'hooks/use-lazy-validation.{js,ts}',
        'hooks/use-land-wizard.{js,ts}',
        'hooks/use-blog-wizard.{js,ts}',
        'lib/actions/property-actions.{js,ts}',
        'lib/actions/land-wizard-actions.{js,ts}',
        'lib/actions/blog-wizard-actions.{js,ts}',
        'lib/actions/ai-actions.{js,ts}',
        'lib/schemas/property-wizard-schemas.{js,ts}',
        'lib/schemas/land-wizard-schemas.{js,ts}',
        'lib/schemas/blog-wizard-schemas.{js,ts}',
        'types/universal-wizard.{js,ts}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/coverage/**',
        '!**/__tests__/**',
        '!**/test-utils.{js,ts,jsx,tsx}',
        '!**/integration-test-runner.js'
    ],
    coverageThreshold: {
        global: {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85
        },
        'components/wizard/universal/': {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
        },
        'components/wizard/land/': {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85
        },
        'components/wizard/blog/': {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85
        },
        'hooks/use-universal-wizard.ts': {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95
        },
        'hooks/use-lazy-validation.ts': {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95
        }
    },
    testTimeout: 60000, // 60 seconds for integration tests
    verbose: true,

    // Performance and memory settings for integration tests
    maxWorkers: '50%',
    workerIdleMemoryLimit: '1GB',

    // Test result processing
    reporters: [
        'default',
        ['jest-html-reporters', {
            publicPath: './components/wizard/__tests__/artifacts',
            filename: 'integration-test-report.html',
            expand: true,
            hideIcon: false,
            pageTitle: 'Universal Wizard Integration Tests',
            logoImgPath: undefined,
            inlineSource: true
        }],
        ['jest-junit', {
            outputDirectory: './components/wizard/__tests__/artifacts',
            outputName: 'integration-test-results.xml',
            suiteName: 'Universal Wizard Integration Tests',
            classNameTemplate: '{classname}',
            titleTemplate: '{title}',
            ancestorSeparator: ' › ',
            usePathForSuiteName: true
        }]
    ],

    // Coverage reporting
    coverageReporters: [
        'text',
        'text-summary',
        'html',
        'lcov',
        'json',
        'json-summary'
    ],
    coverageDirectory: './components/wizard/__tests__/artifacts/coverage',

    // Global test configuration
    globals: {
        'ts-jest': {
            tsconfig: {
                jsx: 'react-jsx',
            },
        },
        // Integration test specific globals
        INTEGRATION_TEST: true,
        TEST_TIMEOUT: 60000,
        PERFORMANCE_BUDGET: {
            LOAD_TIME: 2000,
            INTERACTION_TIME: 500,
            MEMORY_USAGE: 50 * 1024 * 1024, // 50MB
        },
        NETWORK_SIMULATION: {
            SLOW_3G: {
                downloadThroughput: (500 * 1024) / 8,
                uploadThroughput: (500 * 1024) / 8,
                latency: 2000,
            },
            FAST_3G: {
                downloadThroughput: (1.5 * 1024 * 1024) / 8,
                uploadThroughput: (750 * 1024) / 8,
                latency: 562.5,
            },
        },
    },

    // Transform configuration
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
    },
    transformIgnorePatterns: [
        'node_modules/(?!(lucide-react|@tanstack/react-query)/)'
    ],

    // Module resolution
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

    // Test environment setup
    testEnvironmentOptions: {
        url: 'http://localhost:3000',
    },

    // Snapshot configuration
    snapshotSerializers: [
        'enzyme-to-json/serializer'
    ],

    // Watch mode configuration
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname'
    ],

    // Error handling
    errorOnDeprecated: true,

    // Cache configuration
    cacheDirectory: '<rootDir>/node_modules/.cache/jest-integration',

    // Custom matchers and utilities
    setupFiles: [
        '<rootDir>/components/wizard/__tests__/integration-polyfills.js'
    ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)