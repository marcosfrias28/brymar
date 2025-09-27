"use client";

import { useState, useCallback } from "react";
import { PropertyFormData, WizardState } from "@/types/wizard";
import { validateStep } from "@/lib/schemas/wizard-schemas";

export function usePropertyWizard(initialData: Partial<PropertyFormData> = {}) {
    const [wizardState, setWizardState] = useState<WizardState>({
        currentStep: 1,
        formData: initialData,
        isValid: {},
        isDirty: false,
        isLoading: false,
        errors: {},
    });

    const updateFormData = useCallback((newData: Partial<PropertyFormData>) => {
        setWizardState(prev => ({
            ...prev,
            formData: { ...prev.formData, ...newData },
            isDirty: true,
            errors: {}, // Clear errors when data changes
        }));
    }, []);

    const setCurrentStep = useCallback((step: number) => {
        setWizardState(prev => ({
            ...prev,
            currentStep: step,
            errors: {},
        }));
    }, []);

    const setLoading = useCallback((loading: boolean) => {
        setWizardState(prev => ({
            ...prev,
            isLoading: loading,
        }));
    }, []);

    const setErrors = useCallback((errors: Record<string, string>) => {
        setWizardState(prev => ({
            ...prev,
            errors,
        }));
    }, []);

    const validateCurrentStep = useCallback(() => {
        const { currentStep, formData } = wizardState;
        const validation = validateStep(currentStep, formData);

        setWizardState(prev => ({
            ...prev,
            isValid: { ...prev.isValid, [currentStep]: validation.success },
            errors: validation.errors || {},
        }));

        return validation.success;
    }, [wizardState]);

    const resetWizard = useCallback(() => {
        setWizardState({
            currentStep: 1,
            formData: {},
            isValid: {},
            isDirty: false,
            isLoading: false,
            errors: {},
        });
    }, []);

    return {
        wizardState,
        updateFormData,
        setCurrentStep,
        setLoading,
        setErrors,
        validateCurrentStep,
        resetWizard,
    };
}