# Design Document

## Overview

This design document outlines the architectural transformation of Brymar Real Estate Platform from a traditional layered architecture to Domain-Driven Design (DDD) with Clean Architecture principles. The migration will establish clear bounded contexts, centralize business logic, and improve system maintainability while preserving existing functionality.

## Architecture

### Current Architecture Analysis

The existing system follows a traditional Next.js layered architecture:

- **Presentation Layer**: React components, pages, hooks
- **Business Logic Layer**: Server Actions, services, validations
- **Data Layer**: Drizzle ORM, database schemas

**Key Issues Identified:**

- Mixed responsibilities in Server Actions (validation + business logic + persistence)
- Monolithic database schema in single file
- Business logic scattered across components and actions
- Tight coupling between layers
- Difficult to test business logic in isolation

### Target DDD Architecture

```
src/
├── domain/                 # Pure business logic
│   ├── user/
│   │   ├── entities/       # User, Session, Account
│   │   ├── value-objects/  # Email, UserId, UserPreferences
│   │   ├── repositories/   # IUserRepository interface
│   │   └── services/       # UserDomainService
│   ├── property/
│   │   ├── entities/       # Property, PropertyDraft
│   │   ├── value-objects/  # Price, Address, PropertyType
│   │   ├── repositories/   # IPropertyRepository interface
│   │   └── services/       # PropertyDomainService
│   ├── land/
│   ├── content/
│   ├── wizard/
│   └── shared/
├── application/            # Use cases and coordination
│   ├── use-cases/
│   │   ├── property/       # CreatePropertyUseCase, UpdatePropertyUseCase
│   │   ├── user/           # RegisterUserUseCase, AuthenticateUserUseCase
│   │   └── wizard/         # SaveWizardDraftUseCase, PublishWizardUseCase
│   ├── services/           # Application services
│   └── dto/                # Data Transfer Objects
├── infrastructure/         # External concerns
│   ├── database/
│   │   ├── repositories/   # DrizzlePropertyRepository
│   │   ├── schemas/        # Drizzle table definitions
│   │   └── migrations/
│   ├── external-services/
│   │   ├── ai/             # HuggingFace AI service
│   │   ├── storage/        # Vercel Blob storage
│   │   └── email/          # Resend email service
│   └── config/
└── presentation/           # UI and adapters
    ├── components/         # React components (existing)
    ├── server-actions/     # Thin adapters to use cases
    └── hooks/              # React hooks using use cases
```

## Components and Interfaces

### Domain Layer Components

#### 1. Bounded Contexts

**User Management Context:**

- Entities: `User`, `Session`, `Account`
- Value Objects: `Email`, `UserId`, `UserRole`, `UserPreferences`
- Domain Services: `UserAuthenticationService`, `UserProfileService`
- Repository Interfaces: `IUserRepository`, `ISessionRepository`

**Property Management Context:**

- Entities: `Property`, `PropertyDraft`, `PropertyImage`
- Value Objects: `Price`, `Address`, `PropertyType`, `PropertyStatus`
- Domain Services: `PropertyValidationService`, `PropertyPricingService`
- Repository Interfaces: `IPropertyRepository`, `IPropertyDraftRepository`

**Land Management Context:**

- Entities: `Land`, `LandDraft`
- Value Objects: `LandArea`, `LandType`, `LandPrice`
- Domain Services: `LandValidationService`
- Repository Interfaces: `ILandRepository`, `ILandDraftRepository`

**Content Management Context:**

- Entities: `BlogPost`, `BlogDraft`, `PageSection`
- Value Objects: `BlogCategory`, `ContentStatus`
- Domain Services: `ContentPublishingService`
- Repository Interfaces: `IBlogRepository`, `IPageSectionRepository`

**Wizard System Context:**

- Entities: `WizardDraft`, `WizardMedia`, `WizardAnalytic`
- Value Objects: `WizardType`, `StepProgress`, `CompletionPercentage`
- Domain Services: `WizardProgressService`, `WizardValidationService`
- Repository Interfaces: `IWizardDraftRepository`, `IWizardMediaRepository`

#### 2. Entity Design Patterns

```typescript
// Example: Property Entity
export class Property {
  private constructor(
    private readonly id: PropertyId,
    private title: PropertyTitle,
    private description: PropertyDescription,
    private price: Price,
    private location: Address,
    private type: PropertyType,
    private status: PropertyStatus,
    private features: PropertyFeatures,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  static create(data: CreatePropertyData): Property {
    // Domain validation and business rules
    const id = PropertyId.generate();
    const title = PropertyTitle.create(data.title);
    const price = Price.create(data.price, data.currency);
    // ... more validations

    return new Property(
      id,
      title,
      description,
      price,
      location,
      type,
      status,
      features,
      new Date(),
      new Date()
    );
  }

  updatePrice(newPrice: Price): void {
    // Business rule: Price changes require validation
    if (
      this.status.isPublished() &&
      newPrice.isSignificantlyDifferent(this.price)
    ) {
      throw new DomainError("Significant price changes require approval");
    }
    this.price = newPrice;
    this.updatedAt = new Date();
  }

  publish(): void {
    // Business rule: Property must be complete to publish
    if (!this.isComplete()) {
      throw new DomainError("Property must be complete before publishing");
    }
    this.status = PropertyStatus.published();
    this.updatedAt = new Date();
  }

  private isComplete(): boolean {
    return (
      this.title.isValid() &&
      this.description.isValid() &&
      this.price.isValid() &&
      this.location.isValid()
    );
  }
}
```

#### 3. Value Object Design

```typescript
// Example: Price Value Object
export class Price {
  private constructor(
    private readonly amount: number,
    private readonly currency: Currency
  ) {}

  static create(amount: number, currency: string = "USD"): Price {
    if (amount < 0) {
      throw new DomainError("Price cannot be negative");
    }
    if (amount > 100_000_000) {
      throw new DomainError("Price exceeds maximum allowed value");
    }
    return new Price(amount, Currency.create(currency));
  }

  isSignificantlyDifferent(other: Price): boolean {
    const percentageChange =
      Math.abs(this.amount - other.amount) / other.amount;
    return percentageChange > 0.1; // 10% threshold
  }

  format(): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.currency.code,
    }).format(this.amount);
  }

  equals(other: Price): boolean {
    return this.amount === other.amount && this.currency.equals(other.currency);
  }
}
```

### Application Layer Components

#### 1. Use Case Design Pattern

```typescript
// Example: CreatePropertyUseCase
export class CreatePropertyUseCase {
  constructor(
    private readonly propertyRepository: IPropertyRepository,
    private readonly imageService: IImageService,
    private readonly notificationService: INotificationService
  ) {}

  async execute(input: CreatePropertyInput): Promise<CreatePropertyOutput> {
    // 1. Validate input
    const validatedInput = CreatePropertyInput.validate(input);

    // 2. Create domain entity
    const property = Property.create({
      title: validatedInput.title,
      description: validatedInput.description,
      price: validatedInput.price,
      location: validatedInput.location,
      type: validatedInput.type,
    });

    // 3. Handle images if provided
    if (validatedInput.images?.length > 0) {
      const processedImages = await this.imageService.processImages(
        validatedInput.images
      );
      property.addImages(processedImages);
    }

    // 4. Persist entity
    await this.propertyRepository.save(property);

    // 5. Send notifications
    await this.notificationService.notifyPropertyCreated(property);

    // 6. Return output
    return CreatePropertyOutput.from(property);
  }
}
```

#### 2. DTO Design

```typescript
// Input DTOs
export class CreatePropertyInput {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly price: number,
    public readonly currency: string,
    public readonly location: AddressInput,
    public readonly type: string,
    public readonly images?: ImageInput[]
  ) {}

  static validate(input: any): CreatePropertyInput {
    const schema = z.object({
      title: z.string().min(3).max(100),
      description: z.string().min(10).max(1000),
      price: z.number().min(1000).max(10_000_000),
      currency: z.string().length(3),
      location: AddressInputSchema,
      type: z.enum(["house", "apartment", "condo", "land"]),
      images: z.array(ImageInputSchema).optional(),
    });

    const validated = schema.parse(input);
    return new CreatePropertyInput(
      validated.title,
      validated.description,
      validated.price,
      validated.currency,
      validated.location,
      validated.type,
      validated.images
    );
  }
}

// Output DTOs
export class CreatePropertyOutput {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly status: string,
    public readonly createdAt: Date
  ) {}

  static from(property: Property): CreatePropertyOutput {
    return new CreatePropertyOutput(
      property.getId().value,
      property.getTitle().value,
      property.getStatus().value,
      property.getCreatedAt()
    );
  }
}
```

### Infrastructure Layer Components

#### 1. Repository Implementation

```typescript
// Example: DrizzlePropertyRepository
export class DrizzlePropertyRepository implements IPropertyRepository {
  constructor(private readonly db: Database) {}

  async save(property: Property): Promise<void> {
    const propertyData = this.mapToDatabase(property);

    if (property.isNew()) {
      await this.db.insert(properties).values(propertyData);
    } else {
      await this.db
        .update(properties)
        .set(propertyData)
        .where(eq(properties.id, propertyData.id));
    }
  }

  async findById(id: PropertyId): Promise<Property | null> {
    const result = await this.db
      .select()
      .from(properties)
      .where(eq(properties.id, id.value));

    if (result.length === 0) return null;

    return this.mapToDomain(result[0]);
  }

  async findByStatus(status: PropertyStatus): Promise<Property[]> {
    const results = await this.db
      .select()
      .from(properties)
      .where(eq(properties.status, status.value));

    return results.map((row) => this.mapToDomain(row));
  }

  private mapToDatabase(property: Property): any {
    return {
      id: property.getId().value,
      title: property.getTitle().value,
      description: property.getDescription().value,
      price: property.getPrice().amount,
      currency: property.getPrice().currency.code,
      location: property.getLocation().toJSON(),
      type: property.getType().value,
      status: property.getStatus().value,
      features: property.getFeatures().toJSON(),
      createdAt: property.getCreatedAt(),
      updatedAt: property.getUpdatedAt(),
    };
  }

  private mapToDomain(row: any): Property {
    return Property.reconstitute({
      id: PropertyId.create(row.id),
      title: PropertyTitle.create(row.title),
      description: PropertyDescription.create(row.description),
      price: Price.create(row.price, row.currency),
      location: Address.fromJSON(row.location),
      type: PropertyType.create(row.type),
      status: PropertyStatus.create(row.status),
      features: PropertyFeatures.fromJSON(row.features),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
```

#### 2. External Service Implementation

```typescript
// Example: HuggingFaceAIService
export class HuggingFaceAIService implements IAIService {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string
  ) {}

  async generatePropertyDescription(input: PropertyBasicInfo): Promise<string> {
    try {
      const prompt = this.buildPrompt(input);
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new InfrastructureError("AI service unavailable");
      }

      const result = await response.json();
      return result.generated_text;
    } catch (error) {
      throw new InfrastructureError(`AI generation failed: ${error.message}`);
    }
  }

  private buildPrompt(input: PropertyBasicInfo): string {
    return `Generate a compelling property description for a ${input.type} 
            with ${input.bedrooms} bedrooms, ${input.bathrooms} bathrooms, 
            ${input.area} sqm, located in ${input.location}. 
            Price: ${input.price}. Focus on key selling points and amenities.`;
  }
}
```

### Presentation Layer Components

#### 1. Server Action Adapters

```typescript
// Example: Property Server Actions as Adapters
export async function createProperty(formData: FormData): Promise<ActionState> {
  try {
    // 1. Map form data to input DTO
    const input = CreatePropertyInput.fromFormData(formData);

    // 2. Get use case from container
    const useCase = container.get<CreatePropertyUseCase>(
      "CreatePropertyUseCase"
    );

    // 3. Execute use case
    const result = await useCase.execute(input);

    // 4. Revalidate cache
    revalidatePath("/dashboard/properties");

    // 5. Return success response
    return createSuccessResponse(result, "Property created successfully");
  } catch (error) {
    if (error instanceof DomainError) {
      return createErrorResponse(error.message);
    }
    if (error instanceof ValidationError) {
      return createErrorResponse("Invalid input data", error.errors);
    }

    console.error("Create property error:", error);
    return createErrorResponse("Failed to create property");
  }
}
```

#### 2. React Hook Adapters

```typescript
// Example: useProperties hook using use cases
export function useProperties(filters?: PropertyFilters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchUseCase = useMemo(
    () => container.get<SearchPropertiesUseCase>("SearchPropertiesUseCase"),
    []
  );

  const searchProperties = useCallback(
    async (searchFilters: PropertyFilters) => {
      try {
        setLoading(true);
        setError(null);

        const input = SearchPropertiesInput.create(searchFilters);
        const result = await searchUseCase.execute(input);

        setProperties(result.properties);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setLoading(false);
      }
    },
    [searchUseCase]
  );

  useEffect(() => {
    if (filters) {
      searchProperties(filters);
    }
  }, [filters, searchProperties]);

  return {
    properties,
    loading,
    error,
    searchProperties,
    refetch: () => filters && searchProperties(filters),
  };
}
```

## Data Models

### Domain Entity Models

#### Property Aggregate

```typescript
// Property Root Entity
export class Property extends AggregateRoot {
  private constructor(
    id: PropertyId,
    private title: PropertyTitle,
    private description: PropertyDescription,
    private price: Price,
    private location: Address,
    private type: PropertyType,
    private status: PropertyStatus,
    private features: PropertyFeatures,
    private images: PropertyImage[],
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  // Factory methods
  static create(data: CreatePropertyData): Property {
    /* ... */
  }
  static reconstitute(data: PropertyData): Property {
    /* ... */
  }

  // Business methods
  updatePrice(newPrice: Price): void {
    /* ... */
  }
  addImage(image: PropertyImage): void {
    /* ... */
  }
  removeImage(imageId: ImageId): void {
    /* ... */
  }
  publish(): void {
    /* ... */
  }
  unpublish(): void {
    /* ... */
  }

  // Getters
  getId(): PropertyId {
    return this.id as PropertyId;
  }
  getTitle(): PropertyTitle {
    return this.title;
  }
  getPrice(): Price {
    return this.price;
  }
  // ... other getters
}

// Property Value Objects
export class PropertyTitle {
  private constructor(private readonly value: string) {}

  static create(title: string): PropertyTitle {
    if (!title || title.trim().length < 3) {
      throw new DomainError("Property title must be at least 3 characters");
    }
    if (title.length > 100) {
      throw new DomainError("Property title cannot exceed 100 characters");
    }
    return new PropertyTitle(title.trim());
  }

  get value(): string {
    return this.value;
  }
  isValid(): boolean {
    return this.value.length >= 3;
  }
}
```

#### User Aggregate

```typescript
// User Root Entity
export class User extends AggregateRoot {
  private constructor(
    id: UserId,
    private email: Email,
    private profile: UserProfile,
    private role: UserRole,
    private preferences: UserPreferences,
    private status: UserStatus,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(data: CreateUserData): User {
    /* ... */
  }
  static reconstitute(data: UserData): User {
    /* ... */
  }

  // Business methods
  updateProfile(profile: UserProfile): void {
    /* ... */
  }
  changeEmail(newEmail: Email): void {
    /* ... */
  }
  updatePreferences(preferences: UserPreferences): void {
    /* ... */
  }
  activate(): void {
    /* ... */
  }
  deactivate(): void {
    /* ... */
  }

  // Query methods
  canManageProperty(property: Property): boolean {
    /* ... */
  }
  hasPermission(permission: Permission): boolean {
    /* ... */
  }
}
```

### Database Schema Mapping

The existing Drizzle schema will be reorganized by bounded context:

```typescript
// infrastructure/database/schemas/property-schema.ts
export const properties = pgTable("properties", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  location: jsonb("location").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  features: jsonb("features").notNull(),
  images: jsonb("images").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// infrastructure/database/schemas/user-schema.ts
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  profile: jsonb("profile").notNull(),
  role: text("role").notNull(),
  preferences: jsonb("preferences").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

## Error Handling

### Domain Error Hierarchy

```typescript
// Base domain error
export abstract class DomainError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Specific domain errors
export class PropertyValidationError extends DomainError {
  constructor(message: string, public readonly field: string) {
    super(message, "PROPERTY_VALIDATION_ERROR");
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(message: string, public readonly rule: string) {
    super(message, "BUSINESS_RULE_VIOLATION");
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityType: string, id: string) {
    super(`${entityType} with id ${id} not found`, "ENTITY_NOT_FOUND");
  }
}
```

### Application Error Handling

```typescript
// Application layer error handling
export class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

// Use case error handling pattern
export class CreatePropertyUseCase {
  async execute(input: CreatePropertyInput): Promise<CreatePropertyOutput> {
    try {
      // ... use case logic
    } catch (error) {
      if (error instanceof DomainError) {
        throw new ApplicationError(
          `Failed to create property: ${error.message}`,
          "CREATE_PROPERTY_FAILED",
          error
        );
      }
      throw error;
    }
  }
}
```

## Testing Strategy

### Domain Layer Testing

```typescript
// Example: Property entity tests
describe("Property Entity", () => {
  describe("create", () => {
    it("should create property with valid data", () => {
      const data = {
        title: "Beautiful House",
        description: "A lovely family home",
        price: 500000,
        currency: "USD",
        location: validAddress,
        type: "house",
      };

      const property = Property.create(data);

      expect(property.getTitle().value).toBe("Beautiful House");
      expect(property.getPrice().amount).toBe(500000);
    });

    it("should throw error for invalid title", () => {
      const data = { ...validPropertyData, title: "AB" };

      expect(() => Property.create(data)).toThrow(
        "Property title must be at least 3 characters"
      );
    });
  });

  describe("updatePrice", () => {
    it("should update price for draft property", () => {
      const property = createDraftProperty();
      const newPrice = Price.create(600000, "USD");

      property.updatePrice(newPrice);

      expect(property.getPrice().amount).toBe(600000);
    });

    it("should throw error for significant price change on published property", () => {
      const property = createPublishedProperty();
      const newPrice = Price.create(1000000, "USD"); // 100% increase

      expect(() => property.updatePrice(newPrice)).toThrow(
        "Significant price changes require approval"
      );
    });
  });
});
```

### Application Layer Testing

```typescript
// Example: Use case integration tests
describe("CreatePropertyUseCase", () => {
  let useCase: CreatePropertyUseCase;
  let mockPropertyRepository: jest.Mocked<IPropertyRepository>;
  let mockImageService: jest.Mocked<IImageService>;

  beforeEach(() => {
    mockPropertyRepository = createMockPropertyRepository();
    mockImageService = createMockImageService();
    useCase = new CreatePropertyUseCase(
      mockPropertyRepository,
      mockImageService,
      mockNotificationService
    );
  });

  it("should create property successfully", async () => {
    const input = CreatePropertyInput.create(validPropertyData);
    mockPropertyRepository.save.mockResolvedValue();

    const result = await useCase.execute(input);

    expect(result.id).toBeDefined();
    expect(mockPropertyRepository.save).toHaveBeenCalledWith(
      expect.any(Property)
    );
  });

  it("should handle image processing", async () => {
    const input = CreatePropertyInput.create({
      ...validPropertyData,
      images: [mockImageInput],
    });
    mockImageService.processImages.mockResolvedValue([mockProcessedImage]);

    await useCase.execute(input);

    expect(mockImageService.processImages).toHaveBeenCalledWith([
      mockImageInput,
    ]);
  });
});
```

### Infrastructure Layer Testing

```typescript
// Example: Repository integration tests
describe("DrizzlePropertyRepository", () => {
  let repository: DrizzlePropertyRepository;
  let testDb: Database;

  beforeEach(async () => {
    testDb = await createTestDatabase();
    repository = new DrizzlePropertyRepository(testDb);
  });

  afterEach(async () => {
    await cleanupTestDatabase(testDb);
  });

  it("should save and retrieve property", async () => {
    const property = Property.create(validPropertyData);

    await repository.save(property);
    const retrieved = await repository.findById(property.getId());

    expect(retrieved).not.toBeNull();
    expect(retrieved!.getTitle().value).toBe(property.getTitle().value);
  });

  it("should update existing property", async () => {
    const property = Property.create(validPropertyData);
    await repository.save(property);

    const newPrice = Price.create(600000, "USD");
    property.updatePrice(newPrice);
    await repository.save(property);

    const retrieved = await repository.findById(property.getId());
    expect(retrieved!.getPrice().amount).toBe(600000);
  });
});
```

This design provides a comprehensive blueprint for migrating the Brymar Real Estate Platform to a clean DDD architecture while maintaining all existing functionality and improving system maintainability, testability, and scalability.
