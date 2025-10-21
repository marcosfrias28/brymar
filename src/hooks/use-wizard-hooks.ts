import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    saveWizardDraft,
    loadWizardDraft,
    getWizardDrafts,
    publishWizard,
    generateAIContent,
} from "@/lib/actions/wizard";
import {
    WizardDraft,
    UpdateWizardDraftInput,
    PublishWizardInput,
    GenerateAIContentInput,
    WizardType,
} from "@/lib/types";
import { toast } from "@/hooks/use-toast";

/**
 * Hook for managing wizard drafts - replaces complex service layers
 * Implements useWizardDrafts as specified in task 6.2
 */
export function useWizardDrafts(type?: WizardType) {
    return useQuery({
        queryKey: ["wizard-drafts", type],
        queryFn: () => getWizardDrafts(type),
        select: (data) => data.data || [],
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Hook for loading a single wizard draft - replaces LoadWizardDraftUseCase
 * Implements useWizardDraft as specified in task 6.2
 */
export function useWizardDraft(draftId: string | null) {
    return useQuery({
        queryKey: ["wizard-draft", draftId],
        queryFn: () => (draftId ? loadWizardDraft(draftId) : null),
        enabled: !!draftId,
        select: (data) => data?.data,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook for saving wizard drafts - replaces SaveWizardDraftUseCase
 * Implements useSaveWizardDraft as specified in task 6.2
 */
export function useSaveWizardDraft() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateWizardDraftInput) => saveWizardDraft(input),
        onMutate: async (variables) => {
            // Cancel outgoing refetches for optimistic updates
            await queryClient.cancelQueries({ queryKey: ["wizard-draft", variables.id] });
            await queryClient.cancelQueries({ queryKey: ["wizard-drafts"] });

            // Snapshot previous values
            const previousDraft = queryClient.getQueryData(["wizard-draft", variables.id]);
            const previousDrafts = queryClient.getQueryData(["wizard-drafts"]);

            // Optimistically update single draft
            if (previousDraft) {
                queryClient.setQueryData(["wizard-draft", variables.id], (old: any) => {
                    if (!old?.data) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            ...variables,
                            updatedAt: new Date(),
                        },
                    };
                });
            }

            // Optimistically update drafts list
            queryClient.setQueryData(["wizard-drafts"], (old: any) => {
                if (!Array.isArray(old)) return old;
                return old.map((draft: WizardDraft) =>
                    draft.id === variables.id
                        ? { ...draft, ...variables, updatedAt: new Date() }
                        : draft
                );
            });

            return { previousDraft, previousDrafts };
        },
        onSuccess: (result, variables) => {
            if (result.success) {
                // Update cache with server response
                queryClient.setQueryData(["wizard-draft", variables.id], {
                    success: true,
                    data: result.data,
                });

                toast({
                    title: "Success",
                    description: "Draft saved successfully",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to save draft",
                    variant: "destructive",
                });
            }
        },
        onError: (error, variables, context) => {
            // Rollback optimistic updates on error
            if (context?.previousDraft) {
                queryClient.setQueryData(["wizard-draft", variables.id], context.previousDraft);
            }
            if (context?.previousDrafts) {
                queryClient.setQueryData(["wizard-drafts"], context.previousDrafts);
            }

            toast({
                title: "Error",
                description: "Failed to save draft",
                variant: "destructive",
            });
        },
        onSettled: (result, error, variables) => {
            // Always refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: ["wizard-draft", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["wizard-drafts"] });
        },
    });
}

/**
 * Hook for publishing wizards - replaces PublishWizardUseCase
 * Implements usePublishWizard as specified in task 6.2
 */
export function usePublishWizard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: PublishWizardInput) => publishWizard(input),
        onSuccess: (result, variables) => {
            if (result.success) {
                // Invalidate all related queries
                queryClient.invalidateQueries({ queryKey: ["wizard-drafts"] });
                queryClient.invalidateQueries({ queryKey: ["wizard-draft", variables.id] });

                // Invalidate related entity queries based on wizard type
                const wizardType = result.data?.draft?.type;
                if (wizardType === "property") {
                    queryClient.invalidateQueries({ queryKey: ["properties"] });
                } else if (wizardType === "land") {
                    queryClient.invalidateQueries({ queryKey: ["lands"] });
                } else if (wizardType === "blog") {
                    queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
                }

                toast({
                    title: "Success",
                    description: "Wizard published successfully",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to publish wizard",
                    variant: "destructive",
                });
            }
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to publish wizard",
                variant: "destructive",
            });
        },
    });
}

/**
 * Hook for generating AI content - replaces GenerateAIContentUseCase
 * Implements useGenerateAIContent as specified in task 6.2
 */
export function useGenerateAIContent() {
    return useMutation({
        mutationFn: (input: GenerateAIContentInput) => generateAIContent(input),
        onSuccess: (result) => {
            if (result.success) {
                toast({
                    title: "Success",
                    description: "AI content generated successfully",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to generate AI content",
                    variant: "destructive",
                });
            }
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to generate AI content",
                variant: "destructive",
            });
        },
        retry: (failureCount, error) => {
            // Retry up to 2 times for AI generation failures
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });
}

/**
 * Composite hook for wizard step management with auto-save functionality
 * Provides additional utility for managing wizard state
 */
export function useWizardStepManager(draftId: string | null, autoSaveDelay = 2000) {
    const { data: draft, isLoading } = useWizardDraft(draftId);
    const saveDraft = useSaveWizardDraft();

    // Auto-save functionality with debouncing
    const autoSave = useMutation({
        mutationFn: async (data: Partial<UpdateWizardDraftInput>) => {
            if (!draftId) throw new Error("No draft ID provided");

            // Debounce the save operation
            await new Promise(resolve => setTimeout(resolve, autoSaveDelay));

            return saveDraft.mutateAsync({
                id: draftId,
                ...data,
            });
        },
        onError: (error) => {
            console.warn("Auto-save failed:", error);
            // Don't show toast for auto-save failures to avoid spam
        },
    });

    const goToStep = (step: number) => {
        if (!draftId) return;
        saveDraft.mutate({
            id: draftId,
            currentStep: step,
        });
    };

    const nextStep = () => {
        if (!draftId || !draft) return;
        saveDraft.mutate({
            id: draftId,
            currentStep: (draft.currentStep || 0) + 1,
        });
    };

    const previousStep = () => {
        if (!draftId || !draft || (draft.currentStep || 0) <= 0) return;
        saveDraft.mutate({
            id: draftId,
            currentStep: (draft.currentStep || 0) - 1,
        });
    };

    const saveStepData = (stepData: Record<string, any>, useAutoSave = false) => {
        if (!draftId) return;

        const updateData = {
            id: draftId,
            data: {
                ...draft?.data,
                ...stepData,
            },
        };

        if (useAutoSave) {
            autoSave.mutate(updateData);
        } else {
            saveDraft.mutate(updateData);
        }
    };

    return {
        draft,
        isLoading,
        goToStep,
        nextStep,
        previousStep,
        saveStepData,
        isUpdating: saveDraft.isPending,
        isAutoSaving: autoSave.isPending,
        canGoNext: draft && (draft.currentStep || 0) < (draft.steps?.length || 0) - 1,
        canGoPrevious: draft && (draft.currentStep || 0) > 0,
    };
}