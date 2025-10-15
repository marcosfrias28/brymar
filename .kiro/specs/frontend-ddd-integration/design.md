# Design Document

## Overview

This design addresses the complete integration of the frontend with the DDD architecture, fixing all TypeScript compilation errors, and cleaning up the codebase. The approach focuses on systematic updates to DTOs, hooks, components, and removal of legacy code while maintaining the established DDD patterns.

## Architecture

### Current Issues Analysis

1. **DTO Method Mismatch**: Frontend components expect `getId()` method on DTOs but they only expose properties
2. **Inconsistent Hook Usage**: Some components still use legacy hooks instead of DDD-based ones
3. **Legacy File Remnants**: Old utility files and implementations still exist alongside new DDD structure
4. **Type Safety Gaps**: Missing type definitions and incorrect property access patterns

### Target Architecture

```
Frontend Layer (Presentation)
├── Pages (Next.js App Router)
│   ├── Use DDD Hooks exclusively
│   ├── Call DDD Server Actions
│   └── Handle DTOs correctly
├── Components
│   ├── Receive data from DDD hooks
│   ├── Use proper DTO methods/properties
│   └── Handle loading/error states
└── Hooks (Presentation Layer)
    ├── Call Use Cases via Container
    ├── Return DTOs to components
    └── Handle state management

Application Layer
├── Use Cases (Business Logic Coordination)
├── DTOs (Data Transfer Objects)
└── Services (Application Services)

Domain Layer
├── Entities (Business Objects)
├── Value Objects (Domain Concepts)
└── Repositories (Data Access Interfaces)

Infrastructure Layer
├── Database Repositories (Drizzle ORM)
├── External Services
└── Container (Dependency Injection)
```

## Components and Interfaces

### 1. DTO Enhancement Strategy

**Problem**: DTOs currently only expose properties but frontend expects methods like `getId()`

**Solution**: Add convenience methods to DTOs while maintaining immutability

```typescript
// Enhanced DTO Pattern
export class GetCurrentUserOutput {
  // ... existing properties

  // Add convenience methods for frontend consumption
  getId(): { value: string } {
    return { value: this.id };
  }

  getEmail(): { value: string } {
    return { value: this.email };
  }

  // ... other convenience methods
}
```

### 2. Frontend Hook Integration Pattern

**Current State**: Mixed usage of legacy and DDD hooks
**Target State**: All components use DDD hooks exclusively

```typescript
// Standard DDD Hook Pattern
export function useEntity(): UseEntityReturn {
  const [entity, setEntity] = useState<EntityOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use cases via container
  const useCase = container.get<EntityUseCase>("EntityUseCase");

  // Return DTOs to components
  return { entity, loading, error, actions };
}
```

### 3. Page Component Update Pattern

**Before**: Direct database calls, mixed patterns
**After**: DDD hooks and server actions only

```typescript
// Standard Page Pattern
export default function EntityPage() {
  const { entity, loading, error } = useEntity();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!entity) return <NotFoundState />;

  return <EntityComponent entity={entity} />;
}
```

### 4. File Cleanup Strategy

**Legacy Files to Remove**:

- Old utility files not used by DDD structure
- Duplicate hook implementations
- Unused server action files
- Legacy schema files
- Debug/test files not needed in production

**Files to Update**:

- All page components to use DDD hooks
- All components receiving entity data
- All server actions to use presentation layer
- All type definitions to match DTOs

## Data Models

### DTO Method Additions

```typescript
// User DTO Methods
interface UserDTOMethods {
  getId(): { value: string };
  getEmail(): { value: string };
  getRole(): { value: string };
  getStatus(): { value: string };
}

// Property DTO Methods
interface PropertyDTOMethods {
  getId(): { value: string };
  getTitle(): string;
  getPrice(): { value: number };
  getLocation(): AddressValue;
}

// Land DTO Methods
interface LandDTOMethods {
  getId(): { value: string };
  getTitle(): string;
  getArea(): { value: number };
  getLocation(): AddressValue;
}

// Blog DTO Methods
interface BlogDTOMethods {
  getId(): { value: string };
  getTitle(): string;
  getContent(): string;
  getStatus(): { value: string };
}
```

### Hook Return Types

```typescript
// Standardized Hook Return Pattern
interface UseEntityReturn<T> {
  entity: T | null;
  entities: T[];
  loading: boolean;
  error: string | null;
  create: (data: CreateInput) => Promise<void>;
  update: (id: string, data: UpdateInput) => Promise<void>;
  delete: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}
```

## Error Handling

### TypeScript Error Resolution Strategy

1. **Property Access Errors**: Add missing methods to DTOs
2. **Type Mismatch Errors**: Update component prop types to match DTOs
3. **Import Errors**: Remove unused imports, fix import paths
4. **Method Call Errors**: Ensure all called methods exist on DTOs

### Runtime Error Handling

```typescript
// Standard Error Boundary Pattern
export function withErrorBoundary<T>(Component: React.ComponentType<T>) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
```

## Testing Strategy

### Component Testing

```typescript
// Test DTOs work correctly with components
describe("Component with DTO", () => {
  it("should access DTO methods correctly", () => {
    const dto = GetCurrentUserOutput.fromUser(mockUser);
    expect(dto.getId().value).toBe(mockUser.getId().getValue());
  });
});
```

### Integration Testing

```typescript
// Test full DDD flow works
describe("DDD Integration", () => {
  it("should work end-to-end", async () => {
    // Hook calls use case
    // Use case calls repository
    // Repository returns domain entity
    // DTO created from entity
    // Component receives DTO
  });
});
```

### Type Safety Testing

```typescript
// Ensure TypeScript compilation passes
describe("Type Safety", () => {
  it("should compile without errors", () => {
    // This test passes if TypeScript compilation succeeds
    expect(true).toBe(true);
  });
});
```

## Implementation Phases

### Phase 1: Fix DTO Methods

- Add missing methods to all DTOs
- Ensure method signatures match frontend expectations
- Test DTO methods work correctly

### Phase 2: Update Frontend Components

- Update all pages to use DDD hooks
- Fix all TypeScript compilation errors
- Remove legacy hook imports

### Phase 3: Clean Up Legacy Files

- Identify and remove unused files
- Remove duplicate implementations
- Clean up imports and variables

### Phase 4: Verify Integration

- Run full TypeScript compilation
- Test all major user flows
- Verify zero compilation errors

## File Organization

### Files to Update

```
src/app/ - All page components
src/components/ - Components using entity data
src/hooks/ - Legacy hook redirects (remove)
src/presentation/hooks/ - DDD hooks (enhance)
src/application/dto/ - Add convenience methods
src/lib/ - Remove unused utilities
```

### Files to Remove

```
src/lib/actions/ - Legacy server actions
src/lib/utils/ - Unused utility files
src/hooks/ - Legacy hook implementations
Any duplicate or unused files
```

### Files to Keep and Enhance

```
src/presentation/ - All DDD presentation layer
src/application/ - All use cases and DTOs
src/domain/ - All domain entities
src/infrastructure/ - All repositories and services
```
