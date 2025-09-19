# Project Structure

## Root Directory Organization

### Core Application
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable React components
- `lib/` - Utility functions, database, and business logic
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions
- `utils/` - Additional utilities and stores

### Configuration & Build
- `next.config.ts` - Next.js configuration
- `drizzle.config.ts` - Database configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts
- `middleware.ts` - Next.js middleware for auth/routing

## App Directory Structure (`app/`)

### Route Groups
- `(auth)/` - Authentication pages (sign-in, sign-up, etc.)
- `(dashboard)/` - Protected dashboard pages
- `api/` - API routes
- `properties/` - Property listing pages
- `search/` - Search functionality

### Core Pages
- `layout.tsx` - Root layout with providers
- `page.tsx` - Homepage
- `globals.css` - Global styles
- `loading.tsx` - Loading UI
- `error.tsx` - Error boundaries
- `not-found.tsx` - 404 page

## Components Directory (`components/`)

### Feature-Based Organization
- `auth/` - Authentication components
- `blog/` - Blog-related components
- `dashboard/` - Dashboard-specific components
- `lands/` - Land management components
- `properties/` - Property components
- `profile/` - User profile components
- `sections/` - Homepage sections
- `shared/` - Shared/common components
- `ui/` - Base UI components (Shadcn/ui)

### Navigation Components
- `navbar/` - Navigation components
- `*-sidebar.tsx` - Various sidebar implementations
- `nav-*.tsx` - Navigation utilities

## Library Directory (`lib/`)

### Core Modules
- `actions/` - Server actions
- `auth/` - Authentication logic and permissions
- `db/` - Database schema and utilities
- `routes/` - Route definitions
- `schemas/` - Zod validation schemas
- `email-templates/` - Email templates

### Utilities
- `utils.ts` - Common utility functions (cn helper)
- `validations.ts` - Form validations
- `email.ts` - Email functionality
- `logger.ts` - Logging utilities

## Hooks Directory (`hooks/`)

### Custom Hooks Pattern
- `use-*.ts` - Feature-specific hooks
- Examples: `use-properties.ts`, `use-blog.ts`, `use-permissions.ts`

## File Naming Conventions

### Components
- **PascalCase** for component files: `PropertyCard.tsx`
- **kebab-case** for multi-word components: `property-card.tsx`
- **Descriptive names**: `search-filters.tsx`, `blog-form.tsx`

### Hooks
- **use-** prefix: `use-properties.ts`
- **kebab-case**: `use-mobile.tsx`

### Actions & Utilities
- **kebab-case**: `auth-actions.ts`
- **Descriptive names**: `email-templates/`

## Import Path Conventions

### Absolute Imports
- Use `@/` prefix for all internal imports
- Examples: `@/components/ui/button`, `@/lib/utils`

### Import Organization
1. External libraries
2. Internal components/utilities
3. Types and interfaces
4. Relative imports (if any)

## Architecture Patterns

### Feature-First Organization
- Components grouped by feature/domain
- Shared components in dedicated directories
- Clear separation of concerns

### Server/Client Separation
- Server actions in `lib/actions/`
- Client components clearly marked
- Middleware for route protection

### Type Safety
- Centralized type definitions in `types/`
- Zod schemas for validation
- TypeScript strict mode enabled

## Special Directories

### Static Assets
- `public/` - Static files and images
- Organized by feature: `villa/`, `residencial/`

### Documentation
- `docs/` - Project documentation
- `secciones/` - HTML sections (legacy/reference)

### Development
- `.kiro/` - Kiro IDE configuration
- `.vscode/` - VS Code settings
- `node_modules/` - Dependencies