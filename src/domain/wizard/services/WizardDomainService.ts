import { DomainError } from '@/domain/shared/errors/DomainError';
import { WizardDraft } from "../entities/WizardDraft";
import { WizardType } from "../value-objects/WizardType";
import { StepProgress } from "../value-objects/StepProgress";
import { CompletionPercentage } from "../value-objects/CompletionPercentage";

export interface WizardStepDefinition {
    id: string;
    title: string;
    isRequired: boolean;
    validationRules?: Record<string, any>;
}

export interface WizardValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
    warnings: Record<string, string>;
}

export interface StepValidationContext {
    stepId: string;
    formData: Record<string, any>;
    wizardType: WizardType;
    stepDefinitions: WizardStepDefinition[];
}

export class WizardDomainService {
    /**
     * Validates a specific step of the wizard
     */
    validateStep(context: StepValidationContext): WizardValidationResult {
        const { stepId, formData, wizardType, stepDefinitions } = context;

        const stepDefinition = stepDefinitions.find(step => step.id === stepId);
        if (!stepDefinition) {
            return {
                isValid: false,
                errors: { step: `Step '${stepId}' not found in wizard definition` },
                warnings: {},
            };
        }

        const errors: Record<string, string> = {};
        const warnings: Record<string, string> = {};

        // Validate based on wizard type and step
        switch (wizardType.value) {
            case "property":
                this.validatePropertyStep(stepId, formData, errors, warnings);
                break;
            case "land":
                this.validateLandStep(stepId, formData, errors, warnings);
                break;
            case "blog":
                this.validateBlogStep(stepId, formData, errors, warnings);
                break;
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Calculates completion percentage based on step progress and form data
     */
    calculateCompletionPercentage(
        stepProgress: StepProgress,
        formData: Record<string, any>,
        stepDefinitions: WizardStepDefinition[]
    ): CompletionPercentage {
        const totalSteps = stepDefinitions.length;
        if (totalSteps === 0) {
            return CompletionPercentage.zero();
        }

        const completedSteps = stepProgress.getCompletedStepsCount();
        let basePercentage = (completedSteps / totalSteps) * 100;

        // Add partial completion for current step based on form data
        const currentStepCompletion = this.calculateCurrentStepCompletion(formData, stepDefinitions);
        const partialPercentage = currentStepCompletion / totalSteps;

        const totalPercentage = Math.min(100, basePercentage + partialPercentage);
        return CompletionPercentage.create(totalPercentage);
    }

    /**
     * Determines if a wizard can be published
     */
    canPublish(
        wizardDraft: WizardDraft,
        stepDefinitions: WizardStepDefinition[]
    ): { canPublish: boolean; reasons: string[] } {
        const reasons: string[] = [];

        // Check if all required steps are completed
        const requiredSteps = stepDefinitions.filter(step => step.isRequired);
        const completedSteps = wizardDraft.getStepProgress().getCompletedSteps();

        for (const requiredStep of requiredSteps) {
            if (!completedSteps.includes(requiredStep.id)) {
                reasons.push(`Required step '${requiredStep.title}' is not completed`);
            }
        }

        // Check minimum completion percentage
        if (!wizardDraft.getCompletionPercentage().isNearlyComplete()) {
            reasons.push("Wizard must be at least 90% complete to publish");
        }

        // Validate form data completeness
        const formData = wizardDraft.getFormData().value;
        const validationResult = this.validateCompleteWizard(
            formData,
            wizardDraft.getWizardType(),
            stepDefinitions
        );

        if (!validationResult.isValid) {
            reasons.push(...Object.values(validationResult.errors));
        }

        return {
            canPublish: reasons.length === 0,
            reasons,
        };
    }

    /**
     * Validates the complete wizard for publishing
     */
    private validateCompleteWizard(
        formData: Record<string, any>,
        wizardType: WizardType,
        stepDefinitions: WizardStepDefinition[]
    ): WizardValidationResult {
        const errors: Record<string, string> = {};
        const warnings: Record<string, string> = {};

        // Validate all steps
        for (const stepDefinition of stepDefinitions) {
            if (stepDefinition.isRequired) {
                const stepValidation = this.validateStep({
                    stepId: stepDefinition.id,
                    formData,
                    wizardType,
                    stepDefinitions,
                });

                if (!stepValidation.isValid) {
                    Object.assign(errors, stepValidation.errors);
                }
                Object.assign(warnings, stepValidation.warnings);
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Calculates completion percentage for the current step
     */
    private calculateCurrentStepCompletion(
        formData: Record<string, any>,
        stepDefinitions: WizardStepDefinition[]
    ): number {
        // This is a simplified calculation - in a real implementation,
        // you would analyze the form data against step requirements
        const requiredFields = this.getRequiredFieldsForCurrentStep(formData, stepDefinitions);
        const completedFields = requiredFields.filter(field =>
            formData[field] !== undefined &&
            formData[field] !== null &&
            formData[field] !== ""
        );

        if (requiredFields.length === 0) return 0;
        return (completedFields.length / requiredFields.length) * 100;
    }

    /**
     * Gets required fields for the current step
     */
    private getRequiredFieldsForCurrentStep(
        formData: Record<string, any>,
        stepDefinitions: WizardStepDefinition[]
    ): string[] {
        // This would be implemented based on your specific wizard configuration
        // For now, return common required fields
        return ["title", "description"];
    }

    /**
     * Validates property-specific step data
     */
    private validatePropertyStep(
        stepId: string,
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        switch (stepId) {
            case "general":
                this.validatePropertyGeneralStep(formData, errors, warnings);
                break;
            case "location":
                this.validatePropertyLocationStep(formData, errors, warnings);
                break;
            case "media":
                this.validatePropertyMediaStep(formData, errors, warnings);
                break;
            case "preview":
                this.validatePropertyPreviewStep(formData, errors, warnings);
                break;
        }
    }

    /**
     * Validates land-specific step data
     */
    private validateLandStep(
        stepId: string,
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        switch (stepId) {
            case "general":
                this.validateLandGeneralStep(formData, errors, warnings);
                break;
            case "location":
                this.validateLandLocationStep(formData, errors, warnings);
                break;
            case "media":
                this.validateLandMediaStep(formData, errors, warnings);
                break;
            case "preview":
                this.validateLandPreviewStep(formData, errors, warnings);
                break;
        }
    }

    /**
     * Validates blog-specific step data
     */
    private validateBlogStep(
        stepId: string,
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        switch (stepId) {
            case "content":
                this.validateBlogContentStep(formData, errors, warnings);
                break;
            case "settings":
                this.validateBlogSettingsStep(formData, errors, warnings);
                break;
            case "preview":
                this.validateBlogPreviewStep(formData, errors, warnings);
                break;
        }
    }

    // Property validation methods
    private validatePropertyGeneralStep(
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        if (!formData.title || formData.title.trim().length < 3) {
            errors.title = "Property title must be at least 3 characters long";
        }

        if (!formData.price || formData.price <= 0) {
            errors.price = "Property price must be greater than 0";
        }

        if (!formData.propertyType) {
            errors.propertyType = "Property type is required";
        }
    }

    private validatePropertyLocationStep(
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        if (!formData.address || !formData.address.city) {
            errors.location = "City is required";
        }

        if (!formData.coordinates) {
            warnings.coordinates = "Adding coordinates will improve property visibility";
        }
    }

    private validatePropertyMediaStep(
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        if (!formData.images || formData.images.length === 0) {
            warnings.images = "Adding images will significantly improve property appeal";
        }
    }

    private validatePropertyPreviewStep(
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        // Preview step typically doesn't have validation errors
        // but might have warnings about completeness
    }

    // Land validation methods
    private validateLandGeneralStep(
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        if (!formData.name || formData.name.trim().length < 3) {
            errors.name = "Land name must be at least 3 characters long";
        }

        if (!formData.area || formData.area <= 0) {
            errors.area = "Land area must be greater than 0";
        }

        if (!formData.landType) {
            errors.landType = "Land type is required";
        }
    }

    private validateLandLocationStep(
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        if (!formData.location) {
            errors.location = "Location is required";
        }
    }

    private validateLandMediaStep(
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        if (!formData.images || formData.images.length === 0) {
            warnings.images = "Adding images will help showcase the land";
        }
    }

    private validateLandPreviewStep(
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        // Preview step validation
    }

    // Blog validation methods
    private validateBlogContentStep(
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        if (!formData.title || formData.title.trim().length < 5) {
            errors.title = "Blog title must be at least 5 characters long";
        }

        if (!formData.content || formData.content.trim().length < 100) {
            errors.content = "Blog content must be at least 100 characters long";
        }
    }

    private validateBlogSettingsStep(
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        if (!formData.category) {
            errors.category = "Blog category is required";
        }

        if (!formData.author) {
            errors.author = "Author is required";
        }
    }

    private validateBlogPreviewStep(
        formData: Record<string, any>,
        errors: Record<string, string>,
        warnings: Record<string, string>
    ): void {
        // Preview step validation
    }
}