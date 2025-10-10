/**
 * Wizard Schemas - Centralized Schema Exports
 * 
 * This file provides a single entry point for all wizard-related Zod schemas,
 * ensuring consistent validation across the application and proper
 * separation of concerns between different wizard types.
 */

// Property Wizard Schemas
export {
    PropertyGeneralSchema,
    PropertyLocationSchema,
    PropertyMediaSchema,
    PropertyCompleteSchema,
} from "./property-wizard-schemas";

// Land Wizard Schemas
export {
    LandStep1Schema,
    LandStep2Schema,
    LandStep3Schema,
    LandStep4Schema,
    LandFormDataSchema,
    LandDraftSchema,
} from "./land-wizard-schemas";

// Blog Wizard Schemas
export {
    BlogContentStepSchema,
    BlogMediaStepSchema,
    BlogSEOStepSchema,
    BlogWizardSchema,
    blogWizardStepSchemas,
} from "./blog-wizard-schemas";

// Core Wizard Schemas
export {
    CoordinatesSchema,
    AddressSchema,
    ImageMetadataSchema,
    VideoMetadataSchema,
    WizardStateSchema,
} from "./wizard-schemas";

// Re-export commonly used schema utilities
export type { z } from "zod";