# API Documentation - Server Actions

This document provides comprehensive documentation for all server actions in the simplified architecture.

## 📋 Overview

Server actions replace the traditional REST API endpoints and complex use case patterns. They provide type-safe, server-side operations that can be called directly from React components.

### Response Format

All server actions return a consistent `ActionResult` format:

```typescript
interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>; // Validation errors
}
```

## 🔐 Authentication Actions

### `signIn(credentials)`

Authenticate a user with email and password.

**Parameters:**

```typescript
interface AuthenticateUserInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

**Returns:**

```typescript
ActionResult<{
  user: User;
  redirectUrl: string;
}>;
```

**Example:**

```typescript
const result = await signIn({
  email: "user@example.com",
  password: "password123",
  rememberMe: true,
});

if (result.success) {
  // Redirect to result.data.redirectUrl
} else {
  // Handle error: result.error
}
```

### `signUp(userData)`

Register a new user account.

**Parameters:**

```typescript
interface SignUpInput {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}
```

**Returns:**

```typescript
ActionResult<{
  user: User;
  redirectUrl: string;
}>;
```

**Example:**

```typescript
const result = await signUp({
  email: "newuser@example.com",
  password: "securepassword",
  name: "John Doe",
  firstName: "John",
  lastName: "Doe",
});
```

### `forgotPassword(email)`

Request a password reset email.

**Parameters:**

```typescript
interface ForgotPasswordInput {
  email: string;
}
```

**Returns:**

```typescript
ActionResult<void>;
```

### `resetPassword(token, password)`

Reset password using a reset token.

**Parameters:**

```typescript
interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}
```

**Returns:**

```typescript
ActionResult<void>;
```

### `updateUserProfile(data)`

Update user profile information.

**Parameters:**

```typescript
interface UpdateUserProfileInput {
  id?: string;
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
}
```

**Returns:**

```typescript
ActionResult<User>;
```

### `getCurrentUser()`

Get the current authenticated user.

**Parameters:** None

**Returns:**

```typescript
ActionResult<User | null>;
```

## 🏠 Property Actions

### `createProperty(data)`

Create a new property listing.

**Parameters:**

```typescript
interface CreatePropertyInput {
  title: string;
  description: string;
  price: number;
  currency: string;
  type: PropertyType;
  address: AddressInput;
  features: PropertyFeaturesInput;
  images?: string[];
  featured?: boolean;
}
```

**Returns:**

```typescript
ActionResult<Property>;
```

**Example:**

```typescript
const result = await createProperty({
  title: "Beautiful Family Home",
  description: "A stunning 3-bedroom house...",
  price: 350000,
  currency: "USD",
  type: "house",
  address: {
    street: "123 Main St",
    city: "Springfield",
    state: "IL",
    country: "USA",
    postalCode: "62701",
  },
  features: {
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    parking: 2,
    yearBuilt: 2020,
  },
  images: ["image1.jpg", "image2.jpg"],
});
```

### `updateProperty(id, data)`

Update an existing property.

**Parameters:**

```typescript
interface UpdatePropertyInput {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  type?: PropertyType;
  address?: AddressInput;
  features?: PropertyFeaturesInput;
  images?: string[];
  featured?: boolean;
}
```

**Returns:**

```typescript
ActionResult<Property>;
```

### `getPropertyById(id)`

Get a single property by ID.

**Parameters:**

- `id: string` - Property ID

**Returns:**

```typescript
ActionResult<Property>;
```

### `searchProperties(filters)`

Search properties with filters and pagination.

**Parameters:**

```typescript
interface PropertySearchFilters {
  minPrice?: number;
  maxPrice?: number;
  propertyTypes?: PropertyType[];
  location?: string;
  featured?: boolean;
  userId?: string;
  status?: PropertyStatus[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

**Returns:**

```typescript
ActionResult<PropertySearchResult>;

interface PropertySearchResult {
  items: Property[];
  total: number;
  hasMore: boolean;
  page: number;
  totalPages: number;
  filters: {
    applied: string[];
    available: AvailableFilters;
  };
}
```

**Example:**

```typescript
const result = await searchProperties({
  minPrice: 200000,
  maxPrice: 500000,
  propertyTypes: ["house", "condo"],
  location: "Springfield",
  page: 1,
  limit: 20,
  sortBy: "price",
  sortOrder: "asc",
});
```

### `publishProperty(id, publishedAt?)`

Publish a property listing.

**Parameters:**

```typescript
interface PublishPropertyInput {
  id: string;
  publishedAt?: Date;
}
```

**Returns:**

```typescript
ActionResult<Property>;
```

### `deleteProperty(id)`

Delete a property listing.

**Parameters:**

- `id: string` - Property ID

**Returns:**

```typescript
ActionResult<void>;
```

### `createPropertyInquiry(data)`

Create an inquiry for a property.

**Parameters:**

```typescript
interface CreatePropertyInquiryInput {
  propertyId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}
```

**Returns:**

```typescript
ActionResult<PropertyInquiry>;
```

## 🌍 Land Actions

### `createLand(data)`

Create a new land listing.

**Parameters:**

```typescript
interface CreateLandInput {
  name: string;
  description: string;
  area: number;
  price: number;
  currency?: string;
  location: string;
  address?: AddressInput;
  type: LandType;
  features?: LandFeatures;
  images?: string[];
}
```

**Returns:**

```typescript
ActionResult<Land>;
```

### `updateLand(id, data)`

Update an existing land listing.

**Parameters:**

```typescript
interface UpdateLandInput {
  id: string;
  name?: string;
  description?: string;
  area?: number;
  price?: number;
  currency?: string;
  location?: string;
  address?: AddressInput;
  type?: LandType;
  features?: LandFeatures;
  images?: string[];
}
```

**Returns:**

```typescript
ActionResult<Land>;
```

### `getLandById(id)`

Get a single land listing by ID.

**Parameters:**

- `id: string` - Land ID

**Returns:**

```typescript
ActionResult<Land>;
```

### `searchLands(filters)`

Search land listings with filters.

**Parameters:**

```typescript
interface LandSearchFilters {
  minPrice?: number;
  maxPrice?: number;
  landTypes?: LandType[];
  location?: string;
  minArea?: number;
  maxArea?: number;
  status?: LandStatus[];
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

**Returns:**

```typescript
ActionResult<LandSearchResult>;
```

### `deleteLand(id)`

Delete a land listing.

**Parameters:**

- `id: string` - Land ID

**Returns:**

```typescript
ActionResult<void>;
```

## 📝 Blog Actions

### `createBlogPost(data)`

Create a new blog post.

**Parameters:**

```typescript
interface CreateBlogPostInput {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  category: string;
  tags?: string[];
  coverImage?: string;
}
```

**Returns:**

```typescript
ActionResult<BlogPost>;
```

**Example:**

```typescript
const result = await createBlogPost({
  title: "Real Estate Market Trends 2024",
  content: "The real estate market in 2024...",
  excerpt: "An overview of current market trends",
  category: "market-analysis",
  tags: ["real-estate", "market", "trends", "2024"],
  coverImage: "market-trends-cover.jpg",
});
```

### `updateBlogPost(id, data)`

Update an existing blog post.

**Parameters:**

```typescript
interface UpdateBlogPostInput {
  id: string;
  title?: string;
  content?: string;
  excerpt?: string;
  slug?: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
}
```

**Returns:**

```typescript
ActionResult<BlogPost>;
```

### `getBlogPostById(id)`

Get a single blog post by ID.

**Parameters:**

- `id: string` - Blog post ID

**Returns:**

```typescript
ActionResult<BlogPost>;
```

### `getBlogPostBySlug(slug)`

Get a blog post by its slug.

**Parameters:**

- `slug: string` - Blog post slug

**Returns:**

```typescript
ActionResult<BlogPost>;
```

### `searchBlogPosts(filters)`

Search blog posts with filters and pagination.

**Parameters:**

```typescript
interface BlogSearchFilters {
  query?: string;
  category?: string;
  status?: BlogStatus;
  authorId?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

**Returns:**

```typescript
ActionResult<BlogSearchResult>;

interface BlogSearchResult {
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
```

### `publishBlogPost(id, publishedAt?)`

Publish a blog post.

**Parameters:**

```typescript
interface PublishBlogPostInput {
  id: string;
  publishedAt?: Date;
}
```

**Returns:**

```typescript
ActionResult<BlogPost>;
```

### `unpublishBlogPost(id)`

Unpublish a blog post (set back to draft).

**Parameters:**

- `id: string` - Blog post ID

**Returns:**

```typescript
ActionResult<BlogPost>;
```

### `deleteBlogPost(id)`

Delete a blog post.

**Parameters:**

- `id: string` - Blog post ID

**Returns:**

```typescript
ActionResult<{ id: string }>;
```

### `getRecentBlogPosts(limit?)`

Get recent published blog posts.

**Parameters:**

- `limit?: number` - Number of posts to return (default: 5)

**Returns:**

```typescript
ActionResult<BlogPost[]>;
```

### `getFeaturedBlogPosts(limit?)`

Get featured blog posts.

**Parameters:**

- `limit?: number` - Number of posts to return (default: 3)

**Returns:**

```typescript
ActionResult<BlogPost[]>;
```

## 🧙‍♂️ Wizard Actions

### `createWizardDraft(data)`

Create a new wizard draft.

**Parameters:**

```typescript
interface CreateWizardDraftInput {
  type: WizardType;
  title: string;
  description?: string;
  initialData?: Record<string, any>;
}
```

**Returns:**

```typescript
ActionResult<WizardDraft>;
```

### `saveWizardDraft(id, data)`

Save/update a wizard draft.

**Parameters:**

```typescript
interface UpdateWizardDraftInput {
  id: string;
  title?: string;
  description?: string;
  currentStep?: number;
  data?: Record<string, any>;
}
```

**Returns:**

```typescript
ActionResult<WizardDraft>;
```

### `loadWizardDraft(id)`

Load a wizard draft by ID.

**Parameters:**

- `id: string` - Draft ID

**Returns:**

```typescript
ActionResult<WizardDraft>;
```

### `getWizardDrafts(type?)`

Get all wizard drafts for the current user.

**Parameters:**

- `type?: WizardType` - Optional filter by wizard type

**Returns:**

```typescript
ActionResult<WizardDraft[]>;
```

### `publishWizard(id, finalData?)`

Publish a wizard draft to create the final item.

**Parameters:**

```typescript
interface PublishWizardInput {
  id: string;
  finalData?: Record<string, any>;
}
```

**Returns:**

```typescript
ActionResult<{
  draft: WizardDraft;
  publishedItem: Property | Land | BlogPost;
}>;
```

### `deleteWizardDraft(id)`

Delete a wizard draft.

**Parameters:**

- `id: string` - Draft ID

**Returns:**

```typescript
ActionResult<void>;
```

### `generateAIContent(params)`

Generate AI content for wizard steps.

**Parameters:**

```typescript
interface GenerateAIContentInput {
  wizardType: WizardType;
  contentType: string;
  baseData: Record<string, any>;
}
```

**Returns:**

```typescript
ActionResult<{
  content: Record<string, any>;
  model: string;
  confidence: number;
}>;
```

**Example:**

```typescript
const result = await generateAIContent({
  wizardType: "property",
  contentType: "title",
  baseData: {
    propertyType: "house",
    location: "Springfield",
    bedrooms: 3,
    bathrooms: 2,
  },
});

// Result might be:
// {
//   success: true,
//   data: {
//     content: { title: "Beautiful 3-Bedroom House in Springfield" },
//     model: "simplified-ai-v1",
//     confidence: 0.85
//   }
// }
```

## 🔧 Error Handling

### Common Error Types

```typescript
// Validation Error
{
  success: false,
  error: "Validation failed",
  errors: {
    email: ["Email is required"],
    password: ["Password must be at least 8 characters"]
  }
}

// Authentication Error
{
  success: false,
  error: "Unauthorized"
}

// Not Found Error
{
  success: false,
  error: "Property not found"
}

// Server Error
{
  success: false,
  error: "An unexpected error occurred"
}
```

### Error Handling in Components

```typescript
const handleSubmit = async (data: FormData) => {
  const result = await createProperty(data);

  if (result.success) {
    // Handle success
    toast.success("Property created successfully");
    router.push(`/properties/${result.data.id}`);
  } else {
    // Handle error
    if (result.errors) {
      // Handle validation errors
      Object.entries(result.errors).forEach(([field, messages]) => {
        form.setError(field as any, { message: messages[0] });
      });
    } else {
      // Handle general error
      toast.error(result.error || "An error occurred");
    }
  }
};
```

## 🚀 Performance Considerations

### Caching

Server actions automatically benefit from Next.js caching. Use `revalidatePath()` or `revalidateTag()` to invalidate cache:

```typescript
export async function updateProperty(input: UpdatePropertyInput) {
  // ... update logic

  revalidatePath("/properties");
  revalidatePath(`/properties/${input.id}`);

  return result;
}
```

### Pagination

Always implement pagination for list endpoints:

```typescript
const result = await searchProperties({
  page: 1,
  limit: 20, // Reasonable default
  // ... other filters
});
```

### Validation

Validate input data in server actions:

```typescript
export async function createProperty(input: CreatePropertyInput) {
  // Validate required fields
  if (!input.title?.trim()) {
    return {
      success: false,
      error: "Title is required",
      errors: { title: ["Title is required"] },
    };
  }

  // ... rest of the logic
}
```

## 📚 Usage Examples

### React Hook Form Integration

```typescript
const form = useForm<CreatePropertyInput>();
const createMutation = useCreateProperty();

const onSubmit = async (data: CreatePropertyInput) => {
  const result = await createMutation.mutateAsync(data);
  if (result.success) {
    router.push(`/properties/${result.data.id}`);
  }
};
```

### TanStack Query Integration

```typescript
// In a custom hook
export function useProperties(filters?: PropertySearchFilters) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => searchProperties(filters || {}),
  });
}

// In a component
const { data, isLoading, error } = useProperties({
  minPrice: 200000,
  maxPrice: 500000,
});
```

### Server Component Usage

```typescript
// In a server component
export default async function PropertiesPage() {
  const result = await searchProperties({
    status: ["published"],
    limit: 10,
  });

  if (!result.success) {
    return <div>Error loading properties</div>;
  }

  return (
    <div>
      {result.data.items.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
```

---

This API documentation covers all server actions in the simplified architecture. For implementation details and examples, refer to the actual server action files in `/src/lib/actions/`.
