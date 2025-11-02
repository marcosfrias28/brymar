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

export {
	loadPropertyDraft,
	savePropertyDraft,
	createPropertyFromWizard,
	updatePropertyFromWizard,
} from "@/lib/actions/property-wizard-actions.ts";
// Configuration and Actions (Re-exported for convenience)
export { propertyWizardConfig } from "@/lib/wizard/property-wizard-config.ts";

// Types (Re-exported for convenience)
export type { PropertyWizardData } from "@/types/property-wizard.ts";
// Component
export { PropertyWizard } from "./property-wizard.tsx";
