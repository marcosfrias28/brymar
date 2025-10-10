#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive Integration Test Runner for Universal Wizard System
 * 
 * This script runs all integration tests for the universal wizard system,
 * including compatibility verification, draft synchronization, and end-to-end workflows.
 * 
 * Requirements covered:
 * - 5.1: Complete compatibility with existing preview components
 * - 5.2: Draft saving, restoration, and cross-device synchronization
 * - 5.3: AI integration and error handling across all wizards
 * - 5.4: End-to-end testing of complete creation workflows
 * - 5.5: Performance and reliability validation
 * - 7.5: AI integration testing
 * - 8.1-8.5: Comprehensive error handling and recovery
 */

class IntegrationTestRunner {
    constructor() {
        this.testSuites = [
            {
                name: 'Universal Wizard Integration',
                file: 'universal-wizard-integration.test.tsx',
                description: 'Tests all wizard types and validation flows',
                requirements: ['5.1', '5.2', '5.3', '5.4', '5.5', '7.5', '8.1', '8.2', '8.3', '8.4', '8.5'],
                timeout: 30000,
            },
            {
                name: 'Preview Component Compatibility',
                file: 'preview-compatibility.test.tsx',
                description: 'Verifies compatibility with existing preview components',
                requirements: ['5.1', '5.2'],
                timeout: 20000,
            },
            {
                name: 'Draft Synchronization',
                file: 'draft-synchronization.test.tsx',
                description: 'Tests draft saving, restoration, and cross-device sync',
                requirements: ['5.3', '8.1', '8.2', '8.3'],
                timeout: 25000,
            },
            {
                name: 'End-to-End Workflows',
                file: 'end-to-end-workflows.test.tsx',
                description: 'Complete creation workflows for all wizard types',
                requirements: ['5.4', '5.5', '7.5', '8.4', '8.5'],
                timeout: 45000,
            },
        ];

        this.results = {
            startTime: new Date(),
            endTime: null,
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            suiteResults: [],
            coverage: null,
            performance: {
                averageTestTime: 0,
                slowestTest: null,
                fastestTest: null,
            },
            errors: [],
        };

        this.config = {
            generateCoverage: process.argv.includes('--coverage'),
            generateReport: process.argv.includes('--report'),
            verbose: process.argv.includes('--verbose'),
            bail: process.argv.includes('--bail'),
            parallel: process.argv.includes('--parallel'),
            updateSnapshots: process.argv.includes('--updateSnapshots'),
            watchMode: process.argv.includes('--watch'),
            specificSuite: this.getSpecificSuite(),
        };
    }

    getSpecificSuite() {
        const suiteArg = process.argv.find(arg => arg.startsWith('--suite='));
        return suiteArg ? suiteArg.split('=')[1] : null;
    }

    async run() {
        console.log('🧪 Universal Wizard System Integration Test Runner');
        console.log('='.repeat(60));
        console.log(`Started at: ${this.results.startTime.toISOString()}`);
        console.log(`Configuration:`, this.config);
        console.log('');

        try {
            await this.setupEnvironment();
            await this.runTestSuites();
            await this.generateCoverageReport();
            await this.generateTestReport();
            this.displayResults();
        } catch (error) {
            console.error('❌ Test runner failed:', error.message);
            process.exit(1);
        }

        this.results.endTime = new Date();
        const success = this.results.failedTests === 0;
        process.exit(success ? 0 : 1);
    }

    async setupEnvironment() {
        console.log('🔧 Setting up test environment...');

        // Ensure test database is clean
        try {
            execSync('npm run db:test:reset', { stdio: 'pipe' });
            console.log('✅ Test database reset');
        } catch (error) {
            console.warn('⚠️  Could not reset test database:', error.message);
        }

        // Clear any existing test artifacts
        const artifactsDir = path.join(__dirname, 'artifacts');
        if (fs.existsSync(artifactsDir)) {
            fs.rmSync(artifactsDir, { recursive: true, force: true });
        }
        fs.mkdirSync(artifactsDir, { recursive: true });

        // Set environment variables
        process.env.NODE_ENV = 'test';
        process.env.JEST_TIMEOUT = '60000';
        process.env.TEST_INTEGRATION = 'true';

        console.log('✅ Environment setup complete\n');
    }

    async runTestSuites() {
        console.log('🏃 Running test suites...\n');

        const suitesToRun = this.config.specificSuite
            ? this.testSuites.filter(suite => suite.name.toLowerCase().includes(this.config.specificSuite.toLowerCase()))
            : this.testSuites;

        if (suitesToRun.length === 0) {
            throw new Error(`No test suites found matching: ${this.config.specificSuite}`);
        }

        for (const suite of suitesToRun) {
            await this.runTestSuite(suite);

            if (this.config.bail && this.results.failedTests > 0) {
                console.log('🛑 Stopping due to --bail flag');
                break;
            }
        }
    }

    async runTestSuite(suite) {
        console.log(`📋 Running: ${suite.name}`);
        console.log(`   Description: ${suite.description}`);
        console.log(`   Requirements: ${suite.requirements.join(', ')}`);
        console.log(`   Timeout: ${suite.timeout}ms`);

        const startTime = Date.now();
        const suiteResult = {
            name: suite.name,
            file: suite.file,
            requirements: suite.requirements,
            startTime: new Date(startTime),
            endTime: null,
            duration: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            tests: [],
            coverage: null,
            errors: [],
        };

        try {
            const jestCommand = this.buildJestCommand(suite);
            const output = execSync(jestCommand, {
                stdio: 'pipe',
                encoding: 'utf8',
                timeout: suite.timeout,
                env: {
                    ...process.env,
                    JEST_SUITE_NAME: suite.name,
                },
            });

            // Parse Jest output
            this.parseJestOutput(output, suiteResult);

        } catch (error) {
            suiteResult.errors.push({
                message: error.message,
                stack: error.stack,
                stdout: error.stdout,
                stderr: error.stderr,
            });

            // Try to parse partial results from error output
            if (error.stdout) {
                this.parseJestOutput(error.stdout, suiteResult);
            }
        }

        const endTime = Date.now();
        suiteResult.endTime = new Date(endTime);
        suiteResult.duration = endTime - startTime;

        this.results.suiteResults.push(suiteResult);
        this.updateOverallResults(suiteResult);

        this.displaySuiteResult(suiteResult);
        console.log('');
    }

    buildJestCommand(suite) {
        const testFile = path.join(__dirname, suite.file);
        let command = `npx jest "${testFile}" --config=jest.wizard.config.js`;

        if (this.config.verbose) {
            command += ' --verbose';
        }

        if (this.config.generateCoverage) {
            command += ' --coverage --coverageDirectory=components/wizard/__tests__/artifacts/coverage';
        }

        if (this.config.updateSnapshots) {
            command += ' --updateSnapshot';
        }

        command += ` --testTimeout=${suite.timeout}`;
        command += ' --json --outputFile=components/wizard/__tests__/artifacts/jest-results.json';

        return command;
    }

    parseJestOutput(output, suiteResult) {
        try {
            // Try to parse JSON output first
            const jsonMatch = output.match(/\{[\s\S]*"success":\s*(true|false)[\s\S]*\}/);
            if (jsonMatch) {
                const results = JSON.parse(jsonMatch[0]);

                suiteResult.passed = results.numPassedTests || 0;
                suiteResult.failed = results.numFailedTests || 0;
                suiteResult.skipped = results.numPendingTests || 0;

                if (results.testResults && results.testResults[0]) {
                    const testResult = results.testResults[0];
                    suiteResult.tests = testResult.assertionResults || [];

                    if (testResult.coverage) {
                        suiteResult.coverage = testResult.coverage;
                    }
                }

                return;
            }

            // Fallback to regex parsing
            const passedMatch = output.match(/(\d+) passed/);
            const failedMatch = output.match(/(\d+) failed/);
            const skippedMatch = output.match(/(\d+) skipped/);

            suiteResult.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
            suiteResult.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
            suiteResult.skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0;

        } catch (error) {
            console.warn(`⚠️  Could not parse Jest output for ${suiteResult.name}:`, error.message);
        }
    }

    updateOverallResults(suiteResult) {
        this.results.totalTests += suiteResult.passed + suiteResult.failed + suiteResult.skipped;
        this.results.passedTests += suiteResult.passed;
        this.results.failedTests += suiteResult.failed;
        this.results.skippedTests += suiteResult.skipped;

        if (suiteResult.errors.length > 0) {
            this.results.errors.push(...suiteResult.errors);
        }

        // Update performance metrics
        if (!this.results.performance.slowestTest || suiteResult.duration > this.results.performance.slowestTest.duration) {
            this.results.performance.slowestTest = {
                name: suiteResult.name,
                duration: suiteResult.duration,
            };
        }

        if (!this.results.performance.fastestTest || suiteResult.duration < this.results.performance.fastestTest.duration) {
            this.results.performance.fastestTest = {
                name: suiteResult.name,
                duration: suiteResult.duration,
            };
        }
    }

    displaySuiteResult(suiteResult) {
        const status = suiteResult.failed > 0 ? '❌' : suiteResult.passed > 0 ? '✅' : '⚠️';
        const duration = `${suiteResult.duration}ms`;

        console.log(`   ${status} ${suiteResult.name} (${duration})`);
        console.log(`      Passed: ${suiteResult.passed}, Failed: ${suiteResult.failed}, Skipped: ${suiteResult.skipped}`);

        if (suiteResult.errors.length > 0) {
            console.log(`      Errors: ${suiteResult.errors.length}`);
            if (this.config.verbose) {
                suiteResult.errors.forEach((error, index) => {
                    console.log(`        ${index + 1}. ${error.message}`);
                });
            }
        }
    }

    async generateCoverageReport() {
        if (!this.config.generateCoverage) {
            return;
        }

        console.log('📊 Generating coverage report...');

        try {
            // Combine coverage from all suites
            const coverageDir = path.join(__dirname, 'artifacts', 'coverage');
            if (fs.existsSync(coverageDir)) {
                const lcovFile = path.join(coverageDir, 'lcov.info');
                if (fs.existsSync(lcovFile)) {
                    console.log(`✅ Coverage report generated: ${lcovFile}`);

                    // Parse coverage summary
                    const summaryFile = path.join(coverageDir, 'coverage-summary.json');
                    if (fs.existsSync(summaryFile)) {
                        const summary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
                        this.results.coverage = summary.total;
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️  Could not generate coverage report:', error.message);
        }
    }

    async generateTestReport() {
        if (!this.config.generateReport) {
            return;
        }

        console.log('📄 Generating test report...');

        const reportData = {
            ...this.results,
            config: this.config,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                cwd: process.cwd(),
            },
            requirements: {
                '5.1': 'Complete compatibility with existing preview components',
                '5.2': 'Draft saving, restoration, and cross-device synchronization',
                '5.3': 'AI integration and error handling across all wizards',
                '5.4': 'End-to-end testing of complete creation workflows',
                '5.5': 'Performance and reliability validation',
                '7.5': 'AI integration testing',
                '8.1': 'Error handling and recovery - network errors',
                '8.2': 'Error handling and recovery - validation errors',
                '8.3': 'Error handling and recovery - component errors',
                '8.4': 'Error handling and recovery - data persistence errors',
                '8.5': 'Error handling and recovery - user experience',
            },
        };

        // Calculate performance metrics
        if (this.results.suiteResults.length > 0) {
            const totalDuration = this.results.suiteResults.reduce((sum, suite) => sum + suite.duration, 0);
            this.results.performance.averageTestTime = totalDuration / this.results.suiteResults.length;
        }

        // Generate HTML report
        const htmlReport = this.generateHTMLReport(reportData);
        const htmlFile = path.join(__dirname, 'artifacts', 'integration-test-report.html');
        fs.writeFileSync(htmlFile, htmlReport);

        // Generate JSON report
        const jsonFile = path.join(__dirname, 'artifacts', 'integration-test-report.json');
        fs.writeFileSync(jsonFile, JSON.stringify(reportData, null, 2));

        console.log(`✅ Test reports generated:`);
        console.log(`   HTML: ${htmlFile}`);
        console.log(`   JSON: ${jsonFile}`);
    }

    generateHTMLReport(data) {
        const successRate = data.totalTests > 0 ? ((data.passedTests / data.totalTests) * 100).toFixed(1) : 0;
        const duration = data.endTime ? data.endTime - data.startTime : Date.now() - data.startTime;

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universal Wizard System - Integration Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .metric.success { border-left-color: #28a745; }
        .metric.danger { border-left-color: #dc3545; }
        .metric.warning { border-left-color: #ffc107; }
        .metric h3 { margin: 0 0 10px 0; font-size: 2em; }
        .metric p { margin: 0; color: #666; }
        .suite { margin-bottom: 30px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
        .suite-header { background: #f8f9fa; padding: 15px 20px; border-bottom: 1px solid #e9ecef; }
        .suite-content { padding: 20px; }
        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .status.passed { background: #d4edda; color: #155724; }
        .status.failed { background: #f8d7da; color: #721c24; }
        .status.skipped { background: #fff3cd; color: #856404; }
        .requirements { margin-top: 15px; }
        .requirement { display: inline-block; background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; margin: 2px; }
        .errors { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 15px; margin-top: 15px; }
        .coverage { margin-top: 20px; }
        .coverage-bar { background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden; }
        .coverage-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Universal Wizard System</h1>
            <h2>Integration Test Report</h2>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="metric ${data.failedTests === 0 ? 'success' : 'danger'}">
                    <h3>${successRate}%</h3>
                    <p>Success Rate</p>
                </div>
                <div class="metric">
                    <h3>${data.totalTests}</h3>
                    <p>Total Tests</p>
                </div>
                <div class="metric success">
                    <h3>${data.passedTests}</h3>
                    <p>Passed</p>
                </div>
                <div class="metric ${data.failedTests > 0 ? 'danger' : ''}">
                    <h3>${data.failedTests}</h3>
                    <p>Failed</p>
                </div>
                <div class="metric ${data.skippedTests > 0 ? 'warning' : ''}">
                    <h3>${data.skippedTests}</h3>
                    <p>Skipped</p>
                </div>
                <div class="metric">
                    <h3>${Math.round(duration / 1000)}s</h3>
                    <p>Duration</p>
                </div>
            </div>

            ${data.coverage ? `
            <div class="coverage">
                <h3>Code Coverage</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div>
                        <p>Lines: ${data.coverage.lines.pct}%</p>
                        <div class="coverage-bar">
                            <div class="coverage-fill" style="width: ${data.coverage.lines.pct}%"></div>
                        </div>
                    </div>
                    <div>
                        <p>Functions: ${data.coverage.functions.pct}%</p>
                        <div class="coverage-bar">
                            <div class="coverage-fill" style="width: ${data.coverage.functions.pct}%"></div>
                        </div>
                    </div>
                    <div>
                        <p>Branches: ${data.coverage.branches.pct}%</p>
                        <div class="coverage-bar">
                            <div class="coverage-fill" style="width: ${data.coverage.branches.pct}%"></div>
                        </div>
                    </div>
                    <div>
                        <p>Statements: ${data.coverage.statements.pct}%</p>
                        <div class="coverage-bar">
                            <div class="coverage-fill" style="width: ${data.coverage.statements.pct}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}

            <h3>Test Suites</h3>
            ${data.suiteResults.map(suite => `
                <div class="suite">
                    <div class="suite-header">
                        <h4>${suite.name} <span class="status ${suite.failed > 0 ? 'failed' : 'passed'}">${suite.failed > 0 ? 'FAILED' : 'PASSED'}</span></h4>
                        <p>${suite.description}</p>
                        <p><strong>Duration:</strong> ${suite.duration}ms</p>
                        <div class="requirements">
                            <strong>Requirements:</strong>
                            ${suite.requirements.map(req => `<span class="requirement">${req}</span>`).join('')}
                        </div>
                    </div>
                    <div class="suite-content">
                        <p>
                            <span class="status passed">${suite.passed} Passed</span>
                            <span class="status failed">${suite.failed} Failed</span>
                            <span class="status skipped">${suite.skipped} Skipped</span>
                        </p>
                        ${suite.errors.length > 0 ? `
                            <div class="errors">
                                <h5>Errors:</h5>
                                ${suite.errors.map(error => `<p>${error.message}</p>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}

            <h3>Performance Metrics</h3>
            <div class="summary">
                <div class="metric">
                    <h3>${Math.round(data.performance.averageTestTime)}ms</h3>
                    <p>Average Test Time</p>
                </div>
                ${data.performance.slowestTest ? `
                <div class="metric warning">
                    <h3>${data.performance.slowestTest.duration}ms</h3>
                    <p>Slowest: ${data.performance.slowestTest.name}</p>
                </div>
                ` : ''}
                ${data.performance.fastestTest ? `
                <div class="metric success">
                    <h3>${data.performance.fastestTest.duration}ms</h3>
                    <p>Fastest: ${data.performance.fastestTest.name}</p>
                </div>
                ` : ''}
            </div>

            <h3>Requirements Coverage</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
                ${Object.entries(data.requirements).map(([req, desc]) => {
            const covered = data.suiteResults.some(suite => suite.requirements.includes(req) && suite.failed === 0);
            return `
                    <div class="requirement" style="padding: 10px; background: ${covered ? '#d4edda' : '#f8d7da'};">
                        <strong>${req}:</strong> ${desc}
                        <span class="status ${covered ? 'passed' : 'failed'}" style="float: right;">${covered ? 'COVERED' : 'NOT COVERED'}</span>
                    </div>
                  `;
        }).join('')}
            </div>
        </div>
    </div>
</body>
</html>
    `;
    }

    displayResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 INTEGRATION TEST RESULTS');
        console.log('='.repeat(60));

        const duration = this.results.endTime ? this.results.endTime - this.results.startTime : Date.now() - this.results.startTime;
        const successRate = this.results.totalTests > 0 ? ((this.results.passedTests / this.results.totalTests) * 100).toFixed(1) : 0;

        console.log(`Total Tests: ${this.results.totalTests}`);
        console.log(`Passed: ${this.results.passedTests} ✅`);
        console.log(`Failed: ${this.results.failedTests} ${this.results.failedTests > 0 ? '❌' : '✅'}`);
        console.log(`Skipped: ${this.results.skippedTests} ${this.results.skippedTests > 0 ? '⚠️' : '✅'}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log(`Duration: ${Math.round(duration / 1000)}s`);

        if (this.results.coverage) {
            console.log('\n📊 Coverage:');
            console.log(`Lines: ${this.results.coverage.lines.pct}%`);
            console.log(`Functions: ${this.results.coverage.functions.pct}%`);
            console.log(`Branches: ${this.results.coverage.branches.pct}%`);
            console.log(`Statements: ${this.results.coverage.statements.pct}%`);
        }

        if (this.results.performance.averageTestTime > 0) {
            console.log('\n⚡ Performance:');
            console.log(`Average Test Time: ${Math.round(this.results.performance.averageTestTime)}ms`);
            if (this.results.performance.slowestTest) {
                console.log(`Slowest Test: ${this.results.performance.slowestTest.name} (${this.results.performance.slowestTest.duration}ms)`);
            }
            if (this.results.performance.fastestTest) {
                console.log(`Fastest Test: ${this.results.performance.fastestTest.name} (${this.results.performance.fastestTest.duration}ms)`);
            }
        }

        if (this.results.errors.length > 0) {
            console.log('\n❌ Errors:');
            this.results.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.message}`);
            });
        }

        console.log('\n' + '='.repeat(60));

        if (this.results.failedTests === 0) {
            console.log('🎉 ALL INTEGRATION TESTS PASSED!');
            console.log('✅ Universal Wizard System is ready for deployment');
        } else {
            console.log('❌ SOME TESTS FAILED');
            console.log('🔧 Please review and fix the failing tests before deployment');
        }

        console.log('='.repeat(60));
    }
}

// Run the integration tests
if (require.main === module) {
    const runner = new IntegrationTestRunner();
    runner.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = IntegrationTestRunner;