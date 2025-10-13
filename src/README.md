# DDD Clean Architecture Implementation

This directory contains the Domain-Driven Design (DDD) implementation for the Brymar Real Estate Platform.

## Architecture Overview

The architecture follows Clean Architecture principles with clear separation of concerns across four main layers:

### 1. Domain Layer (`/domain`)

Contains pure business logic with no external dependencies.

- **Entities**: Business objects with identity and lifecycle
- **Value Objects**: Immutable objects representing domain concepts
- **Domain Services**: Business logic that doesn't belong to a specific entity
- **Repository Interfaces**: Contracts for data access
- **Domain Events**: Events representing important business occurrences

### 2. Application Layer (`/application`)

Coordinates domain operations and defines use cases.

- **Use Cases**: Application-specific business rules and workflows
- **DTOs**: Data Transfer Objects for input/output
- **Service Interfaces**: Contracts for external services

### 3. Infrastructure Layer (`/infrastructure`)

Implements external concerns and technical details.

- **Database**: Repository implementations using Drizzle ORM
- **External Services**: Adapters for AI, storage, email services
- **Configuration**: Dependency injection and service setup

### 4. Presentation Layer (`/presentation`)

Adapts the application for UI frameworks.

- **Server Actions**: Next.js server actions as thin adapters
- **Hooks**: React hooks using application use cases

## Bounded Contexts

The domain is organized into the following bounded contexts:

1. **User Management**: Authentication, profiles, roles
2. **Property Management**: Properties, drafts, media handling
3. **Land Management**: Land entities and business rules
4. **Content Management**: Blog posts, pages, sections
5. **Wizard System**: Unified wizard functionality

## Key Principles

### Dependency Rule

Dependencies point inward toward the domain:

- Domain layer has no dependencies
- Application layer depends only on domain
- Infrastructure implements domain/application interfaces
- Presentation depends only on application layer

### Entity Design

```typescript
export class Property extends AggregateRoot {
  // Pure business logic
  // No infrastructure dependencies
  // Encapsulated state with business rules
}
```

### Use Case Pattern

```typescript
export class CreatePropertyUseCase extends UseCase<
  CreatePropertyInput,
  CreatePropertyOutput
> {
  // Coordinates domain operations
  // Handles application concerns
  // Uses dependency injection
}
```

### Repository Pattern

```typescript
// Domain interface
export interface IPropertyRepository {
  save(property: Property): Promise<void>;
  findById(id: PropertyId): Promise<Property | null>;
}

// Infrastructure implementation
export class DrizzlePropertyRepository implements IPropertyRepository {
  // Uses Drizzle ORM
  // Maps between domain and database
}
```

## Getting Started

### 1. Dependency Injection

Services are registered in the IoC container:

```typescript
import { container } from "./infrastructure/config/container";

// Register services
container.register("PropertyRepository", DrizzlePropertyRepository);
container.register("CreatePropertyUseCase", CreatePropertyUseCase);

// Resolve dependencies
const useCase = container.get<CreatePropertyUseCase>("CreatePropertyUseCase");
```

### 2. Use Cases

Execute business operations through use cases:

```typescript
const input = CreatePropertyInput.create({
  title: "Beautiful House",
  price: 500000,
  // ... other properties
});

const result = await createPropertyUseCase.execute(input);
```

### 3. Server Actions

Server actions act as thin adapters:

```typescript
export async function createProperty(formData: FormData) {
  const input = CreatePropertyInput.fromFormData(formData);
  const useCase = container.get<CreatePropertyUseCase>("CreatePropertyUseCase");
  const result = await useCase.execute(input);
  return mapToResponse(result);
}
```

## Migration Strategy

The migration is being done incrementally:

1. ✅ **Phase 1**: Set up DDD structure and core interfaces
2. 🔄 **Phase 2**: Implement User Management bounded context
3. 🔄 **Phase 3**: Implement Property Management bounded context
4. 🔄 **Phase 4**: Implement remaining bounded contexts
5. 🔄 **Phase 5**: Migrate presentation layer
6. 🔄 **Phase 6**: Performance optimization and validation

## Testing Strategy

Each layer has specific testing approaches:

- **Domain**: Unit tests for entities and value objects
- **Application**: Integration tests for use cases with mocked repositories
- **Infrastructure**: Integration tests with real database
- **Presentation**: Adapter tests with mocked use cases

## File Organization

```
src/
├── domain/                 # Pure business logic
│   ├── shared/            # Shared domain components
│   ├── user/              # User bounded context
│   ├── property/          # Property bounded context
│   └── ...
├── application/           # Use cases and coordination
│   ├── use-cases/         # Business workflows
│   ├── dto/               # Data transfer objects
│   └── services/          # Service interfaces
├── infrastructure/        # External concerns
│   ├── database/          # Data persistence
│   ├── external-services/ # Third-party integrations
│   └── config/            # Configuration and DI
└── presentation/          # UI adapters
    ├── server-actions/    # Next.js server actions
    └── hooks/             # React hooks
```

## Next Steps

1. Implement User Management domain entities and use cases
2. Create repository implementations using existing Drizzle schemas
3. Migrate existing server actions to use new use cases
4. Update React hooks to use application layer
5. Add comprehensive testing for each layer

For detailed implementation guidelines, see the DDD migration specification in `.kiro/specs/ddd-migration/`.
