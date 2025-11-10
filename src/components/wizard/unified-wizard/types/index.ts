export type WizardStep<T extends Record<string, unknown> = Record<string, unknown>> = {
	id: string;
	title: string;
	description?: string;
	component: React.ComponentType<{
		data: T;
		onChange: (data: T) => void;
		onValidate?: () => boolean;
		errors?: Record<string, string>;
	}>;
	validation?: (data: T) => Record<string, string> | null;
	optional?: boolean;
};

export type UnifiedWizardProps<T extends Record<string, unknown> = Record<string, unknown>> = {
	title: string;
	description?: string;
	steps: WizardStep<T>[];
	initialData?: Partial<T>;
	onComplete: (
		data: T
	) => Promise<{ success: boolean; message?: string; error?: string }>;
	onSaveDraft?: (data: T) => Promise<void>;
	showDraftOption?: boolean;
	className?: string;
};
