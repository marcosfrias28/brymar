# Developer Guide - Simplified Architecture

This guide explains how to work with the simplified architecture and provides best practices for development.

## 🎯 Architecture Philosophy

### From Complex to Simple

The application has been transformed from a complex Domain-Driven Design (DDD) architecture to a simplified, maintainable structure:

**Before (DDD)**:

```
Component → Hook → Service → Use Case → Repository → Database
```

**After (Simplified)**:

```
Component → Hook → Server Action → Database
```

### Key Principles

1. **Feature-Centric Organization**: Code is organized by business functionality
2. **Direct Data Flow**: Minimal abstractions between UI and data
3. **Centralized Types**: Single source of truth for TypeScript definitions
4. **Server Actions**: Replace complex use cases with direct server operations
5. **KISS Principle**: Keep It Simple, Stupid

## 🏗️ Directory Structure Deep Dive

### `/src/lib/actions/` - Server Actions

Server actions replace the entire application layer (use cases, DTOs, services):

```typescript
// ❌ Old DDD approach (multiple files)
// - CreatePropertyUseCase.ts
// - CreatePropertyDTO.ts
// - PropertyRepository.ts
// - PropertyService.ts

// ✅ New simplified approach (single file)
// src/lib/actions/properties.ts
export async function createProperty(input: CreatePropertyInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const [property] = await db
    .insert(properties)
    .values({
      ...input,
      userId: session.user.id,
      createdAt: new Date(),
    })
    .returning();

  revalidatePath("/properties");
  return { success: true, data: property };
}
```

### `/src/lib/types/` - Centralized Types

All TypeScript types are centralized by feature:

```typescript
// src/lib/types/properties.ts
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  address: Address;
  features: PropertyFeatures;
  images: string[];
  status: PropertyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  price: number;
  currency: string;
  address: AddressInput;
  features: PropertyFeaturesInput;
  images?: string[];
}

export interface PropertySearchFilters {
  minPrice?: number;
  maxPrice?: number;
  propertyTypes?: string[];
  location?: string;
}
```

### `/src/hooks/` - Custom React Hooks

Hooks manage state and server interactions:

```typescript
// src/hooks/use-properties.ts
export function useProperties(filters?: PropertySearchFilters) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => searchProperties(filters || {}),
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
```

### `/src/components/` - Feature-Organized Components

Components are organized by business functionality:

```
src/components/
├── ui/                 # Reusable UI components
├── auth/              # Authentication components
├── properties/        # Property-related components
│   ├── property-form.tsx
│   ├── property-card.tsx
│   ├── property-list.tsx
│   └── property-filters.tsx
├── lands/             # Land-related components
├── blog/              # Blog components
└── shared/            # Cross-feature components
```

## 🛠️ Development Workflows

### Adding a New Feature

#### 1. Define Types

```typescript
// src/lib/types/feature.ts
export interface Feature {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeatureInput {
  name: string;
  description: string;
}

export interface UpdateFeatureInput {
  id: string;
  name?: string;
  description?: string;
}
```

#### 2. Create Database Schema

```typescript
// src/lib/db/schema/features.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const features = pgTable("features", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

#### 3. Implement Server Actions

```typescript
// src/lib/actions/features.ts
"use server";

import { db } from "@/lib/db";
import { features } from "@/lib/db/schema/features";
import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";
import { CreateFeatureInput, UpdateFeatureInput } from "@/lib/types/features";

export async function createFeature(input: CreateFeatureInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [feature] = await db
      .insert(features)
      .values({
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/features");
    return { success: true, data: feature };
  } catch (error) {
    return { success: false, error: "Failed to create feature" };
  }
}

export async function updateFeature(input: UpdateFeatureInput) {
  // Implementation
}

export async function getFeatures() {
  // Implementation
}
```

#### 4. Create Custom Hooks

```typescript
// src/hooks/use-features.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFeature,
  updateFeature,
  getFeatures,
} from "@/lib/actions/features";

export function useFeatures() {
  return useQuery({
    queryKey: ["features"],
    queryFn: getFeatures,
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["features"] });
    },
  });
}
```

#### 5. Build Components

```typescript
// src/components/features/feature-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { useCreateFeature } from "@/hooks/use-features";
import { CreateFeatureInput } from "@/lib/types/features";

export function FeatureForm() {
  const form = useForm<CreateFeatureInput>();
  const createMutation = useCreateFeature();

  const onSubmit = async (data: CreateFeatureInput) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>{/* Form fields */}</form>
  );
}
```

### Error Handling Pattern

```typescript
// src/lib/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "UNKNOWN_ERROR",
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export function handleActionError(error: unknown): ActionResult {
  if (error instanceof AppError) {
    return { success: false, error: error.message };
  }

  console.error("Unexpected error:", error);
  return { success: false, error: "An unexpected error occurred" };
}
```

### Database Operations

#### Simple Queries

```typescript
// Get all items
const items = await db.select().from(table);

// Get by ID
const [item] = await db.select().from(table).where(eq(table.id, id)).limit(1);

// Create
const [newItem] = await db.insert(table).values(data).returning();

// Update
const [updatedItem] = await db
  .update(table)
  .set(data)
  .where(eq(table.id, id))
  .returning();
```

#### Complex Queries with Filters

```typescript
export async function searchItems(filters: SearchFilters) {
  let query = db.select().from(table);
  const conditions = [];

  if (filters.name) {
    conditions.push(ilike(table.name, `%${filters.name}%`));
  }

  if (filters.minPrice) {
    conditions.push(gte(table.price, filters.minPrice));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return await query;
}
```

## 🧪 Testing Patterns

### Server Action Tests

```typescript
// src/lib/actions/__tests__/features.test.ts
import { createFeature } from "../features";

describe("Feature Actions", () => {
  it("should create a feature", async () => {
    const input = {
      name: "Test Feature",
      description: "A test feature",
    };

    const result = await createFeature(input);

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe(input.name);
  });
});
```

### Component Tests

```typescript
// src/components/features/__tests__/feature-form.test.tsx
import { render, screen } from "@testing-library/react";
import { FeatureForm } from "../feature-form";

describe("FeatureForm", () => {
  it("should render form fields", () => {
    render(<FeatureForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });
});
```

### Hook Tests

```typescript
// src/hooks/__tests__/use-features.test.ts
import { renderHook } from "@testing-library/react";
import { useFeatures } from "../use-features";

describe("useFeatures", () => {
  it("should fetch features", async () => {
    const { result } = renderHook(() => useFeatures());

    expect(result.current.isLoading).toBe(true);
  });
});
```

## 🚀 Performance Best Practices

### Server Actions

- Use `revalidatePath()` to update cached data
- Implement proper error handling
- Validate input data
- Use transactions for complex operations

### Database Queries

- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Use `select()` to fetch only needed fields
- Batch operations when possible

### Components

- Use React.memo for expensive components
- Implement proper loading states
- Use Suspense boundaries
- Optimize re-renders with useCallback/useMemo

### Caching

- Leverage Next.js caching with server actions
- Use React Query for client-side caching
- Implement proper cache invalidation
- Use static generation where appropriate

## 🔧 Debugging Tips

### Server Action Debugging

```typescript
export async function debugAction(input: any) {
  console.log("Action input:", input);

  try {
    const result = await someOperation(input);
    console.log("Action result:", result);
    return result;
  } catch (error) {
    console.error("Action error:", error);
    throw error;
  }
}
```

### Database Query Debugging

```typescript
// Enable query logging in development
const db = drizzle(connection, {
  logger: process.env.NODE_ENV === "development",
});
```

### Component Debugging

```typescript
// Use React DevTools Profiler
// Add debug logs in development
if (process.env.NODE_ENV === "development") {
  console.log("Component props:", props);
}
```

## 📚 Migration Guide

### From DDD to Simplified Architecture

#### 1. Identify Use Cases

- Map existing use cases to server actions
- Combine related operations
- Simplify complex workflows

#### 2. Consolidate Types

- Merge DTOs into domain types
- Remove unnecessary abstractions
- Centralize type definitions

#### 3. Replace Repositories

- Convert repository methods to direct database operations
- Remove repository interfaces
- Simplify data access patterns

#### 4. Update Components

- Replace service injections with hook usage
- Simplify component props
- Remove unnecessary abstractions

## 🎯 Best Practices Summary

### Do's ✅

- Keep server actions focused and simple
- Use centralized types for consistency
- Organize components by feature
- Implement proper error handling
- Write tests for critical functionality
- Use TypeScript strictly
- Follow Next.js conventions

### Don'ts ❌

- Don't create unnecessary abstractions
- Don't bypass the simplified patterns
- Don't ignore error handling
- Don't skip type definitions
- Don't create complex inheritance hierarchies
- Don't mix server and client code inappropriately

## 🆘 Common Issues and Solutions

### Issue: Server Action Not Working

**Solution**: Ensure the function is marked with `"use server"` and is properly exported.

### Issue: Type Errors

**Solution**: Check that types are properly imported from centralized type files.

### Issue: Database Connection Issues

**Solution**: Verify environment variables and database configuration.

### Issue: Caching Problems

**Solution**: Use `revalidatePath()` or `revalidateTag()` to invalidate cache.

### Issue: Performance Problems

**Solution**: Implement proper pagination, indexing, and caching strategies.

---

This guide provides the foundation for working with the simplified architecture. For specific implementation details, refer to the existing code examples in the codebase.
