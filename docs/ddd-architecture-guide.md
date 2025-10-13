# DDD Architecture Guide - Brymar Real Estate Platform

## Overview

This document provides a comprehensive guide to the Domain-Driven Design (DDD) architecture implemented in the Brymar Real Estate platform. The migration from a traditional layered architecture to DDD with Clean Architecture principles has been completed to improve maintainability, testability, and business logic clarity.

## Architecture Overview

### Bounded Contexts

The platform is organized into the following bounded contexts:

1. **User Management** - Authentication, profiles, roles, and permissions
2. **Property Management** - Properties, drafts, media, and property-related operations
3. **Land Management** - Land listings, land-specific features, and management
4. **Content Management** - Blog posts, pages, and dynamic content
5. **Wizard System** - Unified wizard system for creating properties, lands, and content
6. **Analytics & Reporting** - Metrics, analytics, and reporting functionality

### Layer Structure

```
src/
├── domain/                 # Domain Layer (Business Logic)
│   ├── shared/            # Shared domain concepts
│   ├── user/              # User Management bounded context
│   ├── property/          # Property Management bounded context
│   ├── land/              # Land Management bounded context
│   ├── content/           # Content Management bounded context
│   └── wizard/            # Wizard System bounded context
├── application/           # Application Layer (Use Cases)
│   ├── dto/               # Data Transfer Objects
│   ├── use-cases/         # Application Use Cases
│   └── services/          # Application Services
├── infrastructure/        # Infrastructure Layer (External Concerns)
│   ├── database/          # Database implementations
│   ├── external-services/ # External API integrations
│   ├── container/         # Dependency Injection
│   └── repositories/      # Repository implementations
└── presentation/          # Presentation Layer (UI Adapters)
    ├── server-actions/    # Next.js Server Actions (adapters)
    ├── hooks/             # React Hooks (adapters)
    └── components/        # UI Components
```

## Domain Layer

### Entities

Entities represent core business objects with identity and lifecycle:

```typescript
// Example: User Entity
export class User extends AggregateRoot<UserId> {
  private constructor(
    id: UserId,
    private email: Email,
    private profile: UserProfile,
    private role: UserRole,
    private status: UserStatus
  ) {
    super(id);
  }

  static create(data: CreateUserData): User {
    // Domain validation and business rules
    const user = new User(
      UserId.generate(),
      Email.create(data.email),
      UserProfile.create(data.profile),
      UserRole.create(data.role),
      UserStatus.create("active")
    );

    // Domain event
    user.addDomainEvent(new UserCreatedEvent(user.getId()));
    return user;
  }

  // Business methods
  updateProfile(newProfile: UserProfile): void {
    this.profile = newProfile;
    this.addDomainEvent(new UserProfileUpdatedEvent(this.getId()));
  }

  hasPermission(permission: string): boolean {
    return this.role.hasPermission(permission);
  }
}
```

### Value Objects

Value objects represent concepts without identity:

```typescript
// Example: Email Value Object
export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(email: string): Email {
    if (!email || email.trim().length === 0) {
      throw new DomainError("Email cannot be empty");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new DomainError("Invalid email format");
    }

    return new Email(email.toLowerCase().trim());
  }

  getDomain(): string {
    return this.value.split("@")[1];
  }
}
```

### Domain Services

Domain services contain business logic that doesn't belong to a specific entity:

```typescript
// Example: Property Domain Service
export class PropertyDomainService {
  calculateMarketValue(property: Property, marketData: MarketData): Price {
    // Complex business logic for property valuation
    const baseValue = property.getPrice().value;
    const locationMultiplier = marketData.getLocationMultiplier(
      property.getAddress()
    );
    const sizeMultiplier = this.calculateSizeMultiplier(property.getSize());

    return Price.create(baseValue * locationMultiplier * sizeMultiplier);
  }

  validatePropertyForPublication(property: Property): ValidationResult {
    const errors: string[] = [];

    if (!property.hasRequiredImages()) {
      errors.push("Property must have at least 3 images");
    }

    if (!property.hasCompleteDescription()) {
      errors.push("Property description must be complete");
    }

    return new ValidationResult(errors.length === 0, errors);
  }
}
```

## Application Layer

### Use Cases

Use cases orchestrate domain objects to fulfill business requirements:

```typescript
// Example: Create Property Use Case
export class CreatePropertyUseCase {
  constructor(
    private propertyRepository: IPropertyRepository,
    private userRepository: IUserRepository,
    private imageService: IImageService,
    private propertyDomainService: PropertyDomainService
  ) {}

  async execute(input: CreatePropertyInput): Promise<CreatePropertyOutput> {
    // 1. Validate input
    const validatedInput = CreatePropertyInput.validate(input);

    // 2. Load user (authorization)
    const user = await this.userRepository.findById(
      UserId.create(validatedInput.userId)
    );
    if (!user || !user.canCreateProperties()) {
      throw new ApplicationError("User not authorized to create properties");
    }

    // 3. Process images
    const processedImages = await this.imageService.processImages(
      validatedInput.images
    );

    // 4. Create domain entity
    const property = Property.create({
      title: validatedInput.title,
      description: validatedInput.description,
      price: validatedInput.price,
      address: validatedInput.address,
      images: processedImages,
      ownerId: user.getId(),
    });

    // 5. Apply domain rules
    const validationResult =
      this.propertyDomainService.validatePropertyForCreation(property);
    if (!validationResult.isValid) {
      throw new ApplicationError(
        `Property validation failed: ${validationResult.errors.join(", ")}`
      );
    }

    // 6. Persist
    await this.propertyRepository.save(property);

    // 7. Return result
    return CreatePropertyOutput.create({
      propertyId: property.getId().value,
      property: property,
    });
  }
}
```

### DTOs (Data Transfer Objects)

DTOs define the input and output contracts for use cases:

```typescript
// Example: Create Property Input DTO
export class CreatePropertyInput {
  private constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly price: number,
    public readonly propertyType: string,
    public readonly address: AddressData,
    public readonly features: string[],
    public readonly images: ImageData[],
    public readonly userId: string
  ) {}

  static create(data: any): CreatePropertyInput {
    // Validation using Zod or similar
    const schema = z.object({
      title: z.string().min(1).max(200),
      description: z.string().min(10).max(2000),
      price: z.number().positive(),
      propertyType: z.enum(["house", "apartment", "villa", "studio"]),
      address: AddressSchema,
      features: z.array(z.string()),
      images: z.array(ImageSchema),
      userId: z.string().uuid(),
    });

    const validated = schema.parse(data);

    return new CreatePropertyInput(
      validated.title,
      validated.description,
      validated.price,
      validated.propertyType,
      validated.address,
      validated.features,
      validated.images,
      validated.userId
    );
  }
}
```

## Infrastructure Layer

### Repository Implementations

Repositories implement domain interfaces using specific technologies:

```typescript
// Example: Drizzle Property Repository
export class DrizzlePropertyRepository implements IPropertyRepository {
  constructor(private db: Database) {}

  async save(property: Property): Promise<void> {
    const propertyData = this.mapToDatabase(property);

    await this.db.insert(properties).values(propertyData);
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

  async search(criteria: PropertySearchCriteria): Promise<Property[]> {
    let query = this.db.select().from(properties);

    // Apply filters based on criteria
    if (criteria.propertyType) {
      query = query.where(eq(properties.propertyType, criteria.propertyType));
    }

    if (criteria.minPrice) {
      query = query.where(gte(properties.price, criteria.minPrice));
    }

    if (criteria.maxPrice) {
      query = query.where(lte(properties.price, criteria.maxPrice));
    }

    const results = await query.limit(criteria.limit).offset(criteria.offset);

    return results.map((result) => this.mapToDomain(result));
  }

  private mapToDomain(data: any): Property {
    // Map database record to domain entity
    return Property.reconstitute({
      id: PropertyId.create(data.id),
      title: PropertyTitle.create(data.title),
      description: data.description,
      price: Price.create(data.price),
      address: Address.create(data.address),
      features: PropertyFeatures.create(data.features),
      images: data.images.map((img: any) => PropertyImage.create(img)),
      status: PropertyStatus.create(data.status),
      ownerId: UserId.create(data.ownerId),
    });
  }

  private mapToDatabase(property: Property): any {
    // Map domain entity to database record
    return {
      id: property.getId().value,
      title: property.getTitle().value,
      description: property.getDescription(),
      price: property.getPrice().value,
      address: property.getAddress().toJSON(),
      features: property.getFeatures().toArray(),
      images: property.getImages().map((img) => img.toJSON()),
      status: property.getStatus().value,
      ownerId: property.getOwnerId().value,
      createdAt: property.getCreatedAt(),
      updatedAt: property.getUpdatedAt(),
    };
  }
}
```

### Dependency Injection

The container manages dependencies and their lifecycles:

```typescript
// Container Configuration
export class Container {
  private services = new Map<string, any>();
  private singletons = new Map<string, any>();

  register<T>(name: string, factory: () => T, singleton = false): void {
    if (singleton) {
      this.singletons.set(name, factory);
    } else {
      this.services.set(name, factory);
    }
  }

  get<T>(name: string): T {
    if (this.singletons.has(name)) {
      const factory = this.singletons.get(name);
      return factory();
    }

    if (this.services.has(name)) {
      const factory = this.services.get(name);
      return factory();
    }

    throw new Error(`Service ${name} not found`);
  }
}

// Service Registration
export function initializeContainer(): Container {
  const container = new Container();

  // Register repositories
  container.register(
    "IPropertyRepository",
    () => new DrizzlePropertyRepository(db),
    true
  );

  container.register(
    "IUserRepository",
    () => new DrizzleUserRepository(db),
    true
  );

  // Register domain services
  container.register(
    "PropertyDomainService",
    () => new PropertyDomainService(),
    true
  );

  // Register use cases
  container.register(
    "CreatePropertyUseCase",
    () =>
      new CreatePropertyUseCase(
        container.get("IPropertyRepository"),
        container.get("IUserRepository"),
        container.get("IImageService"),
        container.get("PropertyDomainService")
      )
  );

  return container;
}
```

## Presentation Layer

### Server Actions (Adapters)

Server actions act as thin adapters between the web layer and application layer:

```typescript
// Example: Property Server Action
export async function createProperty(
  formData: FormData
): Promise<ActionResult> {
  try {
    // 1. Extract and validate form data
    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      propertyType: formData.get("propertyType") as string,
      // ... other fields
    };

    // 2. Get use case from container
    const createPropertyUseCase = container.get<CreatePropertyUseCase>(
      "CreatePropertyUseCase"
    );

    // 3. Create input DTO
    const input = CreatePropertyInput.create(rawData);

    // 4. Execute use case
    const result = await createPropertyUseCase.execute(input);

    // 5. Return success response
    return {
      success: true,
      data: {
        propertyId: result.propertyId,
        message: "Property created successfully",
      },
    };
  } catch (error) {
    // 6. Handle errors appropriately
    if (error instanceof DomainError || error instanceof ApplicationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Log unexpected errors
    console.error("Unexpected error in createProperty:", error);

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
```

### React Hooks (Adapters)

React hooks provide a clean interface for components to interact with use cases:

```typescript
// Example: Property Management Hook
export function usePropertyManagement() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get use cases from container
  const createPropertyUseCase = container.get<CreatePropertyUseCase>(
    "CreatePropertyUseCase"
  );
  const searchPropertiesUseCase = container.get<SearchPropertiesUseCase>(
    "SearchPropertiesUseCase"
  );

  const createProperty = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        setError(null);

        const input = CreatePropertyInput.create(data);
        const result = await createPropertyUseCase.execute(input);

        // Update local state
        setProperties((prev) => [...prev, result.property]);

        toast.success("Property created successfully");
        return result.property;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create property";
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [createPropertyUseCase]
  );

  const searchProperties = useCallback(
    async (filters: any) => {
      try {
        setLoading(true);
        setError(null);

        const input = SearchPropertiesInput.create(filters);
        const result = await searchPropertiesUseCase.execute(input);

        setProperties(result.properties);
        return result.properties;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to search properties";
        setError(message);
        toast.error(message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [searchPropertiesUseCase]
  );

  return {
    properties,
    loading,
    error,
    createProperty,
    searchProperties,
  };
}
```

## Best Practices

### 1. Domain Layer Rules

- **No external dependencies**: Domain layer should only depend on TypeScript/JavaScript native features
- **Pure business logic**: All business rules and validations should be in the domain layer
- **Immutability**: Prefer immutable objects and functional approaches
- **Rich domain model**: Entities should have behavior, not just data

### 2. Application Layer Rules

- **Orchestration**: Use cases orchestrate domain objects and infrastructure services
- **Transaction boundaries**: Use cases define transaction boundaries
- **Input validation**: Validate all inputs using DTOs
- **Error handling**: Convert domain errors to application errors when appropriate

### 3. Infrastructure Layer Rules

- **Implement interfaces**: Always implement domain/application interfaces
- **Technology isolation**: Keep technology-specific code isolated
- **Configuration**: Handle all external configuration and setup
- **Error translation**: Translate infrastructure errors to domain/application errors

### 4. Presentation Layer Rules

- **Thin adapters**: Keep presentation logic minimal
- **Input/Output mapping**: Map between web formats and application DTOs
- **Error handling**: Handle and present errors appropriately
- **No business logic**: Never put business logic in the presentation layer

## Testing Strategy

### Domain Layer Testing

```typescript
// Example: Domain Entity Test
describe("Property Entity", () => {
  it("should create a valid property with required fields", () => {
    const propertyData = {
      title: "Beautiful House",
      description: "A lovely family home",
      price: 250000,
      address: {
        street: "123 Main St",
        city: "Springfield",
        country: "USA",
      },
      propertyType: "house",
      ownerId: "user-123",
    };

    const property = Property.create(propertyData);

    expect(property.getTitle().value).toBe("Beautiful House");
    expect(property.getPrice().value).toBe(250000);
    expect(property.getStatus().value).toBe("draft");
  });

  it("should throw error for invalid price", () => {
    const propertyData = {
      title: "House",
      description: "Description",
      price: -1000, // Invalid price
      address: validAddress,
      propertyType: "house",
      ownerId: "user-123",
    };

    expect(() => Property.create(propertyData)).toThrow(
      "Price must be positive"
    );
  });
});
```

### Application Layer Testing

```typescript
// Example: Use Case Test
describe("CreatePropertyUseCase", () => {
  let useCase: CreatePropertyUseCase;
  let mockPropertyRepository: jest.Mocked<IPropertyRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockPropertyRepository = createMockPropertyRepository();
    mockUserRepository = createMockUserRepository();

    useCase = new CreatePropertyUseCase(
      mockPropertyRepository,
      mockUserRepository,
      mockImageService,
      mockPropertyDomainService
    );
  });

  it("should create property successfully", async () => {
    const input = CreatePropertyInput.create(validPropertyData);
    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockPropertyRepository.save.mockResolvedValue();

    const result = await useCase.execute(input);

    expect(result.property).toBeDefined();
    expect(mockPropertyRepository.save).toHaveBeenCalledWith(
      expect.any(Property)
    );
  });

  it("should throw error when user not found", async () => {
    const input = CreatePropertyInput.create(validPropertyData);
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow("User not found");
  });
});
```

## Migration Guide

### For Existing Code

1. **Identify Domain Concepts**: Look for business logic scattered in controllers, services, or components
2. **Extract Entities**: Create domain entities for core business objects
3. **Create Value Objects**: Replace primitive types with meaningful value objects
4. **Define Use Cases**: Extract application logic into use cases
5. **Implement Repositories**: Create repository implementations for data access
6. **Update Presentation**: Modify controllers/actions to use use cases

### Common Patterns

#### Before (Traditional Layered Architecture)

```typescript
// Server Action with mixed concerns
export async function createProperty(formData: FormData) {
  // Input validation
  const title = formData.get("title") as string;
  if (!title || title.length < 1) {
    throw new Error("Title is required");
  }

  // Business logic
  const price = Number(formData.get("price"));
  if (price <= 0) {
    throw new Error("Price must be positive");
  }

  // Data access
  const property = await db.insert(properties).values({
    title,
    price,
    status: "draft",
    createdAt: new Date(),
  });

  return { success: true, data: property };
}
```

#### After (DDD Clean Architecture)

```typescript
// Server Action as thin adapter
export async function createProperty(
  formData: FormData
): Promise<ActionResult> {
  try {
    const input = CreatePropertyInput.fromFormData(formData);
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

## Troubleshooting

### Common Issues

1. **Circular Dependencies**: Ensure proper dependency direction (Domain ← Application ← Infrastructure ← Presentation)
2. **Container Resolution**: Make sure all dependencies are registered in the container
3. **Value Object Validation**: Handle validation errors from value object creation
4. **Repository Mapping**: Ensure proper mapping between domain entities and database records

### Performance Considerations

1. **Lazy Loading**: Use lazy loading for expensive operations
2. **Caching**: Implement caching at the repository level
3. **Query Optimization**: Optimize database queries in repository implementations
4. **Event Handling**: Use domain events for decoupled communication

## Conclusion

The DDD architecture provides a solid foundation for the Brymar Real Estate platform, ensuring:

- **Clear separation of concerns** between business logic and technical implementation
- **Testable code** with isolated domain logic
- **Maintainable codebase** with well-defined boundaries
- **Scalable architecture** that can grow with business needs

This guide should help developers understand and work effectively with the new architecture. For specific implementation details, refer to the code examples in each bounded context.
