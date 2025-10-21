/**
 * Wizard-related types consolidating all wizard DTOs
 */

import { BaseEntity, ActionResult, Language, ContentType } from "./shared";
import { CreatePropertyInput } from "./properties";
import { CreateLandInput } from "./lands";
import { CreateBlogPostInput } from "./blog";

export type WizardType = "property" | "land" | "blog";
export type WizardStatus = "draft" | "completed" | "published" | "archived";

export interface WizardStep {
    id: string;
    name: string;
    title: string;
    description?: string;
    completed: boolean;
    optional?: boolean;
    data?: Record<string, any>;
}

export interface WizardDraft extends BaseEntity {
    type: WizardType;
    status: WizardStatus;
    title: string;
    description?: string;
    currentStep: number;
    steps: WizardStep[];
    data: Record<string, any>;
    userId: string;
    completedAt?: Date;
    publishedAt?: Date;
}

export interface CreateWizardDraftInput {
    type: WizardType;
    title: string;
    description?: string;
    initialData?: Record<string, any>;
}

export interface UpdateWizardDraftInput {
    id: string;
    title?: string;
    description?: string;
    currentStep?: number;
    data?: Record<string, any>;
    stepData?: {
        stepId: string;
        data: Record<string, any>;
        completed?: boolean;
    };
}

export interface SaveWizardStepInput {
    draftId: string;
    stepId: string;
    data: Record<string, any>;
    completed?: boolean;
}

export interface PublishWizardInput {
    id: string;
    finalData?: Record<string, any>;
}

export interface GenerateAIContentInput {
    wizardType: WizardType;
    contentType: ContentType;
    baseData: Record<string, any>;
    language?: Language;
    userId?: string;
    prompt?: string; // optional custom prompt
    context?: Record<string, any>;
    previousData?: Record<string, any>;
}

export interface AIGeneratedContent {
    content: Record<string, any>;
    suggestions?: string[];
    confidence?: number;
    model?: string;
}

// Wizard template types
export interface WizardTemplate {
    id: string;
    type: WizardType;
    name: string;
    description: string;
    steps: Omit<WizardStep, "completed" | "data">[];
    defaultData?: Record<string, any>;
    isActive: boolean;
}

// Property wizard specific types
export interface PropertyWizardData extends CreatePropertyInput {
    wizardStep?: number;
    aiGenerated?: {
        description?: boolean;
        features?: boolean;
        pricing?: boolean;
    };
}

// Land wizard specific types
export interface LandWizardData extends CreateLandInput {
    wizardStep?: number;
    aiGenerated?: {
        description?: boolean;
        features?: boolean;
        pricing?: boolean;
    };
}

// Blog wizard specific types
export interface BlogWizardData extends CreateBlogPostInput {
    wizardStep?: number;
    aiGenerated?: {
        content?: boolean;
        excerpt?: boolean;
        tags?: boolean;
    };
}

// Action result types
export type CreateWizardDraftResult = ActionResult<WizardDraft>;
export type UpdateWizardDraftResult = ActionResult<WizardDraft>;
export type GetWizardDraftResult = ActionResult<WizardDraft>;
export type SaveWizardStepResult = ActionResult<WizardDraft>;
export type PublishWizardResult = ActionResult<{ draft: WizardDraft; publishedItem: any }>;
export type DeleteWizardDraftResult = ActionResult<void>;
export type GenerateAIContentResult = ActionResult<AIGeneratedContent>;
export type GetWizardTemplatesResult = ActionResult<WizardTemplate[]>;