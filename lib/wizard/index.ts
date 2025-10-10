/**
 * Wizard Library Module
 * 
 * This module contains the core business logic and utilities for the
 * wizard framework. It provides validation, persistence, and configuration
 * management that is used by wizard components and hooks.
 * 
 * Classes:
 * - WizardValidator: Centralized validation logic using Zod schemas
 * - WizardPersistence: Draft management and auto-save functionality
 * 
 * Configurations:
 * - Property Wizard Config: Configuration for property creation wizards
 * - Land Wizard Config: Configuration for land listing wizards
 * - Blog Wizard Config: Configuration for blog post wizards
 * 
 * Architecture:
 * - Domain-driven design
 * - Separation of concerns
 * - Type-safe with comprehensive interfaces
 * - Error handling with recovery strategies
 */

// Core Utilities
export { WizardValidator } from "./wizard-validator";
export { WizardPersistence } from "./wizard-persistence";

// Wizard Configurations
export { propertyWizardConfig } from "./property-wizard-config";
export { landWizardConfig } from "./land-wizard-config";
export { blogWizardConfig } from "./blog-wizard-config";

// Types (Re-exported for convenience)
export type { WizardDraft } from "@/lib/db/schema";
export type {
    WizardConfig,
    WizardData,
    ValidationResult,
} from "@/types/wizard-core";