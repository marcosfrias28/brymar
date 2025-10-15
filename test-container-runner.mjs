/**
 * Simple test runner for the container setup
 * This file can be run with Node.js to test the container
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Running Container Setup Tests...\n');

try {
    // Try to compile and run the TypeScript test file
    console.log('📝 Compiling TypeScript test file...');

    // Use tsx to run the TypeScript file directly
    const testFile = join(__dirname, 'src', 'test-container.ts');

    console.log('🧪 Executing container tests...\n');

    // Run the test using tsx (if available) or ts-node
    try {
        execSync(`npx tsx ${testFile}`, {
            stdio: 'inherit',
            cwd: __dirname
        });
    } catch (tsxError) {
        console.log('tsx not available, trying ts-node...');
        try {
            execSync(`npx ts-node ${testFile}`, {
                stdio: 'inherit',
                cwd: __dirname
            });
        } catch (tsNodeError) {
            console.log('ts-node not available, trying direct TypeScript compilation...');

            // Compile to JavaScript and run
            execSync(`npx tsc ${testFile} --outDir ./dist --target es2020 --module commonjs --esModuleInterop --skipLibCheck`, {
                cwd: __dirname
            });

            const compiledFile = join(__dirname, 'dist', 'src', 'test-container.js');
            execSync(`node ${compiledFile}`, {
                stdio: 'inherit',
                cwd: __dirname
            });
        }
    }

    console.log('\n✅ Container tests completed successfully!');

} catch (error) {
    console.error('\n❌ Container tests failed:');
    console.error(error.message);

    console.log('\n💡 To run the tests manually:');
    console.log('1. Install tsx: npm install -g tsx');
    console.log('2. Run: tsx src/test-container.ts');
    console.log('\nOr:');
    console.log('1. Install ts-node: npm install -g ts-node');
    console.log('2. Run: ts-node src/test-container.ts');

    process.exit(1);
}