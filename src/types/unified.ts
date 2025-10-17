/**
 * Unified Types System
 * 
 * This file replaces the complex type system with a simplified approach
 * where all types are derived from Drizzle schemas, eliminating duplication
 * between domain models, DTOs, and frontend types.
 */

// Re-export all unified types from the schema system
export type {
    // Database types (single source of truth)
    User,
    Property,
    Land,
    BlogPost,
    Category,
    UserFavorite,
    PageSection,
    ContactInfo,
    WizardDraft,
    WizardMedia,
    PropertyDraft,
    AIGeneration,
    PropertyImage,
    PropertyVideo,
    PropertyCharacteristic,
    PropertyDraftCharacteristic,
    WizardAnalytic,
    LandDraft,
    BlogDraft,

    // Form data types
    PropertyFormData,
    PropertyUpdateFormData,
    LandFormData,
    LandUpdateFormData,
    BlogFormData,
    BlogUpdateFormData,

    // Search types
    PropertySearchParams,
    LandSearchParams,
    BlogSearchParams,

    // Wizard types
    WizardStepData,
    WizardProgress,
} from '../lib/unified-schema';

// Re-export validation schemas
export {
    // Property schemas
    PropertySelectSchema,
    PropertyInsertSchema,
    PropertyFormSchema,
    PropertyUpdateFormSchema,
    PropertySearchSchema,

    // Land schemas
    LandSelectSchema,
    LandInsertSchema,
    LandFormSchema,
    LandUpdateFormSchema,
    LandSearchSchema,

    // Blog schemas
    BlogPostSelectSchema,
    BlogPostInsertSchema,
    BlogFormSchema,
    BlogUpdateFormSchema,
    BlogSearchSchema,

    // Other schemas
    UserSelectSchema,
    UserInsertSchema,
    CategorySelectSchema,
    CategoryInsertSchema,
    WizardDraftSelectSchema,
    WizardDraftInsertSchema,
    WizardMediaSelectSchema,
    WizardMediaInsertSchema,
    UserFavoriteSelectSchema,
    UserFavoriteInsertSchema,
    PageSectionSelectSchema,
    PageSectionInsertSchema,
    ContactInfoSelectSchema,
    ContactInfoInsertSchema,

    // Wizard schemas
    WizardStepDataSchema,
    WizardProgressSchema,

    // Utility functions
    validateData,
    createValidator,
    extractValidationErrors,
    formatValidationError,
} from '../lib/unified-schema';

// Re-export error types and utilities
export type {
    AppError,
} from '../lib/unified-errors';

export {
    // Error classes
    ValidationError,
    BusinessRuleError,
    NotFoundError,
    AuthError,
    AuthorizationError,
    DatabaseError,
    ExternalServiceError,
    RateLimitError,

    // Error factory functions
    createValidationError,
    createBusinessRuleError,
    createNotFoundError,
    createAuthError,
    createAuthorizationError,
    createDatabaseError,

    // Error utilities
    isAppError,
    isValidationError,
    isBusinessRuleError,
    isNotFoundError,
    isAuthError,
    handleError,
    getErrorMessage,
    getErrorCode,
    getErrorStatusCode,
    formatErrorResponse,
    logError,

    // Business rule validators
    validatePropertyBusinessRules,
    validateLandBusinessRules,
    validateBlogBusinessRules,
} from '../lib/unified-errors';

// Re-export action types
export type {
    ActionState,
    ValidatedOptions,
    ActionFunction,
} from '../lib/validations';

export {
    createValidatedAction,
    createSuccessResponse,
    createErrorResponse,
    handleActionError,
    parseFormData,
} from '../lib/validations';

// ============================================================================
// SIMPLIFIED WIZARD TYPES
// ============================================================================

/**
 * Simplified wizard configuration that replaces the complex wizard system
 */
export interface SimpleWizardConfig {
    id: string;
    title: string;
    description: string;
    steps: SimpleWizardStep[];
}

export interface SimpleWizardStep {
    id: string;
    title: string;
    description?: string;
    component: string;
    validation?: any;
    isOptional?: boolean;
}

/**
 * Simplified wizard data that works with any entity type
 */
export interface SimpleWizardData {
    wizardType: 'property' | 'land' | 'blog';
    currentStep: string;
    completedSteps: string[];
    formData: Record<string, any>;
    completionPercentage: number;
    isValid: boolean;
}

// ============================================================================
// COMMON UI TYPES
// ============================================================================

/**
 * Common list view props
 */
export interface ListViewProps<T> {
    items: T[];
    loading?: boolean;
    error?: string;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onView?: (item: T) => void;
}

/**
 * Common form props
 */
export interface FormProps<T> {
    initialData?: Partial<T>;
    onSubmit: (data: T) => Promise<void>;
    onCancel?: () => void;
    loading?: boolean;
    error?: string;
}

/**
 * Common search/filter props
 */
export interface SearchFilterProps {
    onSearch: (query: string) => void;
    onFilter: (filters: Record<string, any>) => void;
    loading?: boolean;
    placeholder?: string;
}

/**
 * Pagination props
 */
export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    loading?: boolean;
}

/**
 * Common card props for displaying items
 */
export interface CardProps<T> {
    item: T;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onView?: (item: T) => void;
    featured?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    code?: string;
    statusCode?: number;
    details?: any;
}

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
    filters?: Record<string, any>;
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
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;

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
    DRAFT: 'draft',
    PUBLISHED: 'published',
    SOLD: 'sold',
    RENTED: 'rented',
    WITHDRAWN: 'withdrawn',
    ARCHIVED: 'archived',
} as const;

export const LandStatus = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    SOLD: 'sold',
    WITHDRAWN: 'withdrawn',
    ARCHIVED: 'archived',
} as const;

export const BlogStatus = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
} as const;

export const WizardType = {
    PROPERTY: 'property',
    LAND: 'land',
    BLOG: 'blog',
} as const;

export type PropertyStatusType = typeof PropertyStatus[keyof typeof PropertyStatus];
export type LandStatusType = typeof LandStatus[keyof typeof LandStatus];
export type BlogStatusType = typeof BlogStatus[keyof typeof BlogStatus];
export type WizardTypeType = typeof WizardType[keyof typeof WizardType];