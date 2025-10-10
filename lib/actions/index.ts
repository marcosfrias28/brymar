/**
 * Wizard Actions - Centralized Action Exports
 * 
 * This file provides a single entry point for all wizard-related server actions,
 * ensuring consistent action usage across the application and proper
 * separation of concerns between different wizard types.
 */

// Unified Wizard Actions (Cross-Domain)
export {
    saveUnifiedDraft,
    loadUnifiedDraft,
    deleteUnifiedDraft,
    listUnifiedDrafts,
} from "./unified-wizard-actions";

// Property Wizard Actions
export {
    completePropertyWizard,
    savePropertyDraft,
    loadPropertyDraft,
    deletePropertyDraft,
    autoSavePropertyDraft,
    validatePropertyStep,
} from "./property-wizard-actions";

// Land Wizard Actions
export {
    completeLandWizard,
    saveLandDraft,
    loadLandDraft,
    deleteLandDraft,
} from "./land-wizard-actions";

// Blog Wizard Actions
export {
    createBlogFromWizard,
    updateBlogFromWizard,
    saveBlogDraft,
    loadBlogDraft,
} from "./blog-wizard-actions";

// Re-export common types used by actions
export type { ActionState } from "@/lib/validations";