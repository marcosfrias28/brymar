/**
 * Wizard Framework - Clean Architecture
 * 
 * This is the main entry point for the unified wizard framework.
 * All wizard components follow clean architecture principles with
 * proper separation of concerns and type safety.
 */

// Core Framework Components
export * from "./core";

// Wizard Type Implementations
export { PropertyWizard } from "./property";
export { LandWizard } from "./land";
export { BlogWizard } from "./blog";

// Shared Components (Domain-Agnostic)
export * from "./shared";

// Utility Components
export { DraftList } from "./draft-list";
export { LazyWizardWrapper } from "./lazy-wizard-wrapper";
export {
    WizardFallbackUI,
    WizardLoadingSkeleton,
    WizardErrorFallback,
    WizardEmptyState
} from "./fallback-ui-states";
export {
    ErrorTestingPanel,
    ErrorScenarioRunner,
    useErrorTesting
} from "./error-testing-utils";

// Re-export core types for convenience
export type {
    WizardData,
    WizardConfig,
    WizardStep,
    WizardStepProps,
    WizardProps,
    UseWizardOptions,
    UseWizardReturn,
    WizardError,
    ValidationResult
} from '@/types/wizard-core';