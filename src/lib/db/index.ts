/**
 * Database module exports
 * Centralized database access for the simplified architecture
 */

// Main database connection
export {
    db,
    type Database,
    testConnection,
    closeConnection,
    withTransaction,
    eq, and, or, like, ilike, gte, lte, gt, lt, isNull, isNotNull, inArray, notInArray
} from './connection';

// All schemas
export * from './schema/index';

