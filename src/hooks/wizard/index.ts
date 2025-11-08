/**
 * Wizard Hooks Module
 *
 * This module contains all wizard-related React hooks that provide
 * state management, side effects, and business logic for wizard components.
 *
 * Hooks:
 * - useWizard: Main wizard hook that replaces all previous wizard hooks
 *
 * Architecture:
 * - Centralized state management
 * - Type-safe with TypeScript generics
 * - Comprehensive error handling
 * - Auto-save and persistence support
 * - Performance optimized with proper memoization
 */

// Types (Re-exported for convenience)
export type {
	UseWizardOptions,
	UseWizardReturn,
	WizardConfig,
	WizardData,
} from "@/types/wizard-core";
// Main Wizard Hook (Replaces all previous wizard hooks)
export { useWizard } from "./use-wizard";
// Keyboard Navigation Hook
export { useWizardKeyboard } from "./use-wizard-keyboard";
