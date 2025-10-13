# API Documentation - Brymar Real Estate Platform

## Overview

This document describes the API endpoints and server actions available in the Brymar Real Estate platform. While the internal architecture has been migrated to Domain-Driven Design (DDD), the external API contracts remain unchanged to ensure backward compatibility.

## Architecture Context

The platform now uses a clean architecture with the following layers:

- **Domain Layer**: Business logic and entities
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: Database and external service implementations
- **Presentation Layer**: Server actions and API adapters

All API endpoints are implemented as thin adapters that delegate to application use cases.

## Authentication

### User Registration

**Endpoint**: Server Action `registerUser`

**Input**:

```typescript
interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "user" | "agent" | "admin";
}
```

**Output**:

```typescript
interface RegisterUserOutput {
  success: boolean;
  data?: {
    userId: string;
    message: string;
  };
  error?: string;
}
```

**Example Usage**:

```typescript
const formData = new FormData();
formData.append("email", "user@example.com");
formData.append("password", "securePassword123");
formData.append("firstName", "John");
formData.append("lastName", "Doe");

const result = await registerUser(formData);
```

**Internal Flow**:

1. `registerUser` server action validates input
2. Creates `CreateUserInput` DTO
3. Executes `RegisterUserUseCase`
4. Use case creates `User` domain entity
5. Persists via `IUserRepository`
6. Returns success response

### User Authentication

**Endpoint**: Server Action `authenticateUser`

**Input**:

```typescript
interface AuthenticateUserInput {
  email: string;
  password: string;
}
```

**Output**:

```typescript
interface AuthenticateUserOutput {
  success: boolean;
  data?: {
    user: UserData;
    token: string;
  };
  error?: string;
}
```

**Internal Flow**:

1. Input validation and DTO creation
2. `AuthenticateUserUseCase` execution
3. Domain validation via `User` entity
4. Session creation and token generation
5. Response formatting

## Property Management

### Create Property

**Endpoint**: Server Action `createProperty`

**Input**:

```typescript
interface CreatePropertyInput {
  title: string;
  description: string;
  price: number;
  propertyType: "house" | "apartment" | "villa" | "studio";
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  features: string[];
  images: File[];
  userId: string;
}
```

**Output**:

```typescript
interface CreatePropertyOutput {
  success: boolean;
  data?: {
    propertyId: string;
    property: PropertyData;
    message: string;
  };
  error?: string;
}
```

**Example Usage**:

```typescript
const formData = new FormData();
formData.append("title", "Beautiful Family Home");
formData.append("description", "A lovely 3-bedroom house...");
formData.append("price", "250000");
formData.append("propertyType", "house");
formData.append("address", JSON.stringify(addressData));
formData.append("features", JSON.stringify(["garage", "garden"]));
// Add image files
images.forEach((image) => formData.append("images", image));

const result = await createProperty(formData);
```

**Internal Flow**:

1. Form data extraction and validation
2. `CreatePropertyInput` DTO creation with domain validation
3. `CreatePropertyUseCase` execution
4. `Property` domain entity creation with business rules
5. Image processing via infrastructure services
6. Persistence via `IPropertyRepository`
7. Domain events publication

### Update Property

**Endpoint**: Server Action `updateProperty`

**Input**:

```typescript
interface UpdatePropertyInput {
  propertyId: string;
  title?: string;
  description?: string;
  price?: number;
  features?: string[];
  images?: File[];
}
```

**Output**:

```typescript
interface UpdatePropertyOutput {
  success: boolean;
  data?: {
    property: PropertyData;
    message: string;
  };
  error?: string;
}
```

**Internal Flow**:

1. Input validation and DTO creation
2. `UpdatePropertyUseCase` execution
3. Property retrieval and authorization check
4. Domain entity update with business rule validation
5. Persistence and event publication

### Search Properties

**Endpoint**: Server Action `searchProperties`

**Input**:

```typescript
interface SearchPropertiesInput {
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
  page?: number;
  limit?: number;
}
```

**Output**:

```typescript
interface SearchPropertiesOutput {
  success: boolean;
  data?: {
    properties: PropertyData[];
    total: number;
    page: number;
    totalPages: number;
  };
  error?: string;
}
```

**Internal Flow**:

1. Search criteria validation
2. `SearchPropertiesUseCase` execution
3. Repository query with optimized filters
4. Domain entity to DTO mapping
5. Paginated response formatting

### Publish Property

**Endpoint**: Server Action `publishProperty`

**Input**:

```typescript
interface PublishPropertyInput {
  propertyId: string;
}
```

**Output**:

```typescript
interface PublishPropertyOutput {
  success: boolean;
  data?: {
    property: PropertyData;
    message: string;
  };
  error?: string;
}
```

**Internal Flow**:

1. Property retrieval and authorization
2. `PublishPropertyUseCase` execution
3. Domain validation for publication readiness
4. Status update with business rules
5. Event publication for notifications

## Land Management

### Create Land

**Endpoint**: Server Action `createLand`

**Input**:

```typescript
interface CreateLandInput {
  title: string;
  description: string;
  price: number;
  area: number;
  landType: "residential" | "commercial" | "agricultural" | "industrial";
  address: AddressData;
  features: string[];
  images: File[];
  userId: string;
}
```

**Output**:

```typescript
interface CreateLandOutput {
  success: boolean;
  data?: {
    landId: string;
    land: LandData;
    message: string;
  };
  error?: string;
}
```

**Internal Flow**:

1. Input validation with land-specific rules
2. `CreateLandUseCase` execution
3. `Land` domain entity creation
4. Land-specific validation (zoning, area limits)
5. Persistence and event handling

### Search Lands

**Endpoint**: Server Action `searchLands`

**Input**:

```typescript
interface SearchLandsInput {
  landType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  location?: string;
  page?: number;
  limit?: number;
}
```

**Output**:

```typescript
interface SearchLandsOutput {
  success: boolean;
  data?: {
    lands: LandData[];
    total: number;
    page: number;
    totalPages: number;
  };
  error?: string;
}
```

## Content Management

### Create Blog Post

**Endpoint**: Server Action `createBlogPost`

**Input**:

```typescript
interface CreateBlogPostInput {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage?: File;
  authorId: string;
  status?: "draft" | "published";
}
```

**Output**:

```typescript
interface CreateBlogPostOutput {
  success: boolean;
  data?: {
    postId: string;
    post: BlogPostData;
    message: string;
  };
  error?: string;
}
```

**Internal Flow**:

1. Content validation and sanitization
2. `CreateBlogPostUseCase` execution
3. `BlogPost` domain entity creation
4. SEO validation and content processing
5. Image processing and storage
6. Persistence with content indexing

### Publish Blog Post

**Endpoint**: Server Action `publishBlogPost`

**Input**:

```typescript
interface PublishBlogPostInput {
  postId: string;
}
```

**Output**:

```typescript
interface PublishBlogPostOutput {
  success: boolean;
  data?: {
    post: BlogPostData;
    message: string;
  };
  error?: string;
}
```

## Wizard System

### Save Wizard Draft

**Endpoint**: Server Action `saveWizardDraft`

**Input**:

```typescript
interface SaveWizardDraftInput {
  wizardType: "property" | "land" | "blog";
  stepData: Record<string, any>;
  currentStep: number;
  userId: string;
  draftId?: string; // For updates
}
```

**Output**:

```typescript
interface SaveWizardDraftOutput {
  success: boolean;
  data?: {
    draftId: string;
    progress: number;
    message: string;
  };
  error?: string;
}
```

**Internal Flow**:

1. Wizard data validation by type
2. `SaveWizardDraftUseCase` execution
3. `WizardDraft` domain entity management
4. Progress calculation with business rules
5. Auto-save functionality

### Load Wizard Draft

**Endpoint**: Server Action `loadWizardDraft`

**Input**:

```typescript
interface LoadWizardDraftInput {
  draftId: string;
  userId: string;
}
```

**Output**:

```typescript
interface LoadWizardDraftOutput {
  success: boolean;
  data?: {
    draft: WizardDraftData;
    progress: number;
  };
  error?: string;
}
```

### Publish Wizard

**Endpoint**: Server Action `publishWizard`

**Input**:

```typescript
interface PublishWizardInput {
  draftId: string;
  userId: string;
}
```

**Output**:

```typescript
interface PublishWizardOutput {
  success: boolean;
  data?: {
    entityId: string; // Property, Land, or Blog Post ID
    entityType: string;
    message: string;
  };
  error?: string;
}
```

**Internal Flow**:

1. Draft validation and completion check
2. `PublishWizardUseCase` execution
3. Entity creation based on wizard type
4. Cross-context coordination
5. Draft cleanup and finalization

## Error Handling

### Error Response Format

All API endpoints return errors in a consistent format:

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
}
```

### Error Types

1. **Validation Errors** (400)

   ```typescript
   {
     success: false,
     error: "Invalid input data",
     code: "VALIDATION_ERROR",
     details: {
       field: "email",
       message: "Invalid email format"
     }
   }
   ```

2. **Authorization Errors** (401/403)

   ```typescript
   {
     success: false,
     error: "User not authorized to perform this action",
     code: "AUTHORIZATION_ERROR"
   }
   ```

3. **Business Rule Violations** (422)

   ```typescript
   {
     success: false,
     error: "Property cannot be published without images",
     code: "BUSINESS_RULE_VIOLATION"
   }
   ```

4. **Not Found Errors** (404)

   ```typescript
   {
     success: false,
     error: "Property not found",
     code: "NOT_FOUND"
   }
   ```

5. **Server Errors** (500)
   ```typescript
   {
     success: false,
     error: "An unexpected error occurred",
     code: "INTERNAL_ERROR"
   }
   ```

## Data Models

### User Data

```typescript
interface UserData {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    phone?: string;
    location?: string;
  };
  role: "user" | "agent" | "admin" | "super_admin";
  status: "active" | "inactive" | "suspended";
  preferences: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### Property Data

```typescript
interface PropertyData {
  id: string;
  title: string;
  description: string;
  price: number;
  propertyType: "house" | "apartment" | "villa" | "studio";
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  features: string[];
  images: {
    id: string;
    url: string;
    alt: string;
    order: number;
  }[];
  status: "draft" | "published" | "sold" | "archived";
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

### Land Data

```typescript
interface LandData {
  id: string;
  title: string;
  description: string;
  price: number;
  area: number; // in square meters
  landType: "residential" | "commercial" | "agricultural" | "industrial";
  address: AddressData;
  features: string[];
  images: ImageData[];
  zoning?: string;
  utilities: string[];
  status: "draft" | "published" | "sold" | "archived";
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Blog Post Data

```typescript
interface BlogPostData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  category: string;
  tags: string[];
  featuredImage?: {
    url: string;
    alt: string;
  };
  authorId: string;
  status: "draft" | "published" | "archived";
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **Create operations**: 10 requests per minute per user
- **Search operations**: 60 requests per minute per user
- **Read operations**: 100 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

## Caching

Response caching is implemented for performance:

- **Property listings**: 5 minutes
- **Blog posts**: 15 minutes
- **User profiles**: 10 minutes
- **Search results**: 2 minutes

Cache headers indicate freshness:

```
Cache-Control: public, max-age=300
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT
```

## Webhooks

The platform supports webhooks for real-time notifications:

### Available Events

- `property.created`
- `property.updated`
- `property.published`
- `property.sold`
- `user.registered`
- `blog.published`

### Webhook Payload

```typescript
interface WebhookPayload {
  event: string;
  timestamp: string;
  data: {
    id: string;
    type: string;
    attributes: Record<string, any>;
  };
  metadata: {
    userId?: string;
    source: string;
  };
}
```

## SDK and Client Libraries

### JavaScript/TypeScript SDK

```typescript
import { BrymarAPI } from "@brymar/api-client";

const client = new BrymarAPI({
  apiKey: "your-api-key",
  baseUrl: "https://api.brymar.com",
});

// Create property
const property = await client.properties.create({
  title: "Beautiful Home",
  price: 250000,
  // ... other fields
});

// Search properties
const results = await client.properties.search({
  propertyType: "house",
  minPrice: 200000,
  maxPrice: 300000,
});
```

### React Hooks

```typescript
import { usePropertyManagement } from "@brymar/react-hooks";

function PropertyForm() {
  const { createProperty, loading, error } = usePropertyManagement();

  const handleSubmit = async (data) => {
    const result = await createProperty(data);
    if (result) {
      // Handle success
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

## Migration Notes

### Breaking Changes

None. The API maintains backward compatibility while the internal architecture has been completely refactored.

### New Features

- Enhanced validation with domain-driven business rules
- Improved error messages with business context
- Better performance through optimized queries
- Real-time updates via domain events

### Deprecated Features

- Legacy validation endpoints (will be removed in v2.0)
- Old webhook format (use new format for better reliability)

## Support

For API support and questions:

- Documentation: https://docs.brymar.com
- Support Email: api-support@brymar.com
- GitHub Issues: https://github.com/brymar/platform/issues

## Changelog

### v1.5.0 (Current)

- Internal migration to DDD architecture
- Improved error handling and validation
- Enhanced performance and caching
- New webhook events

### v1.4.0

- Added land management endpoints
- Wizard system implementation
- Blog management features

### v1.3.0

- Property search improvements
- User role management
- Image processing enhancements
