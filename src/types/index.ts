/**
 * Wizard Framework Types - Centralized Type Exports
 * 
 * This file provides a single entry point for all wizard-related types,
 * ensuring consistent type usage across the application and proper
 * separation of concerns.
 */

// Core Wizard Framework Types
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

// Property Wizard Types
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

// Land Wizard Types
export type {
    LandWizardData,
    LandCharacteristic,
} from "./land-wizard";

export { defaultLandWizardData } from "./land-wizard";

// Blog Wizard Types
export type {
    BlogWizardData,
    BlogImageMetadata,
    BlogVideoMetadata,
} from "./blog-wizard";

export { categoryLabels, defaultBlogWizardData } from "./blog-wizard";

// Re-export commonly used enums and constants
export { PropertyType } from "./property-wizard";