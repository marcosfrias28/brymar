"use client";

import { useMemo, useCallback } from "react";
import { PropertyFormData } from "@/types/wizard";
import { validateStep as schemaValidateStep, validatePartialStep } from "@/lib/schemas/wizard-schemas";

interface StepValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
    warnings: Record<string, string>;
    completion: number;
    requiredFields: string[];
    missingFields: string[];
}

interface StepValidationHook {
    validateStep: (step: number, data: Partial<PropertyFormData>) => StepValidationResult;
    validateAllSteps: (data: Partial<PropertyFormData>) => Record<number, StepValidationResult>;
    canNavigateToStep: (targetStep: number, currentStep: number, data: Partial<PropertyFormData>) => boolean;
    getStepProgress: (step: number, data: Partial<PropertyFormData>) => number;
    getOverallProgress: (data: Partial<PropertyFormData>) => number;
    getNextIncompleteStep: (data: Partial<PropertyFormData>) => number | null;
}

export function useStepValidation(): StepValidationHook {
    // Define required fields for each step
    const stepRequiredFields = useMemo(() => ({
        1: ["title", "description", "price", "surface", "propertyType"],
        2: ["coordinates", "address.street", "address.city", "address.province"],
        3: ["images"],
        4: [], // Step 4 is preview, no additional fields required
    }), []);

    // Define optional fields that contribute to completion
    const stepOptionalFields = useMemo(() => ({
        1: ["bedrooms", "bathrooms", "characteristics"],
        2: ["address.postalCode", "address.formattedAddress"],
        3: ["videos"],
        4: [],
    }), []);

    // Get nested value from object
    const getNestedValue = useCallback((obj: any, path: string): any => {
        return path.split(".").reduce((current, key) => current?.[key], obj);
    }, []);

    // Check if a field has a valid value
    const hasValidValue = useCallback((value: any): boolean => {
        if (value === undefined || value === null) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === "object" && Object.keys(value).length === 0) return false;
        return true;
    }, []);

    // Calculate field completion for a step
    const calculateFieldCompletion = useCallback(
        (step: number, data: Partial<PropertyFormData>): {
            completion: number;
            missingRequired: string[];
            missingOptional: string[];
        } => {
            const requiredFields = stepRequiredFields[step as 1 | 2 | 3 | 4] || [];
            const optionalFields = stepOptionalFields[step as 1 | 2 | 3 | 4] || [];

            const missingRequired = requiredFields.filter(field => {
                const value = getNestedValue(data, field);
                return !hasValidValue(value);
            });

            const missingOptional = optionalFields.filter(field => {
                const value = getNestedValue(data, field);
                return !hasValidValue(value);
            });

            const totalFields = requiredFields.length + optionalFields.length;
            const completedFields = (requiredFields.length - missingRequired.length) +
                (optionalFields.length - missingOptional.length);

            // Si no hay campos definidos, el progreso debería ser 0% para pasos vacíos
            // Solo el paso 4 (preview) puede tener 100% sin campos
            const completion = totalFields > 0
                ? Math.round((completedFields / totalFields) * 100)
                : (step === 4 ? 100 : 0);

            return {
                completion,
                missingRequired,
                missingOptional,
            };
        },
        [stepRequiredFields, stepOptionalFields, getNestedValue, hasValidValue]
    );

    // Validate a single step
    const validateStep = useCallback(
        (step: number, data: Partial<PropertyFormData>): StepValidationResult => {
            const validation = schemaValidateStep(step, data);
            const { completion, missingRequired, missingOptional } = calculateFieldCompletion(step, data);

            const requiredFields = stepRequiredFields[step as 1 | 2 | 3 | 4] || [];

            // Generate warnings for missing optional fields
            const warnings: Record<string, string> = {};
            missingOptional.forEach(field => {
                warnings[field] = `Campo opcional ${field} no completado`;
            });

            return {
                isValid: validation.success,
                errors: validation.errors || {},
                warnings,
                completion,
                requiredFields,
                missingFields: missingRequired,
            };
        },
        [calculateFieldCompletion, stepRequiredFields]
    );

    // Validate all steps
    const validateAllSteps = useCallback(
        (data: Partial<PropertyFormData>): Record<number, StepValidationResult> => {
            const results: Record<number, StepValidationResult> = {};

            for (let step = 1; step <= 4; step++) {
                results[step] = validateStep(step, data);
            }

            return results;
        },
        [validateStep]
    );

    // Check if navigation to a step is allowed
    const canNavigateToStep = useCallback(
        (targetStep: number, currentStep: number, data: Partial<PropertyFormData>): boolean => {
            // Always allow navigation to previous steps or current step
            if (targetStep <= currentStep) return true;

            // For forward navigation, check if all intermediate steps are valid
            for (let step = currentStep; step < targetStep; step++) {
                const validation = validateStep(step, data);
                if (!validation.isValid) return false;
            }

            return true;
        },
        [validateStep]
    );

    // Get progress for a specific step
    const getStepProgress = useCallback(
        (step: number, data: Partial<PropertyFormData>): number => {
            const { completion } = calculateFieldCompletion(step, data);
            return completion;
        },
        [calculateFieldCompletion]
    );

    // Get overall progress across all steps
    const getOverallProgress = useCallback(
        (data: Partial<PropertyFormData>): number => {
            const stepProgresses = [1, 2, 3, 4].map(step => getStepProgress(step, data));
            const totalProgress = stepProgresses.reduce((sum, progress) => sum + progress, 0);
            return Math.round(totalProgress / 4);
        },
        [getStepProgress]
    );

    // Get the next incomplete step
    const getNextIncompleteStep = useCallback(
        (data: Partial<PropertyFormData>): number | null => {
            for (let step = 1; step <= 4; step++) {
                const validation = validateStep(step, data);
                if (!validation.isValid) return step;
            }
            return null; // All steps are complete
        },
        [validateStep]
    );

    return {
        validateStep,
        validateAllSteps,
        canNavigateToStep,
        getStepProgress,
        getOverallProgress,
        getNextIncompleteStep,
    };
}