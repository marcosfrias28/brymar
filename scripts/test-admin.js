#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Running Better Auth Admin System Tests...\n');

const testFiles = [
  'lib/__tests__/admin-system.test.ts',
  'lib/__tests__/admin-system-integration.test.ts', 
  'lib/__tests__/middleware-auth.test.ts',
  'lib/__tests__/auth-actions.test.ts',
  'lib/__tests__/admin-hooks.test.ts'
];

try {
  const result = execSync(`pnpm jest ${testFiles.join(' ')} --verbose`, {
    stdio: 'inherit',
    encoding: 'utf8'
  });
  
  console.log('\n✅ All admin system tests passed!');
} catch (error) {
  console.error('\n❌ Some admin system tests failed.');
  process.exit(1);
}