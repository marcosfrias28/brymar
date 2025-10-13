# Brymar Real Estate Platform

A modern real estate platform built with Next.js 15, TypeScript, PostgreSQL, and Domain-Driven Design (DDD) architecture.

## Features

- **Property Management**: Create, edit, and manage property listings with advanced search and filtering
- **Land Management**: Specialized tools for land listings with area calculations and zoning information
- **User Authentication**: Secure authentication with role-based access control and user profiles
- **Wizard System**: Guided property and land creation process with auto-save functionality
- **Blog System**: Content management for real estate articles with SEO optimization
- **Admin Dashboard**: Comprehensive admin tools for platform management and analytics
- **Responsive Design**: Mobile-first design that works seamlessly on all devices
- **Clean Architecture**: Domain-Driven Design with clear separation of concerns

## Architecture

This platform follows **Domain-Driven Design (DDD)** principles with **Clean Architecture**:

```
src/
├── domain/                 # Domain Layer (Business Logic)
│   ├── shared/            # Shared domain concepts
│   ├── user/              # User Management bounded context
│   ├── property/          # Property Management bounded context
│   ├── land/              # Land Management bounded context
│   ├── content/           # Content Management bounded context
│   └── wizard/            # Wizard System bounded context
├── application/           # Application Layer (Use Cases)
│   ├── dto/               # Data Transfer Objects
│   ├── use-cases/         # Application Use Cases
│   └── services/          # Application Services
├── infrastructure/        # Infrastructure Layer (External Concerns)
│   ├── database/          # Database implementations
│   ├── repositories/      # Repository implementations
│   └── container/         # Dependency Injection
└── presentation/          # Presentation Layer (UI Adapters)
    ├── server-actions/    # Next.js Server Actions
    ├── hooks/             # React Hooks
    └── components/        # UI Components
```

### Bounded Contexts

- **User Management**: Authentication, profiles, roles, permissions
- **Property Management**: Property listings, media, features, search
- **Land Management**: Land listings, area calculations, zoning
- **Content Management**: Blog posts, pages, SEO optimization
- **Wizard System**: Multi-step forms, draft persistence, progress tracking
- **Analytics & Reporting**: Metrics, analytics, business intelligence

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Architecture**: Domain-Driven Design (DDD), Clean Architecture
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom authentication with JWT
- **File Storage**: Vercel Blob for image storage
- **Dependency Injection**: Custom IoC container
- **Validation**: Zod schemas with domain validation
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/brymar-real-estate.git
cd brymar-real-estate
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Fill in your database connection string and other required environment variables.

4. Set up the database:

```bash
npm run db:push
```

5. Seed the database (optional):

```bash
npm run db:seed
```

6. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure (Legacy Compatibility)

The project maintains backward compatibility while using the new DDD structure:

```
├── src/                   # Main source directory (DDD Architecture)
│   ├── domain/           # Domain Layer
│   ├── application/      # Application Layer
│   ├── infrastructure/   # Infrastructure Layer
│   └── presentation/     # Presentation Layer
├── app/                  # Next.js app directory (moved to src/app)
├── components/           # UI components (moved to src/components)
├── lib/                  # Utilities (moved to src/lib)
├── hooks/                # React hooks (compatibility layer)
├── types/                # TypeScript types (moved to src/types)
└── public/               # Static assets
```

## Domain Model

### Core Entities

- **User**: User accounts, profiles, authentication, and authorization
- **Property**: Real estate properties with features, images, and pricing
- **Land**: Land listings with area, zoning, and utility information
- **BlogPost**: Content articles with SEO optimization and categorization
- **WizardDraft**: Multi-step form drafts with progress tracking

### Value Objects

- **Email**: Email validation and domain extraction
- **Price**: Currency formatting and range validation
- **Address**: Geographic information and coordinate handling
- **UserRole**: Role-based permissions and hierarchy
- **PropertyFeatures**: Property amenities and characteristics

### Domain Services

- **PropertyDomainService**: Property valuation and publication validation
- **UserDomainService**: User access control and trust scoring
- **WizardDomainService**: Step validation and progress calculation

## API Documentation

The platform provides server actions that act as thin adapters to the application layer:

### Property Management

- `createProperty(formData)` - Create new property listing
- `updateProperty(formData)` - Update existing property
- `searchProperties(criteria)` - Search properties with filters
- `publishProperty(propertyId)` - Publish property listing

### User Management

- `registerUser(formData)` - Register new user account
- `authenticateUser(credentials)` - Authenticate user login
- `updateUserProfile(formData)` - Update user profile information

### Content Management

- `createBlogPost(formData)` - Create new blog post
- `publishBlogPost(postId)` - Publish blog post
- `updatePageSection(formData)` - Update dynamic page content

For detailed API documentation, see [API Documentation](./docs/api-documentation.md).

## Development Guide

### Working with DDD Architecture

1. **Domain Layer**: Contains business logic, entities, and value objects

   - No external dependencies
   - Pure business rules and validation
   - Domain events for cross-context communication

2. **Application Layer**: Orchestrates domain objects and coordinates use cases

   - Input/output DTOs for data transfer
   - Use cases for business operations
   - Application services for coordination

3. **Infrastructure Layer**: Implements external concerns

   - Repository implementations with Drizzle ORM
   - External service integrations
   - Database schema mapping

4. **Presentation Layer**: Handles user interface concerns
   - Server actions as thin adapters
   - React hooks for state management
   - UI components for user interaction

### Adding New Features

1. **Define Domain Entities** in `src/domain/[context]/entities/`
2. **Create Value Objects** in `src/domain/[context]/value-objects/`
3. **Implement Use Cases** in `src/application/use-cases/[context]/`
4. **Create Repository Interface** in `src/domain/[context]/repositories/`
5. **Implement Repository** in `src/infrastructure/repositories/`
6. **Add Server Actions** in `src/presentation/server-actions/`
7. **Create React Hooks** in `src/presentation/hooks/`

For detailed development guidelines, see [Developer Migration Guide](./docs/developer-migration-guide.md).

## Testing

The project uses a comprehensive testing strategy:

- **Domain Layer**: Unit tests for entities and value objects
- **Application Layer**: Integration tests for use cases
- **Infrastructure Layer**: Repository tests with test containers
- **Presentation Layer**: Component and hook tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/brymar_db

# Authentication
NEXTAUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret

# File Storage
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# External Services
HUGGINGFACE_API_KEY=your-huggingface-key
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run test suite
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:seed` - Seed database with sample data

## Documentation

- [DDD Architecture Guide](./docs/ddd-architecture-guide.md) - Comprehensive architecture documentation
- [Developer Migration Guide](./docs/developer-migration-guide.md) - Guide for working with the new architecture
- [API Documentation](./docs/api-documentation.md) - Complete API reference
- [Domain Model Documentation](./docs/domain-model-documentation.md) - Domain entities and business rules

## Performance

The platform is optimized for performance with:

- **Repository Pattern**: Efficient database queries with Drizzle ORM
- **Caching Strategy**: Multi-level caching for frequently accessed data
- **Image Optimization**: Automatic image processing and CDN delivery
- **Code Splitting**: Lazy loading of components and routes
- **Database Indexing**: Optimized indexes for search and filtering

## Security

Security features include:

- **Authentication**: JWT-based authentication with secure session management
- **Authorization**: Role-based access control with fine-grained permissions
- **Input Validation**: Domain-level validation with Zod schemas
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM
- **XSS Protection**: Content sanitization and CSP headers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the DDD architecture patterns
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please read our [Developer Migration Guide](./docs/developer-migration-guide.md) for detailed contribution guidelines.

## Migration Status

✅ **Completed**: Full migration to DDD architecture with clean separation of concerns
✅ **Backward Compatibility**: All existing functionality preserved
✅ **Performance**: Optimized queries and caching implemented
✅ **Testing**: Comprehensive test suite for all layers
✅ **Documentation**: Complete documentation for new architecture

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions and support:

- 📖 [Documentation](./docs/)
- 🐛 [Issues](https://github.com/your-username/brymar-real-estate/issues)
- 💬 [Discussions](https://github.com/your-username/brymar-real-estate/discussions)

---

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/marcosfrias28/brymar)
