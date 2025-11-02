/**
 * Land Wizard Module
 *
 * This module contains all land-specific wizard components and logic.
 * It uses the core wizard framework to provide a complete land listing
 * creation and editing experience.
 *
 * Components:
 * - LandWizard: Main land wizard component
 * - Land Steps: Individual step components for land data collection
 *
 * Features:
 * - Multi-step land listing creation flow
 * - Land-specific validation schemas
 * - Terrain type and zoning information
 * - Development potential assessment
 * - Location-based features
 */

export {
	createLandFromWizard,
	loadLandDraft,
	saveLandDraft,
	updateLandFromWizard,
} from "@/lib/actions/land-wizard-actions.ts";
// Configuration and Actions (Re-exported for convenience)
export { landWizardConfig } from "@/lib/wizard/land-wizard-config.ts";
// Types (Re-exported for convenience)
export type { LandWizardData } from "@/types/land-wizard.ts";
// Main Land Wizard Component
export { LandWizard } from "./land-wizard.tsx";
// Land Wizard Steps
// export { LandGeneralStep } from "./steps/land-general-step"; // TODO: Create step
// export { LandLocationStep } from "./steps/land-location-step"; // TODO: Create step
// export { LandMediaStep } from "./steps/land-media-step"; // TODO: Create step
// export { LandPreviewStep } from "./steps/land-preview-step"; // TODO: Create step
