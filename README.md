# Brymar Inmobiliaria

A modern real estate platform built with Next.js 15, featuring a simplified architecture for optimal performance and maintainability.

## 🏗️ Architecture Overview

This project has been architected using a **simplified, feature-centric approach** that prioritizes maintainability and developer experience over complex abstractions.

### Core Principles

- **KISS (Keep It Simple, Stupid)**: Prioritizing simplicity over unnecessary complexity
- **Feature-Centric Organization**: Code organized by business functionality, not technical layers
- **Direct Data Flow**: Minimal abstractions between UI and database
- **Type Safety**: Centralized TypeScript types for consistency
- **Server Actions**: Direct server-side operations replacing complex use case patterns

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (authenticated)/   # Protected pages
│   └── api/               # API routes
├── components/             # React components (organized by feature)
│   ├── ui/                # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── properties/        # Property-related components
│   ├── lands/             # Land-related components
│   ├── blog/              # Blog components
│   ├── wizard/            # Wizard components
│   └── shared/            # Cross-feature components
├── lib/
│   ├── actions/           # Server actions (replaces use cases + DTOs)
│   ├── types/             # Centralized TypeScript types
│   ├── db/                # Database configuration and schemas
│   ├── auth/              # Authentication configuration
│   └── utils/             # Utility functions
├── hooks/                 # Custom React hooks
└── types/                 # Additional type definitions
```

## 🚀 Key Features

### Real Estate Management

- **Property Listings**: Create, update, and manage property listings
- **Land Management**: Handle land sales and development opportunities
- **Advanced Search**: Filter properties by location, price, type, and features
- **Image Management**: Upload and manage property images
- **Publishing Workflow**: Draft and publish listings

### Content Management

- **Blog System**: Create and manage real estate blog content
- **SEO Optimization**: Built-in SEO features for better search visibility
- **Category Management**: Organize content by categories and tags

### Wizard System

- **Step-by-Step Creation**: Guided property, land, and blog creation
- **Draft Management**: Save and resume work in progress
- **AI Content Generation**: Generate titles, descriptions, and tags
- **Publishing Integration**: Seamlessly publish from drafts

### Authentication & Authorization

- **User Management**: Registration, login, and profile management
- **Role-Based Access**: Admin, agent, and user roles
- **Password Reset**: Secure password recovery workflow
- **Email Verification**: Account verification system

## 🛠️ Technology Stack

### Frontend

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern UI component library
- **React Hook Form**: Form management
- **TanStack Query**: Server state management

### Backend

- **Server Actions**: Next.js server-side operations
- **Better Auth**: Authentication system
- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Primary database

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **Playwright**: End-to-end testing
- **TypeScript**: Static type checking

## 📦 Installation

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd brymar-inmobiliaria
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/brymar"
   BETTER_AUTH_SECRET="your-secret-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Database setup**

   ```bash
   # Verify configuration
   npm run db:check

   # Apply schema
   npm run db:push

   # Load initial data (optional)
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

## 🔄 Database Reset (When Needed)

If you encounter schema conflicts or need a fresh database:

### Quick Reset (Recommended)

```bash
# Complete reset: clean + schema + seed
npm run db:setup
```

### Manual Reset

```bash
# Step 1: Clean database
npm run db:reset --force

# Step 2: Apply schema
npm run db:push

# Step 3: Load initial data
npm run db:seed
```

### When to Reset

- ✅ Schema conflicts (like the enumValues error)
- ✅ Major database structure changes
- ✅ Starting fresh in development
- ❌ **Never in production with important data**

📚 **Full guide**: [docs/DATABASE_RESET_GUIDE.md](docs/DATABASE_RESET_GUIDE.md)

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### End-to-End Tests

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui
```

### Architecture Validation

```bash
# Run architecture validation tests
pnpm test -- architecture-validation.test.ts
```

## 🏗️ Architecture Details

### Server Actions Pattern

Instead of complex DDD layers, we use Next.js server actions for direct server-side operations:

```typescript
// src/lib/actions/properties.ts
export async function createProperty(input: CreatePropertyInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const property = await db
    .insert(properties)
    .values({
      ...input,
      userId: session.user.id,
    })
    .returning();

  revalidatePath("/properties");
  return { success: true, data: property };
}
```

### Centralized Types

All TypeScript types are centralized for consistency:

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
  // ...
}
```

### Feature-Specific Hooks

Custom hooks manage state and server interactions:

```typescript
// src/hooks/use-properties.ts
export function useProperties(filters?: PropertySearchFilters) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => searchProperties(filters || {}),
  });
}
```

## 📚 API Documentation

### Server Actions

#### Authentication

- `signIn(credentials)` - User authentication
- `signUp(userData)` - User registration
- `forgotPassword(email)` - Password reset request
- `resetPassword(token, password)` - Password reset
- `updateUserProfile(data)` - Profile updates

#### Properties

- `createProperty(data)` - Create new property
- `updateProperty(id, data)` - Update property
- `getPropertyById(id)` - Get single property
- `searchProperties(filters)` - Search properties
- `publishProperty(id)` - Publish property
- `deleteProperty(id)` - Delete property

#### Lands

- `createLand(data)` - Create land listing
- `updateLand(id, data)` - Update land
- `getLandById(id)` - Get single land
- `searchLands(filters)` - Search lands
- `deleteLand(id)` - Delete land

#### Blog

- `createBlogPost(data)` - Create blog post
- `updateBlogPost(id, data)` - Update blog post
- `getBlogPostById(id)` - Get single post
- `searchBlogPosts(filters)` - Search posts
- `publishBlogPost(id)` - Publish post
- `deleteBlogPost(id)` - Delete post

#### Wizard

- `createWizardDraft(data)` - Create draft
- `saveWizardDraft(id, data)` - Save draft
- `loadWizardDraft(id)` - Load draft
- `publishWizard(id, data)` - Publish from draft
- `generateAIContent(params)` - Generate AI content

## 🔧 Development Guide

### Adding New Features

1. **Create Server Actions**

   ```typescript
   // src/lib/actions/feature.ts
   export async function createFeature(input: CreateFeatureInput) {
     // Implementation
   }
   ```

2. **Define Types**

   ```typescript
   // src/lib/types/feature.ts
   export interface Feature {
     // Type definition
   }
   ```

3. **Create Hooks**

   ```typescript
   // src/hooks/use-feature.ts
   export function useFeature() {
     // Hook implementation
   }
   ```

4. **Build Components**
   ```typescript
   // src/components/feature/feature-component.tsx
   export function FeatureComponent() {
     // Component implementation
   }
   ```

### Database Schema Changes

1. **Update Schema**

   ```typescript
   // src/lib/db/schema/feature.ts
   export const features = pgTable("features", {
     // Schema definition
   });
   ```

2. **Generate Migration**

   ```bash
   pnpm db:generate
   ```

3. **Apply Migration**
   ```bash
   pnpm db:migrate
   ```

### Testing Guidelines

- **Unit Tests**: Test server actions and utility functions
- **Component Tests**: Test React components with React Testing Library
- **Integration Tests**: Test complete workflows
- **E2E Tests**: Test critical user journeys

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

### Environment Variables

Ensure all production environment variables are configured:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`

### Performance Monitoring

The application includes performance monitoring for:

- Bundle size tracking
- Core Web Vitals
- Database query performance
- Memory usage

## 📈 Performance

### Architecture Benefits

- **80% reduction** in file count compared to DDD architecture
- **Faster build times** due to simplified dependency graph
- **Improved developer experience** with direct code paths
- **Better maintainability** through centralized types and actions

### Optimization Features

- **Server-side rendering** with Next.js App Router
- **Optimized images** with Next.js Image component
- **Code splitting** for optimal bundle sizes
- **Caching strategies** for server actions and database queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation in `/docs`
- Review the test files for usage examples

---

**Built with ❤️ using modern web technologies and simplified architecture principles.**
