/**
 * Shared Wizard Components
 *
 * This module contains reusable components that can be used across
 * different wizard types. These components are domain-agnostic and
 * provide common functionality needed by multiple wizard implementations.
 *
 * Components:
 * - ImageUploadStep: Reusable image upload functionality
 * - LocationPickerStep: Interactive location selection
 * - EnhancedImageUpload: Advanced image upload with optimization
 * - EnhancedAIDescription: AI-powered content generation
 * - InteractiveMap: Map integration for location-based wizards
 *
 * Design Principles:
 * - Composition over inheritance
 * - Configurable and extensible
 * - Consistent API across components
 * - Mobile-first responsive design
 */

export {
	ConsistentErrorState,
	ConsistentLoadingState,
	generateWizardBreadcrumbs,
	getNavigationConfig,
	useConsistentStepValidation,
	validateStepProgression,
} from "./consistent-navigation";
export { EnhancedAIDescription } from "./enhanced-ai-description";
export { EnhancedImageUpload } from "./enhanced-image-upload";
export { ImagePreview, ImagePreviewGrid } from "./image-preview-handler";
// Types (Re-exported for convenience)
export type { ImageMetadata } from "./image-upload-step";
export { ImageUploadStep } from "./image-upload-step";
export { InteractiveMap } from "./interactive-map";
export type { LocationData } from "./location-picker-step";
export { LocationPickerStep } from "./location-picker-step";
export { LocationStepWrapper } from "./location-step-wrapper";
export { MapErrorBoundary } from "./map-error-boundary";
export { SimpleLocationPicker } from "./simple-location-picker";
export { WizardFormField } from "./wizard-form-field";
export { WizardFormSection } from "./wizard-form-section";
export { WizardSelectionGrid } from "./wizard-selection-grid";
export { WizardStepLayout } from "./wizard-step-layout";
