# Requirements Document

## Introduction

This spec addresses the systematic resolution of all Biome linting errors and warnings found in the codebase. The errors include type safety issues (explicit `any` usage), performance concerns (using `<img>` instead of Next.js `<Image>`), security vulnerabilities (dangerouslySetInnerHTML), React best practices violations (array index keys, hardcoded IDs, hook ordering), and code quality issues (unused variables, shadowing global names). The goal is to achieve a clean, type-safe, performant, and maintainable codebase that follows modern React and Next.js best practices.

## Requirements

### Requirement 1: Type Safety - Eliminate Explicit `any` Types

**User Story:** As a developer, I want all TypeScript types to be properly defined instead of using `any`, so that I can catch type errors at compile time and improve code reliability.

#### Acceptance Criteria

1. WHEN reviewing type definitions in `src/types/unified.ts` THEN the system SHALL replace all `any` types with proper TypeScript types or generic constraints
2. WHEN reviewing type definitions in `src/types/universal-wizard.ts` THEN the system SHALL define proper validation schema types instead of using `any`
3. WHEN reviewing type definitions in `src/types/wizard.ts` THEN the system SHALL define proper map library types or use generic type parameters
4. WHEN reviewing component state in `src/app/(auth)/verify-email/page.tsx` THEN the system SHALL define a proper session type interface
5. WHEN filtering blog posts in `src/app/(authenticated)/dashboard/blog/page.tsx` THEN the system SHALL use the proper BlogPost type instead of `any`
6. WHEN mapping property types in `src/app/(authenticated)/dashboard/properties/[id]/edit/page.tsx` THEN the system SHALL use proper type assertions or type guards

### Requirement 2: Performance - Replace `<img>` with Next.js `<Image>`

**User Story:** As a user, I want images to load efficiently with automatic optimization, so that pages load faster and consume less bandwidth.

#### Acceptance Criteria

1. WHEN rendering images in `src/app/(authenticated)/dashboard/blog/[id]/page.tsx` THEN the system SHALL use Next.js `Image` component instead of HTML `<img>` tags
2. WHEN rendering property images in `src/app/(authenticated)/dashboard/properties/[id]/page.tsx` THEN the system SHALL use Next.js `Image` component with proper width and height attributes
3. WHEN using placeholder images THEN the system SHALL configure Next.js to handle placeholder.svg appropriately

### Requirement 3: Security - Address XSS Vulnerabilities

**User Story:** As a security-conscious developer, I want to safely render user-generated content, so that the application is protected from XSS attacks.

#### Acceptance Criteria

1. WHEN rendering blog content in `src/app/(authenticated)/dashboard/blog/[id]/page.tsx` THEN the system SHALL use a safe HTML sanitization library or render markdown safely
2. WHEN rendering land descriptions in `src/app/(authenticated)/dashboard/lands/[id]/page.tsx` THEN the system SHALL sanitize HTML content before rendering
3. IF content is trusted and sanitization is not needed THEN the system SHALL add comments explaining why dangerouslySetInnerHTML is safe in that context

### Requirement 4: React Best Practices - Fix Key Props

**User Story:** As a developer, I want React list items to have stable, unique keys, so that React can efficiently update the DOM and maintain component state correctly.

#### Acceptance Criteria

1. WHEN mapping over arrays in all dashboard pages THEN the system SHALL use unique identifiers (id, name, or composite keys) instead of array indices
2. WHEN items don't have unique IDs THEN the system SHALL generate stable keys using item properties or add unique IDs to the data structures
3. WHEN rendering static skeleton loaders THEN the system SHALL use generated unique keys or accept the index key with a comment explaining why it's safe

### Requirement 5: React Best Practices - Fix Hardcoded Element IDs

**User Story:** As a developer, I want form elements to have unique IDs when components are reused, so that accessibility features work correctly and there are no DOM ID conflicts.

#### Acceptance Criteria

1. WHEN rendering form inputs in `src/app/(authenticated)/dashboard/blog/[id]/page.tsx` THEN the system SHALL use React's `useId()` hook to generate unique IDs
2. WHEN rendering form inputs in `src/app/(authenticated)/dashboard/properties/[id]/page.tsx` THEN the system SHALL use React's `useId()` hook for all input elements
3. WHEN associating labels with inputs THEN the system SHALL use the generated unique IDs for both `htmlFor` and `id` attributes

### Requirement 6: React Best Practices - Fix Hook Ordering

**User Story:** As a developer, I want hooks to be called unconditionally at the top level, so that React can maintain consistent component state across renders.

#### Acceptance Criteria

1. WHEN implementing `src/app/(authenticated)/dashboard/lands/[id]/edit/page.tsx` THEN the system SHALL call all hooks before any conditional returns
2. WHEN implementing `src/app/(authenticated)/dashboard/lands/[id]/page.tsx` THEN the system SHALL call all hooks before any conditional returns
3. WHEN implementing `src/app/(authenticated)/dashboard/properties/[id]/edit/page.tsx` THEN the system SHALL call all hooks before any conditional returns
4. IF early returns are necessary THEN the system SHALL refactor to move validation logic after all hook calls

### Requirement 7: Code Quality - Fix Unused Variables

**User Story:** As a developer, I want to remove or use all declared variables, so that the code is clean and doesn't contain dead code.

#### Acceptance Criteria

1. WHEN the `loading` variable is unused in `src/app/(authenticated)/layout.tsx` THEN the system SHALL either use it or remove it from destructuring
2. WHEN variables are intentionally unused THEN the system SHALL prefix them with underscore (e.g., `_loading`) to indicate intentional non-use

### Requirement 8: Code Quality - Fix Global Name Shadowing

**User Story:** As a developer, I want component names to not shadow global objects, so that code is less confusing and potential bugs are avoided.

#### Acceptance Criteria

1. WHEN the Error component in `src/app/(auth)/error.tsx` shadows the global Error object THEN the system SHALL rename it to `AuthError` or `ErrorPage`

### Requirement 9: Code Quality - Fix Parse Errors

**User Story:** As a developer, I want all code to parse correctly, so that the application builds and runs without syntax errors.

#### Acceptance Criteria

1. WHEN there's an empty ternary branch in `src/app/(authenticated)/dashboard/properties/[id]/page.tsx` at line 527 THEN the system SHALL add the missing content or refactor the conditional logic
2. WHEN fixing parse errors THEN the system SHALL ensure the code maintains its intended functionality

### Requirement 10: Code Cleanup - Remove Unused Files

**User Story:** As a developer, I want to remove any files that are no longer in use, so that the codebase remains clean and maintainable without dead code.

#### Acceptance Criteria

1. WHEN analyzing the codebase THEN the system SHALL identify files that are not imported or referenced anywhere
2. WHEN unused files are found THEN the system SHALL verify they are truly unused by checking all imports and references
3. WHEN removing files THEN the system SHALL ensure no runtime dependencies are broken
4. WHEN files are removed THEN the system SHALL document which files were deleted and why

### Requirement 11: Comprehensive Testing

**User Story:** As a developer, I want to verify that all fixes work correctly, so that I can be confident the application still functions as expected.

#### Acceptance Criteria

1. WHEN all fixes are applied THEN the system SHALL run `npm run lint` or the Biome check command and confirm zero errors
2. WHEN fixes are complete THEN the system SHALL verify that TypeScript compilation succeeds
3. WHEN fixes involve component changes THEN the system SHALL verify that the application builds successfully
4. WHEN unused files are removed THEN the system SHALL verify the application still runs correctly
