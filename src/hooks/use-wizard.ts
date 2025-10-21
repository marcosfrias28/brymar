import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createWizardDraft,
    saveWizardDraft,
    loadWizardDraft,
    getWizardDrafts,
    deleteWizardDraft,
    publishWizard,
    generateAIContent,
} from "@/lib/actions/wizard";
import {
    WizardDraft,
    CreateWizardDraftInput,
    UpdateWizardDraftInput,
    PublishWizardInput,
    GenerateAIContentInput,
    WizardType,
} from "@/lib/types";
import { toast } from "@/hooks/use-toast";

// Import the new simplified hooks
import {
    useWizardDrafts as useWizardDraftsNew,
    useWizardDraft as useWizardDraftNew,
    useSaveWizardDraft as useSaveWizardDraftNew,
    usePublishWizard as usePublishWizardNew,
    useGenerateAIContent as useGenerateAIContentNew,
    useWizardStepManager,
} from "./use-wizard-hooks";

/**
 * Hook for managing wizard drafts - replaces complex service layers
 * Updated to use new simplified implementation
 */
export function useWizardDrafts(type?: WizardType) {
    return useWizardDraftsNew(type);
}

/**
 * Hook for loading a single wizard draft - replaces LoadWizardDraftUseCase
 * Updated to use new simplified implementation
 */
export function useWizardDraft(draftId: string | null) {
    return useWizardDraftNew(draftId);
}

/**
 * Hook for creating wizard drafts
 */
export function useCreateWizardDraft() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createWizardDraft,
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ["wizard-drafts"] });
                toast({
                    title: "Success",
                    description: "Wizard draft created successfully",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to create wizard draft",
                    variant: "destructive",
                });
            }
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to create wizard draft",
                variant: "destructive",
            });
        },
    });
}

/**
 * Hook for saving wizard drafts - replaces SaveWizardDraftUseCase
 * Updated to use new simplified implementation with optimistic updates
 */
export function useSaveWizardDraft() {
    return useSaveWizardDraftNew();
}

/**
 * Hook for updating wizard drafts with optimistic updates
 * Updated to use new simplified implementation
 */
export function useUpdateWizardDraft() {
    return useSaveWizardDraftNew();
}

/**
 * Hook for deleting wizard drafts
 */
export function useDeleteWizardDraft() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteWizardDraft,
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ["wizard-drafts"] });
                toast({
                    title: "Success",
                    description: "Draft deleted successfully",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to delete draft",
                    variant: "destructive",
                });
            }
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to delete draft",
                variant: "destructive",
            });
        },
    });
}

/**
 * Hook for publishing wizards - replaces PublishWizardUseCase
 * Updated to use new simplified implementation
 */
export function usePublishWizard() {
    return usePublishWizardNew();
}

/**
 * Hook for generating AI content - replaces GenerateAIContentUseCase
 * Updated to use new simplified implementation with retry logic
 */
export function useGenerateAIContent() {
    return useGenerateAIContentNew();
}

/**
 * Hook for wizard step management
 * Updated to use new simplified implementation with enhanced features
 */
export function useWizardStep(draftId: string | null, currentStep?: number) {
    return useWizardStepManager(draftId);
}

/**
 * Hook for wizard form persistence
 * Updated to use new simplified implementation with auto-save
 */
export function useWizardFormPersistence(draftId: string | null, debounceMs = 1000) {
    const stepManager = useWizardStepManager(draftId, debounceMs);

    return {
        saveFormData: (formData: Record<string, any>) => stepManager.saveStepData(formData, true),
        isSaving: stepManager.isAutoSaving,
        lastSaveError: null, // Error handling is done internally in the step manager
    };
}

// Export the new wizard step manager for direct use
export { useWizardStepManager };