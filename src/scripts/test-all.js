#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Complete Test Suite for Brymar Inmobiliaria\n');

async function runTests() {
  try {
    console.log('📋 Step 1: Running Admin System Unit Tests...');
    execSync('node scripts/test-admin.js', { stdio: 'inherit' });
    console.log('✅ Admin system unit tests passed!\n');

    console.log('📋 Step 2: Starting development server for E2E tests...');
    console.log('ℹ️  Make sure your development server is running on http://localhost:3000');
    console.log('ℹ️  Run "pnpm dev" in another terminal if not already running\n');

    console.log('📋 Step 3: Running E2E Tests...');
    execSync('pnpm test:e2e', { stdio: 'inherit' });
    console.log('✅ E2E tests passed!\n');

    console.log('🎉 All tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Admin System Unit Tests: PASSED');
    console.log('✅ Authentication E2E Tests: PASSED');
    console.log('✅ Admin System E2E Tests: PASSED');
    
  } catch (error) {
    console.error('\n❌ Test suite failed.');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

runTests();