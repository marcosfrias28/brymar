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

// Core Hooks (Re-exported for convenience)
export { useWizard } from "@/hooks/wizard/use-wizard";
export { WizardPersistence } from "@/lib/wizard/wizard-persistence";
// Core Utilities (Re-exported for convenience)
export { WizardValidator } from "@/lib/wizard/wizard-validator";
// Core Types (Re-exported for convenience)
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
} from "@/types/wizard-core";
// Main Wizard Components
export { Wizard, WizardWithFeatures } from "./wizard";
// Error Handling
export {
	useWizardErrorHandler,
	WizardErrorBoundary,
	withWizardErrorBoundary,
} from "./wizard-error-boundary";
export {
	useWizardKeyboardNavigation,
	useWizardNavigationState,
	WizardNavigation,
} from "./wizard-navigation";
export {
	useWizardProgress,
	WizardProgress,
	WizardProgressCircular,
	WizardProgressCompact,
} from "./wizard-progress";
export {
	createLazyStep,
	useStepAccessibility,
	useStepPerformance,
	WizardStepRenderer,
	withLazyLoading,
} from "./wizard-step-renderer";
