/**
 * Database module exports
 * Centralized database access for the simplified architecture
 */

// Main database connection
export {
	and,
	closeConnection,
	type Database,
	db,
	eq,
	gt,
	gte,
	ilike,
	inArray,
	isNotNull,
	isNull,
	like,
	lt,
	lte,
	notInArray,
	or,
	testConnection,
	withTransaction,
} from "./connection";

// All schemas
export * from "./schema/index";
