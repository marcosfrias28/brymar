/**
 * Wizard-related types consolidating all wizard DTOs
 */

import type { CreateBlogPostInput } from "./blog";
import type { CreateLandInput } from "./lands";
import type { CreatePropertyInput } from "./properties";
import type { ActionResult, BaseEntity, ContentType, Language } from "./shared";

export type WizardType = "property" | "land" | "blog";
export type WizardStatus = "draft" | "completed" | "published" | "archived";

export type WizardStep = {
	id: string;
	name: string;
	title: string;
	description?: string;
	completed: boolean;
	optional?: boolean;
	data?: Record<string, any>;
};

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

export type CreateWizardDraftInput = {
	type: WizardType;
	title: string;
	description?: string;
	initialData?: Record<string, any>;
};

export type UpdateWizardDraftInput = {
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
};

export type SaveWizardStepInput = {
	draftId: string;
	stepId: string;
	data: Record<string, any>;
	completed?: boolean;
};

export type PublishWizardInput = {
	id: string;
	finalData?: Record<string, any>;
};

export type GenerateAIContentInput = {
	wizardType: WizardType;
	contentType: ContentType;
	baseData: Record<string, any>;
	language?: Language;
	userId?: string;
	prompt?: string; // optional custom prompt
	context?: Record<string, any>;
	previousData?: Record<string, any>;
};

export type AIGeneratedContent = {
	content: Record<string, any>;
	suggestions?: string[];
	confidence?: number;
	model?: string;
};

// Wizard template types
export type WizardTemplate = {
	id: string;
	type: WizardType;
	name: string;
	description: string;
	steps: Omit<WizardStep, "completed" | "data">[];
	defaultData?: Record<string, any>;
	isActive: boolean;
};

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
export type PublishWizardResult = ActionResult<{
	draft: WizardDraft;
	publishedItem: any;
}>;
export type DeleteWizardDraftResult = ActionResult<void>;
export type GenerateAIContentResult = ActionResult<AIGeneratedContent>;
export type GetWizardTemplatesResult = ActionResult<WizardTemplate[]>;
