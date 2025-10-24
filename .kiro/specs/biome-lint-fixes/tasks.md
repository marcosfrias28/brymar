# Implementation Plan

- [x] 1. Setup and Create Type Definitions





  - Install DOMPurify: `npm install dompurify @types/dompurify`
  - Create src/types/validation.ts with ValidationFunction and ValidationResult types
  - Create src/types/session.ts with UserSession type
  - Create src/types/blog.ts with BlogPost and BlogPostStatus types
  - Update src/types/unified.ts - replace all `any` with `unknown` or proper types
  - Update src/types/universal-wizard.ts - replace validation `any` types
  - Update src/types/wizard.ts - add MapInstance and MapMarker types
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_




- [ ] 2. Fix All Component Type Issues and Code Quality

  - Fix src/app/(auth)/verify-email/page.tsx - use UserSession type
  - Fix src/app/(auth)/error.tsx - rename to AuthError
  - Fix src/app/(authenticated)/layout.tsx - remove unused loading variable
  - Fix src/app/(authenticated)/dashboard/blog/page.tsx - use BlogPost type
  - Fix src/app/(authenticated)/dashboard/blog/[id]/page.tsx - use BlogPost type


  - Fix src/app/(authenticated)/dashboard/properties/[id]/edit/page.tsx - fix type assertion and useActionState
  - Fix src/app/(authenticated)/dashboard/properties/[id]/page.tsx - fix parse error at line 527
  - _Requirements: 1.4, 1.5, 1.6, 7.1, 8.1, 9.1_

- [x] 3. Create Utilities and Fix Security Issues





  - Create src/lib/utils/sanitize.ts with DOMPurify integration
  - Update src/app/(authenticated)/dashboard/blog/[id]/page.tsx - sanitize HTML content
  - Update src/app/(authenticated)/dashboard/lands/[id]/page.tsx - sanitize HTML content



  - _Requirements: 3.1, 3.2_

- [ ] 4. Fix All Image Performance Issues

  - Update next.config.js to configure Image domains if needed
  - Replace all `<img>` tags with Next.js `<Image>` in blog/[id]/page.tsx (2 instances)
  - Replace all `<img>` tags with Next.js `<Image>` in properties/[id]/page.tsx (2 instances)
  - Add proper width/height or fill props to all Image components
  - _Requirements: 2.1, 2.2, 2.3_





- [ ] 5. Fix All React Key Props (Batch Update)

  - Fix keys in dashboard/admin/page.tsx




  - Fix keys in dashboard/blog/page.tsx (stats and skeleton)
  - Fix keys in dashboard/database/page.tsx
  - Fix keys in dashboard/error-testing/page.tsx (2 locations)



  - Fix keys in dashboard/help/page.tsx
  - Fix keys in dashboard/lands/[id]/page.tsx (images and features)
  - Fix keys in dashboard/lands/page.tsx
  - Fix keys in dashboard/properties/[id]/page.tsx (2 image maps)




  - Fix keys in dashboard/properties/page.tsx
  - _Requirements: 4.1, 4.2_

- [ ] 6. Fix All Hardcoded IDs with useId() (Batch Update)

  - Fix all 5 input IDs in dashboard/blog/[id]/page.tsx using useId()
  - Fix title input ID in dashboard/properties/[id]/page.tsx using useId()
  - Update all corresponding htmlFor attributes
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7. Fix All Hook Ordering Issues

  - Fix dashboard/lands/[id]/edit/page.tsx - move hooks before early return, fix useActionState types
  - Fix dashboard/lands/[id]/page.tsx - move hooks before early return
  - Fix dashboard/properties/[id]/edit/page.tsx - move hooks before early return, fix useActionState types
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 8. Remove Unused Files

  - Scan for unused files using grep/search
  - Verify files are not imported
  - Remove unused files and document
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 9. Final Validation

  - Run `npx @biomejs/biome check src/` - verify 0 errors
  - Run `npm run build` - verify successful build
  - Quick manual test of blog, properties, and lands pages
  - _Requirements: 11.1, 11.2, 11.3, 11.4_
