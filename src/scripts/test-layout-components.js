#!/usr/bin/env node

/**
 * Test runner for layout components
 * Runs all layout-related tests with proper configuration
 */

const { execSync } = require('child_process');
const path = require('path');

const testPatterns = [
    'components/layout/__tests__/**/*.test.{ts,tsx}',
    'components/__tests__/admin-sidebar.test.tsx',
    'components/__tests__/navigation-integration.test.tsx',
    'components/__tests__/responsive-behavior.test.tsx',
    'components/__tests__/visual-regression.test.tsx',
];

const testCommand = `jest ${testPatterns.join(' ')} --verbose --coverage --collectCoverageFrom="components/layout/**/*.{ts,tsx}" --collectCoverageFrom="components/admin-sidebar.tsx"`;

console.log('🧪 Running layout component tests...\n');

try {
    execSync(testCommand, {
        stdio: 'inherit',
        cwd: process.cwd(),
    });

    console.log('\n✅ All layout component tests passed!');
} catch (error) {
    console.error('\n❌ Some tests failed. Check the output above for details.');
    process.exit(1);
}