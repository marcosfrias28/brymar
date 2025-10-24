/**
 * Unified Types - Single Source of Truth
 *
 * This file provides a single entry point for all types in the application,
 * using the unified schema system where Drizzle schemas are the source of truth.
 *
 * This replaces the complex DDD type system with a simplified approach.
 */

// Legacy blog wizard types (will be gradually removed)
export type {
	BlogImageMetadata,
	BlogVideoMetadata,
	BlogWizardData,
} from "./blog-wizard";
export { categoryLabels, defaultBlogWizardData } from "./blog-wizard";
// Legacy land wizard types (will be gradually removed)
export type {
	LandCharacteristic,
	LandWizardData,
} from "./land-wizard";
export { defaultLandWizardData } from "./land-wizard";
// Legacy property wizard types (will be gradually removed)
export type {
	Address,
	AIService,
	Coordinates,
	ImageMetadata,
	ImageUploadService,
	MapService,
	PropertyBasicInfo,
	PropertyCharacteristic,
	PropertyWizardData,
	SignedUrlResponse,
	UploadError,
	UploadResult,
	VideoMetadata,
} from "./property-wizard";
// Legacy enums (will be gradually removed)
export { AIServiceError, PropertyType } from "./property-wizard";
// Export all unified types and utilities
export * from "./unified";
// Legacy wizard types for backward compatibility (will be gradually removed)
export type {
	ErrorRecoveryStrategy,
	UseWizardOptions,
	UseWizardReturn,
	ValidationResult,
	WizardConfig,
	WizardData,
	WizardError,
	WizardNavigationProps,
	WizardProgressProps,
	WizardProps,
	WizardStep,
	WizardStepProps,
	WizardStepRendererProps,
} from "./wizard-core";
