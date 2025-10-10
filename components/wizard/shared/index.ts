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

export { EnhancedAIDescription } from "./enhanced-ai-description";
export { EnhancedImageUpload } from "./enhanced-image-upload";
export { ImagePreview, ImagePreviewGrid } from "./image-preview-handler";
export { ImageUploadStep } from "./image-upload-step";
export { InteractiveMap } from "./interactive-map";
export { LocationPickerStep } from "./location-picker-step";
export { LocationStepWrapper } from "./location-step-wrapper";
export { SimpleLocationPicker } from "./simple-location-picker";
export { MapErrorBoundary } from "./map-error-boundary";
export { 
  ConsistentLoadingState,
  ConsistentErrorState,
  getNavigationConfig,
  useConsistentStepValidation,
  generateWizardBreadcrumbs,
  validateStepProgression
} from "./consistent-navigation";
export { WizardStepLayout } from "./wizard-step-layout";
export { WizardFormSection } from "./wizard-form-section";
export { WizardFormField } from "./wizard-form-field";
export { WizardSelectionGrid } from "./wizard-selection-grid";

// Types (Re-exported for convenience)
export type { ImageMetadata } from "./image-upload-step";
export type { LocationData } from "./location-picker-step";