#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Test suites configuration
const testSuites = {
    unit: {
        name: 'Unit Tests',
        pattern: 'components/wizard/**/__tests__/**/*.test.{ts,tsx}',
        config: 'jest.wizard.config.js',
    },
    integration: {
        name: 'Integration Tests',
        pattern: 'components/wizard/**/__tests__/**/*integration*.test.{ts,tsx}',
        config: 'jest.wizard.config.js',
    },
    accessibility: {
        name: 'Accessibility Tests',
        pattern: 'components/wizard/**/__tests__/**/*accessibility*.test.{ts,tsx}',
        config: 'jest.wizard.config.js',
    },
    performance: {
        name: 'Performance Tests',
        pattern: 'components/wizard/**/__tests__/**/*performance*.test.{ts,tsx}',
        config: 'jest.wizard.config.js',
    },
    visual: {
        name: 'Visual Regression Tests',
        pattern: 'components/wizard/**/__tests__/**/*visual*.test.{ts,tsx}',
        config: 'jest.wizard.config.js',
    },
    hooks: {
        name: 'Hooks Tests',
        pattern: 'hooks/**/__tests__/**/*.test.{ts,tsx}',
        config: 'jest.wizard.config.js',
    },
    actions: {
        name: 'Actions Tests',
        pattern: 'lib/actions/**/__tests__/**/*.test.{ts,tsx}',
        config: 'jest.wizard.config.js',
    },
};

// Parse command line arguments
const args = process.argv.slice(2);
const suiteArg = args.find(arg => arg.startsWith('--suite='));
const watchMode = args.includes('--watch');
const coverage = args.includes('--coverage');
const verbose = args.includes('--verbose');

let suitesToRun = ['unit', 'integration', 'accessibility', 'performance', 'visual', 'hooks', 'actions'];

if (suiteArg) {
    const requestedSuite = suiteArg.split('=')[1];
    if (testSuites[requestedSuite]) {
        suitesToRun = [requestedSuite];
    } else {
        console.error(`Unknown test suite: ${requestedSuite}`);
        console.error(`Available suites: ${Object.keys(testSuites).join(', ')}`);
        process.exit(1);
    }
}

// Function to run a test suite
function runTestSuite(suiteName) {
    return new Promise((resolve, reject) => {
        const suite = testSuites[suiteName];
        console.log(`\n🧪 Running ${suite.name}...`);

        const jestArgs = [
            '--config', suite.config,
            '--testPathPattern', suite.pattern,
        ];

        if (watchMode) {
            jestArgs.push('--watch');
        }

        if (coverage) {
            jestArgs.push('--coverage');
        }

        if (verbose) {
            jestArgs.push('--verbose');
        }

        // Add environment variables for specific test types
        const env = { ...process.env };

        if (suiteName === 'performance') {
            env.NODE_ENV = 'test';
            env.PERFORMANCE_TESTING = 'true';
        }

        if (suiteName === 'accessibility') {
            env.ACCESSIBILITY_TESTING = 'true';
        }

        if (suiteName === 'visual') {
            env.VISUAL_REGRESSION_TESTING = 'true';
        }

        const jest = spawn('npx', ['jest', ...jestArgs], {
            stdio: 'inherit',
            env,
            cwd: process.cwd(),
        });

        jest.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${suite.name} passed`);
                resolve();
            } else {
                console.log(`❌ ${suite.name} failed`);
                reject(new Error(`${suite.name} failed with code ${code}`));
            }
        });

        jest.on('error', (error) => {
            console.error(`Error running ${suite.name}:`, error);
            reject(error);
        });
    });
}

// Function to run all test suites
async function runAllSuites() {
    console.log('🚀 Starting Wizard Test Suite');
    console.log(`Running suites: ${suitesToRun.join(', ')}`);

    const results = {
        passed: [],
        failed: [],
    };

    for (const suiteName of suitesToRun) {
        try {
            await runTestSuite(suiteName);
            results.passed.push(suiteName);
        } catch (error) {
            results.failed.push(suiteName);

            // Continue with other suites unless in watch mode
            if (watchMode) {
                break;
            }
        }
    }

    // Print summary
    console.log('\n📊 Test Results Summary');
    console.log('========================');

    if (results.passed.length > 0) {
        console.log(`✅ Passed (${results.passed.length}): ${results.passed.join(', ')}`);
    }

    if (results.failed.length > 0) {
        console.log(`❌ Failed (${results.failed.length}): ${results.failed.join(', ')}`);
    }

    console.log(`\nTotal: ${results.passed.length + results.failed.length} suites`);

    // Exit with error code if any tests failed
    if (results.failed.length > 0) {
        process.exit(1);
    }

    console.log('\n🎉 All wizard tests passed!');
}

// Handle specific commands
if (args.includes('--help')) {
    console.log(`
Wizard Test Runner

Usage: node scripts/test-wizard.js [options]

Options:
  --suite=<name>    Run specific test suite (unit, integration, accessibility, performance, visual, hooks, actions)
  --watch          Run tests in watch mode
  --coverage       Generate coverage report
  --verbose        Verbose output
  --help           Show this help message

Examples:
  node scripts/test-wizard.js                           # Run all test suites
  node scripts/test-wizard.js --suite=unit             # Run only unit tests
  node scripts/test-wizard.js --suite=accessibility    # Run only accessibility tests
  node scripts/test-wizard.js --watch                  # Run all tests in watch mode
  node scripts/test-wizard.js --coverage               # Run all tests with coverage
  node scripts/test-wizard.js --suite=performance --verbose  # Run performance tests with verbose output
`);
    process.exit(0);
}

if (args.includes('--list-suites')) {
    console.log('Available test suites:');
    Object.entries(testSuites).forEach(([key, suite]) => {
        console.log(`  ${key.padEnd(15)} - ${suite.name}`);
    });
    process.exit(0);
}

// Run the tests
runAllSuites().catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
});