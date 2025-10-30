import type { ComponentType } from "react";
import type { z } from "zod";

// Base wizard data interface
export type WizardData = {
	id?: string;
	title: string;
	description: string;
	status: "draft" | "published";
	createdAt?: Date;
	updatedAt?: Date;
};

// Property-specific data
export interface PropertyWizardData extends WizardData {
	price: number;
	surface: number;
	propertyType: string;
	bedrooms?: number;
	bathrooms?: number;
	characteristics: string[];
	coordinates?: { lat: number; lng: number };
	address?: {
		street?: string;
		city?: string;
		state?: string;
		zipCode?: string;
	};
	images: Array<{
		id: string;
		url: string;
		filename: string;
		size: number;
		contentType: string;
		width?: number;
		height?: number;
	}>;
}

// Land-specific data
export interface LandWizardData extends WizardData {
	price: number;
	surface: number;
	landType: "commercial" | "residential" | "agricultural" | "beachfront";
	location: string;
	coordinates?: { lat: number; lng: number };
	images: Array<{
		id: string;
		url: string;
		filename: string;
		size: number;
		contentType: string;
		width?: number;
		height?: number;
	}>;
	zoning?: string;
	utilities?: string[];
}

// Blog-specific data
export interface BlogWizardData extends WizardData {
	content: string;
	author: string;
	category: string;
	coverImage?: string;
	tags: string[];
	seoTitle?: string;
	seoDescription?: string;
	readTime?: number;
}

// Wizard step interface
export type WizardStep<T extends WizardData> = {
	id: string;
	title: string;
	description?: string;
	component: ComponentType<WizardStepProps<T>>;
	validationSchema?: string;
	isOptional?: boolean;
	canSkip?: boolean;
};

// Wizard step component props
export type WizardStepProps<T extends WizardData> = {
	data: Partial<T>;
	onUpdate: (updates: Partial<T>) => void;
	onNext: () => void;
	onPrevious: () => void;
	errors?: Record<string, string>;
	isLoading?: boolean;
};

// Validation result interface
export type ValidationResult = {
	isValid: boolean;
	errors: Record<string, string>;
	warnings?: Record<string, string>;
};

// Navigation configuration for consistent UI
export type WizardNavigationConfig = {
	showProgress?: boolean;
	showStepList?: boolean;
	enableKeyboardNavigation?: boolean;
	cancelLabel?: string;
	nextLabel?: string;
	previousLabel?: string;
	completeLabel?: string;
	saveDraftLabel?: string;
	showCancel?: boolean;
	showSaveDraft?: boolean;
};

// Universal wizard configuration
export type WizardConfig<T extends WizardData> = {
	type: "property" | "land" | "blog";
	steps: WizardStep<T>[];
	validationSchemas: Record<
		string,
		(data: unknown) => { success: boolean; errors?: Record<string, string[]> }
	>;
	partialValidationSchemas?: Record<
		string,
		(data: unknown) => { success: boolean; errors?: Record<string, string[]> }
	>;
	previewComponent: ComponentType<{ data: T }>;
	onComplete: (data: T) => Promise<void>;
	onSaveDraft: (data: Partial<T>, stepCompleted: number) => Promise<string>;
	onLoadDraft?: (
		draftId: string
	) => Promise<{ formData: Partial<T>; stepCompleted: number } | null>;
	onDeleteDraft?: (draftId: string) => Promise<void>;
	formSchema: z.ZodSchema<T>;
	defaultValues: Partial<T>;
	navigation?: WizardNavigationConfig;
};

// Universal wizard props
export type UniversalWizardProps<T extends WizardData> = {
	config: WizardConfig<T>;
	initialData?: Partial<T>;
	draftId?: string;
	onUpdate?: (data: Partial<T>) => void;
	onComplete?: (data: T) => void;
	onCancel?: () => void;
};

// Wizard navigation state
export type WizardNavigationState = {
	currentStep: number;
	completedSteps: Set<number>;
	canNavigateToStep: (step: number) => boolean;
	totalSteps: number;
	progress: number;
};

// Error recovery strategies
export type ErrorRecoveryStrategy = {
	retryValidation: () => void;
	skipValidation: () => void;
	resetStep: () => void;
	saveDraftAndContinue: () => void;
	goToStep: (step: number) => void;
};

// Wizard error types
export type WizardErrorType =
	| "validation"
	| "network"
	| "storage"
	| "permission"
	| "unknown";

export type WizardError = {
	type: WizardErrorType;
	message: string;
	step?: number;
	field?: string;
	recoverable: boolean;
	timestamp: Date;
};
