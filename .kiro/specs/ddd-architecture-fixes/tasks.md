# Implementation Plan

- [x] 1. Create shared domain schemas foundation

  - Create the shared schemas directory structure in domain layer
  - Implement text validation schemas (ShortTextSchema, LongTextSchema, OptionalShortTextSchema)
  - Implement price validation schemas (SimplePriceSchema)
  - Create proper barrel exports for all schemas
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement property-specific shared schemas

  - Create PropertyTypeSchema for property type validation
  - Create PropertyStatusSchema for status validation
  - Create PropertyFeaturesSchema for features validation
  - Add property-related validation schemas
  - _Requirements: 1.1, 1.2, 4.2_

- [x] 3. Implement user-specific shared schemas

  - Create UserRoleSchema for role validation
  - Create UserPreferencesSchema for preferences validation
  - Create OptionalPhoneSchema for phone number validation
  - Add user-related validation schemas
  - _Requirements: 1.1, 1.2, 4.2_

- [x] 4. Implement search and utility shared schemas

  - Create SearchQuerySchema for search validation
  - Create PaginationSchema for pagination validation
  - Create SortSchema for sorting validation
  - Create LocationSearchSchema for location-based searches
  - Create utility schemas (BooleanFlagSchema, ImageInputSchema, OptionalTagsSchema, IdSchema, OptionalYearSchema)
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 5. Update application DTOs to use shared schemas

  - Update CreatePropertyInput to use shared schemas
  - Update CreateLandInput to use shared schemas
  - Update SearchPropertiesInput to use shared schemas
  - Update UpdatePropertyInput to use shared schemas
  - Update CreateUserInput to use shared schemas
  - Fix all import statements in DTO files
  - _Requirements: 1.1, 4.2, 5.3_

- [x] 6. Implement missing auth server actions

  - Create forgotPassword server action with proper validation
  - Create resetPassword server action with proper validation
  - Create sendVerificationOTP server action with proper validation
  - Create verifyOTP server action with proper validation
  - Create updateUserAction server action with proper validation
  - Add proper exports to auth-actions file
  - _Requirements: 2.1, 2.2, 4.3_

- [x] 7. Implement missing property server actions

  - Create getPropertyById server action with proper validation
  - Create searchPropertiesAction server action with proper validation
  - Create addProperty server action with proper validation
  - Add proper exports to property-actions files
  - Ensure proper integration with use cases
  - _Requirements: 2.1, 2.2, 4.3_

- [x] 8. Implement missing profile server actions

  - Create removeFavoriteAction server action with proper validation
  - Create markNotificationAsReadAction server action with proper validation
  - Create markAllNotificationsAsReadAction server action with proper validation
  - Add proper exports to profile-actions file
  - _Requirements: 2.1, 2.2, 4.3_

- [x] 9. Implement missing property hooks

  - Create useProperty hook with proper data fetching
  - Implement proper error handling and loading states
  - Add proper TypeScript types and interfaces
  - Add proper exports to use-properties file
  - _Requirements: 3.1, 3.2, 4.3_

- [x] 10. Fix remaining import and export issues

  - Review all import statements across the application
  - Fix any remaining missing exports
  - Ensure proper barrel exports in index files
  - Resolve any circular dependency issues
  - _Requirements: 2.1, 2.2, 5.3_

- [x] 11. Validate DDD architecture compliance

  - Ensure domain layer contains only business logic
  - Verify application layer properly coordinates use cases
  - Confirm infrastructure layer implements interfaces correctly
  - Validate presentation layer only handles UI concerns
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 12. Run comprehensive build and lint validation
  - Execute npm run build to ensure successful compilation
  - Execute npm run lint to verify code quality
  - Fix any remaining TypeScript errors
  - Address any critical lint warnings
  - Verify all imports resolve correctly
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
