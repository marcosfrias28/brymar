# Design Document

## Overview

This design outlines a systematic approach to fixing all Biome linting errors and warnings in the codebase. The solution involves creating proper TypeScript type definitions, migrating to Next.js Image components, implementing HTML sanitization, refactoring React components to follow best practices, fixing hook ordering issues, cleaning up unused code, and removing unused files. The approach prioritizes type safety, performance, security, and maintainability while ensuring no breaking changes to application functionality.

## Architecture

### High-Level Approach

1. **Type System Enhancement**: Create comprehensive type definitions to replace all `any` types
2. **Component Refactoring**: Update components to use Next.js best practices and React hooks correctly
3. **Security Hardening**: Implement HTML sanitization for user-generated content
4. **Performance Optimization**: Replace HTML img tags with Next.js Image components
5. **Code Cleanup**: Remove unused variables and files, fix naming conflicts
6. **Validation**: Run linting and build checks to ensure all issues are resolved

### Dependency Analysis

- **DOMPurify** or **sanitize-html**: For HTML sanitization (security requirement)
- **Next.js Image**: Already available, needs configuration for external images
- **React useId**: Already available in React 18+
- **TypeScript**: Existing, will use advanced type features

## Components and Interfaces

### 1. Type Definitions Module

**Location**: `src/types/`

**New Type Definitions**:

```typescript
// src/types/validation.ts
export interface ValidationResult {
  success: boolean;
  errors?: Record<string, string[]>;
}

export type ValidationFunction<T = unknown> = (
  data: T
) => ValidationResult;

// src/types/session.ts
export interface UserSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

// src/types/map.ts
export interface MapInstance {
  setView: (center: [number, number], zoom: number) => void;
  remove: () => void;
}

export interface MapMarker {
  setLatLng: (coords: [number, number]) => void;
  remove: () => void;
}

// src/types/blog.ts
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  publishedDate?: string;
  readTime?: number;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Updated Type Definitions**:

```typescript
// src/types/unified.ts updates
export interface FormField {
  name: string;
  label: string;
  type: string;
  description?: string;
  component: string;
  validation?: ValidationFunction;
  isOptional?: boolean;
}

export interface WizardState {
  currentStep: string;
  completedSteps: string[];
  formData: Record<string, unknown>;
  completionPercentage: number;
  isValid: boolean;
}

export interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, string | number | boolean>) => void;
  loading?: boolean;
  placeholder?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  query: string;
  filters?: Record<string, string | number | boolean>;
}
```

### 2. HTML Sanitization Utility

**Location**: `src/lib/utils/sanitize.ts`

**Interface**:

```typescript
export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

export function sanitizeHtml(
  html: string,
  options?: SanitizeOptions
): string;
```

**Implementation Strategy**:
- Use DOMPurify for client-side sanitization
- Provide sensible defaults for blog content (headings, paragraphs, lists, links, images)
- Allow customization for different content types

### 3. Image Component Wrapper

**Location**: `src/components/ui/optimized-image.tsx`

**Interface**:

```typescript
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}
```

**Implementation Strategy**:
- Wrap Next.js Image component with sensible defaults
- Handle placeholder images gracefully
- Provide fallback for missing dimensions

### 4. Form Input with Unique IDs

**Location**: `src/components/ui/form-input.tsx`

**Interface**:

```typescript
interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}
```

**Implementation Strategy**:
- Use React's `useId()` hook internally
- Generate unique IDs for input and label association
- Maintain backward compatibility with existing Input component

## Data Models

### BlogPost Type Enhancement

```typescript
export interface BlogPost {
  id: string;
  title: string;
  content: string; // Raw HTML or Markdown
  sanitizedContent?: string; // Sanitized HTML for display
  excerpt?: string;
  author: string;
  status: BlogPostStatus;
  publishedDate?: string;
  readTime?: number;
  coverImage?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type BlogPostStatus = 'draft' | 'published' | 'archived';
```

### Property Type Enhancement

```typescript
export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  location: PropertyLocation;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

export type PropertyType = 
  | 'house' 
  | 'apartment' 
  | 'land' 
  | 'commercial' 
  | 'villa';
```

## Error Handling

### Type Safety Errors

**Strategy**: Use TypeScript's strict mode and proper type guards

```typescript
// Type guard example
function isBlogPost(obj: unknown): obj is BlogPost {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'status' in obj
  );
}
```

### Runtime Errors

**Strategy**: Graceful degradation for image loading and content rendering

```typescript
// Image error handling
<OptimizedImage
  src={image}
  alt={alt}
  onError={(e) => {
    e.currentTarget.src = '/placeholder.svg';
  }}
/>
```

### Sanitization Errors

**Strategy**: Fall back to plain text if sanitization fails

```typescript
try {
  const sanitized = sanitizeHtml(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
} catch (error) {
  console.error('Sanitization failed:', error);
  return <div>{stripHtml(content)}</div>;
}
```

## Testing Strategy

### Type Checking

1. Run `tsc --noEmit` to verify all type errors are resolved
2. Ensure no `any` types remain (except where explicitly documented as necessary)
3. Verify generic types work correctly with different data types

### Linting

1. Run Biome check: `npx @biomejs/biome check src/`
2. Verify zero errors and zero warnings
3. Check that all auto-fixable issues are resolved

### Component Testing

1. Verify all pages render correctly after refactoring
2. Test form inputs have unique IDs when rendered multiple times
3. Verify images load with Next.js Image component
4. Test sanitized HTML renders correctly without XSS vulnerabilities

### Build Testing

1. Run `npm run build` to ensure production build succeeds
2. Verify no build-time errors or warnings
3. Check bundle size hasn't increased significantly

### Manual Testing Checklist

- [ ] Blog post creation and editing works
- [ ] Property listing and detail pages render correctly
- [ ] Land listing and detail pages render correctly
- [ ] Images load and display properly
- [ ] Forms are accessible with proper label associations
- [ ] No console errors in browser
- [ ] Authentication flows work correctly

## Implementation Phases

### Phase 1: Type System (Requirements 1, 7, 8)
- Create new type definition files
- Update existing type files
- Fix unused variables
- Rename shadowing components

### Phase 2: React Best Practices (Requirements 4, 5, 6)
- Fix hook ordering issues
- Replace array index keys with unique keys
- Implement useId() for form inputs

### Phase 3: Performance & Security (Requirements 2, 3)
- Install and configure DOMPurify
- Create sanitization utility
- Replace img tags with Next.js Image
- Implement sanitized content rendering

### Phase 4: Code Quality (Requirements 9, 10)
- Fix parse errors
- Identify and remove unused files
- Clean up dead code

### Phase 5: Validation (Requirement 11)
- Run all linting checks
- Run TypeScript compiler
- Run build process
- Manual testing

## File Organization

```
src/
├── types/
│   ├── validation.ts (new)
│   ├── session.ts (new)
│   ├── map.ts (new)
│   ├── blog.ts (new)
│   ├── unified.ts (updated)
│   ├── universal-wizard.ts (updated)
│   └── wizard.ts (updated)
├── lib/
│   └── utils/
│       └── sanitize.ts (new)
├── components/
│   └── ui/
│       ├── optimized-image.tsx (new)
│       └── form-input.tsx (new)
└── app/
    ├── (auth)/
    │   ├── error.tsx → auth-error.tsx (renamed)
    │   └── verify-email/
    │       └── page.tsx (updated)
    └── (authenticated)/
        └── dashboard/
            ├── layout.tsx (updated)
            ├── blog/
            │   ├── page.tsx (updated)
            │   └── [id]/
            │       └── page.tsx (updated)
            ├── properties/
            │   ├── page.tsx (updated)
            │   └── [id]/
            │       ├── page.tsx (updated)
            │       └── edit/
            │           └── page.tsx (updated)
            └── lands/
                ├── page.tsx (updated)
                └── [id]/
                    ├── page.tsx (updated)
                    └── edit/
                        └── page.tsx (updated)
```

## Configuration Changes

### Next.js Configuration

```javascript
// next.config.js
module.exports = {
  images: {
    domains: [], // Add external image domains if needed
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};
```

### TypeScript Configuration

```json
// tsconfig.json (verify these are enabled)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## Security Considerations

1. **HTML Sanitization**: All user-generated HTML content must be sanitized before rendering
2. **Image Sources**: Validate image URLs to prevent loading from malicious sources
3. **Type Safety**: Proper typing prevents runtime type errors and potential security issues
4. **Input Validation**: Maintain existing validation while improving type safety

## Performance Considerations

1. **Image Optimization**: Next.js Image component provides automatic optimization
2. **Bundle Size**: DOMPurify adds ~45KB gzipped, acceptable for security benefit
3. **Type Checking**: No runtime performance impact, only build-time
4. **Re-renders**: Using useId() and proper keys improves React performance

## Rollback Strategy

1. All changes are tracked in version control
2. Each phase can be rolled back independently
3. Type changes are backward compatible where possible
4. Component refactoring maintains same props interface
