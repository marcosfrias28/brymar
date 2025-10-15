# Database Connection and Repository Setup

This directory contains the database connection setup and repository implementations for the DDD architecture.

## Overview

The database setup follows a simple pattern as outlined in the production-ready spec:

- Simple repository factory functions that return repository instances
- Direct instantiation with the database connection
- No complex dependency injection, just clean factory functions

## Files

### Core Setup

- `drizzle.ts` - Database connection configuration using Vercel Postgres
- `repositories/index.ts` - Repository factory functions
- `test-connection.ts` - Comprehensive test suite for database and repositories

### Repository Implementations

- `DrizzleUserRepository.ts` - User management operations
- `DrizzlePropertyRepository.ts` - Property operations
- `DrizzlePropertyDraftRepository.ts` - Property draft operations
- `DrizzleLandRepository.ts` - Land operations
- `DrizzleLandDraftRepository.ts` - Land draft operations
- `DrizzleBlogRepository.ts` - Blog post operations
- `DrizzlePageSectionRepository.ts` - Page section operations
- `DrizzleSessionRepository.ts` - Session management
- `DrizzleWizardDraftRepository.ts` - Wizard draft operations
- `DrizzleWizardMediaRepository.ts` - Wizard media operations

## Usage

### Creating Repository Instances

```typescript
import {
  createUserRepository,
  createPropertyRepository,
  createPropertyDraftRepository,
  // ... other repositories
} from "@/infrastructure/database/repositories";

// Create repository instances
const userRepo = createUserRepository();
const propertyRepo = createPropertyRepository();
const propertyDraftRepo = createPropertyDraftRepository();
```

### Testing

Run the comprehensive test suite to verify everything is working:

```bash
npx tsx src/infrastructure/database/test-connection.ts
```

This will test:

- Database connection
- Table accessibility
- Basic CRUD operations
- Repository factory functions
- Repository instance creation

## Database Configuration

The database connection uses Vercel Postgres with the following environment variables:

- `POSTGRES_URL` - Main connection string (required)

Make sure your `.env` file contains the proper database connection string.

## Status

✅ **COMPLETED** - Task 1: Fix Database Connection and Repository Setup

- ✅ Vercel Postgres connection working properly
- ✅ Simple repository factory functions created
- ✅ All repository instances can be imported directly
- ✅ Basic CRUD operations tested and working
- ✅ No connection or schema issues found
- ✅ Comprehensive test suite created and passing
- ✅ Domain entity mapping working correctly with legacy database values
- ✅ Repository operations (User, Property, Wizard Draft) all functional
