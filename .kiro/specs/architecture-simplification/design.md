# Architecture Simplification Design Document

## Overview

This design document outlines the transformation from the current complex Domain-Driven Design (DDD) architecture to a simplified, maintainable structure that reduces file count by 80% while preserving all functionality. The new architecture follows the KISS principle and organizes code around features rather than technical layers.

### Current Architecture Problems

- **Over-engineered DDD layers**: Separate application, domain, and infrastructure layers create unnecessary complexity
- **Excessive abstraction**: DTOs, Use Cases, and Repository patterns add boilerplate without clear benefits
- **File proliferation**: Simple operations require multiple files across different layers
- **Navigation complexity**: Developers must traverse multiple directories to understand a single feature
- **Maintenance overhead**: Changes require updates across multiple layers and files

### Target Architecture Benefits

- **Feature-centric organization**: Related code co-located by business functionality
- **Direct data flow**: Simplified path from UI to database without unnecessary abstractions
- **Reduced cognitive load**: Fewer concepts and patterns to understand
- **Faster development**: Single file changes for most features
- **Better maintainability**: Clear, predictable code structure

## Architecture

### New Directory Structure

```
src/
├── app/                    # Next.js App Router (unchanged)
├── components/             # React components organized by feature
│   ├── ui/                # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── properties/        # Property-related components
│   ├── lands/             # Land-related components
│   ├── blog/              # Blog components
│   └── shared/            # Cross-feature components
├── lib/
│   ├── actions/           # Server actions (replaces use cases + DTOs)
│   ├── hooks/             # Custom React hooks (replaces services)
│   ├── types/             # Centralized TypeScript types
│   ├── utils/             # Utility functions
│   ├── db/                # Database configuration and schemas
│   └── auth/              # Authentication configuration
├── hooks/                 # Feature-specific hooks
└── types/                 # Additional type definitions
```

### Layer Elimination Strategy

#### 1. Remove DDD Layers

- **Eliminate**: `src/application/`, `src/domain/`, `src/infrastructure/`
- **Replace with**: Direct server actions and hooks
- **Benefit**: 80% reduction in files, direct code paths

#### 2. Consolidate Types

- **Current**: Scattered DTOs across application layer
- **New**: Single `src/lib/types/` directory with feature-based organization
- **Structure**:
  ```typescript
  // src/lib/types/index.ts
  export * from "./auth";
  export * from "./properties";
  export * from "./lands";
  export * from "./blog";
  export * from "./shared";
  ```

#### 3. Simplify Data Flow

- **Current**: Component → Hook → Server Action → Use Case → Repository → Database
- **New**: Component → Hook → Server Action → Database
- **Reduction**: 3 fewer layers per operation

## Components and Interfaces

### 1. Centralized Types System

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

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
  id: string;
}

export interface PropertySearchFilters {
  minPrice?: number;
  maxPrice?: number;
  propertyTypes?: string[];
  location?: string;
  // ... other filters
}

export interface PropertySearchResult {
  properties: Property[];
  total: number;
  hasMore: boolean;
  filters: {
    applied: string[];
    available: AvailableFilters;
  };
}
```

### 2. Simplified Server Actions

```typescript
// src/lib/actions/properties.ts
"use server";

import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import {
  CreatePropertyInput,
  UpdatePropertyInput,
  PropertySearchFilters,
} from "@/lib/types";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createProperty(input: CreatePropertyInput) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const [property] = await db
      .insert(properties)
      .values({
        ...input,
        userId: session.user.id,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/dashboard/properties");
    return { success: true, data: property };
  } catch (error) {
    return { success: false, error: "Failed to create property" };
  }
}

export async function updateProperty(input: UpdatePropertyInput) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const [property] = await db
      .update(properties)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(properties.id, input.id))
      .returning();

    revalidatePath("/dashboard/properties");
    revalidatePath(`/properties/${input.id}`);
    return { success: true, data: property };
  } catch (error) {
    return { success: false, error: "Failed to update property" };
  }
}

export async function searchProperties(filters: PropertySearchFilters) {
  try {
    // Build dynamic query based on filters
    let query = db.select().from(properties);

    if (filters.minPrice) {
      query = query.where(gte(properties.price, filters.minPrice));
    }

    if (filters.maxPrice) {
      query = query.where(lte(properties.price, filters.maxPrice));
    }

    // ... additional filter logic

    const results = await query.execute();

    return {
      success: true,
      data: {
        properties: results,
        total: results.length,
        hasMore: false, // Implement pagination logic
      },
    };
  } catch (error) {
    return { success: false, error: "Search failed" };
  }
}
```

### 3. Feature-Specific Hooks

```typescript
// src/hooks/use-properties.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProperty,
  updateProperty,
  searchProperties,
} from "@/lib/actions/properties";
import {
  CreatePropertyInput,
  UpdatePropertyInput,
  PropertySearchFilters,
} from "@/lib/types";

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

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProperty,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", data.data?.id] });
    },
  });
}
```

### 4. Simplified Components

```typescript
// src/components/properties/property-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { useCreateProperty, useUpdateProperty } from "@/hooks/use-properties";
import { CreatePropertyInput, Property } from "@/lib/types";

interface PropertyFormProps {
  property?: Property;
  onSuccess?: () => void;
}

export function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const form = useForm<CreatePropertyInput>({
    defaultValues: property || {
      title: "",
      description: "",
      price: 0,
      currency: "USD",
      // ... other defaults
    },
  });

  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();

  const onSubmit = async (data: CreatePropertyInput) => {
    try {
      if (property) {
        await updateMutation.mutateAsync({ ...data, id: property.id });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>{/* Form fields */}</form>
  );
}
```

## Data Models

### Database Schema (Drizzle)

```typescript
// src/lib/db/schema/properties.ts
import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

export const properties = pgTable("properties", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").notNull().default("USD"),
  address: jsonb("address").notNull(),
  features: jsonb("features").notNull(),
  images: jsonb("images").default([]),
  status: text("status").notNull().default("draft"),
  featured: boolean("featured").default(false),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lands = pgTable("lands", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  name: text("name").notNull(),
  description: text("description").notNull(),
  area: integer("area").notNull(),
  price: integer("price").notNull(),
  currency: text("currency").notNull().default("USD"),
  location: text("location").notNull(),
  type: text("type").notNull(),
  features: jsonb("features").default([]),
  images: jsonb("images").default([]),
  status: text("status").notNull().default("available"),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: text("id").primaryKey().default("gen_random_uuid()"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("draft"),
  category: text("category").notNull(),
  tags: jsonb("tags").default([]),
  coverImage: text("cover_image"),
  authorId: text("author_id").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Type Definitions

```typescript
// src/lib/types/shared.ts
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AddressInput extends Omit<Address, "coordinates"> {
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  page: number;
  totalPages: number;
}

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
```

## Error Handling

### Simplified Error Management

```typescript
// src/lib/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "UNKNOWN_ERROR",
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors: Record<string, string[]>) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export function handleActionError(error: unknown): ActionResult {
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      errors: error.errors,
    };
  }

  if (error instanceof AppError) {
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

## Testing Strategy

### Simplified Testing Approach

1. **Unit Tests**: Focus on utility functions and complex business logic
2. **Integration Tests**: Test server actions with database
3. **Component Tests**: Test React components with React Testing Library
4. **E2E Tests**: Test critical user flows with Playwright

```typescript
// src/lib/actions/__tests__/properties.test.ts
import { describe, it, expect, beforeEach } from "@jest/globals";
import { createProperty, updateProperty } from "../properties";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";

describe("Property Actions", () => {
  beforeEach(async () => {
    // Clean up test data
    await db.delete(properties);
  });

  it("should create a property", async () => {
    const input = {
      title: "Test Property",
      description: "A test property",
      price: 100000,
      currency: "USD",
      address: {
        street: "123 Test St",
        city: "Test City",
        state: "Test State",
        country: "Test Country",
      },
      features: {
        bedrooms: 3,
        bathrooms: 2,
        area: 1500,
      },
    };

    const result = await createProperty(input);

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe(input.title);
  });
});
```

### Migration Strategy

#### Phase 1: Setup New Structure

1. Create new directory structure
2. Set up centralized types
3. Create database schemas with Drizzle
4. Implement core server actions

#### Phase 2: Feature Migration

1. Start with authentication (lowest risk)
2. Migrate properties functionality
3. Migrate lands functionality
4. Migrate blog functionality
5. Migrate wizard functionality

#### Phase 3: Cleanup and Deduplication

1. **Remove old DDD layers completely**:
   - Delete `src/application/` directory entirely
   - Delete `src/domain/` directory entirely
   - Delete `src/infrastructure/` directory entirely
   - Delete `src/presentation/` directory entirely
2. **Remove duplicate components and utilities**:
   - Audit all components for duplicates and remove redundant ones
   - Consolidate duplicate utility functions
   - Remove duplicate hook implementations
   - Delete unused type definitions
3. **Clean up imports and dependencies**:
   - Update all import statements to use new paths
   - Remove unused npm dependencies
   - Clean up package.json
4. **File system cleanup**:
   - Remove empty directories
   - Delete unused configuration files
   - Clean up test files for deleted components
5. Update documentation and README files

#### Phase 4: Optimization

1. Performance testing
2. Bundle size optimization
3. Code splitting improvements
4. Final cleanup

### Rollback Strategy

Each phase includes rollback procedures:

1. **Git branching**: Feature branches for each migration phase
2. **Database migrations**: Reversible Drizzle migrations
3. **Feature flags**: Toggle between old and new implementations
4. **Monitoring**: Track performance and error rates during migration

This design ensures a smooth transition from the complex DDD architecture to a simplified, maintainable codebase while preserving all existing functionality.
