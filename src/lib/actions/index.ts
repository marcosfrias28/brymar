/**
 * Wizard Actions - Centralized Action Exports
 *
 * This file provides a single entry point for all wizard-related server actions,
 * ensuring consistent action usage across the application and proper
 * separation of concerns between different wizard types.
 */

// Re-export common types used by actions
export type { ActionState } from "@/lib/validations";
// Blog Wizard Actions
export {
	createBlogFromWizard,
	loadBlogDraft,
	saveBlogDraft,
	updateBlogFromWizard,
} from "./blog-wizard-actions";

// Land Wizard Actions
export {
	completeLandWizard,
	deleteLandDraft,
	loadLandDraft,
	saveLandDraft,
} from "./land-wizard-actions";
// Property Wizard Actions
export {
	autoSavePropertyDraft,
	completePropertyWizard,
	deletePropertyDraft,
	loadPropertyDraft,
	savePropertyDraft,
	validatePropertyStep,
} from "./property-wizard-actions";
// Unified Wizard Actions (Cross-Domain)
export {
	deleteUnifiedDraft,
	listUnifiedDrafts,
	loadUnifiedDraft,
	saveUnifiedDraft,
} from "./unified-wizard-actions";

// Profile Actions
export {
	getUserProfile,
	updateProfileAction,
} from "./profile-actions";
