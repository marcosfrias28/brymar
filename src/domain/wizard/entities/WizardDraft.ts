import { AggregateRoot } from '@/domain/shared/entities/AggregateRoot';
import { DomainError } from '@/domain/shared/errors/DomainError';
import { WizardDraftId } from "../value-objects/WizardDraftId";
import { WizardType } from "../value-objects/WizardType";
import { StepProgress } from "../value-objects/StepProgress";
import { CompletionPercentage } from "../value-objects/CompletionPercentage";
import { WizardFormData } from "../value-objects/WizardFormData";
import { UserId } from "../../user/value-objects/UserId";

export interface CreateWizardDraftData {
    userId: string;
    wizardType: string;
    wizardConfigId: string;
    formData: Record<string, any>;
    currentStep: string;
    title?: string;
    description?: string;
}

export interface WizardDraftData {
    id: WizardDraftId;
    userId: UserId;
    wizardType: WizardType;
    wizardConfigId: string;
    formData: WizardFormData;
    currentStep: string;
    stepProgress: StepProgress;
    completionPercentage: CompletionPercentage;
    title?: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class WizardDraft extends AggregateRoot {
    private constructor(
        private readonly id: WizardDraftId,
        private readonly userId: UserId,
        private readonly wizardType: WizardType,
        private readonly wizardConfigId: string,
        private formData: WizardFormData,
        private currentStep: string,
        private stepProgress: StepProgress,
        private completionPercentage: CompletionPercentage,
        private title?: string,
        private description?: string,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        super(id, createdAt, updatedAt);
    }

    static create(data: CreateWizardDraftData): WizardDraft {
        const id = WizardDraftId.generate();
        const userId = UserId.create(data.userId);
        const wizardType = WizardType.create(data.wizardType);
        const formData = WizardFormData.create(data.formData);
        const stepProgress = StepProgress.create({});
        const completionPercentage = CompletionPercentage.create(0);

        // Validate wizard config ID
        if (!data.wizardConfigId || data.wizardConfigId.trim().length === 0) {
            throw new DomainError("Wizard config ID is required");
        }

        // Validate current step
        if (!data.currentStep || data.currentStep.trim().length === 0) {
            throw new DomainError("Current step is required");
        }

        return new WizardDraft(
            id,
            userId,
            wizardType,
            data.wizardConfigId.trim(),
            formData,
            data.currentStep.trim(),
            stepProgress,
            completionPercentage,
            data.title?.trim(),
            data.description?.trim(),
            new Date(),
            new Date()
        );
    }

    static reconstitute(data: WizardDraftData): WizardDraft {
        return new WizardDraft(
            data.id,
            data.userId,
            data.wizardType,
            data.wizardConfigId,
            data.formData,
            data.currentStep,
            data.stepProgress,
            data.completionPercentage,
            data.title,
            data.description,
            data.createdAt,
            data.updatedAt
        );
    }

    updateFormData(newFormData: Record<string, any>): void {
        this.formData = WizardFormData.create(newFormData);
        this.touch();
    }

    updateCurrentStep(stepId: string): void {
        if (!stepId || stepId.trim().length === 0) {
            throw new DomainError("Step ID cannot be empty");
        }
        this.currentStep = stepId.trim();
        this.touch();
    }

    markStepCompleted(stepId: string): void {
        if (!stepId || stepId.trim().length === 0) {
            throw new DomainError("Step ID cannot be empty");
        }
        this.stepProgress = this.stepProgress.markStepCompleted(stepId);
        this.touch();
    }

    updateCompletionPercentage(percentage: number): void {
        this.completionPercentage = CompletionPercentage.create(percentage);
        this.touch();
    }

    updateTitle(title: string): void {
        if (title && title.trim().length > 0) {
            this.title = title.trim();
            this.touch();
        }
    }

    updateDescription(description: string): void {
        if (description && description.trim().length > 0) {
            this.description = description.trim();
            this.touch();
        }
    }

    canBePublished(): boolean {
        return this.completionPercentage.isComplete();
    }

    isComplete(): boolean {
        return this.completionPercentage.isComplete();
    }

    // Getters
    getId(): WizardDraftId {
        return this.id;
    }

    getUserId(): UserId {
        return this.userId;
    }

    getWizardType(): WizardType {
        return this.wizardType;
    }

    getWizardConfigId(): string {
        return this.wizardConfigId;
    }

    getFormData(): WizardFormData {
        return this.formData;
    }

    getCurrentStep(): string {
        return this.currentStep;
    }

    getStepProgress(): StepProgress {
        return this.stepProgress;
    }

    getCompletionPercentage(): CompletionPercentage {
        return this.completionPercentage;
    }

    getTitle(): string | undefined {
        return this.title;
    }

    getDescription(): string | undefined {
        return this.description;
    }

    private touch(): void {
        this.updatedAt = new Date();
    }
}