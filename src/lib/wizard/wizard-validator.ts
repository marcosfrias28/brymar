// Centralized Wizard Validation Engine

import { ZodSchema, ZodError } from "zod";
import { WizardData, WizardConfig, ValidationResult } from '@/types/wizard-core';

export class WizardValidator {
    /**
     * Validates a single step's data
     */
    static validateStep<T extends WizardData>(
        stepId: string,
        data: Partial<T>,
        schema: ZodSchema
    ): ValidationResult {
        try {
            schema.parse(data);
            return {
                isValid: true,
                errors: {},
                warnings: {},
            };
        } catch (error) {
            if (error instanceof ZodError) {
                const errors: Record<string, string> = {};
                const warnings: Record<string, string> = {};

                error.issues.forEach((err) => {
                    const path = err.path.length > 0 ? err.path.join(".") : "root";
                    const message = err.message;

                    // Classify certain validation errors as warnings instead of hard errors
                    if (this.isWarning(err.code, err.message)) {
                        warnings[path] = message;
                    } else {
                        errors[path] = message;
                    }
                });

                return {
                    isValid: Object.keys(errors).length === 0,
                    errors,
                    warnings,
                };
            }

            return {
                isValid: false,
                errors: { [stepId]: "Validation failed" },
                warnings: {},
            };
        }
    }

    /**
     * Validates all steps in a wizard
     */
    static validateAllSteps<T extends WizardData>(
        data: Partial<T>,
        config: WizardConfig<T>
    ): ValidationResult {
        const allErrors: Record<string, string> = {};
        const allWarnings: Record<string, string> = {};
        let isValid = true;

        // Validate each step
        config.steps.forEach((step) => {
            const stepSchema = config.validation.stepSchemas[step.id];
            if (stepSchema) {
                const stepResult = this.validateStep(step.id, data, stepSchema);

                if (!stepResult.isValid) {
                    isValid = false;
                }

                // Merge errors and warnings with step prefix
                Object.entries(stepResult.errors).forEach(([field, message]) => {
                    allErrors[`${step.id}.${field}`] = message;
                });

                Object.entries(stepResult.warnings).forEach(([field, message]) => {
                    allWarnings[`${step.id}.${field}`] = message;
                });
            }
        });

        // Final validation with complete schema
        try {
            config.validation.finalSchema.parse(data);
        } catch (error) {
            if (error instanceof ZodError) {
                isValid = false;
                error.issues.forEach((err) => {
                    const path = err.path.join(".");
                    allErrors[`final.${path}`] = err.message;
                });
            }
        }

        return {
            isValid,
            errors: allErrors,
            warnings: allWarnings,
        };
    }

    /**
     * Validates if wizard can proceed to next step
     */
    static canProceedToNextStep<T extends WizardData>(
        currentStepId: string,
        data: Partial<T>,
        config: WizardConfig<T>
    ): boolean {
        const currentStep = config.steps.find(step => step.id === currentStepId);
        if (!currentStep) return false;

        // Optional steps can always be skipped
        if (currentStep.isOptional || currentStep.canSkip) {
            return true;
        }

        // Validate current step
        const stepSchema = config.validation.stepSchemas[currentStepId];
        if (!stepSchema) return true; // No validation schema means step is valid

        const result = this.validateStep(currentStepId, data, stepSchema);
        return result.isValid;
    }

    /**
     * Validates if wizard can be completed
     */
    static canComplete<T extends WizardData>(
        data: Partial<T>,
        config: WizardConfig<T>
    ): boolean {
        // Check if all required steps are valid
        for (const step of config.steps) {
            if (!step.isOptional && !step.canSkip) {
                const stepSchema = config.validation.stepSchemas[step.id];
                if (stepSchema) {
                    const result = this.validateStep(step.id, data, stepSchema);
                    if (!result.isValid) {
                        return false;
                    }
                }
            }
        }

        // Final schema validation
        try {
            config.validation.finalSchema.parse(data);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Gets validation errors for a specific step
     */
    static getStepErrors<T extends WizardData>(
        stepId: string,
        data: Partial<T>,
        config: WizardConfig<T>
    ): Record<string, string> {
        const stepSchema = config.validation.stepSchemas[stepId];
        if (!stepSchema) return {};

        const result = this.validateStep(stepId, data, stepSchema);
        return result.errors;
    }

    /**
     * Gets all validation errors across all steps
     */
    static getAllErrors<T extends WizardData>(
        data: Partial<T>,
        config: WizardConfig<T>
    ): Record<string, string> {
        const result = this.validateAllSteps(data, config);
        return result.errors;
    }

    /**
     * Determines if a validation error should be treated as a warning
     */
    private static isWarning(code: string, message: string): boolean {
        // Define conditions for warnings vs hard errors
        const warningCodes = ["too_small", "too_big"];
        const warningMessages = ["optional", "recommended", "suggested"];

        return (
            warningCodes.includes(code) ||
            warningMessages.some(keyword => message.toLowerCase().includes(keyword))
        );
    }

    /**
     * Sanitizes and formats validation error messages for display
     */
    static formatErrorMessage(field: string, message: string): string {
        // Remove technical Zod terminology and make user-friendly
        const friendlyMessage = message
            .replace(/String must contain at least \d+ character\(s\)/, "Este campo es requerido")
            .replace(/Number must be greater than \d+/, "Debe ser un número válido")
            .replace(/Invalid email/, "Correo electrónico inválido")
            .replace(/Required/, "Este campo es requerido");

        return friendlyMessage;
    }

    /**
     * Validates field-level changes for real-time validation
     */
    static validateField<T extends WizardData>(
        stepId: string,
        fieldName: string,
        value: any,
        data: Partial<T>,
        config: WizardConfig<T>
    ): { isValid: boolean; error?: string } {
        const stepSchema = config.validation.stepSchemas[stepId];
        if (!stepSchema) {
            return { isValid: true };
        }

        try {
            // Create a partial object with just this field to validate
            const fieldData = { ...data, [fieldName]: value };
            const result = stepSchema.safeParse(fieldData);

            if (result.success) {
                return { isValid: true };
            }

            // Find error for this specific field
            const fieldError = result.error.issues.find(
                err => err.path.includes(fieldName)
            );

            if (fieldError) {
                return {
                    isValid: false,
                    error: this.formatErrorMessage(fieldName, fieldError.message),
                };
            }

            return { isValid: true };
        } catch {
            return { isValid: false, error: "Error de validación" };
        }
    }
}