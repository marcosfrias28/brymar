# Design Document

## Overview

This design focuses on getting the existing DDD architecture working properly with real database connections and functional use cases. The approach is simple and practical - no complex dependency injection, just direct instantiation of repositories and services where needed.

## Architecture

### Simple Repository Pattern

Instead of complex DI, we'll create simple factory functions that return repository instances:

```typescript
// Simple repository factory
export function createUserRepository(): IUserRepository {
  return new DrizzleUserRepository(db);
}

export function createPropertyRepository(): IPropertyRepository {
  return new DrizzlePropertyRepository(db);
}
```

### Database Connection Management

Ensure the Drizzle database connection is properly configured:

```typescript
// Simplified database setup
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";

export const db = drizzle(sql);
```

### Use Case Instantiation

Use cases will be instantiated directly with their required repositories:

```typescript
// Simple use case instantiation
export function createUpdateUserProfileUseCase(): UpdateUserProfileUseCase {
  const userRepository = createUserRepository();
  return new UpdateUserProfileUseCase(userRepository);
}
```

## Components and Interfaces

### 1. Repository Factories

Simple factory functions for each repository type:

- `createUserRepository()`
- `createPropertyRepository()`
- `createLandRepository()`
- `createWizardDraftRepository()`

### 2. Use Case Factories

Simple factory functions for each use case:

- `createUpdateUserProfileUseCase()`
- `createSaveWizardDraftUseCase()`
- `createLoadWizardDraftUseCase()`
- `createPublishWizardUseCase()`

### 3. Service Integration

Direct service instantiation where needed:

- Vercel Blob for image storage
- Email services for notifications
- AI services for content generation

## Error Handling

### Simple Error Strategy

- Use existing domain error types
- Catch and wrap infrastructure errors appropriately
- Return meaningful error messages to users
- Log errors to console for now (can be enhanced later)

## Implementation Strategy

### Phase 1: Database Connection (Priority: High)

1. Verify Vercel Postgres connection works
2. Test basic repository operations
3. Fix any schema or connection issues

### Phase 2: Use Case Implementation (Priority: High)

1. Replace stub implementations with real logic
2. Connect use cases to actual repositories
3. Test that data flows work end-to-end

### Phase 3: UI Integration (Priority: High)

1. Update server actions to use real use cases
2. Update hooks to call actual operations
3. Test that forms and UI work with real data

### Phase 4: Code Cleanup (Priority: Medium)

1. Remove console statements
2. Clean up unused imports/variables
3. Fix remaining lint warnings

## Testing Approach

### Manual Testing

- Test each major user flow manually
- Verify data persists correctly
- Check error handling works

### Database Testing

- Test CRUD operations work
- Verify schema matches domain models
- Check data integrity

## Deployment Considerations

### Vercel Integration

- Ensure environment variables are set correctly
- Test database connection in production
- Verify file uploads work with Vercel Blob

### Performance

- Keep it simple for now
- Optimize later if needed
- Monitor for obvious performance issues
