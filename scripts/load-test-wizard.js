#!/usr/bin/env node

/**
 * AI Property Wizard Load Testing Script
 * 
 * This script performs load testing on the wizard to validate performance
 * under concurrent user scenarios and high traffic conditions.
 */

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');

// Configuration
const LOAD_TEST_CONFIG = {
    baseUrl: process.env.LOAD_TEST_URL || 'http://localhost:3000',
    scenarios: {
        light: {
            users: 5,
            duration: 60, // seconds
            rampUp: 10, // seconds
        },
        moderate: {
            users: 20,
            duration: 120,
            rampUp: 30,
        },
        heavy: {
            users: 50,
            duration: 300,
            rampUp: 60,
        },
        stress: {
            users: 100,
            duration: 600,
            rampUp: 120,
        },
    },
    endpoints: {
        wizard: '/dashboard/properties/new',
        aiGeneration: '/api/analytics/wizard/ai',
        imageUpload: '/api/signed-upload',
        healthCheck: '/api/health-check',
        analytics: '/api/analytics/wizard',
    },
    thresholds: {
        responseTime: {
            p95: 2000, // 95th percentile should be under 2s
            p99: 5000, // 99th percentile should be under 5s
        },
        errorRate: 0.05, // Less than 5% error rate
        throughput: 10, // Minimum 10 requests per second
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

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
    log(`\n${colors.bright}${colors.cyan}=== ${message} ===${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, colors.green);
}

function logError(message) {
    log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
    log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
    log(`ℹ️  ${message}`, colors.blue);
}

// Test scenarios
const testScenarios = {
    // Basic wizard page load
    wizardPageLoad: async (baseUrl) => {
        const start = Date.now();
        try {
            const response = await fetch(`${baseUrl}${LOAD_TEST_CONFIG.endpoints.wizard}`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'LoadTest/1.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
                signal: AbortSignal.timeout(10000),
            });

            const duration = Date.now() - start;

            return {
                success: response.ok,
                status: response.status,
                duration,
                size: parseInt(response.headers.get('content-length') || '0'),
                scenario: 'wizardPageLoad',
            };
        } catch (error) {
            return {
                success: false,
                status: 0,
                duration: Date.now() - start,
                error: error.message,
                scenario: 'wizardPageLoad',
            };
        }
    },

    // AI generation API call
    aiGeneration: async (baseUrl) => {
        const start = Date.now();
        try {
            const response = await fetch(`${baseUrl}${LOAD_TEST_CONFIG.endpoints.aiGeneration}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'LoadTest/1.0',
                },
                body: JSON.stringify({
                    type: 'description',
                    propertyData: {
                        title: 'Test Property',
                        type: 'house',
                        price: 150000,
                        surface: 200,
                        characteristics: ['pool', 'parking'],
                    },
                }),
                signal: AbortSignal.timeout(30000),
            });

            const duration = Date.now() - start;

            return {
                success: response.ok,
                status: response.status,
                duration,
                scenario: 'aiGeneration',
            };
        } catch (error) {
            return {
                success: false,
                status: 0,
                duration: Date.now() - start,
                error: error.message,
                scenario: 'aiGeneration',
            };
        }
    },

    // Image upload signed URL generation
    imageUploadSignedUrl: async (baseUrl) => {
        const start = Date.now();
        try {
            const response = await fetch(`${baseUrl}${LOAD_TEST_CONFIG.endpoints.imageUpload}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'LoadTest/1.0',
                },
                body: JSON.stringify({
                    filename: 'test-image.jpg',
                    contentType: 'image/jpeg',
                    size: 1024 * 1024, // 1MB
                }),
                signal: AbortSignal.timeout(10000),
            });

            const duration = Date.now() - start;

            return {
                success: response.ok,
                status: response.status,
                duration,
                scenario: 'imageUploadSignedUrl',
            };
        } catch (error) {
            return {
                success: false,
                status: 0,
                duration: Date.now() - start,
                error: error.message,
                scenario: 'imageUploadSignedUrl',
            };
        }
    },

    // Health check
    healthCheck: async (baseUrl) => {
        const start = Date.now();
        try {
            const response = await fetch(`${baseUrl}${LOAD_TEST_CONFIG.endpoints.healthCheck}`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'LoadTest/1.0',
                },
                signal: AbortSignal.timeout(5000),
            });

            const duration = Date.now() - start;

            return {
                success: response.ok,
                status: response.status,
                duration,
                scenario: 'healthCheck',
            };
        } catch (error) {
            return {
                success: false,
                status: 0,
                duration: Date.now() - start,
                error: error.message,
                scenario: 'healthCheck',
            };
        }
    },

    // Analytics endpoint
    analytics: async (baseUrl) => {
        const start = Date.now();
        try {
            const response = await fetch(`${baseUrl}${LOAD_TEST_CONFIG.endpoints.analytics}/summary`, {
                method: 'GET',
                headers: {
                    'User-Agent': 'LoadTest/1.0',
                },
                signal: AbortSignal.timeout(10000),
            });

            const duration = Date.now() - start;

            return {
                success: response.ok,
                status: response.status,
                duration,
                scenario: 'analytics',
            };
        } catch (error) {
            return {
                success: false,
                status: 0,
                duration: Date.now() - start,
                error: error.message,
                scenario: 'analytics',
            };
        }
    },

    // Complete wizard flow simulation
    completeWizardFlow: async (baseUrl) => {
        const results = [];
        const scenarios = [
            'wizardPageLoad',
            'aiGeneration',
            'imageUploadSignedUrl',
            'analytics',
        ];

        for (const scenario of scenarios) {
            const result = await testScenarios[scenario](baseUrl);
            results.push(result);

            // Small delay between requests to simulate user behavior
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        }

        return {
            success: results.every(r => r.success),
            duration: results.reduce((sum, r) => sum + r.duration, 0),
            results,
            scenario: 'completeWizardFlow',
        };
    },
};

// Worker thread for load testing
if (!isMainThread) {
    const { scenario, baseUrl, duration, userId } = workerData;
    const results = [];
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);

    (async () => {
        while (Date.now() < endTime) {
            try {
                const result = await testScenarios[scenario](baseUrl);
                result.timestamp = Date.now();
                result.userId = userId;
                results.push(result);

                // Random delay between requests (0.5-3 seconds)
                const delay = 500 + Math.random() * 2500;
                await new Promise(resolve => setTimeout(resolve, delay));
            } catch (error) {
                results.push({
                    success: false,
                    error: error.message,
                    timestamp: Date.now(),
                    userId,
                    scenario,
                });
            }
        }

        parentPort.postMessage(results);
    })();
}

// Statistics calculation
function calculateStats(results) {
    if (results.length === 0) return null;

    const durations = results.filter(r => r.duration).map(r => r.duration);
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.length - successCount;

    durations.sort((a, b) => a - b);

    const stats = {
        totalRequests: results.length,
        successCount,
        errorCount,
        errorRate: errorCount / results.length,
        avgResponseTime: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        minResponseTime: Math.min(...durations),
        maxResponseTime: Math.max(...durations),
        p50: durations[Math.floor(durations.length * 0.5)],
        p95: durations[Math.floor(durations.length * 0.95)],
        p99: durations[Math.floor(durations.length * 0.99)],
    };

    // Calculate throughput (requests per second)
    const timeSpan = (Math.max(...results.map(r => r.timestamp)) - Math.min(...results.map(r => r.timestamp))) / 1000;
    stats.throughput = results.length / timeSpan;

    return stats;
}

// Run load test for a specific scenario
async function runLoadTest(scenarioName, config) {
    logHeader(`Load Test: ${scenarioName.toUpperCase()}`);
    logInfo(`Users: ${config.users}, Duration: ${config.duration}s, Ramp-up: ${config.rampUp}s`);

    const workers = [];
    const allResults = [];

    // Create workers with ramp-up
    for (let i = 0; i < config.users; i++) {
        const delay = (config.rampUp * 1000 * i) / config.users;

        setTimeout(() => {
            const worker = new Worker(__filename, {
                workerData: {
                    scenario: 'completeWizardFlow',
                    baseUrl: LOAD_TEST_CONFIG.baseUrl,
                    duration: config.duration,
                    userId: i,
                },
            });

            worker.on('message', (results) => {
                allResults.push(...results);
            });

            worker.on('error', (error) => {
                logError(`Worker ${i} error: ${error.message}`);
            });

            workers.push(worker);
        }, delay);
    }

    // Wait for all workers to complete
    await new Promise(resolve => {
        const checkInterval = setInterval(() => {
            if (workers.length === config.users) {
                Promise.all(workers.map(w => new Promise(res => w.on('exit', res))))
                    .then(() => {
                        clearInterval(checkInterval);
                        resolve();
                    });
            }
        }, 1000);
    });

    // Calculate and display statistics
    const stats = calculateStats(allResults);

    if (stats) {
        logInfo(`Total Requests: ${stats.totalRequests}`);
        logInfo(`Success Rate: ${((1 - stats.errorRate) * 100).toFixed(2)}%`);
        logInfo(`Error Rate: ${(stats.errorRate * 100).toFixed(2)}%`);
        logInfo(`Avg Response Time: ${stats.avgResponseTime.toFixed(2)}ms`);
        logInfo(`95th Percentile: ${stats.p95.toFixed(2)}ms`);
        logInfo(`99th Percentile: ${stats.p99.toFixed(2)}ms`);
        logInfo(`Throughput: ${stats.throughput.toFixed(2)} req/s`);

        // Check against thresholds
        const thresholds = LOAD_TEST_CONFIG.thresholds;

        if (stats.p95 <= thresholds.responseTime.p95) {
            logSuccess(`95th percentile response time within threshold (${stats.p95.toFixed(2)}ms <= ${thresholds.responseTime.p95}ms)`);
        } else {
            logError(`95th percentile response time exceeds threshold (${stats.p95.toFixed(2)}ms > ${thresholds.responseTime.p95}ms)`);
        }

        if (stats.p99 <= thresholds.responseTime.p99) {
            logSuccess(`99th percentile response time within threshold (${stats.p99.toFixed(2)}ms <= ${thresholds.responseTime.p99}ms)`);
        } else {
            logError(`99th percentile response time exceeds threshold (${stats.p99.toFixed(2)}ms > ${thresholds.responseTime.p99}ms)`);
        }

        if (stats.errorRate <= thresholds.errorRate) {
            logSuccess(`Error rate within threshold (${(stats.errorRate * 100).toFixed(2)}% <= ${(thresholds.errorRate * 100).toFixed(2)}%)`);
        } else {
            logError(`Error rate exceeds threshold (${(stats.errorRate * 100).toFixed(2)}% > ${(thresholds.errorRate * 100).toFixed(2)}%)`);
        }

        if (stats.throughput >= thresholds.throughput) {
            logSuccess(`Throughput meets minimum requirement (${stats.throughput.toFixed(2)} >= ${thresholds.throughput} req/s)`);
        } else {
            logError(`Throughput below minimum requirement (${stats.throughput.toFixed(2)} < ${thresholds.throughput} req/s)`);
        }

        return stats;
    } else {
        logError('No valid results collected');
        return null;
    }
}

// Individual endpoint testing
async function testIndividualEndpoints() {
    logHeader('Individual Endpoint Testing');

    const endpoints = Object.keys(testScenarios).filter(key => key !== 'completeWizardFlow');
    const results = {};

    for (const endpoint of endpoints) {
        logInfo(`Testing ${endpoint}...`);

        const testResults = [];
        for (let i = 0; i < 10; i++) {
            const result = await testScenarios[endpoint](LOAD_TEST_CONFIG.baseUrl);
            testResults.push(result);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const stats = calculateStats(testResults);
        results[endpoint] = stats;

        if (stats) {
            if (stats.errorRate === 0) {
                logSuccess(`${endpoint}: 100% success rate, avg ${stats.avgResponseTime.toFixed(2)}ms`);
            } else {
                logWarning(`${endpoint}: ${((1 - stats.errorRate) * 100).toFixed(2)}% success rate, avg ${stats.avgResponseTime.toFixed(2)}ms`);
            }
        } else {
            logError(`${endpoint}: No valid responses`);
        }
    }

    return results;
}

// Main execution
async function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
AI Property Wizard Load Testing Script

Usage: node scripts/load-test-wizard.js [options] [scenario]

Scenarios:
  light      - Light load (5 users, 60s)
  moderate   - Moderate load (20 users, 120s)
  heavy      - Heavy load (50 users, 300s)
  stress     - Stress test (100 users, 600s)
  endpoints  - Test individual endpoints only
  all        - Run all scenarios (default)

Options:
  --help, -h     Show this help message
  --url URL      Set base URL (default: http://localhost:3000)
  --verbose, -v  Enable verbose output

Environment Variables:
  LOAD_TEST_URL  Base URL for testing

Examples:
  node scripts/load-test-wizard.js light
  node scripts/load-test-wizard.js --url https://myapp.vercel.app moderate
  LOAD_TEST_URL=https://staging.myapp.com node scripts/load-test-wizard.js heavy
    `);
        return;
    }

    // Parse arguments
    const urlIndex = args.indexOf('--url');
    if (urlIndex !== -1 && args[urlIndex + 1]) {
        LOAD_TEST_CONFIG.baseUrl = args[urlIndex + 1];
    }

    const scenario = args.find(arg => !arg.startsWith('--')) || 'all';

    log(`${colors.bright}${colors.magenta}AI Property Wizard Load Testing${colors.reset}`);
    log(`Target URL: ${LOAD_TEST_CONFIG.baseUrl}`);
    log(`Scenario: ${scenario}`);
    log(`Timestamp: ${new Date().toISOString()}\n`);

    try {
        // Test individual endpoints first
        if (scenario === 'endpoints' || scenario === 'all') {
            await testIndividualEndpoints();
        }

        // Run load tests
        if (scenario === 'all') {
            for (const [name, config] of Object.entries(LOAD_TEST_CONFIG.scenarios)) {
                await runLoadTest(name, config);
                await new Promise(resolve => setTimeout(resolve, 5000)); // Cool down between tests
            }
        } else if (LOAD_TEST_CONFIG.scenarios[scenario]) {
            await runLoadTest(scenario, LOAD_TEST_CONFIG.scenarios[scenario]);
        } else if (scenario !== 'endpoints') {
            logError(`Unknown scenario: ${scenario}`);
            process.exit(1);
        }

        logHeader('Load Testing Complete');
        logSuccess('All load tests completed successfully');

    } catch (error) {
        logError(`Load testing failed: ${error.message}`);
        process.exit(1);
    }
}

// Run if this is the main thread
if (isMainThread) {
    main().catch(error => {
        logError(`Unexpected error: ${error.message}`);
        process.exit(1);
    });
}