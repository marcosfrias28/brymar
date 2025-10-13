#!/usr/bin/env node

/**
 * Test validation script to check if all test files are properly structured
 */

const fs = require('fs');
const path = require('path');

const testFiles = [
    'enhanced-ai-description.test.tsx',
    'interactive-map.test.tsx',
    'step-validation.test.tsx',
    'wizard-integration.test.tsx',
    'mobile-responsiveness.test.tsx',
    'error-recovery.test.tsx',
    'performance.test.tsx',
];

function validateTestFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];

    // Check for basic test structure
    if (!content.includes('describe(')) {
        issues.push('Missing describe blocks');
    }

    if (!content.includes('it(') && !content.includes('test(')) {
        issues.push('Missing test cases');
    }

    // Check for proper imports
    if (!content.includes('import') && !content.includes('require')) {
        issues.push('Missing imports');
    }

    // Check for React Testing Library imports
    if (content.includes('@testing-library/react') && !content.includes('render')) {
        issues.push('Missing render import from testing library');
    }

    // Check for proper cleanup
    if (content.includes('beforeEach') || content.includes('afterEach')) {
        // Good practice found
    }

    return issues;
}

function main() {
    console.log('🔍 Validating test files...\n');

    let totalIssues = 0;
    let validFiles = 0;

    testFiles.forEach(fileName => {
        const filePath = path.join(__dirname, fileName);

        if (!fs.existsSync(filePath)) {
            console.log(`❌ ${fileName} - File not found`);
            totalIssues++;
            return;
        }

        const issues = validateTestFile(filePath);

        if (issues.length === 0) {
            console.log(`✅ ${fileName} - Valid`);
            validFiles++;
        } else {
            console.log(`⚠️  ${fileName} - Issues found:`);
            issues.forEach(issue => {
                console.log(`   • ${issue}`);
            });
            totalIssues += issues.length;
        }
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Valid files: ${validFiles}/${testFiles.length}`);
    console.log(`   Total issues: ${totalIssues}`);

    if (totalIssues === 0) {
        console.log('\n🎉 All test files are valid!');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some issues found. Please review the files above.');
        process.exit(1);
    }
}

main();