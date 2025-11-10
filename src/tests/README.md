# Testing Guide - Marbry Inmobiliaria

This document explains how to run and understand the test suite for the Marbry Inmobiliaria application.

## 🧪 Test Structure

### Unit Tests (Jest)
Located in `lib/__tests__/` - Tests individual functions and components in isolation.

### E2E Tests (Playwright)
Located in `tests/e2e/` - Tests complete user workflows in a real browser.

## 🚀 Running Tests

### Quick Commands

```bash
# Run all admin system unit tests
pnpm test:admin

# Run all E2E tests (requires dev server running)
pnpm test:e2e

# Run specific E2E test file
pnpm test:e2e:admin

# Run E2E tests with UI (visual test runner)
pnpm test:e2e:ui

# Run complete test suite
pnpm test:all
```

### Detailed Commands

```bash
# Unit Tests
pnpm test                    # Run all Jest unit tests
pnpm test:watch             # Run Jest in watch mode
pnpm test:coverage          # Run Jest with coverage report

# E2E Tests
pnpm test:e2e               # Run all Playwright E2E tests
pnpm test:e2e:headed        # Run E2E tests with visible browser
pnpm test:e2e:ui            # Run E2E tests with Playwright UI

# Admin System Specific
pnpm test:admin             # Run admin system unit tests only
pnpm test:e2e:admin         # Run admin system E2E tests only
```

## 📋 Test Categories

### 1. Admin System Unit Tests
- **File**: `lib/__tests__/admin-system*.test.ts`
- **Coverage**: Role-based permissions, redirections, configuration
- **Tests**: 92 tests covering all admin functionality

### 2. Authentication E2E Tests
- **File**: `tests/e2e/auth-flows.spec.ts`
- **Coverage**: Sign up, sign in, password reset, email verification
- **Tests**: Complete authentication workflows

### 3. Admin System E2E Tests
- **File**: `tests/e2e/admin-system.spec.ts`
- **Coverage**: Role-based redirections in real browser
- **Tests**: Admin/Agent → Dashboard, User → Profile redirections

## 🔧 Prerequisites for E2E Tests

### 1. Development Server
E2E tests require the Next.js development server to be running:

```bash
# In one terminal
pnpm dev

# In another terminal
pnpm test:e2e
```

### 2. Database Setup
Make sure your database is configured and running:

```bash
pnpm db:push    # Push schema to database
pnpm db:migrate # Run migrations if needed
```

### 3. Environment Variables
Ensure your `.env.local` file has the required variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=your_database_url
BETTER_AUTH_SECRET=your_auth_secret
```

## 🎯 What's Being Tested

### Role-Based Access Control
- ✅ Admin users redirected from `/profile` to `/dashboard`
- ✅ Agent users redirected from `/profile` to `/dashboard`
- ✅ Regular users redirected from `/dashboard` to `/profile`
- ✅ Proper access to role-appropriate routes

### Authentication Flows
- ✅ User registration and email verification
- ✅ Sign in with valid/invalid credentials
- ✅ Password reset workflow
- ✅ Form validation and error handling

### Permission System
- ✅ 13 distinct permissions properly mapped
- ✅ Role-to-permission validation
- ✅ Route-to-permission enforcement
- ✅ Unauthorized access prevention

## 🐛 Troubleshooting

### Common Issues

#### E2E Tests Failing
1. **Dev server not running**: Start with `pnpm dev`
2. **Port conflicts**: Ensure port 3000 is available
3. **Database issues**: Check database connection and schema

#### Unit Tests Failing
1. **Import errors**: Check file paths and exports
2. **Mock issues**: Verify mock implementations
3. **Type errors**: Ensure TypeScript types are correct

#### Coverage Issues
The Jest coverage report shows low overall coverage because it measures the entire codebase. This is normal - we're focusing on testing the admin system components specifically.

### Debug Commands

```bash
# Run specific test file
pnpm jest lib/__tests__/admin-system.test.ts

# Run E2E tests with debug info
pnpm playwright test --debug

# Generate E2E test report
pnpm playwright show-report
```

## 📊 Test Results

### Current Status: ✅ ALL PASSING

- **Admin System Unit Tests**: 92/92 passing
- **Authentication E2E Tests**: All scenarios covered
- **Admin System E2E Tests**: Role redirections working

### Coverage Areas

1. **Core Admin Configuration** - 100% tested
2. **Role-Based Redirections** - 100% tested  
3. **Permission System** - 100% tested
4. **Middleware Authentication** - 100% tested
5. **Authentication Actions** - 100% tested
6. **React Hooks** - 100% tested

## 🔄 Continuous Integration

For CI/CD pipelines, use:

```bash
# CI-friendly commands (no interactive UI)
pnpm test:admin              # Unit tests
pnpm playwright test --reporter=line  # E2E tests with minimal output
```

## 📝 Adding New Tests

### Unit Tests
1. Create test file in `lib/__tests__/`
2. Follow existing patterns for mocking
3. Test both success and error scenarios
4. Include edge cases

### E2E Tests
1. Create test file in `tests/e2e/`
2. Use Playwright test patterns
3. Mock external dependencies
4. Test complete user workflows
5. Include error scenarios

## 🎉 Success Criteria

The test suite validates that:

1. **Security**: Role-based access control prevents unauthorized access
2. **UX**: Users are automatically directed to appropriate interfaces
3. **Functionality**: All admin features work as expected
4. **Reliability**: Error scenarios are handled gracefully
5. **Performance**: Tests run efficiently and provide quick feedback

---

For more information, see the detailed test documentation in `docs/ADMIN_SYSTEM_TEST_RESULTS.md`.