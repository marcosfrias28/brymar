"use client";

// Responsive Wizard Progress Component

import { AlertCircle, Check, Circle, Dot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { WizardData, WizardProgressProps } from "@/types/wizard-core";

export function WizardProgress<T extends WizardData>({
	steps,
	currentStep,
	showStepNumbers = true,
	isMobile,
	stepValidation,
	onStepClick,
}: WizardProgressProps<T> & {
	stepValidation?: Record<
		number,
		{
			isValid: boolean;
			hasErrors: boolean;
			hasWarnings: boolean;
			errorCount?: number;
		}
	>;
	onStepClick?: (stepIndex: number) => void;
}) {
	const progress =
		steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

	// Mobile compact view with validation indicators
	if (isMobile) {
		const currentStepValidation = stepValidation?.[currentStep];

		return (
			<div
				aria-valuemax={100}
				aria-valuemin={0}
				aria-valuenow={progress}
				className="wizard-progress-mobile"
				role="progressbar"
			>
				{/* Progress bar */}
				<div className="mb-3">
					<div className="mb-1 flex items-center justify-between text-muted-foreground text-xs">
						<span aria-label={`Paso ${currentStep + 1} de ${steps.length}`}>
							Paso {currentStep + 1} de {steps.length}
						</span>
						<span aria-label={`${Math.round(progress)} por ciento completado`}>
							{Math.round(progress)}%
						</span>
					</div>
					<Progress
						aria-label="Progreso general del asistente"
						className="h-2"
						value={progress}
					/>
				</div>

				{/* Current step info with validation */}
				<div className="text-center">
					<div className="mb-1 flex items-center justify-center gap-2">
						<h3 className="font-medium text-sm">{steps[currentStep]?.title}</h3>

						{/* Validation indicators */}
						{currentStepValidation?.hasErrors && (
							<div className="flex items-center gap-1">
								<AlertCircle
									aria-hidden="true"
									className="h-4 w-4 text-red-500"
								/>
								{currentStepValidation.errorCount && (
									<Badge className="h-5 text-xs" variant="destructive">
										{currentStepValidation.errorCount}
									</Badge>
								)}
								<span className="sr-only">
									Este paso tiene {currentStepValidation.errorCount || 1}{" "}
									errores
								</span>
							</div>
						)}

						{currentStepValidation?.hasWarnings &&
							!currentStepValidation.hasErrors && (
								<div className="flex items-center gap-1">
									<AlertCircle
										aria-hidden="true"
										className="h-4 w-4 text-yellow-500"
									/>
									<span className="sr-only">Este paso tiene advertencias</span>
								</div>
							)}

						{currentStepValidation?.isValid &&
							!currentStepValidation.hasErrors && (
								<div className="flex items-center gap-1">
									<Check
										aria-hidden="true"
										className="h-4 w-4 text-green-500"
									/>
									<span className="sr-only">Este paso está completo</span>
								</div>
							)}
					</div>

					{steps[currentStep]?.description && (
						<p className="mt-1 text-muted-foreground text-xs">
							{steps[currentStep].description}
						</p>
					)}
				</div>
			</div>
		);
	}

	// Desktop full view with enhanced accessibility and validation
	return (
		<div
			aria-valuemax={100}
			aria-valuemin={0}
			aria-valuenow={progress}
			className="wizard-progress-desktop"
			role="progressbar"
		>
			{/* Progress bar */}
			<div className="mb-6">
				<Progress
					aria-label="Progreso general del asistente"
					className="h-2"
					value={progress}
				/>
				<div className="mt-1 flex justify-between text-muted-foreground text-xs">
					<span>Progreso</span>
					<span aria-label={`${Math.round(progress)} por ciento completado`}>
						{Math.round(progress)}% completado
					</span>
				</div>
			</div>

			{/* Step indicators with navigation */}
			<div
				aria-label="Pasos del asistente"
				className="relative flex items-center justify-between"
				role="tablist"
			>
				{/* Connection line */}
				<div className="-z-10 absolute top-4 right-0 left-0 h-0.5 bg-border">
					<div
						className="h-full bg-primary transition-all duration-300 ease-in-out"
						style={{ width: `${progress}%` }}
					/>
				</div>

				{steps.map((step, index) => {
					const isCompleted = index < currentStep;
					const isCurrent = index === currentStep;
					const isUpcoming = index > currentStep;
					const validation = stepValidation?.[index];
					const hasErrors = validation?.hasErrors;
					const hasWarnings = validation?.hasWarnings;
					const _isValid = validation?.isValid;

					return (
						<div
							aria-controls={`step-${index}-panel`}
							aria-selected={isCurrent}
							className={cn(
								"relative flex flex-col items-center",
								"min-w-0 flex-1",
								index === 0 && "items-start",
								index === steps.length - 1 && "items-end"
							)}
							key={step.id}
							role="tab"
						>
							{/* Step circle with click handler */}
							<button
								aria-current={isCurrent ? "step" : undefined}
								aria-label={`Paso ${index + 1}: ${step.title}${
									hasErrors
										? " (con errores)"
										: hasWarnings
											? " (con advertencias)"
											: isCompleted
												? " (completado)"
												: isCurrent
													? " (actual)"
													: ""
								}`}
								className={cn(
									"flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200",
									"relative z-10 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20",
									isCompleted &&
										!hasErrors &&
										"border-primary bg-primary text-primary-foreground",
									isCurrent &&
										"scale-110 border-primary bg-background text-primary",
									isUpcoming &&
										"border-muted-foreground/30 text-muted-foreground",
									hasErrors && "border-red-500 bg-red-50 text-red-700",
									hasWarnings &&
										!hasErrors &&
										"border-yellow-500 bg-yellow-50 text-yellow-700",
									onStepClick && "cursor-pointer hover:scale-105",
									!onStepClick && "cursor-default"
								)}
								disabled={!onStepClick}
								onClick={() => onStepClick?.(index)}
								title={`${step.title}${
									step.description ? ` - ${step.description}` : ""
								}`}
							>
								{hasErrors ? (
									<AlertCircle className="h-4 w-4" />
								) : hasWarnings && !isCompleted ? (
									<AlertCircle className="h-4 w-4" />
								) : isCompleted ? (
									<Check className="h-4 w-4" />
								) : showStepNumbers ? (
									<span className="font-medium text-xs">{index + 1}</span>
								) : (
									<Circle className="h-3 w-3" />
								)}
							</button>

							{/* Step label */}
							<div
								className={cn(
									"mt-2 max-w-24 text-center",
									index === 0 && "text-left",
									index === steps.length - 1 && "text-right"
								)}
							>
								<div
									className={cn(
										"font-medium text-xs transition-colors",
										hasErrors && "text-red-600",
										hasWarnings && !hasErrors && "text-yellow-600",
										isCompleted && !hasErrors && "text-primary",
										isCurrent &&
											!hasErrors &&
											!hasWarnings &&
											"text-foreground",
										isUpcoming &&
											!hasErrors &&
											!hasWarnings &&
											"text-muted-foreground"
									)}
								>
									{step.title}
								</div>

								{step.description && (
									<div className="mt-1 line-clamp-2 text-muted-foreground text-xs">
										{step.description}
									</div>
								)}

								{/* Validation indicators */}
								{hasErrors && validation?.errorCount && (
									<Badge className="mt-1 text-xs" variant="destructive">
										{validation.errorCount} errores
									</Badge>
								)}

								{/* Optional/skippable indicator */}
								{(step.isOptional || step.canSkip) && (
									<div className="mt-1 text-muted-foreground text-xs">
										<span className="inline-flex items-center gap-1">
											<Dot className="h-3 w-3" />
											{step.isOptional ? "Opcional" : "Omitible"}
										</span>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

// Compact progress indicator for tight spaces
export function WizardProgressCompact<T extends WizardData>({
	steps,
	currentStep,
	showStepNumbers = false,
}: Omit<WizardProgressProps<T>, "isMobile">) {
	const progress =
		steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

	return (
		<div className="wizard-progress-compact flex items-center gap-3">
			<div className="flex items-center gap-1">
				{steps.map((_, index) => (
					<div
						className={cn(
							"h-2 w-2 rounded-full transition-all duration-200",
							index < currentStep && "bg-primary",
							index === currentStep && "scale-125 bg-primary",
							index > currentStep && "bg-muted-foreground/30"
						)}
						key={index}
					/>
				))}
			</div>

			<div className="text-muted-foreground text-xs">
				{showStepNumbers
					? `${currentStep + 1}/${steps.length}`
					: `${Math.round(progress)}%`}
			</div>
		</div>
	);
}

// Circular progress indicator
export function WizardProgressCircular<T extends WizardData>({
	steps,
	currentStep,
	size = 60,
}: Omit<WizardProgressProps<T>, "isMobile" | "showStepNumbers"> & {
	size?: number;
}) {
	const progress =
		steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;
	const circumference = 2 * Math.PI * (size / 2 - 4);
	const strokeDashoffset = circumference - (progress / 100) * circumference;

	return (
		<div className="wizard-progress-circular relative inline-flex items-center justify-center">
			<svg className="-rotate-90 transform" height={size} width={size}>
				{/* Background circle */}
				<circle
					className="text-muted-foreground/20"
					cx={size / 2}
					cy={size / 2}
					fill="none"
					r={size / 2 - 4}
					stroke="currentColor"
					strokeWidth="2"
				/>

				{/* Progress circle */}
				<circle
					className="text-primary transition-all duration-300 ease-in-out"
					cx={size / 2}
					cy={size / 2}
					fill="none"
					r={size / 2 - 4}
					stroke="currentColor"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					strokeWidth="2"
				/>
			</svg>

			{/* Center content */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="text-center">
					<div className="font-medium text-xs">
						{currentStep + 1}/{steps.length}
					</div>
					<div className="text-muted-foreground text-xs">
						{Math.round(progress)}%
					</div>
				</div>
			</div>
		</div>
	);
}

// Progress hook for external components
export function useWizardProgress(currentStep: number, totalSteps: number) {
	const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
	const isComplete = currentStep >= totalSteps - 1;
	const stepsRemaining = Math.max(0, totalSteps - currentStep - 1);

	return {
		progress,
		isComplete,
		stepsRemaining,
		currentStep: currentStep + 1, // 1-based for display
		totalSteps,
	};
}
