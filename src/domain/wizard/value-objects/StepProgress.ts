import { ValueObject } from '@/domain/shared/value-objects/ValueObject';
import { BusinessRuleViolationError } from '@/domain/shared/errors/DomainError';

export interface StepProgressData {
    [stepId: string]: {
        completed: boolean;
        completedAt?: Date;
        validationPassed?: boolean;
    };
}

export class StepProgress extends ValueObject<StepProgressData> {
    private constructor(value: StepProgressData) {
        super(value);
    }

    static create(progressData: Record<string, any> = {}): StepProgress {
        const validatedData: StepProgressData = {};

        for (const [stepId, stepData] of Object.entries(progressData)) {
            if (!stepId || stepId.trim().length === 0) {
                throw new BusinessRuleViolationError("Step ID cannot be empty", "WIZARD_VALIDATION");
            }

            if (typeof stepData === "object" && stepData !== null) {
                validatedData[stepId] = {
                    completed: Boolean(stepData.completed),
                    completedAt: stepData.completedAt ? new Date(stepData.completedAt) : undefined,
                    validationPassed: stepData.validationPassed !== undefined ? Boolean(stepData.validationPassed) : undefined,
                };
            } else {
                // Handle simple boolean values for backward compatibility
                validatedData[stepId] = {
                    completed: Boolean(stepData),
                    completedAt: stepData ? new Date() : undefined,
                    validationPassed: Boolean(stepData),
                };
            }
        }

        return new StepProgress(validatedData);
    }

    markStepCompleted(stepId: string, validationPassed: boolean = true): StepProgress {
        if (!stepId || stepId.trim().length === 0) {
            throw new BusinessRuleViolationError("Step ID cannot be empty", "WIZARD_VALIDATION");
        }

        const newProgress = { ...this._value };
        newProgress[stepId] = {
            completed: true,
            completedAt: new Date(),
            validationPassed,
        };

        return new StepProgress(newProgress);
    }

    markStepIncomplete(stepId: string): StepProgress {
        if (!stepId || stepId.trim().length === 0) {
            throw new BusinessRuleViolationError("Step ID cannot be empty", "WIZARD_VALIDATION");
        }

        const newProgress = { ...this._value };
        newProgress[stepId] = {
            completed: false,
            completedAt: undefined,
            validationPassed: false,
        };

        return new StepProgress(newProgress);
    }

    isStepCompleted(stepId: string): boolean {
        return this._value[stepId]?.completed ?? false;
    }

    isStepValidationPassed(stepId: string): boolean {
        return this._value[stepId]?.validationPassed ?? false;
    }

    getStepCompletedAt(stepId: string): Date | undefined {
        return this._value[stepId]?.completedAt;
    }

    getCompletedSteps(): string[] {
        return Object.entries(this._value)
            .filter(([_, stepData]) => stepData.completed)
            .map(([stepId]) => stepId);
    }

    getCompletedStepsCount(): number {
        return this.getCompletedSteps().length;
    }

    getTotalStepsCount(): number {
        return Object.keys(this._value).length;
    }

    calculateCompletionPercentage(): number {
        const totalSteps = this.getTotalStepsCount();
        if (totalSteps === 0) return 0;

        const completedSteps = this.getCompletedStepsCount();
        return Math.round((completedSteps / totalSteps) * 100);
    }

    get value(): StepProgressData {
        return { ...this._value };
    }

    equals(other: StepProgress): boolean {
        const thisSteps = Object.keys(this._value).sort();
        const otherSteps = Object.keys(other._value).sort();

        if (thisSteps.length !== otherSteps.length) {
            return false;
        }

        for (let i = 0; i < thisSteps.length; i++) {
            if (thisSteps[i] !== otherSteps[i]) {
                return false;
            }

            const thisStep = this._value[thisSteps[i]];
            const otherStep = other._value[thisSteps[i]];

            if (
                thisStep.completed !== otherStep.completed ||
                thisStep.validationPassed !== otherStep.validationPassed ||
                thisStep.completedAt?.getTime() !== otherStep.completedAt?.getTime()
            ) {
                return false;
            }
        }

        return true;
    }

    toJSON(): Record<string, any> {
        return this._value;
    }
}