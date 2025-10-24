"use client";

import {
	AlertCircle,
	Check,
	ChevronLeft,
	ChevronRight,
	Save,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

export interface WizardStep<T = Record<string, unknown>> {
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
}

export interface UnifiedWizardProps<T = Record<string, unknown>> {
	title: string;
	description?: string;
	steps: WizardStep<T>[];
	initialData?: T;
	onComplete: (
		data: T,
	) => Promise<{ success: boolean; message?: string; error?: string }>;
	onSaveDraft?: (data: T) => Promise<void>;
	showDraftOption?: boolean;
	className?: string;
}

export function UnifiedWizard<T = Record<string, unknown>>({
	title,
	description,
	steps,
	initialData = {} as T,
	onComplete,
	onSaveDraft,
	showDraftOption = false,
	className,
}: UnifiedWizardProps<T>) {
	const [currentStep, setCurrentStep] = useState(0);
	const [data, setData] = useState<T>(initialData);
	const [errors, setErrors] = useState<Record<string, Record<string, string>>>(
		{},
	);
	const [isLoading, setIsLoading] = useState(false);
	const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

	const currentStepConfig = steps[currentStep];
	const isFirstStep = currentStep === 0;
	const isLastStep = currentStep === steps.length - 1;
	const progress = ((currentStep + 1) / steps.length) * 100;

	const validateStep = useCallback(
		(stepIndex: number, stepData: T) => {
			const step = steps[stepIndex];
			if (!step.validation) return null;

			const stepErrors = step.validation(stepData);
			return stepErrors;
		},
		[steps],
	);

	const handleStepChange = useCallback(
		(stepData: Partial<T>) => {
			setData((prev: T) => ({ ...prev, ...stepData }));

			// Clear errors for current step when data changes
			setErrors((prev) => ({
				...prev,
				[currentStep]: {},
			}));
		},
		[currentStep],
	);

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
	}, [currentStep, data, validateStep, steps.length]);

	const handlePrevious = useCallback(() => {
		setCurrentStep((prev) => Math.max(prev - 1, 0));
	}, []);

	const handleStepClick = useCallback(
		(stepIndex: number) => {
			// Only allow navigation to completed steps or the next step
			if (stepIndex <= currentStep || completedSteps.has(stepIndex - 1)) {
				setCurrentStep(stepIndex);
			}
		},
		[currentStep, completedSteps],
	);

	const handleComplete = useCallback(async () => {
		setIsLoading(true);

		try {
			// Validate all steps
			let hasErrors = false;
			const allErrors: Record<string, Record<string, string>> = {};

			for (let i = 0; i < steps.length; i++) {
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
	}, [data, onComplete, steps, validateStep]);

	const handleSaveDraft = useCallback(async () => {
		if (!onSaveDraft) return;

		setIsLoading(true);
		try {
			await onSaveDraft(data);
			toast.success("Borrador guardado");
		} catch (_error) {
			toast.error("Error al guardar borrador");
		} finally {
			setIsLoading(false);
		}
	}, [data, onSaveDraft]);

	const stepErrors = errors[currentStep] || {};
	const hasStepErrors = Object.keys(stepErrors).length > 0;

	return (
		<div className={cn("max-w-4xl mx-auto space-y-6", className)}>
			{/* Header */}
			<Card className={cn("border-border", secondaryColorClasses.cardHover)}>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-2xl">{title}</CardTitle>
							{description && (
								<p className="text-muted-foreground mt-1">{description}</p>
							)}
						</div>
						<Badge variant="outline" className="text-sm">
							Paso {currentStep + 1} de {steps.length}
						</Badge>
					</div>

					<div className="space-y-2">
						<Progress value={progress} className="h-2" />
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Progreso: {Math.round(progress)}%</span>
							<span>
								{completedSteps.size} de {steps.length} completados
							</span>
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Steps Navigation */}
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
									key={step.id}
									variant={
										isCurrent
											? "default"
											: isCompleted
												? "secondary"
												: "outline"
									}
									size="sm"
									onClick={() => handleStepClick(index)}
									disabled={!isAccessible}
									className={cn(
										"flex items-center gap-2",
										hasErrors && "border-destructive text-destructive",
										!isAccessible && "opacity-50 cursor-not-allowed",
									)}
								>
									{isCompleted ? (
										<Check className="h-4 w-4" />
									) : hasErrors ? (
										<AlertCircle className="h-4 w-4" />
									) : (
										<span className="text-xs">{index + 1}</span>
									)}
									<span className="hidden sm:inline">{step.title}</span>
									{step.optional && (
										<Badge variant="outline" className="text-xs ml-1">
											Opcional
										</Badge>
									)}
								</Button>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Current Step */}
			<Card className={cn("border-border", secondaryColorClasses.cardHover)}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						{currentStepConfig.title}
						{currentStepConfig.optional && (
							<Badge variant="outline" className="text-xs">
								Opcional
							</Badge>
						)}
					</CardTitle>
					{currentStepConfig.description && (
						<p className="text-muted-foreground">
							{currentStepConfig.description}
						</p>
					)}
					{hasStepErrors && (
						<div className="flex items-center gap-2 text-destructive text-sm">
							<AlertCircle className="h-4 w-4" />
							<span>Hay errores en este paso que necesitan ser corregidos</span>
						</div>
					)}
				</CardHeader>
				<CardContent>
					<currentStepConfig.component
						data={data}
						onChange={handleStepChange}
						errors={stepErrors}
					/>
				</CardContent>
			</Card>

			{/* Navigation */}
			<Card className={cn("border-border", secondaryColorClasses.cardHover)}>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<Button
							variant="outline"
							onClick={handlePrevious}
							disabled={isFirstStep || isLoading}
							className="flex items-center gap-2"
						>
							<ChevronLeft className="h-4 w-4" />
							Anterior
						</Button>

						<div className="flex items-center gap-2">
							{showDraftOption && onSaveDraft && (
								<Button
									variant="outline"
									onClick={handleSaveDraft}
									disabled={isLoading}
									className="flex items-center gap-2"
								>
									<Save className="h-4 w-4" />
									Guardar Borrador
								</Button>
							)}

							{isLastStep ? (
								<Button
									onClick={handleComplete}
									disabled={isLoading}
									className="flex items-center gap-2"
								>
									<Check className="h-4 w-4" />
									{isLoading ? "Completando..." : "Completar"}
								</Button>
							) : (
								<Button
									onClick={handleNext}
									disabled={isLoading}
									className="flex items-center gap-2"
								>
									Siguiente
									<ChevronRight className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
