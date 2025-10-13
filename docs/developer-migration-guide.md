# Developer Migration Guide - DDD Architecture

## Quick Start for Developers

This guide helps developers quickly understand how to work with the new DDD architecture in the Brymar Real Estate platform.

## Key Changes Summary

### Before vs After

| Aspect             | Before (Layered)                | After (DDD)                                                                   |
| ------------------ | ------------------------------- | ----------------------------------------------------------------------------- |
| **Structure**      | `lib/`, `components/`, `app/`   | `src/domain/`, `src/application/`, `src/infrastructure/`, `src/presentation/` |
| **Business Logic** | Scattered in actions/components | Centralized in domain entities                                                |
| **Data Access**    | Direct database calls           | Repository pattern                                                            |
| **Validation**     | Mixed with UI/API logic         | Domain value objects                                                          |
| **Dependencies**   | Tightly coupled                 | Dependency injection                                                          |

### Import Path Changes

All imports now use the `@/` alias pointing to `src/`:

```typescript
// Before
import { getUserById } from "../lib/db/queries";
import { UserSchema } from "../lib/validations";

// After
import { User } from "@/domain/user/entities/User";
import { GetUserByIdUseCase } from "@/application/use-cases/user/GetUserByIdUseCase";
```

## Working with the New Architecture

### 1. Creating New Features

#### Step 1: Define Domain Entities

```typescript
// src/domain/property/entities/Property.ts
export class Property extends AggregateRoot<PropertyId> {
  private constructor(
    id: PropertyId,
    private title: PropertyTitle,
    private price: Price,
    private status: PropertyStatus
  ) {
    super(id);
  }

  static create(data: CreatePropertyData): Property {
    // Business validation
    const property = new Property(
      PropertyId.generate(),
      PropertyTitle.create(data.title),
      Price.create(data.price),
      PropertyStatus.create("draft")
    );

    property.addDomainEvent(new PropertyCreatedEvent(property.getId()));
    return property;
  }

  // Business methods
  publish(): void {
    if (!this.canBePublished()) {
      throw new DomainError("Property cannot be published in current state");
    }
    this.status = PropertyStatus.create("published");
    this.addDomainEvent(new PropertyPublishedEvent(this.getId()));
  }

  private canBePublished(): boolean {
    return this.status.value === "draft" && this.title.value.length > 0;
  }
}
```

#### Step 2: Create Value Objects

```typescript
// src/domain/property/value-objects/PropertyTitle.ts
export class PropertyTitle extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(title: string): PropertyTitle {
    if (!title || title.trim().length === 0) {
      throw new DomainError("Property title cannot be empty");
    }

    if (title.length > 200) {
      throw new DomainError("Property title cannot exceed 200 characters");
    }

    return new PropertyTitle(title.trim());
  }
}
```

#### Step 3: Define Repository Interface

```typescript
// src/domain/property/repositories/IPropertyRepository.ts
export interface IPropertyRepository {
  save(property: Property): Promise<void>;
  findById(id: PropertyId): Promise<Property | null>;
  findByUserId(userId: UserId): Promise<Property[]>;
  search(criteria: PropertySearchCriteria): Promise<Property[]>;
  delete(id: PropertyId): Promise<void>;
}
```

#### Step 4: Create Use Case

```typescript
// src/application/use-cases/property/CreatePropertyUseCase.ts
export class CreatePropertyUseCase {
  constructor(
    private propertyRepository: IPropertyRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: CreatePropertyInput): Promise<CreatePropertyOutput> {
    // 1. Validate user exists and has permission
    const user = await this.userRepository.findById(
      UserId.create(input.userId)
    );
    if (!user) {
      throw new ApplicationError("User not found");
    }

    if (!user.canCreateProperties()) {
      throw new ApplicationError("User not authorized to create properties");
    }

    // 2. Create domain entity
    const property = Property.create({
      title: input.title,
      description: input.description,
      price: input.price,
      ownerId: user.getId(),
    });

    // 3. Save to repository
    await this.propertyRepository.save(property);

    // 4. Return result
    return CreatePropertyOutput.create({
      propertyId: property.getId().value,
      property: property,
    });
  }
}
```

#### Step 5: Implement Repository

```typescript
// src/infrastructure/repositories/DrizzlePropertyRepository.ts
export class DrizzlePropertyRepository implements IPropertyRepository {
  constructor(private db: Database) {}

  async save(property: Property): Promise<void> {
    const data = {
      id: property.getId().value,
      title: property.getTitle().value,
      price: property.getPrice().value,
      status: property.getStatus().value,
      ownerId: property.getOwnerId().value,
      createdAt: property.getCreatedAt(),
      updatedAt: property.getUpdatedAt(),
    };

    await this.db.insert(properties).values(data);
  }

  async findById(id: PropertyId): Promise<Property | null> {
    const result = await this.db
      .select()
      .from(properties)
      .where(eq(properties.id, id.value))
      .limit(1);

    if (result.length === 0) return null;

    return this.mapToDomain(result[0]);
  }

  private mapToDomain(data: any): Property {
    return Property.reconstitute({
      id: PropertyId.create(data.id),
      title: PropertyTitle.create(data.title),
      price: Price.create(data.price),
      status: PropertyStatus.create(data.status),
      ownerId: UserId.create(data.ownerId),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
```

#### Step 6: Register Dependencies

```typescript
// src/infrastructure/container/ServiceRegistration.ts
export function registerPropertyServices(container: Container): void {
  // Repository
  container.register(
    "IPropertyRepository",
    () => new DrizzlePropertyRepository(db),
    true
  );

  // Use Cases
  container.register(
    "CreatePropertyUseCase",
    () =>
      new CreatePropertyUseCase(
        container.get("IPropertyRepository"),
        container.get("IUserRepository")
      )
  );
}
```

#### Step 7: Create Server Action

```typescript
// src/presentation/server-actions/property-actions.ts
export async function createProperty(
  formData: FormData
): Promise<ActionResult> {
  try {
    const input = CreatePropertyInput.create({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      userId: formData.get("userId") as string,
    });

    const useCase = container.get<CreatePropertyUseCase>(
      "CreatePropertyUseCase"
    );
    const result = await useCase.execute(input);

    return {
      success: true,
      data: {
        propertyId: result.propertyId,
        message: "Property created successfully",
      },
    };
  } catch (error) {
    return handleError(error);
  }
}
```

### 2. Modifying Existing Features

#### Finding the Right Layer

1. **Business Logic Changes** → Domain Layer (`src/domain/`)
2. **Use Case Changes** → Application Layer (`src/application/`)
3. **Data Access Changes** → Infrastructure Layer (`src/infrastructure/`)
4. **UI/API Changes** → Presentation Layer (`src/presentation/`)

#### Example: Adding Property Validation

```typescript
// 1. Add to domain entity
export class Property extends AggregateRoot<PropertyId> {
  validateForPublication(): ValidationResult {
    const errors: string[] = [];

    if (!this.hasMinimumImages()) {
      errors.push("Property must have at least 3 images");
    }

    if (!this.hasCompleteDescription()) {
      errors.push("Property description must be complete");
    }

    return new ValidationResult(errors.length === 0, errors);
  }
}

// 2. Update use case
export class PublishPropertyUseCase {
  async execute(input: PublishPropertyInput): Promise<PublishPropertyOutput> {
    const property = await this.propertyRepository.findById(
      PropertyId.create(input.propertyId)
    );

    if (!property) {
      throw new ApplicationError("Property not found");
    }

    // Use domain validation
    const validationResult = property.validateForPublication();
    if (!validationResult.isValid) {
      throw new ApplicationError(
        `Cannot publish property: ${validationResult.errors.join(", ")}`
      );
    }

    property.publish();
    await this.propertyRepository.save(property);

    return PublishPropertyOutput.create({ property });
  }
}
```

### 3. Working with Existing Code

#### Gradual Migration Strategy

1. **Keep old code working** - Don't break existing functionality
2. **Create new features with DDD** - Use new architecture for new features
3. **Migrate incrementally** - Move existing features one at a time

#### Compatibility Layers

The migration includes compatibility layers to keep existing code working:

```typescript
// src/hooks/use-properties.ts (compatibility layer)
export * from "@/presentation/hooks/use-properties";
export { usePropertyManagement } from "./use-property-management";
```

#### Migration Checklist for Existing Features

- [ ] Identify business logic in the feature
- [ ] Extract domain entities and value objects
- [ ] Create repository interface and implementation
- [ ] Build use cases for the feature
- [ ] Update server actions to use use cases
- [ ] Update React hooks to use use cases
- [ ] Add tests for domain logic
- [ ] Update imports to use new structure

### 4. Testing with DDD

#### Domain Layer Tests

```typescript
// Test entities and value objects
describe("Property Entity", () => {
  it("should create property with valid data", () => {
    const property = Property.create({
      title: "Beautiful House",
      price: 250000,
      description: "A lovely home",
      ownerId: "user-123",
    });

    expect(property.getTitle().value).toBe("Beautiful House");
    expect(property.getStatus().value).toBe("draft");
  });

  it("should validate before publication", () => {
    const property = createTestProperty();

    const result = property.validateForPublication();

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Property must have at least 3 images");
  });
});
```

#### Application Layer Tests

```typescript
// Test use cases with mocked dependencies
describe("CreatePropertyUseCase", () => {
  let useCase: CreatePropertyUseCase;
  let mockPropertyRepository: jest.Mocked<IPropertyRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockPropertyRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
    };

    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    useCase = new CreatePropertyUseCase(
      mockPropertyRepository,
      mockUserRepository
    );
  });

  it("should create property successfully", async () => {
    const mockUser = createTestUser();
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockPropertyRepository.save.mockResolvedValue();

    const input = CreatePropertyInput.create({
      title: "Test Property",
      price: 100000,
      userId: "user-123",
    });

    const result = await useCase.execute(input);

    expect(result.propertyId).toBeDefined();
    expect(mockPropertyRepository.save).toHaveBeenCalled();
  });
});
```

### 5. Common Patterns and Utilities

#### Error Handling

```typescript
// Domain errors for business rule violations
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

// Application errors for use case failures
export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationError";
  }
}

// Error handling in server actions
function handleError(error: unknown): ActionResult {
  if (error instanceof DomainError || error instanceof ApplicationError) {
    return {
      success: false,
      error: error.message,
    };
  }

  console.error("Unexpected error:", error);
  return {
    success: false,
    error: "An unexpected error occurred",
  };
}
```

#### Validation Patterns

```typescript
// Input validation with Zod
export class CreatePropertyInput {
  static create(data: any): CreatePropertyInput {
    const schema = z.object({
      title: z.string().min(1).max(200),
      price: z.number().positive(),
      description: z.string().min(10),
      userId: z.string().uuid(),
    });

    const validated = schema.parse(data);
    return new CreatePropertyInput(validated);
  }
}

// Domain validation in value objects
export class Price extends ValueObject<number> {
  static create(value: number): Price {
    if (value <= 0) {
      throw new DomainError("Price must be positive");
    }

    if (value > 10000000) {
      throw new DomainError("Price cannot exceed $10,000,000");
    }

    return new Price(value);
  }
}
```

### 6. IDE and Development Setup

#### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

#### Useful Snippets

Create `.vscode/snippets/typescript.json`:

```json
{
  "DDD Entity": {
    "prefix": "ddd-entity",
    "body": [
      "export class ${1:EntityName} extends AggregateRoot<${1:EntityName}Id> {",
      "  private constructor(",
      "    id: ${1:EntityName}Id,",
      "    private ${2:property}: ${3:PropertyType}",
      "  ) {",
      "    super(id);",
      "  }",
      "",
      "  static create(data: Create${1:EntityName}Data): ${1:EntityName} {",
      "    const entity = new ${1:EntityName}(",
      "      ${1:EntityName}Id.generate(),",
      "      ${3:PropertyType}.create(data.${2:property})",
      "    );",
      "    ",
      "    entity.addDomainEvent(new ${1:EntityName}CreatedEvent(entity.getId()));",
      "    return entity;",
      "  }",
      "",
      "  get${3:PropertyType}(): ${3:PropertyType} {",
      "    return this.${2:property};",
      "  }",
      "}"
    ]
  }
}
```

### 7. Debugging and Troubleshooting

#### Common Issues

1. **Container Resolution Errors**

   ```typescript
   // Make sure service is registered
   container.register("ServiceName", () => new ServiceImplementation());

   // Check service name matches exactly
   const service = container.get<ServiceInterface>("ServiceName");
   ```

2. **Value Object Validation Errors**

   ```typescript
   // Handle validation in try-catch
   try {
     const email = Email.create(userInput);
   } catch (error) {
     if (error instanceof DomainError) {
       // Handle validation error
       return { success: false, error: error.message };
     }
     throw error;
   }
   ```

3. **Repository Mapping Issues**
   ```typescript
   // Ensure proper mapping between domain and database
   private mapToDomain(data: any): Property {
     return Property.reconstitute({
       id: PropertyId.create(data.id),
       title: PropertyTitle.create(data.title),
       // ... other mappings
     });
   }
   ```

#### Debugging Tips

1. **Use TypeScript strict mode** - Helps catch errors early
2. **Add logging to use cases** - Track execution flow
3. **Test domain logic in isolation** - Unit test entities and value objects
4. **Use dependency injection** - Makes testing and debugging easier

### 8. Performance Considerations

#### Repository Optimization

```typescript
// Use proper indexing and query optimization
export class DrizzlePropertyRepository implements IPropertyRepository {
  async search(criteria: PropertySearchCriteria): Promise<Property[]> {
    let query = this.db
      .select()
      .from(properties)
      .where(eq(properties.status, "published")); // Use indexed column

    // Add filters efficiently
    if (criteria.priceRange) {
      query = query.where(
        and(
          gte(properties.price, criteria.priceRange.min),
          lte(properties.price, criteria.priceRange.max)
        )
      );
    }

    return query.limit(criteria.limit).offset(criteria.offset);
  }
}
```

#### Caching Strategies

```typescript
// Add caching to expensive operations
export class CachedPropertyRepository implements IPropertyRepository {
  constructor(private repository: IPropertyRepository, private cache: ICache) {}

  async findById(id: PropertyId): Promise<Property | null> {
    const cacheKey = `property:${id.value}`;

    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return this.deserializeProperty(cached);
    }

    // Fallback to repository
    const property = await this.repository.findById(id);
    if (property) {
      await this.cache.set(cacheKey, this.serializeProperty(property), 300); // 5 min TTL
    }

    return property;
  }
}
```

## Quick Reference

### File Structure

```
src/
├── domain/
│   ├── shared/           # Shared domain concepts
│   ├── user/            # User bounded context
│   ├── property/        # Property bounded context
│   └── [context]/       # Other bounded contexts
├── application/
│   ├── dto/             # Data Transfer Objects
│   ├── use-cases/       # Application Use Cases
│   └── services/        # Application Services
├── infrastructure/
│   ├── database/        # Database implementations
│   ├── repositories/    # Repository implementations
│   └── container/       # Dependency injection
└── presentation/
    ├── server-actions/  # Next.js Server Actions
    ├── hooks/           # React Hooks
    └── components/      # UI Components
```

### Key Commands

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Build project
npm run build

# Start development server
npm run dev
```

This guide should help you get productive quickly with the new DDD architecture. For more detailed information, refer to the [DDD Architecture Guide](./ddd-architecture-guide.md).
