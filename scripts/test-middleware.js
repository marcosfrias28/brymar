#!/usr/bin/env node

/**
 * Simple test script to verify middleware behavior
 * This simulates the requests that were being blocked
 */

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(method, path, description) {
    console.log(`\n🧪 Testing ${method} ${path} - ${description}`);

    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: {
                'User-Agent': 'test-script/1.0',
                'Content-Type': 'application/json',
            },
            // Add a simple body for POST requests
            body: method === 'POST' ? JSON.stringify({ test: true }) : undefined,
        });

        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📋 Headers: X-Loop-Warning=${response.headers.get('X-Loop-Warning')}, X-Request-ID=${response.headers.get('X-Request-ID')}`);

        return response.status < 400;
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting middleware tests...');

    // Test the endpoints that were being blocked
    const tests = [
        ['GET', '/dashboard/properties/new', 'Property creation page'],
        ['POST', '/dashboard/properties/new', 'Property form submission'],
        ['GET', '/dashboard/lands/new', 'Land creation page'],
        ['POST', '/dashboard/lands/new', 'Land form submission'],
        ['POST', '/dashboard/properties/31/edit', 'Property edit submission'],
        ['GET', '/dashboard', 'Dashboard access'],
        ['GET', '/', 'Homepage'],
    ];

    let passed = 0;
    let total = tests.length;

    for (const [method, path, description] of tests) {
        const success = await testEndpoint(method, path, description);
        if (success) passed++;

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Test Results: ${passed}/${total} passed`);

    if (passed === total) {
        console.log('🎉 All tests passed! Middleware is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the middleware configuration.');
    }
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };