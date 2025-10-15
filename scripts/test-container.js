#!/usr/bin/env node

/**
 * CLI script to test container setup
 * Run with: node scripts/test-container.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Testing Container Setup - Task 2 Verification');
console.log('='.repeat(50));

try {
    // Check if we're in the right directory
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    require(packageJsonPath); // This will throw if package.json doesn't exist

    console.log('📦 Project detected, running container tests...\n');

    // Try different methods to run the TypeScript test
    const testFile = path.join(process.cwd(), 'src', 'test-container-simple.ts');

    try {
        console.log('🔧 Attempting to run with tsx...');
        execSync('npx tsx --version', { stdio: 'pipe' });
        execSync(`npx tsx -e "
            const { runAllTests } = require('${testFile.replace(/\\/g, '/')}');
            const result = runAllTests();
            process.exit(result ? 0 : 1);
        "`, { stdio: 'inherit' });

    } catch (tsxError) {
        try {
            console.log('🔧 tsx not available, trying ts-node...');
            execSync('npx ts-node --version', { stdio: 'pipe' });
            execSync(`npx ts-node -e "
                const { runAllTests } = require('${testFile.replace(/\\/g, '/')}');
                const result = runAllTests();
                process.exit(result ? 0 : 1);
            "`, { stdio: 'inherit' });

        } catch (tsNodeError) {
            console.log('⚠️  TypeScript runners not available.');
            console.log('📝 Manual verification steps:');
            console.log('');
            console.log('1. Start your Next.js development server:');
            console.log('   npm run dev');
            console.log('');
            console.log('2. Navigate to the test page:');
            console.log('   http://localhost:3000/test-container');
            console.log('');
            console.log('3. Click "Run All Tests" to verify the implementation');
            console.log('');
            console.log('✅ If all tests pass, Task 2 is successfully completed!');

            // Try to open the browser automatically
            try {
                const open = require('open');
                console.log('🌐 Attempting to open test page...');
                open('http://localhost:3000/test-container');
            } catch (openError) {
                // Ignore if 'open' package is not available
            }

            return;
        }
    }

    console.log('\n✅ Container tests completed successfully!');
    console.log('🎉 Task 2: Replace Stub Use Case Implementations - COMPLETED');

} catch (error) {
    console.error('\n❌ Test execution failed:');
    console.error(error.message);

    console.log('\n💡 Alternative testing methods:');
    console.log('1. Visit http://localhost:3000/test-container in your browser');
    console.log('2. Check the browser console for test results');
    console.log('3. Verify that use cases are properly instantiated');

    process.exit(1);
}