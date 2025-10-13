/**
 * Property Wizard Module
 * 
 * This module contains all property-specific wizard components and logic.
 * It uses the core wizard framework to provide a complete property creation
 * and editing experience.
 * 
 * Components:
 * - PropertyWizard: Main property wizard component
 * - Property Steps: Individual step components for property data collection
 * 
 * Features:
 * - Multi-step property creation flow
 * - Real-time validation with Zod schemas
 * - Auto-save functionality
 * - Image upload with optimization
 * - Interactive map integration
 * - Mobile-responsive design
 */

// Main Property Wizard Component
export { PropertyWizard } from "./property-wizard";

// Property Wizard Steps
export { PropertyGeneralStep } from "./steps/property-general-step";
export { PropertyLocationStep } from "./steps/property-location-step";
export { PropertyMediaStep } from "./steps/property-media-step";
export { PropertyPreviewStep } from "./steps/property-preview-step";

// Configuration and Actions (Re-exported for convenience)
export { propertyWizardConfig } from '@/lib/wizard/property-wizard-config';
export {
    completePropertyWizard,
    savePropertyDraft,
    loadPropertyDraft,
    deletePropertyDraft,
    autoSavePropertyDraft,
    validatePropertyStep,
} from '@/lib/actions/property-wizard-actions';

// Types (Re-exported for convenience)
export type { PropertyWizardData } from '@/types/property-wizard';