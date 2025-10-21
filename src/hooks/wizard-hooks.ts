/**
 * Wizard hooks - simplified architecture implementation
 * This file consolidates all wizard-related hooks following the new simplified architecture
 * 
 * Task 6.2 Implementation:
 * - useWizardDrafts: Hook for draft management
 * - useWizardDraft: Hook for single draft data
 * - useSaveWizardDraft: Mutation hook for saving drafts
 * - usePublishWizard: Mutation hook for publishing wizards
 * - useGenerateAIContent: Mutation hook for AI content generation
 */

// Export all wizard hooks from the main implementation
export {
    useWizardDrafts,
    useWizardDraft,
    useSaveWizardDraft,
    useUpdateWizardDraft,
    useCreateWizardDraft,
    useDeleteWizardDraft,
    usePublishWizard,
    useGenerateAIContent,
    useWizardStep,
    useWizardFormPersistence,
    useWizardStepManager,
} from "./use-wizard";

// Export the new simplified hooks directly for advanced usage
export {
    useWizardDrafts as useWizardDraftsSimplified,
    useWizardDraft as useWizardDraftSimplified,
    useSaveWizardDraft as useSaveWizardDraftSimplified,
    usePublishWizard as usePublishWizardSimplified,
    useGenerateAIContent as useGenerateAIContentSimplified,
    useWizardStepManager as useWizardStepManagerSimplified,
} from "./use-wizard-hooks";

// Re-export types for convenience
export type {
    WizardDraft,
    CreateWizardDraftInput,
    UpdateWizardDraftInput,
    PublishWizardInput,
    GenerateAIContentInput,
    WizardType,
} from "@/lib/types";