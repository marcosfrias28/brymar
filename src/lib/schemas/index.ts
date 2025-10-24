/**
 * Wizard Schemas - Centralized Schema Exports
 *
 * This file provides a single entry point for all wizard-related Zod schemas,
 * ensuring consistent validation across the application and proper
 * separation of concerns between different wizard types.
 */

// Re-export commonly used schema utilities
export type { z } from "zod";
// Blog Wizard Schemas
export {
	BlogContentStepSchema,
	BlogMediaStepSchema,
	BlogSEOStepSchema,
	BlogWizardSchema,
	blogWizardStepSchemas,
} from "./blog-wizard-schemas";
// Land Wizard Schemas
export {
	LandDraftSchema,
	LandFormDataSchema,
	LandStep1Schema,
	LandStep2Schema,
	LandStep3Schema,
	LandStep4Schema,
} from "./land-wizard-schemas";
// Property Wizard Schemas
export {
	PropertyCompleteSchema,
	PropertyGeneralSchema,
	PropertyLocationSchema,
	PropertyMediaSchema,
} from "./property-wizard-schemas";
// Core Wizard Schemas
export {
	AddressSchema,
	CoordinatesSchema,
	ImageMetadataSchema,
	VideoMetadataSchema,
	WizardStateSchema,
} from "./wizard-schemas";
