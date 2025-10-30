/**
 * Unified Types System
 *
 * This file replaces the complex type system with a simplified approach
 * where all types are derived from Drizzle schemas, eliminating duplication
 * between domain models, DTOs, and frontend types.
 */

// Re-export error types and utilities
export type { AppError } from "../lib/unified-errors";
export {
	AuthError,
	AuthorizationError,
	BusinessRuleError,
	createAuthError,
	createAuthorizationError,
	createBusinessRuleError,
	createDatabaseError,
	createNotFoundError,
	// Error factory functions
	createValidationError,
	DatabaseError,
	ExternalServiceError,
	formatErrorResponse,
	getErrorCode,
	getErrorMessage,
	getErrorStatusCode,
	handleError,
	// Error utilities
	isAppError,
	isAuthError,
	isBusinessRuleError,
	isNotFoundError,
	isValidationError,
	logError,
	NotFoundError,
	RateLimitError,
	// Error classes
	ValidationError,
	validateBlogBusinessRules,
	validateLandBusinessRules,
	// Business rule validators
	validatePropertyBusinessRules,
} from "../lib/unified-errors";
// Re-export all unified types from the schema system
export type {
	BlogCategory,
	BlogFormData,
	BlogPost,
	BlogSearchParams,
	BlogUpdateFormData,
	Land,
	LandFormData,
	LandSearchParams,
	LandUpdateFormData,
	Property,
	// Form data types
	PropertyFormData,
	// Search types
	PropertySearchParams,
	PropertyUpdateFormData,
	// Database types (single source of truth)
	User,
	WizardProgress,
	WizardStepData,
} from "../lib/unified-schema";
// Re-export validation schemas
export {
	BlogCategoryInsertSchema,
	BlogCategorySelectSchema,
	BlogFormSchema,
	BlogPostInsertSchema,
	// Blog schemas
	BlogPostSelectSchema,
	BlogSearchSchema,
	BlogUpdateFormSchema,
	createValidator,
	extractValidationErrors,
	formatValidationError,
	LandFormSchema,
	LandInsertSchema,
	LandSearchSchema,
	// Land schemas
	LandSelectSchema,
	LandUpdateFormSchema,
	PropertyFormSchema,
	PropertyInsertSchema,
	PropertySearchSchema,
	// Property schemas
	PropertySelectSchema,
	PropertyUpdateFormSchema,
	UserInsertSchema,
	// Other schemas
	UserSelectSchema,
	// Utility functions
	validateData,
	WizardProgressSchema,
	// Wizard schemas
	WizardStepDataSchema,
} from "../lib/unified-schema";

// Re-export action types
export type {
	ActionFunction,
	ActionState,
	ValidatedOptions,
} from "../lib/validations";

export {
	createErrorResponse,
	createSuccessResponse,
	createValidatedAction,
	handleActionError,
	parseFormData,
} from "../lib/validations";

// ============================================================================
// SIMPLIFIED WIZARD TYPES
// ============================================================================

/**
 * Simplified wizard configuration that replaces the complex wizard system
 */
export type SimpleWizardConfig = {
	id: string;
	title: string;
	description: string;
	steps: SimpleWizardStep[];
};

export type SimpleWizardStep = {
	id: string;
	title: string;
	description?: string;
	component: string;
	validation?: (data: unknown) => {
		success: boolean;
		errors?: Record<string, string[]>;
	};
	isOptional?: boolean;
};

/**
 * Simplified wizard data that works with any entity type
 */
export type SimpleWizardData = {
	wizardType: "property" | "land" | "blog";
	currentStep: string;
	completedSteps: string[];
	formData: Record<string, unknown>;
	completionPercentage: number;
	isValid: boolean;
};

// ============================================================================
// COMMON UI TYPES
// ============================================================================

/**
 * Common list view props
 */
export type ListViewProps<T> = {
	items: T[];
	loading?: boolean;
	error?: string;
	onEdit?: (item: T) => void;
	onDelete?: (item: T) => void;
	onView?: (item: T) => void;
};

/**
 * Common form props
 */
export type FormProps<T> = {
	initialData?: Partial<T>;
	onSubmit: (data: T) => Promise<void>;
	onCancel?: () => void;
	loading?: boolean;
	error?: string;
};

/**
 * Common search/filter props
 */
export type SearchFilterProps = {
	onSearch: (query: string) => void;
	onFilter: (filters: Record<string, string | number | boolean>) => void;
	loading?: boolean;
	placeholder?: string;
};

/**
 * Pagination props
 */
export type PaginationProps = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	loading?: boolean;
};

/**
 * Common card props for displaying items
 */
export type CardProps<T> = {
	item: T;
	onEdit?: (item: T) => void;
	onDelete?: (item: T) => void;
	onView?: (item: T) => void;
	featured?: boolean;
};

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response format
 */
export type ApiResponse<T = unknown> = {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	code?: string;
	statusCode?: number;
	details?: Record<string, unknown>;
};

/**
 * Paginated response format
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

/**
 * Search response format
 */
export interface SearchResponse<T> extends PaginatedResponse<T> {
	query: string;
	filters?: Record<string, string | number | boolean>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make all properties optional except specified ones
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Make all properties required except specified ones
 */
export type RequiredExcept<T, K extends keyof T> = Required<T> &
	Partial<Pick<T, K>>;

/**
 * Extract keys of a type that are of a specific type
 */
export type KeysOfType<T, U> = {
	[K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Create a type with only the specified keys
 */
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;

/**
 * Create a type without the specified keys
 */
export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>;

// ============================================================================
// STATUS ENUMS
// ============================================================================

export const PropertyStatus = {
	DRAFT: "draft",
	PUBLISHED: "published",
	SOLD: "sold",
	RENTED: "rented",
	WITHDRAWN: "withdrawn",
	ARCHIVED: "archived",
} as const;

export const LandStatus = {
	DRAFT: "draft",
	PUBLISHED: "published",
	SOLD: "sold",
	WITHDRAWN: "withdrawn",
	ARCHIVED: "archived",
} as const;

export const BlogStatus = {
	DRAFT: "draft",
	PUBLISHED: "published",
	ARCHIVED: "archived",
} as const;

export const WizardType = {
	PROPERTY: "property",
	LAND: "land",
	BLOG: "blog",
} as const;

export type PropertyStatusType =
	(typeof PropertyStatus)[keyof typeof PropertyStatus];
export type LandStatusType = (typeof LandStatus)[keyof typeof LandStatus];
export type BlogStatusType = (typeof BlogStatus)[keyof typeof BlogStatus];
export type WizardTypeType = (typeof WizardType)[keyof typeof WizardType];
