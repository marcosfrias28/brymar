# Technology Stack

## Framework & Runtime
- **Next.js 15.1.4**: React framework with App Router
- **React 19.0.0**: UI library with latest features
- **TypeScript 5.7.3**: Type-safe JavaScript
- **Node.js**: Server runtime

## Database & ORM
- **PostgreSQL**: Primary database (Neon/Vercel Postgres)
- **Drizzle ORM**: Type-safe database toolkit
- **Drizzle Kit**: Database migrations and schema management

## Authentication & Authorization
- **Better Auth**: Modern authentication solution
- **bcryptjs**: Password hashing
- **jose**: JWT handling
- **Role-based permissions**: Admin, Agent, User roles with granular permissions

## UI & Styling
- **Tailwind CSS 4.1.13**: Utility-first CSS framework
- **Radix UI**: Headless component primitives
- **Shadcn/ui**: Pre-built component library
- **Framer Motion**: Animation library
- **GSAP**: Advanced animations
- **Lucide React**: Icon library

## Forms & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Form validation integration

## State Management
- **Zustand**: Lightweight state management
- **React Context**: Built-in state sharing

## Development Tools
- **ESLint**: Code linting (Next.js config)
- **Prettier**: Code formatting (implied)
- **TypeScript**: Static type checking

## Package Manager
- **pnpm 10.16.1**: Fast, disk space efficient package manager

## Common Commands

### Development
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Database Operations
```bash
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Run database migrations
pnpm db:push      # Push schema changes to database
pnpm db:studio    # Open Drizzle Studio (database GUI)
```

### Testing
```bash
# Playwright tests available (configured but not in scripts)
```

## Configuration Files
- `next.config.ts`: Next.js configuration
- `drizzle.config.ts`: Database configuration
- `tsconfig.json`: TypeScript configuration
- `.eslintrc.json`: ESLint rules
- `tailwind.config.js`: Tailwind CSS configuration
- `components.json`: Shadcn/ui configuration