# Design Document

## Overview

This design addresses the critical DDD architecture issues by implementing missing shared schemas, completing action exports, adding missing hook functions, and ensuring proper layer separation. The solution focuses on maintaining DDD principles while resolving all build errors.

## Architecture

### Domain Layer Enhancements

The domain layer will be enhanced with complete shared schemas that provide validation and type safety across all bounded contexts. These schemas will be organized in a shared directory and properly exported.

```
src/domain/shared/
├── schemas/
│   ├── index.ts (barrel exports)
│   ├── text-schemas.ts (ShortTextSchema, LongTextSchema, etc.)
│   ├── price-schemas.ts (SimplePriceSchema, etc.)
│   ├── property-schemas.ts (PropertyTypeSchema, PropertyFeaturesSchema, etc.)
│   ├── user-schemas.ts (UserRoleSchema, UserPreferencesSchema, etc.)
│   ├── search-schemas.ts (SearchQuerySchema, PaginationSchema, etc.)
│   └── validation-schemas.ts (BooleanFlagSchema, ImageInputSchema, etc.)
```

### Application Layer Fixes

The application layer DTOs will be updated to use the newly created shared schemas, ensuring proper validation and type safety.

### Infrastructure Layer Completions

Missing repository implementations and service completions will be addressed to ensure the infrastructure layer properly supports all use cases.

### Presentation Layer Corrections

Server actions and hooks will be completed with missing exports and implementations to ensure components can properly interact with the application layer.

## Components and Interfaces

### Shared Schemas Interface

```typescript
// Domain shared schemas interface
export interface SharedSchemas {
  // Text validation schemas
  ShortTextSchema: ZodSchema;
  LongTextSchema: ZodSchema;
  OptionalShortTextSchema: ZodSchema;

  // Price validation schemas
  SimplePriceSchema: ZodSchema;

  // Property-specific schemas
  PropertyTypeSchema: ZodSchema;
  PropertyStatusSchema: ZodSchema;
  PropertyFeaturesSchema: ZodSchema;

  // User-specific schemas
  UserRoleSchema: ZodSchema;
  UserPreferencesSchema: ZodSchema;
  OptionalPhoneSchema: ZodSchema;

  // Search and pagination schemas
  SearchQuerySchema: ZodSchema;
  PaginationSchema: ZodSchema;
  SortSchema: ZodSchema;
  LocationSearchSchema: ZodSchema;

  // Utility schemas
  BooleanFlagSchema: ZodSchema;
  ImageInputSchema: ZodSchema;
  OptionalTagsSchema: ZodSchema;
  IdSchema: ZodSchema;
  OptionalYearSchema: ZodSchema;
}
```

### Server Actions Interface

```typescript
// Complete server actions interface
export interface ServerActions {
  // Auth actions
  forgotPassword: (email: string) => Promise<ActionState>;
  resetPassword: (token: string, password: string) => Promise<ActionState>;
  sendVerificationOTP: (email: string) => Promise<ActionState>;
  verifyOTP: (email: string, otp: string) => Promise<ActionState>;
  updateUserAction: (data: UpdateUserData) => Promise<ActionState>;

  // Property actions
  getPropertyById: (id: string) => Promise<Property | null>;
  searchPropertiesAction: (filters: SearchFilters) => Promise<Property[]>;
  addProperty: (data: PropertyData) => Promise<ActionState>;

  // Profile actions
  removeFavoriteAction: (propertyId: string) => Promise<ActionState>;
  markNotificationAsReadAction: (
    notificationId: string
  ) => Promise<ActionState>;
  markAllNotificationsAsReadAction: () => Promise<ActionState>;
}
```

### Hooks Interface

```typescript
// Complete hooks interface
export interface PropertyHooks {
  useProperty: (id: string) => {
    property: Property | null;
    loading: boolean;
    error: Error | null;
  };
}
```

## Data Models

### Shared Schema Models

The shared schemas will follow consistent patterns:

1. **Text Schemas**: Validate string inputs with appropriate length constraints
2. **Price Schemas**: Validate monetary values with proper formatting
3. **Enum Schemas**: Validate predefined option sets
4. **Object Schemas**: Validate complex nested objects
5. **Array Schemas**: Validate collections with proper item validation

### DTO Models

DTOs will be updated to use shared schemas consistently:

```typescript
// Example DTO using shared schemas
export const CreatePropertyInputSchema = z.object({
  title: ShortTextSchema,
  description: LongTextSchema,
  price: SimplePriceSchema,
  propertyType: PropertyTypeSchema,
  features: PropertyFeaturesSchema,
  images: z.array(ImageInputSchema),
  isActive: BooleanFlagSchema,
});
```

## Error Handling

### Schema Validation Errors

All shared schemas will provide consistent error messages and validation feedback. Error handling will be centralized in the application layer.

### Import Resolution Errors

All missing imports will be resolved by:

1. Creating missing schema exports
2. Implementing missing action functions
3. Adding missing hook implementations
4. Ensuring proper barrel exports

### Build Errors

TypeScript compilation errors will be resolved by:

1. Ensuring all types are properly exported
2. Fixing circular dependency issues
3. Completing incomplete implementations
4. Adding proper type annotations

## Testing Strategy

### Schema Testing

Each shared schema will have comprehensive tests covering:

- Valid input validation
- Invalid input rejection
- Edge case handling
- Error message accuracy

### Integration Testing

Integration tests will verify:

- DTO validation using shared schemas
- Server action functionality
- Hook behavior and data flow
- End-to-end component integration

### Build Testing

Automated tests will ensure:

- Successful TypeScript compilation
- No missing import errors
- Proper export availability
- Lint rule compliance

## Implementation Phases

### Phase 1: Shared Schemas Creation

- Create all missing shared schemas
- Implement proper validation logic
- Add comprehensive exports
- Test schema functionality

### Phase 2: DTO Updates

- Update all DTOs to use shared schemas
- Fix import statements
- Ensure proper validation
- Test DTO functionality

### Phase 3: Server Actions Completion

- Implement missing server action functions
- Add proper exports
- Ensure proper error handling
- Test action functionality

### Phase 4: Hooks Implementation

- Create missing hook functions
- Implement proper data fetching
- Add error handling
- Test hook behavior

### Phase 5: Integration and Testing

- Run comprehensive build tests
- Fix any remaining issues
- Ensure lint compliance
- Validate DDD architecture compliance
