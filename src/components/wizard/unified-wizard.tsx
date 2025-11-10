"use client";

import {
	AlertCircle,
	Check,
	ChevronLeft,
	ChevronRight,
	Save,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/index";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export type WizardStep<
	T extends Record<string, unknown> = Record<string, unknown>,
> = {
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

export type UnifiedWizardProps<
	T extends Record<string, unknown> = Record<string, unknown>,
> = {
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

// Custom hooks for wizard logic
function useWizardState<T extends Record<string, unknown>>(initialData: T) {
	const [currentStep, setCurrentStep] = useState(0);
	const [data, setData] = useState<T>(initialData);
	const [errors, setErrors] = useState<Record<string, Record<string, string>>>(
		{}
	);
	const [isLoading, setIsLoading] = useState(false);
	const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

	// Merge initialData when component mounts
	useEffect(() => {
		if (initialData) {
			setData((prev) => ({ ...prev, ...initialData }));
		}
	}, [initialData]);

	return {
		currentStep,
		setData,
		setErrors,
		setIsLoading,
		setCompletedSteps,
		setCurrentStep,
		data,
		errors,
		isLoading,
		completedSteps,
	};
}

// Real-time progress calculation hook
function useRealTimeProgress<T extends Record<string, unknown>>(
	steps: WizardStep<T>[],
	data: T,
	validateStep: (
		stepIndex: number,
		stepData: T
	) => Record<string, string> | null
) {
	const [fieldProgress, setFieldProgress] = useState<Record<number, number>>(
		{}
	);

	// Calculate field completion progress for each step
	useEffect(() => {
		const newProgress: Record<number, number> = {};

		steps.forEach((step, index) => {
			const stepErrors = validateStep(index, data);
			const stepData = data as Record<string, unknown>;

			// Count total relevant fields and filled fields for this step
			const totalFields = countRelevantFields(step.id, stepData);
			const filledFields = countFilledFields(step.id, stepData, stepErrors);

			// Calculate percentage (0-100) for this step
			newProgress[index] =
				totalFields > 0
					? Math.round(
							(filledFields / totalFields) * PROGRESS_PERCENTAGE_MULTIPLIER
						)
					: 0;
		});

		setFieldProgress(newProgress);
	}, [data, steps, validateStep]);

	// Calculate overall progress as average of step progress
	const overallProgress = Math.round(
		Object.values(fieldProgress).reduce((sum, progress) => sum + progress, 0) /
			steps.length
	);

	return { overallProgress, fieldProgress };
}

// Constants for progress calculation
const PROGRESS_PERCENTAGE_MULTIPLIER = 100;

// Helper functions to count fields for different step types
function countRelevantFields(
	stepId: string,
	data: Record<string, unknown>
): number {
	switch (stepId) {
		case "general":
			return countGeneralFields(data);
		case "location":
			return countLocationFields(data);
		case "media":
			return countMediaFields(data);
		default:
			return 0;
	}
}

function countFilledFields(
	stepId: string,
	data: Record<string, unknown>,
	errors: Record<string, string> | null
): number {
	switch (stepId) {
		case "general":
			return countFilledGeneralFields(data, errors);
		case "location":
			return countFilledLocationFields(data, errors);
		case "media":
			return countFilledMediaFields(data);
		default:
			return 0;
	}
}

function countGeneralFields(data: Record<string, unknown>): number {
	let count = 0;
	if (data.title !== undefined) {
		count += 1;
	}
	if (data.description !== undefined) {
		count += 1;
	}
	if (data.price !== undefined) {
		count += 1;
	}
	if (data.surface !== undefined) {
		count += 1;
	}
	if (data.propertyType !== undefined) {
		count += 1;
	}
	if (data.bedrooms !== undefined) {
		count += 1;
	}
	if (data.bathrooms !== undefined) {
		count += 1;
	}
	if (data.characteristics !== undefined) {
		count += 1;
	}
	return count;
}

function countFilledGeneralFields(
	data: Record<string, unknown>,
	errors: Record<string, string> | null
): number {
	const filled =
		countStringFields(data, ["title", "description"]) +
		countNumberFields(data, ["price", "surface", "bedrooms", "bathrooms"]) +
		countEnumFields(data, ["propertyType"]) +
		countArrayFields(data, ["characteristics"]);

	// Subtract fields with errors
	const errorCount = errors ? Object.keys(errors).length : 0;
	return Math.max(0, filled - errorCount);
}

function countStringFields(
	data: Record<string, unknown>,
	fieldNames: string[]
): number {
	return fieldNames.filter((name) => {
		const value = data[name];
		return typeof value === "string" && value.trim().length > 0;
	}).length;
}

function countNumberFields(
	data: Record<string, unknown>,
	fieldNames: string[]
): number {
	return fieldNames.filter((name) => {
		const value = data[name];
		return typeof value === "number" && value > 0;
	}).length;
}

function countEnumFields(
	data: Record<string, unknown>,
	fieldNames: string[]
): number {
	return fieldNames.filter(
		(name) => data[name] !== undefined && data[name] !== null
	).length;
}

function countArrayFields(
	data: Record<string, unknown>,
	fieldNames: string[]
): number {
	return fieldNames.filter((name) => {
		const value = data[name];
		return Array.isArray(value) && value.length > 0;
	}).length;
}

function countLocationFields(data: Record<string, unknown>): number {
	let count = 0;
	if (typeof data.address === "object" && data.address !== null) {
		const address = data.address as Record<string, unknown>;
		if (address.street !== undefined) {
			count += 1;
		}
		if (address.city !== undefined) {
			count += 1;
		}
		if (address.state !== undefined) {
			count += 1;
		}
		if (address.country !== undefined) {
			count += 1;
		}
		if (address.postalCode !== undefined) {
			count += 1;
		}
	}
	if (typeof data.coordinates === "object" && data.coordinates !== null) {
		const coordinates = data.coordinates as Record<string, unknown>;
		if (coordinates.lat !== undefined) {
			count += 1;
		}
		if (coordinates.lng !== undefined) {
			count += 1;
		}
	}
	return count;
}

function countFilledLocationFields(
	data: Record<string, unknown>,
	errors: Record<string, string> | null
): number {
	const filled = countAddressFields(data) + countCoordinatesFields(data);

	// Subtract fields with errors
	const errorCount = errors ? Object.keys(errors).length : 0;
	return Math.max(0, filled - errorCount);
}

function countAddressFields(data: Record<string, unknown>): number {
	if (typeof data.address !== "object" || data.address === null) {
		return 0;
	}

	const address = data.address as Record<string, unknown>;
	const addressFields = ["street", "city", "state", "country", "postalCode"];

	return addressFields.filter((field) => {
		const value = address[field];
		return typeof value === "string" && value.trim().length > 0;
	}).length;
}

function countCoordinatesFields(data: Record<string, unknown>): number {
	if (typeof data.coordinates !== "object" || data.coordinates === null) {
		return 0;
	}

	const coordinates = data.coordinates as Record<string, unknown>;
	let filled = 0;

	if (typeof coordinates.lat === "number" && coordinates.lat !== 0) {
		filled += 1;
	}
	if (typeof coordinates.lng === "number" && coordinates.lng !== 0) {
		filled += 1;
	}

	return filled;
}

function countMediaFields(data: Record<string, unknown>): number {
	let count = 0;
	if (data.images !== undefined) {
		count += 1;
	}
	if (data.videos !== undefined) {
		count += 1;
	}
	return count;
}

function countFilledMediaFields(data: Record<string, unknown>): number {
	let filled = 0;
	if (Array.isArray(data.images) && data.images.length > 0) {
		filled += 1;
	}
	if (Array.isArray(data.videos) && data.videos.length > 0) {
		filled += 1;
	}
	return filled;
}
function useWizardValidation<T extends Record<string, unknown>>(
	steps: WizardStep<T>[]
) {
	return useCallback(
		(stepIndex: number, stepData: T) => {
			const step = steps[stepIndex];
			if (!step.validation) {
				return null;
			}

			const stepErrors = step.validation(stepData);
			return stepErrors;
		},
		[steps]
	);
}

// Step change handler
function useStepChangeHandler<T extends Record<string, unknown>>(
	currentStep: number,
	setData: React.Dispatch<React.SetStateAction<T>>,
	setErrors: React.Dispatch<
		React.SetStateAction<Record<string, Record<string, string>>>
	>
) {
	return useCallback(
		(stepData: Partial<T>) => {
			setData((prev: T) => ({ ...prev, ...stepData }));

			// Clear errors for current step when data changes
			setErrors((prev) => ({
				...prev,
				[currentStep]: {},
			}));
		},
		[currentStep, setData, setErrors]
	);
}

// Navigation handlers
type NavigationHandlersParams<T extends Record<string, unknown>> = {
	steps: WizardStep<T>[];
	currentStep: number;
	data: T;
	validateStep: (
		stepIndex: number,
		stepData: T
	) => Record<string, string> | null;
	setErrors: React.Dispatch<
		React.SetStateAction<Record<string, Record<string, string>>>
	>;
	setCompletedSteps: React.Dispatch<React.SetStateAction<Set<number>>>;
	setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
	completedSteps: Set<number>;
};

function useNavigationHandlers<T extends Record<string, unknown>>({
	steps,
	currentStep,
	data,
	validateStep,
	setErrors,
	setCompletedSteps,
	setCurrentStep,
	completedSteps,
}: NavigationHandlersParams<T>) {
	const handleNext = useCallback(() => {
		const stepErrors = validateStep(currentStep, data);

		if (stepErrors && Object.keys(stepErrors).length > 0) {
			setErrors((prev) => ({
				...prev,
				[currentStep]: stepErrors,
			}));
			toast.error("Por favor corrige los errores antes de continuar");
			return;
		}

		setCompletedSteps((prev) => new Set([...prev, currentStep]));
		setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
	}, [
		currentStep,
		data,
		validateStep,
		steps.length,
		setErrors,
		setCompletedSteps,
		setCurrentStep,
	]);

	const handlePrevious = useCallback(() => {
		setCurrentStep((prev) => Math.max(prev - 1, 0));
	}, [setCurrentStep]);

	const handleStepClick = useCallback(
		(stepIndex: number) => {
			// Only allow navigation to completed steps or the next step
			if (stepIndex <= currentStep || completedSteps.has(stepIndex - 1)) {
				setCurrentStep(stepIndex);
			}
		},
		[currentStep, completedSteps, setCurrentStep]
	);

	return { handleNext, handlePrevious, handleStepClick };
}

// Completion handlers
type CompletionHandlersParams<T extends Record<string, unknown>> = {
	data: T;
	steps: WizardStep<T>[];
	validateStep: (
		stepIndex: number,
		stepData: T
	) => Record<string, string> | null;
	setErrors: React.Dispatch<
		React.SetStateAction<Record<string, Record<string, string>>>
	>;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	onComplete: (
		wizardData: T
	) => Promise<{ success: boolean; message?: string; error?: string }>;
	onSaveDraft?: (wizardData: T) => Promise<void>;
};

function useCompletionHandlers<T extends Record<string, unknown>>({
	data,
	steps,
	validateStep,
	setErrors,
	setIsLoading,
	onComplete,
	onSaveDraft,
}: CompletionHandlersParams<T>) {
	const handleComplete = useCallback(async () => {
		setIsLoading(true);

		try {
			// Validate all steps
			let hasErrors = false;
			const allErrors: Record<string, Record<string, string>> = {};

			for (let i = 0; i < steps.length; i += 1) {
				const stepErrors = validateStep(i, data);
				if (stepErrors && Object.keys(stepErrors).length > 0) {
					allErrors[i] = stepErrors;
					hasErrors = true;
				}
			}

			if (hasErrors) {
				setErrors(allErrors);
				toast.error("Por favor corrige todos los errores antes de completar");
				return;
			}

			const result = await onComplete(data);

			if (result.success) {
				toast.success(result.message || "¡Completado exitosamente!");
			} else {
				toast.error(result.error || "Error al completar");
			}
		} catch (_error) {
			toast.error("Error inesperado al completar");
		} finally {
			setIsLoading(false);
		}
	}, [data, onComplete, steps, validateStep, setErrors, setIsLoading]);

	const handleSaveDraft = useCallback(async () => {
		if (!onSaveDraft) {
			return;
		}

		setIsLoading(true);
		try {
			await onSaveDraft(data);
			toast.success("Borrador guardado");
		} catch (_error) {
			toast.error("Error al guardar borrador");
		} finally {
			setIsLoading(false);
		}
	}, [data, onSaveDraft, setIsLoading]);

	return { handleComplete, handleSaveDraft };
}

// Header component
function WizardHeader({
	title,
	description,
	currentStep,
	steps,
	completedSteps,
	overallProgress,
}: {
	title: string;
	description?: string;
	currentStep: number;
	steps: WizardStep[];
	completedSteps: Set<number>;
	overallProgress: number;
}) {
	return (
		<Card className={cn("border-border", secondaryColorClasses.cardHover)}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-2xl">{title}</CardTitle>
						{description && (
							<p className="mt-1 text-muted-foreground">{description}</p>
						)}
					</div>
					<Badge className="text-sm" variant="outline">
						Paso {currentStep + 1} de {steps.length}
					</Badge>
				</div>

				<div className="space-y-2">
					<Progress className="h-2" value={overallProgress} />
					<div className="flex justify-between text-muted-foreground text-xs">
						<span>Progreso: {Math.round(overallProgress)}%</span>
						<span>
							{completedSteps.size} de {steps.length} completados
						</span>
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}

// Steps navigation component
function WizardStepsNavigation<T extends Record<string, unknown>>({
	steps,
	currentStep,
	completedSteps,
	errors,
	onStepClick,
}: {
	steps: WizardStep<T>[];
	currentStep: number;
	completedSteps: Set<number>;
	errors: Record<string, Record<string, string>>;
	onStepClick: (index: number) => void;
}) {
	const getButtonVariant = (isCurrent: boolean, isCompleted: boolean) => {
		if (isCurrent) {
			return "default";
		}
		if (isCompleted) {
			return "secondary";
		}
		return "outline";
	};

	const getStepIcon = (
		isCompleted: boolean,
		hasErrors: boolean,
		index: number
	) => {
		if (isCompleted) {
			return <Check className="h-4 w-4" />;
		}
		if (hasErrors) {
			return <AlertCircle className="h-4 w-4" />;
		}
		return <span className="text-xs">{index + 1}</span>;
	};

	return (
		<Card className={cn("border-border", secondaryColorClasses.cardHover)}>
			<CardContent className="p-4">
				<div className="flex flex-wrap gap-2">
					{steps.map((step, index) => {
						const isCompleted = completedSteps.has(index);
						const isCurrent = index === currentStep;
						const isAccessible =
							index <= currentStep || completedSteps.has(index - 1);
						const hasErrors =
							errors[index] && Object.keys(errors[index]).length > 0;

						return (
							<Button
								className={cn(
									"flex items-center gap-2",
									hasErrors && "border-destructive text-destructive",
									!isAccessible && "cursor-not-allowed opacity-50"
								)}
								disabled={!isAccessible}
								key={step.id}
								onClick={() => onStepClick(index)}
								size="sm"
								variant={getButtonVariant(isCurrent, isCompleted)}
							>
								{getStepIcon(isCompleted, hasErrors, index)}
								<span className="hidden sm:inline">{step.title}</span>
								{step.optional && (
									<Badge className="ml-1 text-xs" variant="outline">
										Opcional
									</Badge>
								)}
							</Button>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

// Current step component
function WizardCurrentStep<T extends Record<string, unknown>>({
	step,
	data,
	errors,
	onChange,
}: {
	step: WizardStep<T>;
	data: T;
	errors: Record<string, string>;
	onChange: (data: Partial<T>) => void;
}) {
	const hasStepErrors = Object.keys(errors).length > 0;

	return (
		<Card className={cn("border-border", secondaryColorClasses.cardHover)}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{step.title}
					{step.optional && (
						<Badge className="text-xs" variant="outline">
							Opcional
						</Badge>
					)}
				</CardTitle>
				{step.description && (
					<p className="text-muted-foreground">{step.description}</p>
				)}
				{hasStepErrors && (
					<div className="flex items-center gap-2 text-destructive text-sm">
						<AlertCircle className="h-4 w-4" />
						<span>Hay errores en este paso que necesitan ser corregidos</span>
					</div>
				)}
			</CardHeader>
			<CardContent>
				<step.component data={data} errors={errors} onChange={onChange} />
			</CardContent>
		</Card>
	);
}

// Navigation component
function WizardNavigation({
	isFirstStep,
	isLastStep,
	isLoading,
	showDraftOption,
	onPrevious,
	onNext,
	onComplete,
	onSaveDraft,
}: {
	isFirstStep: boolean;
	isLastStep: boolean;
	isLoading: boolean;
	showDraftOption: boolean;
	onPrevious: () => void;
	onNext: () => void;
	onComplete: () => void;
	onSaveDraft?: () => void;
}) {
	return (
		<Card className={cn("border-border", secondaryColorClasses.cardHover)}>
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<Button
						className="flex items-center gap-2"
						disabled={isFirstStep || isLoading}
						onClick={onPrevious}
						variant="outline"
					>
						<ChevronLeft className="h-4 w-4" />
						Anterior
					</Button>

					<div className="flex items-center gap-2">
						{showDraftOption && onSaveDraft && (
							<Button
								className="flex items-center gap-2"
								disabled={isLoading}
								onClick={onSaveDraft}
								variant="outline"
							>
								<Save className="h-4 w-4" />
								Guardar Borrador
							</Button>
						)}

						{isLastStep ? (
							<Button
								className="flex items-center gap-2"
								disabled={isLoading}
								onClick={onComplete}
							>
								<Check className="h-4 w-4" />
								{isLoading ? "Completando..." : "Completar"}
							</Button>
						) : (
							<Button
								className="flex items-center gap-2"
								disabled={isLoading}
								onClick={onNext}
							>
								Siguiente
								<ChevronRight className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// Main wizard component logic
function useWizardLogic<T extends Record<string, unknown>>(
	steps: WizardStep<T>[],
	initialData: T,
	onComplete: (
		wizardData: T
	) => Promise<{ success: boolean; message?: string; error?: string }>,
	onSaveDraft?: (wizardData: T) => Promise<void>
) {
	const wizardState = useWizardState(initialData as T);
	const {
		currentStep,
		data,
		errors,
		isLoading,
		completedSteps,
		setData,
		setErrors,
		setIsLoading,
		setCompletedSteps,
		setCurrentStep,
	} = wizardState;

	const validateStep = useWizardValidation(steps);

	// Add real-time progress tracking
	const { overallProgress, fieldProgress } = useRealTimeProgress(
		steps,
		data,
		validateStep
	);

	const wizardHandlers = useWizardHandlers({
		steps,
		currentStep,
		data,
		setData,
		setErrors,
		setCompletedSteps,
		setCurrentStep,
		completedSteps,
		setIsLoading,
		onComplete,
		onSaveDraft,
	});

	return {
		currentStep,
		data,
		errors,
		isLoading,
		completedSteps,
		overallProgress,
		fieldProgress,
		...wizardHandlers,
	};
}

// Consolidated wizard handlers
type WizardHandlersParams<T extends Record<string, unknown>> = {
	steps: WizardStep<T>[];
	currentStep: number;
	data: T;
	setData: React.Dispatch<React.SetStateAction<T>>;
	setErrors: React.Dispatch<
		React.SetStateAction<Record<string, Record<string, string>>>
	>;
	setCompletedSteps: React.Dispatch<React.SetStateAction<Set<number>>>;
	setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
	completedSteps: Set<number>;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	onComplete: (
		wizardData: T
	) => Promise<{ success: boolean; message?: string; error?: string }>;
	onSaveDraft?: (wizardData: T) => Promise<void>;
};

function useWizardHandlers<T extends Record<string, unknown>>({
	steps,
	currentStep,
	data,
	setData,
	setErrors,
	setCompletedSteps,
	setCurrentStep,
	completedSteps,
	setIsLoading,
	onComplete,
	onSaveDraft,
}: WizardHandlersParams<T>) {
	const validateStep = useWizardValidation(steps);
	const handleStepChange = useStepChangeHandler(
		currentStep,
		setData,
		setErrors
	);

	const navigationHandlers = useNavigationHandlers({
		steps,
		currentStep,
		data,
		validateStep,
		setErrors,
		setCompletedSteps,
		setCurrentStep,
		completedSteps,
	});

	const completionHandlers = useCompletionHandlers({
		data,
		steps,
		validateStep,
		setErrors,
		setIsLoading,
		onComplete,
		onSaveDraft,
	});

	return {
		handleStepChange,
		...navigationHandlers,
		...completionHandlers,
	};
}

export function UnifiedWizard<T extends Record<string, unknown>>({
	title,
	description,
	steps,
	initialData = {} as T,
	onComplete,
	onSaveDraft,
	showDraftOption = false,
	className,
}: UnifiedWizardProps<T>) {
	const {
		currentStep,
		data,
		errors,
		isLoading,
		completedSteps,
		overallProgress,
		handleStepChange,
		handleNext,
		handlePrevious,
		handleStepClick,
		handleComplete,
		handleSaveDraft,
	} = useWizardLogic(steps, initialData as T, onComplete, onSaveDraft);

	const currentStepConfig = steps[currentStep];
	const isFirstStep = currentStep === 0;
	const isLastStep = currentStep === steps.length - 1;
	const stepErrors = errors[currentStep] || {};

	return (
		<div className={cn("mx-auto max-w-4xl space-y-6", className)}>
			<WizardHeader
				completedSteps={completedSteps}
				currentStep={currentStep}
				description={description}
				overallProgress={overallProgress}
				steps={steps}
				title={title}
			/>

			<WizardStepsNavigation
				completedSteps={completedSteps}
				currentStep={currentStep}
				errors={errors}
				onStepClick={handleStepClick}
				steps={steps}
			/>

			<WizardCurrentStep
				data={data}
				errors={stepErrors}
				onChange={handleStepChange}
				step={currentStepConfig}
			/>

			<WizardNavigation
				isFirstStep={isFirstStep}
				isLastStep={isLastStep}
				isLoading={isLoading}
				onComplete={handleComplete}
				onNext={handleNext}
				onPrevious={handlePrevious}
				onSaveDraft={onSaveDraft ? handleSaveDraft : undefined}
				showDraftOption={showDraftOption}
			/>
		</div>
	);
}

export { UnifiedWizard } from "./unified-wizard";
