# Implementation Plan

- [x] 1. Create core generic types and utilities


  - Implement generic `ActionState<T>` type to replace all specific action state types
  - Create `ValidatedOptions` interface for configuration options
  - Add type aliases for backward compatibility during migration
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1_



- [x] 2. Implement centralized error handling utility

  - Create `handleAPIError` function that extracts messages from `BetterCallAPIError`
  - Handle fallback messages for unknown errors
  - Ensure consistent error response format with `success: false`

  - Write unit tests for error handling scenarios
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Create unified validation function

  - Implement `createValidatedAction` function that combines `validatedAction` and `validatedActionWithUser`
  - Add support for `withUser` option in `ValidatedOptions`
  - Implement schema validation with Zod


  - Handle user authentication when `withUser: true`
  - Write unit tests for validation scenarios
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.2, 5.3, 5.4_

- [x] 4. Create utility functions for common patterns

  - Create helper functions for FormData parsing and type conversion


  - Implement consistent response formatting utilities
  - Add TypeScript utility types for action function signatures
  - Write unit tests for utility functions
  - _Requirements: 5.1, 5.2, 5.5_



- [ ] 5. Migrate authentication actions to new system
- [x] 5.1 Migrate signIn action

  - Update `signIn` action to use `createValidatedAction` and `ActionState<{ user: User }>`
  - Replace manual error handling with `handleAPIError`
  - Ensure type safety and maintain existing functionality


  - Write integration tests to verify behavior
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5.2 Migrate signUp action

  - Update `signUp` action to use new generic system


  - Replace `SignUpActionState` with `ActionState<{ user?: User }>`
  - Update error handling to use centralized utility
  - Verify image upload functionality remains intact
  - _Requirements: 4.1, 4.2, 4.3, 4.4_



- [x] 5.3 Migrate user update action

  - Update `updateUserAction` to use `createValidatedAction` with `withUser: true`
  - Replace manual user authentication with automatic handling
  - Update to use generic `ActionState` type
  - Test file upload and user data update functionality
  - _Requirements: 4.1, 4.2, 4.3, 4.4_



- [x] 5.4 Migrate password reset actions

  - Update `forgotPassword` and `resetPassword` actions to use new system
  - Replace specific action state types with generic `ActionState`
  - Implement centralized error handling


  - Verify email sending and password reset flows
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5.5 Migrate email verification actions

  - Update `sendVerificationOTP` and `verifyOTP` actions
  - Replace `VerifyEmailActionState` with `ActionState<{ verified?: boolean }>`


  - Update error handling and response formatting
  - Test OTP generation and verification flows
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Update property and other action files

- [x] 6.1 Identify and migrate property actions


  - Scan for property-related actions using old validation system
  - Update property actions to use `createValidatedAction`
  - Replace specific action states with generic types
  - Test CRUD operations for properties
  - _Requirements: 4.1, 4.2, 4.3, 4.4_



- [x] 6.2 Migrate blog actions to new system




  - Update `app/actions/blog-actions.ts` to use `createValidatedAction`
  - Replace `validatedAction` calls with new unified system
  - Update return types to use generic `ActionState<T>`
  - Test blog CRUD operations
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6.3 Remove duplicate auth-actions file








  - Delete the old `app/actions/auth-actions.ts` file that still uses legacy system
  - Ensure all imports point to the migrated `lib/actions/auth-actions.ts`
  - Update any components that might be importing from the old location
  - _Requirements: 4.5_






- [ ] 6.4 Fix property actions schema issues



  - Fix the schema validation issues in property actions (status field default handling)

  - Update return types to properly handle generic ActionState
  - Remove unused imports (handleAPIError, put)
  - _Requirements: 4.1, 4.2_


- [x] 7. Update component imports and usage



- [x] 7.1 Update authentication components

  - Update signin and signup forms to use new action state types
  - Verify form submission and error handling still works
  - Update TypeScript imports to use generic types

  - Test user flows end-to-end
  - _Requirements: 4.1, 4.2, 5.5_


- [x] 7.2 Update hooks and state management






  - Update custom hooks that use action states (like `use-user.ts`, `use-properties.ts`)
  - Replace specific action state types with generic equivalents

  - Verify hook functionality and type safety
  - Test component integration with updated hooks
  - _Requirements: 4.1, 4.2, 5.5_


-

- [x] 7.3 Update remaining components





  - Find all components importing old action state types
  - Update imports to use generic `ActionState<T>` types

  - Verify component functionality and type checking
  - Test form submissions and error displays
  - _Requirements: 4.1, 4.2, 5.5_
-

- [x] 8. Create comprehensive test suite



- [x] 8.1 Write unit tests for core utilities

  - Test `ActionState<T>` type inference and compatibility
  - Test `createValidatedAction` with various scenarios
  - Test `handleAPIError` with different error types
  - Verify edge cases and error conditions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_






- [x] 8.2 Write integration tests for migrated actions



  - Test each migrated action maintains original functionality



  - Verify error handling works correctly
  - Test authentication flows and user validation
  - Ensure form data processing works as expected
  - _Requirements: 4.1, 4.2, 4.3, 4.4_


















- [ ] 8.3 Write end-to-end tests for critical flows

  - Test complete user registration and verification flow

  - Test sign-in and authentication flow
  - Test password reset flow


  - Test property management operations
  - _Requirements: 4.1, 4.2, 4.3, 4.4_



- [x] 9. Clean up deprecated code and optimize



- [ ] 9.1 Remove deprecated types and functions

  - Remove old specific action state types (`SignInActionState`, etc.) from validations.ts
  - Remove `validatedAction` and `validatedActionWithUser` functions
  - Clean up unused imports in auth-actions.ts (legacy types, unused functions)
  - Update any remaining references to old types
  - _Requirements: 4.5_

- [ ] 9.2 Optimize imports and bundle size

  - Consolidate type exports in `lib/validations.ts`
  - Remove duplicate utility functions
  - Optimize import statements across the codebase
  - Verify tree-shaking works correctly
  - _Requirements: 4.5_

- [ ] 9.3 Update documentation and examples

  - Create usage examples for the new generic system
  - Document migration patterns for future actions
  - Update code comments and JSDoc annotations
  - Create developer guide for the new action system
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 10. Final validation and deployment preparation










- [x] 10.1 Run comprehensive test suite






  - Execute all unit, integration, and end-to-end tests
  - Verify no regressions in existing functionality
  - Check TypeScript compilation with strict mode
  - Validate performance benchmarks
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.5_



- [ ] 10.2 Code review and quality assurance


  - Review all migrated code for consistency and best practices
  - Verify error handling follows established patterns
  - Check that all actions use the new generic system
  - Ensure code follows project style guidelines
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.5_