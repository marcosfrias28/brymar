// Main component
export { UnifiedWizard } from "./UnifiedWizard";

// Types
export type { WizardStep, UnifiedWizardProps } from "./types";

// Hooks (for advanced usage)
export { useWizardLogic } from "./hooks/useWizardLogic";
export { useWizardState } from "./hooks/useWizardState";
export { useRealTimeProgress } from "./hooks/useRealTimeProgress";
export { useWizardValidation } from "./hooks/useWizardValidation";
export { useStepChangeHandler } from "./hooks/useStepChangeHandler";
export { useNavigationHandlers } from "./hooks/useNavigationHandlers";
export { useCompletionHandlers } from "./hooks/useCompletionHandlers";

// Components (for customization)
export { WizardHeader } from "./components/WizardHeader";
export { WizardStepsNavigation } from "./components/WizardStepsNavigation";
export { WizardCurrentStep } from "./components/WizardCurrentStep";
export { WizardNavigation } from "./components/WizardNavigation";

// Utils (for custom progress calculations)
export * from "./utils/progress-calculations";
