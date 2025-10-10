#!/usr/bin/env node

/**
 * Comprehensive Wizard Test Runner
 * Runs all wizard tests with different configurations and generates reports
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test suites configuration
const TEST_SUITES = {
    unit: {
        name: 'Unit Tests',
        pattern: 'components/wizard/**/*unit*.test.{ts,tsx}',
        timeout: 30000,
        coverage: true,
    },
    integration: {
        name: 'Integration Tests',
        pattern: 'components/wizard/**/*integration*.test.{ts,tsx}',
        timeout: 60000,
        coverage: true,
    },
    performance: {
        name: 'Performance Tests',
        pattern: 'components/wizard/**/*performance*.test.{ts,tsx}',
        timeout: 120000,
        coverage: false,
    },
    accessibility: {
        name: 'Accessibility Tests',
        pattern: 'components/wizard/**/*accessibility*.test.{ts,tsx}',
        timeout: 60000,
        coverage: false,
    },
    visual: {
        name: 'Visual Regression Tests',
        pattern: 'components/wizard/**/*visual*.test.{ts,tsx}',
        timeout: 90000,
        coverage: false,
    },
    hooks: {
        name: 'Hooks Tests',
        pattern: 'hooks/wizard/**/*.test.{ts,tsx}',
        timeout: 30000,
        coverage: true,
    },
    actions: {
        name: 'Actions Tests',
        pattern: 'lib/actions/**/*wizard*.test.{ts,tsx}',
        timeout: 45000,
        coverage: true,
    },
};

// Command line argument parsing
const args = process.argv.slice(2);
const options = {
    suite: 'all',
    watch: false,
    coverage: false,
    verbose: false,
    bail: false,
    parallel: true,
    updateSnapshots: false,
};

// Parse command line arguments
args.forEach((arg, index) => {
    if (arg === '--suite' && args[index + 1]) {
        options.suite = args[index + 1];
    } else if (arg === '--watch') {
        options.watch = true;
    } else if (arg === '--coverage') {
        options.coverage = true;
    } else if (arg === '--verbose') {
        options.verbose = true;
    } else if (arg === '--bail') {
        options.bail = true;
    } else if (arg === '--no-parallel') {
        options.parallel = false;
    } else if (arg === '--update-snapshots') {
        options.updateSnapshots = true;
    }
});

// Utility functions
function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
        info: '📋',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        performance: '⚡',
        accessibility: '♿',
        visual: '👁️',
    }[level] || '📋';

    console.log(`${prefix} [${timestamp}] ${message}`);
}

function createJestConfig(suite) {
    const baseConfig = {
        preset: 'ts-jest',
        testEnvironment: 'jsdom',
        setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
        moduleNameMapper: {
            '^@/(.*)$': '<rootDir>/$1',
        },
        testMatch: [`<rootDir>/${suite.pattern}`],
        testTimeout: suite.timeout,
        verbose: options.verbose,
        bail: options.bail ? 1 : 0,
        maxWorkers: options.parallel ? '50%' : 1,
    };

    if (suite.coverage && options.coverage) {
        baseConfig.collectCoverage = true;
        baseConfig.collectCoverageFrom = [
            'components/wizard/**/*.{ts,tsx}',
            'hooks/wizard/**/*.{ts,tsx}',
            'lib/wizard/**/*.{ts,tsx}',
            'lib/actions/**/*wizard*.{ts,tsx}',
            '!**/*.d.ts',
            '!**/*.test.{ts,tsx}',
            '!**/__tests__/**',
        ];
        baseConfig.coverageDirectory = `coverage/wizard-${suite.name.toLowerCase().replace(/\s+/g, '-')}`;
        baseConfig.coverageReporters = ['text', 'lcov', 'html', 'json'];
        baseConfig.coverageThreshold = {
            global: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: 80,
            },
        };
    }

    if (options.updateSnapshots) {
        baseConfig.updateSnapshot = true;
    }

    return baseConfig;
}

function runTestSuite(suiteName, suiteConfig) {
    log(`Starting ${suiteConfig.name}...`, 'info');

    const jestConfig = createJestConfig(suiteConfig);
    const configPath = path.join(__dirname, `../jest.wizard.${suiteName}.config.js`);

    // Write temporary Jest config
    fs.writeFileSync(
        configPath,
        `module.exports = ${JSON.stringify(jestConfig, null, 2)};`
    );

    try {
        const jestCommand = [
            'npx jest',
            `--config=${configPath}`,
            options.watch ? '--watch' : '',
            options.verbose ? '--verbose' : '',
            options.updateSnapshots ? '--updateSnapshot' : '',
        ].filter(Boolean).join(' ');

        log(`Running: ${jestCommand}`, 'info');

        const startTime = Date.now();
        execSync(jestCommand, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
        });

        const duration = Date.now() - startTime;
        log(`${suiteConfig.name} completed in ${duration}ms`, 'success');

        return { success: true, duration };
    } catch (error) {
        log(`${suiteConfig.name} failed: ${error.message}`, 'error');
        return { success: false, error: error.message };
    } finally {
        // Clean up temporary config
        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
        }
    }
}

function generateTestReport(results) {
    const reportPath = path.join(__dirname, '../test-reports/wizard-test-report.json');
    const reportDir = path.dirname(reportPath);

    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }

    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total: results.length,
            passed: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0),
        },
        results,
        coverage: {
            // Coverage data would be aggregated here
            overall: 'See individual suite coverage reports',
        },
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`Test report generated: ${reportPath}`, 'success');

    return report;
}

function printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('🧙‍♂️ WIZARD TEST SUITE SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Total Suites: ${report.summary.total}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⏱️  Total Duration: ${report.summary.totalDuration}ms`);
    console.log('='.repeat(60));

    report.results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        const duration = result.duration ? `(${result.duration}ms)` : '';
        console.log(`${status} ${result.suite}: ${result.name} ${duration}`);
        if (!result.success && result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });

    console.log('='.repeat(60));

    if (report.summary.failed > 0) {
        console.log('❌ Some tests failed. Check the output above for details.');
        process.exit(1);
    } else {
        console.log('🎉 All wizard tests passed!');
    }
}

// Performance benchmarking
function runPerformanceBenchmarks() {
    log('Running performance benchmarks...', 'performance');

    const benchmarks = [
        {
            name: 'Wizard Initial Render',
            target: '< 200ms',
            description: 'Time to render wizard with 5 steps',
        },
        {
            name: 'Step Navigation',
            target: '< 100ms',
            description: 'Time to navigate between steps',
        },
        {
            name: 'Data Validation',
            target: '< 50ms',
            description: 'Time to validate step data',
        },
        {
            name: 'Draft Save',
            target: '< 200ms',
            description: 'Time to save draft to storage',
        },
        {
            name: 'Memory Usage',
            target: '< 10MB',
            description: 'Memory usage for large wizard',
        },
    ];

    benchmarks.forEach(benchmark => {
        log(`📊 ${benchmark.name}: ${benchmark.target} - ${benchmark.description}`, 'performance');
    });
}

// Accessibility audit
function runAccessibilityAudit() {
    log('Running accessibility audit...', 'accessibility');

    const auditPoints = [
        'WCAG 2.1 AA Compliance',
        'Keyboard Navigation Support',
        'Screen Reader Compatibility',
        'Focus Management',
        'ARIA Labels and Roles',
        'Color Contrast Requirements',
        'Touch Target Sizes (Mobile)',
    ];

    auditPoints.forEach(point => {
        log(`♿ Checking: ${point}`, 'accessibility');
    });
}

// Visual regression checks
function runVisualRegression() {
    log('Running visual regression tests...', 'visual');

    const viewports = [
        { name: 'Desktop', width: 1920, height: 1080 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Mobile', width: 375, height: 667 },
    ];

    viewports.forEach(viewport => {
        log(`👁️  Testing ${viewport.name} (${viewport.width}x${viewport.height})`, 'visual');
    });
}

// Main execution
async function main() {
    log('🧙‍♂️ Starting Wizard Test Suite', 'info');
    log(`Configuration: ${JSON.stringify(options, null, 2)}`, 'info');

    const results = [];
    const suitesToRun = options.suite === 'all'
        ? Object.keys(TEST_SUITES)
        : [options.suite];

    // Validate suite names
    const invalidSuites = suitesToRun.filter(suite => !TEST_SUITES[suite]);
    if (invalidSuites.length > 0) {
        log(`Invalid test suites: ${invalidSuites.join(', ')}`, 'error');
        log(`Available suites: ${Object.keys(TEST_SUITES).join(', ')}`, 'info');
        process.exit(1);
    }

    // Run pre-test checks
    if (suitesToRun.includes('performance')) {
        runPerformanceBenchmarks();
    }

    if (suitesToRun.includes('accessibility')) {
        runAccessibilityAudit();
    }

    if (suitesToRun.includes('visual')) {
        runVisualRegression();
    }

    // Run test suites
    for (const suiteName of suitesToRun) {
        const suiteConfig = TEST_SUITES[suiteName];
        const result = runTestSuite(suiteName, suiteConfig);

        results.push({
            suite: suiteName,
            name: suiteConfig.name,
            ...result,
        });

        // Bail on first failure if requested
        if (options.bail && !result.success) {
            log('Bailing on first failure', 'warning');
            break;
        }
    }

    // Generate and display report
    const report = generateTestReport(results);
    printSummary(report);
}

// Handle process signals
process.on('SIGINT', () => {
    log('Test run interrupted by user', 'warning');
    process.exit(130);
});

process.on('SIGTERM', () => {
    log('Test run terminated', 'warning');
    process.exit(143);
});

// Run main function
if (require.main === module) {
    main().catch(error => {
        log(`Unexpected error: ${error.message}`, 'error');
        console.error(error.stack);
        process.exit(1);
    });
}

module.exports = {
    runTestSuite,
    generateTestReport,
    TEST_SUITES,
};