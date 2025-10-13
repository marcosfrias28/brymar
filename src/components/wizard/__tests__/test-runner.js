#!/usr/bin/env node

/**
 * Comprehensive test runner for Property Wizard
 * Runs all test suites with proper configuration and reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
    // Test suites to run
    suites: [
        {
            name: 'Unit Tests',
            pattern: 'components/wizard/__tests__/**/*.test.{ts,tsx}',
            config: 'jest.wizard.config.js',
            timeout: 30000,
        },
        {
            name: 'Integration Tests',
            pattern: 'components/wizard/__tests__/wizard-integration.test.tsx',
            config: 'jest.wizard.config.js',
            timeout: 60000,
        },
        {
            name: 'Mobile Responsiveness Tests',
            pattern: 'components/wizard/__tests__/mobile-responsiveness.test.tsx',
            config: 'jest.wizard.config.js',
            timeout: 45000,
        },
        {
            name: 'Error Recovery Tests',
            pattern: 'components/wizard/__tests__/error-recovery.test.tsx',
            config: 'jest.wizard.config.js',
            timeout: 45000,
        },
        {
            name: 'Performance Tests',
            pattern: 'components/wizard/__tests__/performance.test.tsx',
            config: 'jest.wizard.config.js',
            timeout: 60000,
        },
    ],

    // Coverage thresholds
    coverage: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
        wizard: {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85,
        },
    },

    // Performance budgets
    performance: {
        maxLoadTime: 2000, // 2 seconds
        maxInteractionTime: 500, // 500ms
        maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    },
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    log('\n' + '='.repeat(60), 'cyan');
    log(`  ${title}`, 'bright');
    log('='.repeat(60), 'cyan');
}

function logSubsection(title) {
    log(`\n${'-'.repeat(40)}`, 'blue');
    log(`  ${title}`, 'blue');
    log(`${'-'.repeat(40)}`, 'blue');
}

function runCommand(command, options = {}) {
    try {
        const result = execSync(command, {
            stdio: 'pipe',
            encoding: 'utf8',
            ...options,
        });
        return { success: true, output: result };
    } catch (error) {
        return { success: false, error: error.message, output: error.stdout };
    }
}

function checkPrerequisites() {
    logSection('Checking Prerequisites');

    // Check if Jest is installed
    const jestCheck = runCommand('npx jest --version');
    if (!jestCheck.success) {
        log('❌ Jest is not installed', 'red');
        return false;
    }
    log(`✅ Jest version: ${jestCheck.output.trim()}`, 'green');

    // Check if test files exist
    const testFiles = [
        'components/wizard/__tests__/enhanced-ai-description.test.tsx',
        'components/wizard/__tests__/interactive-map.test.tsx',
        'components/wizard/__tests__/step-validation.test.tsx',
        'components/wizard/__tests__/wizard-integration.test.tsx',
        'components/wizard/__tests__/mobile-responsiveness.test.tsx',
        'components/wizard/__tests__/error-recovery.test.tsx',
        'components/wizard/__tests__/performance.test.tsx',
    ];

    let missingFiles = 0;
    testFiles.forEach(file => {
        if (fs.existsSync(file)) {
            log(`✅ ${file}`, 'green');
        } else {
            log(`❌ ${file} (missing)`, 'red');
            missingFiles++;
        }
    });

    if (missingFiles > 0) {
        log(`\n❌ ${missingFiles} test files are missing`, 'red');
        return false;
    }

    log('\n✅ All prerequisites met', 'green');
    return true;
}

function runTestSuite(suite) {
    logSubsection(`Running ${suite.name}`);

    const command = `npx jest "${suite.pattern}" --config=${suite.config} --verbose --coverage --testTimeout=${suite.timeout}`;

    log(`Command: ${command}`, 'blue');

    const result = runCommand(command);

    if (result.success) {
        log(`✅ ${suite.name} passed`, 'green');
        return { name: suite.name, success: true, output: result.output };
    } else {
        log(`❌ ${suite.name} failed`, 'red');
        log(result.output || result.error, 'red');
        return { name: suite.name, success: false, error: result.error, output: result.output };
    }
}

function runAllTests() {
    logSection('Running All Test Suites');

    const results = [];
    let totalPassed = 0;
    let totalFailed = 0;

    for (const suite of TEST_CONFIG.suites) {
        const result = runTestSuite(suite);
        results.push(result);

        if (result.success) {
            totalPassed++;
        } else {
            totalFailed++;
        }
    }

    return { results, totalPassed, totalFailed };
}

function generateCoverageReport() {
    logSection('Generating Coverage Report');

    const command = 'npx jest --config=jest.wizard.config.js --coverage --coverageReporters=html --coverageReporters=text --coverageReporters=lcov';

    const result = runCommand(command);

    if (result.success) {
        log('✅ Coverage report generated', 'green');
        log('📊 Coverage report available at: coverage/lcov-report/index.html', 'cyan');
    } else {
        log('❌ Failed to generate coverage report', 'red');
        log(result.error, 'red');
    }

    return result.success;
}

function runPerformanceTests() {
    logSection('Running Performance Tests');

    const command = 'npx jest components/wizard/__tests__/performance.test.tsx --config=jest.wizard.config.js --verbose';

    const result = runCommand(command);

    if (result.success) {
        log('✅ Performance tests passed', 'green');

        // Extract performance metrics from output
        const output = result.output;
        const loadTimeMatch = output.match(/load time: (\d+)ms/i);
        const memoryMatch = output.match(/memory usage: ([\d.]+)MB/i);

        if (loadTimeMatch) {
            const loadTime = parseInt(loadTimeMatch[1]);
            if (loadTime > TEST_CONFIG.performance.maxLoadTime) {
                log(`⚠️  Load time (${loadTime}ms) exceeds budget (${TEST_CONFIG.performance.maxLoadTime}ms)`, 'yellow');
            } else {
                log(`✅ Load time: ${loadTime}ms (within budget)`, 'green');
            }
        }

        if (memoryMatch) {
            const memoryUsage = parseFloat(memoryMatch[1]) * 1024 * 1024; // Convert to bytes
            if (memoryUsage > TEST_CONFIG.performance.maxMemoryUsage) {
                log(`⚠️  Memory usage (${memoryMatch[1]}MB) exceeds budget (${TEST_CONFIG.performance.maxMemoryUsage / 1024 / 1024}MB)`, 'yellow');
            } else {
                log(`✅ Memory usage: ${memoryMatch[1]}MB (within budget)`, 'green');
            }
        }
    } else {
        log('❌ Performance tests failed', 'red');
        log(result.error, 'red');
    }

    return result.success;
}

function runAccessibilityTests() {
    logSection('Running Accessibility Tests');

    // Check if accessibility tests exist
    const a11yTestFile = 'components/wizard/__tests__/accessibility.test.tsx';

    if (!fs.existsSync(a11yTestFile)) {
        log('⚠️  Accessibility tests not found, skipping', 'yellow');
        return true;
    }

    const command = `npx jest ${a11yTestFile} --config=jest.wizard.config.js --verbose`;

    const result = runCommand(command);

    if (result.success) {
        log('✅ Accessibility tests passed', 'green');
    } else {
        log('❌ Accessibility tests failed', 'red');
        log(result.error, 'red');
    }

    return result.success;
}

function generateTestReport(testResults) {
    logSection('Test Summary Report');

    const { results, totalPassed, totalFailed } = testResults;

    log(`\nTotal Test Suites: ${results.length}`, 'bright');
    log(`✅ Passed: ${totalPassed}`, 'green');
    log(`❌ Failed: ${totalFailed}`, 'red');

    if (totalFailed > 0) {
        log('\nFailed Test Suites:', 'red');
        results.filter(r => !r.success).forEach(result => {
            log(`  • ${result.name}`, 'red');
        });
    }

    // Generate detailed report file
    const reportData = {
        timestamp: new Date().toISOString(),
        summary: {
            total: results.length,
            passed: totalPassed,
            failed: totalFailed,
            successRate: `${((totalPassed / results.length) * 100).toFixed(1)}%`,
        },
        results: results,
        config: TEST_CONFIG,
    };

    const reportPath = 'test-results/wizard-test-report.json';

    // Ensure directory exists
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');

    return totalFailed === 0;
}

function main() {
    log('🧪 Property Wizard Comprehensive Test Suite', 'bright');
    log('============================================', 'bright');

    // Check prerequisites
    if (!checkPrerequisites()) {
        process.exit(1);
    }

    // Run all tests
    const testResults = runAllTests();

    // Generate coverage report
    generateCoverageReport();

    // Run performance tests
    runPerformanceTests();

    // Run accessibility tests
    runAccessibilityTests();

    // Generate final report
    const success = generateTestReport(testResults);

    if (success) {
        log('\n🎉 All tests passed successfully!', 'green');
        process.exit(0);
    } else {
        log('\n💥 Some tests failed. Please check the results above.', 'red');
        process.exit(1);
    }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Property Wizard Test Runner

Usage: node test-runner.js [options]

Options:
  --help, -h          Show this help message
  --coverage          Run with coverage reporting
  --performance       Run only performance tests
  --integration       Run only integration tests
  --mobile            Run only mobile responsiveness tests
  --errors            Run only error recovery tests
  --watch             Run tests in watch mode

Examples:
  node test-runner.js                    # Run all tests
  node test-runner.js --performance      # Run only performance tests
  node test-runner.js --coverage         # Run all tests with coverage
  `);
    process.exit(0);
}

if (args.includes('--performance')) {
    runPerformanceTests();
    process.exit(0);
}

if (args.includes('--integration')) {
    const suite = TEST_CONFIG.suites.find(s => s.name === 'Integration Tests');
    runTestSuite(suite);
    process.exit(0);
}

if (args.includes('--mobile')) {
    const suite = TEST_CONFIG.suites.find(s => s.name === 'Mobile Responsiveness Tests');
    runTestSuite(suite);
    process.exit(0);
}

if (args.includes('--errors')) {
    const suite = TEST_CONFIG.suites.find(s => s.name === 'Error Recovery Tests');
    runTestSuite(suite);
    process.exit(0);
}

// Run main test suite
main();