// Core Wizard Framework Types

import { ZodSchema } from "zod";
import { ReactNode, ComponentType } from "react";

// Base wizard data interface
export interface WizardData {
    id?: string;
    title: string;
    description: string;
    status: "draft" | "published";
    createdAt?: Date;
    updatedAt?: Date;
}

// Wizard step definition
export interface WizardStep<T extends WizardData> {
    id: string;
    title: string;
    description?: string;
    component: ComponentType<WizardStepProps<T>>;
    validation?: ZodSchema;
    isOptional?: boolean;
    canSkip?: boolean;
}

// Wizard configuration
export interface WizardConfig<T extends WizardData> {
    id: string;
    type: string;
    title: string;
    description?: string;
    steps: WizardStep<T>[];
    validation: {
        stepSchemas: Record<string, ZodSchema>;
        finalSchema: ZodSchema;
    };
    persistence?: {
        autoSave?: boolean;
        autoSaveInterval?: number;
        storageKey?: string;
    };
    navigation?: {
        allowSkipSteps?: boolean;
        showProgress?: boolean;
        showStepNumbers?: boolean;
    };
}

// Wizard step props
export interface WizardStepProps<T extends WizardData> {
    data: Partial<T>;
    onUpdate: (updates: Partial<T>) => void;
    onNext: () => void;
    onPrevious: () => void;
    errors: Record<string, string>;
    isLoading: boolean;
    isMobile: boolean;
}

// Wizard hook options
export interface UseWizardOptions<T extends WizardData> {
    config: WizardConfig<T>;
    initialData?: Partial<T>;
    draftId?: string;
    onComplete?: (data: T) => Promise<void>;
    onSaveDraft?: (data: Partial<T>, step: string) => Promise<string>;
    onUpdate?: (data: Partial<T>) => void;
}

// Wizard hook return type
export interface UseWizardReturn<T extends WizardData> {
    // Data
    data: Partial<T>;
    updateData: (updates: Partial<T>) => void;
    resetData: () => void;

    // Navigation
    currentStep: string;
    currentStepIndex: number;
    totalSteps: number;
    progress: number;
    goToStep: (stepId: string) => boolean;
    nextStep: () => Promise<boolean>;
    previousStep: () => boolean;
    canGoNext: boolean;
    canGoPrevious: boolean;

    // Validation
    validateCurrentStep: () => boolean;
    validateAllSteps: () => boolean;
    getStepErrors: (stepId?: string) => Record<string, string>;
    clearErrors: (stepId?: string) => void;

    // Persistence
    saveDraft: () => Promise<string | null>;
    loadDraft: (draftId: string) => Promise<boolean>;
    deleteDraft: (draftId: string) => Promise<boolean>;
    hasDraft: boolean;

    // Completion
    complete: () => Promise<boolean>;
    canComplete: boolean;

    // State
    isLoading: boolean;
    isSaving: boolean;
    isValidating: boolean;
    error: string | null;
}

// Wizard component props
export interface WizardProps<T extends WizardData> {
    config: WizardConfig<T>;
    initialData?: Partial<T>;
    draftId?: string;
    onComplete?: (data: T) => Promise<void>;
    onSaveDraft?: (data: Partial<T>, step: string) => Promise<string>;
    onCancel?: () => void;
    className?: string;

    // UI Options
    showProgress?: boolean;
    showStepNumbers?: boolean;
    enableKeyboardNavigation?: boolean;
    enableMobileOptimizations?: boolean;
}

// Error types
export interface WizardError {
    type: "validation" | "network" | "storage" | "permission";
    message: string;
    field?: string;
    step?: string;
    recoverable: boolean;
    timestamp: Date;
}

export interface ErrorRecoveryStrategy {
    retry: () => void;
    skip: () => void;
    goToStep: (stepId: string) => void;
    saveDraft: () => void;
    reset: () => void;
}

// Validation result
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
    warnings: Record<string, string>;
}

// Navigation props
export interface WizardNavigationProps {
    canGoNext: boolean;
    canGoPrevious: boolean;
    canComplete: boolean;
    isFirstStep: boolean;
    isLastStep: boolean;
    onNext: () => Promise<void>;
    onPrevious: () => void;
    onComplete: () => Promise<void>;
    onSaveDraft: () => Promise<void>;
    onCancel?: () => void;
    isLoading: boolean;
    isSaving: boolean;
    isMobile: boolean;
    enableTouchGestures?: boolean;
    enableKeyboardNavigation?: boolean;
}

// Progress props
export interface WizardProgressProps<T extends WizardData> {
    steps: WizardStep<T>[];
    currentStep: number;
    showStepNumbers?: boolean;
    isMobile: boolean;
}

// Step renderer props
export interface WizardStepRendererProps<T extends WizardData> {
    step: WizardStep<T>;
    data: Partial<T>;
    onUpdate: (updates: Partial<T>) => void;
    onNext: () => void;
    onPrevious: () => void;
    errors: Record<string, string>;
    isLoading: boolean;
    isMobile: boolean;
}