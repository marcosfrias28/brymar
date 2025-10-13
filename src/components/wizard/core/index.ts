/**
 * Core Wizard Framework Components
 * 
 * These components form the foundation of the wizard system.
 * They are domain-agnostic and can be used by any wizard type.
 * 
 * Architecture:
 * - Wizard: Main shell component that orchestrates the entire wizard flow
 * - WizardStepRenderer: Handles dynamic step rendering with lazy loading
 * - WizardNavigation: Provides navigation controls with accessibility support
 * - WizardProgress: Shows progress indicators with multiple display modes
 * - WizardErrorBoundary: Comprehensive error handling with recovery strategies
 */

// Main Wizard Components
export { Wizard, WizardWithFeatures } from "./wizard";
export { WizardStepRenderer, withLazyLoading, createLazyStep, useStepPerformance, useStepAccessibility } from "./wizard-step-renderer";
export { WizardNavigation, useWizardKeyboardNavigation, useWizardNavigationState } from "./wizard-navigation";
export { WizardProgress, WizardProgressCompact, WizardProgressCircular, useWizardProgress } from "./wizard-progress";

// Error Handling
export { WizardErrorBoundary, useWizardErrorHandler, withWizardErrorBoundary } from "./wizard-error-boundary";

// Core Types (Re-exported for convenience)
export type {
    WizardData,
    WizardStep,
    WizardConfig,
    WizardStepProps,
    UseWizardOptions,
    UseWizardReturn,
    WizardProps,
    WizardError,
    ErrorRecoveryStrategy,
    ValidationResult,
    WizardNavigationProps,
    WizardProgressProps,
    WizardStepRendererProps,
} from '@/types/wizard-core';

// Core Hooks (Re-exported for convenience)
export { useWizard } from '@/hooks/wizard/use-wizard';

// Core Utilities (Re-exported for convenience)
export { WizardValidator } from '@/lib/wizard/wizard-validator';
export { WizardPersistence } from '@/lib/wizard/wizard-persistence';