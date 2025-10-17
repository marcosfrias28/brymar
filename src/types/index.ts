/**
 * Unified Types - Single Source of Truth
 * 
 * This file provides a single entry point for all types in the application,
 * using the unified schema system where Drizzle schemas are the source of truth.
 * 
 * This replaces the complex DDD type system with a simplified approach.
 */

// Export all unified types and utilities
export * from './unified';

// Legacy wizard types for backward compatibility (will be gradually removed)
export type {
    WizardData,
    WizardStep,
    WizardConfig,
    WizardStepProps,
    WizardProps,
    UseWizardOptions,
    UseWizardReturn,
    WizardError,
    ErrorRecoveryStrategy,
    ValidationResult,
    WizardNavigationProps,
    WizardProgressProps,
    WizardStepRendererProps,
} from "./wizard-core";

// Legacy property wizard types (will be gradually removed)
export type {
    PropertyWizardData,
    Coordinates,
    Address,
    PropertyCharacteristic,
    ImageMetadata,
    VideoMetadata,
    PropertyBasicInfo,
    AIService,
    SignedUrlResponse,
    UploadResult,
    ImageUploadService,
    MapService,
    UploadError,
} from "./property-wizard";

export { AIServiceError } from "./property-wizard";

// Legacy land wizard types (will be gradually removed)
export type {
    LandWizardData,
    LandCharacteristic,
} from "./land-wizard";

export { defaultLandWizardData } from "./land-wizard";

// Legacy blog wizard types (will be gradually removed)
export type {
    BlogWizardData,
    BlogImageMetadata,
    BlogVideoMetadata,
} from "./blog-wizard";

export { categoryLabels, defaultBlogWizardData } from "./blog-wizard";

// Legacy enums (will be gradually removed)
export { PropertyType } from "./property-wizard";