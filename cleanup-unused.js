#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files with unused imports/variables to clean up
const filesToClean = [
    'src/infrastructure/database/repositories/DrizzleLandDraftRepository.ts',
    'src/infrastructure/database/repositories/DrizzleLandRepository.ts',
    'src/infrastructure/database/repositories/DrizzlePageSectionRepository.ts',
    'src/infrastructure/database/repositories/DrizzlePropertyDraftRepository.ts',
    'src/infrastructure/database/repositories/DrizzlePropertyRepository.ts',
    'src/infrastructure/database/repositories/DrizzleSessionRepository.ts',
    'src/infrastructure/database/repositories/DrizzleUserRepository.ts',
    'src/infrastructure/database/repositories/DrizzleWizardDraftRepository.ts',
    'src/infrastructure/database/repositories/DrizzleWizardMediaRepository.ts',
];

// Simple replacements for common unused variable patterns
const replacements = [
    // Remove unused imports
    { from: /import.*asc.*from.*drizzle-orm.*\n/g, to: '' },
    { from: /import.*like.*from.*drizzle-orm.*\n/g, to: '' },
    { from: /import.*inArray.*from.*drizzle-orm.*\n/g, to: '' },
    { from: /import.*wizardDrafts.*from.*\n/g, to: '' },

    // Fix unused constructor parameters
    { from: /constructor\(private readonly db: Database\)/g, to: 'constructor(private readonly database: Database)' },
    { from: /constructor\(private readonly database: Database\)/g, to: 'constructor(private readonly db: Database)' },
];

console.log('Starting cleanup of unused imports and variables...');

filesToClean.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        replacements.forEach(replacement => {
            const newContent = content.replace(replacement.from, replacement.to);
            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log(`Cleaned up: ${filePath}`);
        }
    }
});

console.log('Cleanup completed!');