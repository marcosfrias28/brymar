// Main Wizard Hook - Replaces all existing wizard hooks

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    WizardData,
    UseWizardOptions,
    UseWizardReturn,
    WizardConfig
} from '@/types/wizard-core';
import { WizardValidator } from '@/lib/wizard/wizard-validator';
import { WizardPersistence } from '@/lib/wizard/wizard-persistence';
import { useIsMobile } from '@/hooks/use-mobile';
import { container } from '@/infrastructure/container/Container';
import { initializeContainer } from '@/infrastructure/container/ServiceRegistration';
import { SaveWizardDraftUseCase } from '@/application/use-cases/wizard/SaveWizardDraftUseCase';
import { LoadWizardDraftUseCase } from '@/application/use-cases/wizard/LoadWizardDraftUseCase';
import { PublishWizardUseCase } from '@/application/use-cases/wizard/PublishWizardUseCase';
import { SaveWizardDraftInput } from '@/application/dto/wizard/SaveWizardDraftInput';
import { LoadWizardDraftInput } from '@/application/dto/wizard/LoadWizardDraftInput';
import { PublishWizardInput } from '@/application/dto/wizard/PublishWizardInput';

// Initialize container on first import
if (!container.has('SaveWizardDraftUseCase')) {
    initializeContainer();
}

export function useWizard<T extends WizardData>(
    options: UseWizardOptions<T>
): UseWizardReturn<T> {
    const {
        config,
        initialData = {} as Partial<T>,
        draftId,
        onComplete,
        onSaveDraft,
        onUpdate,
    } = options;

    const router = useRouter();
    const isMobile = useIsMobile();

    // Core state
    const [data, setData] = useState<Partial<T>>(initialData);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasDraft, setHasDraft] = useState(false);

    // Refs for cleanup
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const mountedRef = useRef(true);

    // Derived values
    const currentStep = config.steps[currentStepIndex]?.id || "";
    const totalSteps = config.steps.length;
    const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

    // Navigation helpers
    const canGoPrevious = currentStepIndex > 0;
    const canGoNext = currentStepIndex < totalSteps - 1 &&
        WizardValidator.canProceedToNextStep(currentStep, data, config);
    const canComplete = WizardValidator.canComplete(data, config);

    // Initialize wizard
    useEffect(() => {
        mountedRef.current = true;

        // Load draft if draftId is provided
        if (draftId) {
            loadDraft(draftId);
        }

        // Setup auto-save if enabled
        if (config.persistence?.autoSave) {
            const interval = config.persistence.autoSaveInterval || 30000;
            autoSaveTimeoutRef.current = setInterval(() => {
                if (Object.keys(data).length > 0) {
                    autoSaveDraft();
                }
            }, interval);
        }

        return () => {
            mountedRef.current = false;
            if (autoSaveTimeoutRef.current) {
                clearInterval(autoSaveTimeoutRef.current);
            }
            WizardPersistence.clearAutoSaveTimeouts();
        };
    }, [draftId, config.persistence]);

    // Update data handler
    const updateData = useCallback((updates: Partial<T>) => {
        setData(prev => {
            const newData = { ...prev, ...updates };

            // Clear errors for updated fields
            const updatedFields = Object.keys(updates);
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                updatedFields.forEach(field => {
                    delete newErrors[field];
                    delete newErrors[`${currentStep}.${field}`];
                });
                return newErrors;
            });

            // Call onUpdate callback
            onUpdate?.(newData);

            return newData;
        });
    }, [currentStep, onUpdate]);

    // Reset data
    const resetData = useCallback(() => {
        setData(initialData);
        setCurrentStepIndex(0);
        setErrors({});
        setError(null);
    }, [initialData]);

    // Navigation functions
    const goToStep = useCallback((stepId: string): boolean => {
        const stepIndex = config.steps.findIndex(step => step.id === stepId);
        if (stepIndex === -1) return false;

        // Validate all previous steps if moving forward
        if (stepIndex > currentStepIndex) {
            for (let i = currentStepIndex; i < stepIndex; i++) {
                const step = config.steps[i];
                if (!WizardValidator.canProceedToNextStep(step.id, data, config)) {
                    const stepErrors = WizardValidator.getStepErrors(step.id, data, config);
                    setErrors(prev => ({ ...prev, ...stepErrors }));
                    toast.error(`Por favor completa el paso "${step.title}" antes de continuar`);
                    return false;
                }
            }
        }

        setCurrentStepIndex(stepIndex);
        return true;
    }, [config.steps, currentStepIndex, data]);

    const nextStep = useCallback(async (): Promise<boolean> => {
        if (!canGoNext) return false;

        setIsValidating(true);

        try {
            // Validate current step
            const isValid = WizardValidator.canProceedToNextStep(currentStep, data, config);

            if (!isValid) {
                const stepErrors = WizardValidator.getStepErrors(currentStep, data, config);
                setErrors(prev => ({ ...prev, ...stepErrors }));
                toast.error("Por favor corrige los errores antes de continuar");
                return false;
            }

            // Clear current step errors
            setErrors(prev => {
                const newErrors = { ...prev };
                Object.keys(newErrors).forEach(key => {
                    if (key.startsWith(`${currentStep}.`)) {
                        delete newErrors[key];
                    }
                });
                return newErrors;
            });

            // Move to next step
            setCurrentStepIndex(prev => prev + 1);

            // Auto-save progress
            if (config.persistence?.autoSave) {
                await autoSaveDraft();
            }

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al avanzar al siguiente paso");
            return false;
        } finally {
            setIsValidating(false);
        }
    }, [canGoNext, currentStep, data, config]);

    const previousStep = useCallback((): boolean => {
        if (!canGoPrevious) return false;

        setCurrentStepIndex(prev => prev - 1);
        return true;
    }, [canGoPrevious]);

    // Validation functions
    const validateCurrentStep = useCallback((): boolean => {
        return WizardValidator.canProceedToNextStep(currentStep, data, config);
    }, [currentStep, data, config]);

    const validateAllSteps = useCallback((): boolean => {
        const result = WizardValidator.validateAllSteps(data, config);
        setErrors(result.errors);
        return result.isValid;
    }, [data, config]);

    const getStepErrors = useCallback((stepId?: string): Record<string, string> => {
        if (stepId) {
            return WizardValidator.getStepErrors(stepId, data, config);
        }
        return errors;
    }, [data, config, errors]);

    const clearErrors = useCallback((stepId?: string) => {
        if (stepId) {
            setErrors(prev => {
                const newErrors = { ...prev };
                Object.keys(newErrors).forEach(key => {
                    if (key.startsWith(`${stepId}.`)) {
                        delete newErrors[key];
                    }
                });
                return newErrors;
            });
        } else {
            setErrors({});
        }
    }, []);

    // Persistence functions using DDD use cases
    const saveDraft = useCallback(async (): Promise<string | null> => {
        if (!onSaveDraft) return null;

        setIsSaving(true);
        try {
            // Use SaveWizardDraftUseCase
            const useCase = container.get<SaveWizardDraftUseCase>('SaveWizardDraftUseCase');
            const input = SaveWizardDraftInput.create({
                userId: 'current-user-id', // This would come from auth context
                wizardType: config.type as 'property' | 'land' | 'blog',
                wizardConfigId: config.id,
                formData: data,
                currentStep,
                title: data.title as string,
                description: data.description as string,
                draftId: draftId || undefined,
            });

            const result = await useCase.execute(input);
            setHasDraft(true);
            toast.success("Borrador guardado");
            return result.draftId;
        } catch (err: any) {
            const message = err?.message || "Error al guardar borrador";
            setError(message);
            toast.error(message);
            return null;
        } finally {
            setIsSaving(false);
        }
    }, [data, currentStep, onSaveDraft, config, draftId]);

    const autoSaveDraft = useCallback(async (): Promise<string | null> => {
        if (!config.persistence?.autoSave || !onSaveDraft) return null;

        try {
            const result = await WizardPersistence.autoSaveDraft(
                config.type,
                config.id,
                data,
                currentStep,
                undefined, // userId would come from auth context
                undefined, // draftId
                { interval: config.persistence.autoSaveInterval }
            );

            if (result.success && result.data) {
                setHasDraft(true);
                return result.data.draftId;
            } else {
                throw new Error(result.error || "Failed to save draft");
            }
        } catch (err) {
            console.warn("Auto-save failed:", err);
            return null;
        }
    }, [config, data, currentStep, onSaveDraft]);

    const loadDraft = useCallback(async (draftId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            // Use LoadWizardDraftUseCase
            const useCase = container.get<LoadWizardDraftUseCase>('LoadWizardDraftUseCase');
            const input = LoadWizardDraftInput.create({
                draftId,
                userId: 'current-user-id', // This would come from auth context
            });

            const result = await useCase.execute(input);
            setData(result.formData as Partial<T>);
            const stepIndex = config.steps.findIndex(step => step.id === result.currentStep);
            if (stepIndex !== -1) {
                setCurrentStepIndex(stepIndex);
            }
            setHasDraft(true);
            toast.success("Borrador cargado");
            return true;
        } catch (err: any) {
            const message = err?.message || "Error al cargar borrador";
            setError(message);
            toast.error(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [config.steps]);

    const deleteDraft = useCallback(async (draftId: string): Promise<boolean> => {
        try {
            const result = await WizardPersistence.deleteDraft(draftId);
            if (result.success) {
                setHasDraft(false);
                toast.success("Borrador eliminado");
            }
            return result.success;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al eliminar borrador";
            setError(message);
            toast.error(message);
            return false;
        }
    }, []);

    // Completion function
    const complete = useCallback(async (): Promise<boolean> => {
        if (!canComplete || !onComplete) return false;

        setIsLoading(true);
        try {
            // Final validation
            if (!validateAllSteps()) {
                toast.error("Por favor corrige todos los errores antes de completar");
                return false;
            }

            // Use PublishWizardUseCase if we have a draft
            if (hasDraft && draftId) {
                const useCase = container.get<PublishWizardUseCase>('PublishWizardUseCase');
                const input = PublishWizardInput.create({
                    draftId,
                    userId: 'current-user-id', // This would come from auth context
                    publishOptions: {},
                });

                await useCase.execute(input);
            } else {
                // Complete the wizard using the callback
                await onComplete(data as T);
            }

            toast.success("¡Completado exitosamente!");
            return true;
        } catch (err: any) {
            const message = err?.message || "Error al completar";
            setError(message);
            toast.error(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [canComplete, onComplete, data, validateAllSteps, hasDraft, draftId]);

    return {
        // Data
        data,
        updateData,
        resetData,

        // Navigation
        currentStep,
        currentStepIndex,
        totalSteps,
        progress,
        goToStep,
        nextStep,
        previousStep,
        canGoNext,
        canGoPrevious,

        // Validation
        validateCurrentStep,
        validateAllSteps,
        getStepErrors,
        clearErrors,

        // Persistence
        saveDraft,
        loadDraft,
        deleteDraft,
        hasDraft,

        // Completion
        complete,
        canComplete,

        // State
        isLoading,
        isSaving,
        isValidating,
        error,
    };
}