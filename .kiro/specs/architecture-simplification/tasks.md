# Implementation Plan

- [x] 1. Setup new simplified architecture foundation

  - Create centralized type system to replace scattered DTOs
  - Set up new directory structure for simplified organization
  - Configure database schemas with Drizzle ORM
  - _Requirements: 1.1, 2.1, 2.2, 6.1_

- [x] 1.1 Create centralized types directory structure

  - Create `src/lib/types/` directory with feature-based organization
  - Implement shared types (Address, PaginationParams, ActionResult, etc.)
  - Create property types consolidating all property-related DTOs
  - Create land types consolidating all land-related DTOs
  - Create blog types consolidating all blog-related DTOs
  - Create user/auth types consolidating all user-related DTOs
  - Create wizard types consolidating all wizard-related DTOs
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 1.2 Set up simplified database layer

  - Create consolidated Drizzle schema files in `src/lib/db/schema/`
  - Implement properties schema replacing domain entities
  - Implement lands schema replacing domain entities
  - Implement blog posts schema replacing domain entities
  - Implement users schema replacing domain entities
  - Create database connection utilities
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 1.3 Create error handling utilities

  - Implement simplified error classes (AppError, ValidationError, etc.)
  - Create error handling utilities for server actions
  - Set up consistent error response format
  - _Requirements: 6.4_

- [x] 2. Migrate authentication system to simplified architecture

  - Replace authentication use cases with direct server actions
  - Consolidate auth-related hooks and components
  - Update auth provider to use simplified data flow
  - _Requirements: 3.1, 3.2, 4.1, 7.2_

- [x] 2.1 Create simplified auth server actions

  - Replace `AuthenticateUserUseCase` with direct `signIn` server action
  - Replace `RegisterUserUseCase` with direct `signUp` server action
  - Replace `ForgotPasswordUseCase` with direct `forgotPassword` server action
  - Replace `ResetPasswordUseCase` with direct `resetPassword` server action
  - Replace `UpdateUserProfileUseCase` with direct `updateUserProfile` server action
  - Remove all auth-related DTOs and use direct types
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 2.2 Simplify auth hooks and components

  - Update `useAuth` hook to work with simplified server actions
  - Consolidate duplicate auth components
  - Remove unnecessary auth abstractions
  - Update auth provider to use new action-based flow
  - _Requirements: 4.1, 4.2, 5.2_

- [x] 3. Migrate properties functionality to simplified architecture

  - Replace property use cases with server actions
  - Create property-specific hooks for state management
  - Consolidate property components and remove duplicates
  - _Requirements: 3.1, 3.2, 4.1, 5.1_

- [x] 3.1 Create property server actions

  - Replace `CreatePropertyUseCase` with `createProperty` server action
  - Replace `UpdatePropertyUseCase` with `updateProperty` server action
  - Replace `GetPropertyByIdUseCase` with `getPropertyById` server action
  - Replace `SearchPropertiesUseCase` with `searchProperties` server action
  - Replace `PublishPropertyUseCase` with `publishProperty` server action
  - Remove all property DTOs and use centralized types
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 3.2 Create property hooks

  - Implement `useProperties` hook for property listing and search
  - Implement `useProperty` hook for single property data
  - Implement `useCreateProperty` mutation hook
  - Implement `useUpdateProperty` mutation hook
  - Implement `usePublishProperty` mutation hook
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 3.3 Consolidate property components

  - Audit property components for duplicates and remove redundant ones
  - Update property forms to use new hooks and actions
  - Update property lists to use simplified data flow
  - Organize property components by feature rather than technical layer
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 4. Migrate lands functionality to simplified architecture

  - Replace land use cases with server actions
  - Create land-specific hooks for state management
  - Consolidate land components and remove duplicates
  - _Requirements: 3.1, 3.2, 4.1, 5.1_

- [x] 4.1 Create land server actions

  - Replace `CreateLandUseCase` with `createLand` server action
  - Replace `UpdateLandUseCase` with `updateLand` server action
  - Replace `GetLandByIdUseCase` with `getLandById` server action
  - Replace `SearchLandsUseCase` with `searchLands` server action
  - Remove all land DTOs and use centralized types
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 4.2 Create land hooks

  - Implement `useLands` hook for land listing and search
  - Implement `useLand` hook for single land data
  - Implement `useCreateLand` mutation hook
  - Implement `useUpdateLand` mutation hook
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 4.3 Consolidate land components

  - Audit land components for duplicates and remove redundant ones
  - Update land forms to use new hooks and actions
  - Update land lists to use simplified data flow
  - Organize land components by feature rather than technical layer
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 5. Migrate blog functionality to simplified architecture

  - Replace blog use cases with server actions
  - Create blog-specific hooks for state management
  - Consolidate blog components and remove duplicates
  - _Requirements: 3.1, 3.2, 4.1, 5.1_

- [x] 5.1 Create blog server actions

  - Replace `CreateBlogPostUseCase` with `createBlogPost` server action
  - Replace `UpdateBlogPostUseCase` with `updateBlogPost` server action
  - Replace `DeleteBlogPostUseCase` with `deleteBlogPost` server action
  - Replace `GetBlogPostByIdUseCase` with `getBlogPostById` server action
  - Replace `SearchBlogPostsUseCase` with `searchBlogPosts` server action
  - Replace `PublishBlogPostUseCase` with `publishBlogPost` server action
  - Remove all blog DTOs and use centralized types
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 5.2 Create blog hooks

  - Implement `useBlogPosts` hook for blog listing and search
  - Implement `useBlogPost` hook for single blog post data
  - Implement `useCreateBlogPost` mutation hook
  - Implement `useUpdateBlogPost` mutation hook
  - Implement `useDeleteBlogPost` mutation hook
  - Implement `usePublishBlogPost` mutation hook
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 5.3 Consolidate blog components

  - Audit blog components for duplicates and remove redundant ones
  - Update blog forms to use new hooks and actions
  - Update blog lists to use simplified data flow
  - Organize blog components by feature rather than technical layer
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 6. Migrate wizard functionality to simplified architecture

  - Replace wizard use cases with server actions
  - Create wizard-specific hooks for state management
  - Consolidate wizard components and remove duplicates
  - _Requirements: 3.1, 3.2, 4.1, 5.1_

- [x] 6.1 Create wizard server actions

  - Replace `SaveWizardDraftUseCase` with `saveWizardDraft` server action
  - Replace `LoadWizardDraftUseCase` with `loadWizardDraft` server action
  - Replace `PublishWizardUseCase` with `publishWizard` server action
  - Replace `GenerateAIContentUseCase` with `generateAIContent` server action
  - Remove all wizard DTOs and use centralized types
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 6.2 Create wizard hooks

  - Implement `useWizardDrafts` hook for draft management
  - Implement `useWizardDraft` hook for single draft data
  - Implement `useSaveWizardDraft` mutation hook
  - Implement `usePublishWizard` mutation hook
  - Implement `useGenerateAIContent` mutation hook
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 6.3 Consolidate wizard components

  - Audit wizard components for duplicates and remove redundant ones
  - Update wizard forms to use new hooks and actions
  - Organize wizard components by feature rather than technical layer
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 7. Complete cleanup and deduplication phase

  - Remove all DDD layer directories completely
  - Audit and remove duplicate components, hooks, and utilities
  - Update all import statements to use new simplified paths
  - Clean up package.json and remove unused dependencies
  - _Requirements: 1.2, 5.2, 6.1_

- [x] 7.1 Delete DDD architecture directories

  - Delete `src/application/` directory entirely
  - Delete `src/domain/` directory entirely
  - Delete `src/infrastructure/` directory entirely
  - Delete `src/presentation/` directory entirely
  - Remove any remaining empty directories
  - _Requirements: 6.1_

- [x] 7.2 Remove duplicate components and utilities

  - Audit all components in `src/components/` for duplicates
  - Remove redundant component implementations
  - Consolidate duplicate utility functions in `src/lib/utils/`
  - Remove duplicate hook implementations in `src/hooks/`
  - Delete unused type definitions and interfaces
  - _Requirements: 5.2_

- [x] 7.3 Update imports and clean dependencies

  - Update all import statements throughout the codebase to use new paths
  - Remove unused npm dependencies from package.json
  - Clean up any remaining references to deleted DDD layers
  - Update TypeScript path mappings if needed
  - _Requirements: 1.2_

- [x] 7.4 File system cleanup

  - Remove empty directories left after deletions
  - Delete unused configuration files
  - Clean up test files for deleted components
  - Remove any orphaned files or directories
  - _Requirements: 1.2_

- [x] 8. Validation and testing phase

  - Verify all features work with simplified architecture
  - Run comprehensive test suite to ensure no regressions
  - Performance testing to validate improvements
  - Update documentation to reflect new architecture
  - _Requirements: 1.1, 1.4, 7.1_

- [x] 8.1 Feature validation testing

  - Test authentication flows (sign in, sign up, password reset)
  - Test property CRUD operations and search functionality
  - Test land CRUD operations and search functionality
  - Test blog CRUD operations and publishing
  - Test wizard functionality and AI content generation
  - _Requirements: 1.1, 3.4, 4.4, 6.4_

- [x] 8.2 Write comprehensive test suite

  - Create unit tests for server actions
  - Create integration tests for database operations
  - Create component tests for React components
  - Create end-to-end tests for critical user flows
  - _Requirements: 1.4_

- [x] 8.3 Performance validation

  - Measure and compare bundle size before and after
  - Test application performance and loading times
  - Verify database query performance
  - Validate memory usage improvements
  - _Requirements: 1.5_

- [x] 8.4 Documentation updates
  - Update README with new architecture overview
  - Create developer guide for the simplified structure
  - Update API documentation for new server actions
  - Document migration process and lessons learned
  - _Requirements: 7.1_
