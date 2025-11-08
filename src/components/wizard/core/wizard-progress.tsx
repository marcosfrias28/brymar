"use client";

// Responsive Wizard Progress Component

import { AlertCircle, Check, Circle, Dot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/index";
import type {
	WizardData,
	WizardProgressProps,
	WizardStep,
} from "@/types/wizard-core";

// Constants for magic numbers
const PROGRESS_PERCENTAGE_MULTIPLIER = 100;
const STEP_INDICATOR_SIZE = 8;
const STEP_ICON_SIZE = 4;
const STEP_LABEL_MAX_WIDTH = 24;
const PROGRESS_BAR_HEIGHT = 2;
const CIRCLE_STROKE_OFFSET = 4;

// Validation status component
function ValidationStatus({
	validation,
}: {
	validation?: {
		isValid: boolean;
		hasErrors: boolean;
		hasWarnings: boolean;
		errorCount?: number;
	};
}) {
	if (!validation) {
		return null;
	}

	if (validation.hasErrors) {
		return (
			<div className="flex items-center gap-1">
				<AlertCircle
					aria-hidden="true"
					className={`h-${STEP_ICON_SIZE} w-${STEP_ICON_SIZE} text-red-500`}
				/>
				{validation.errorCount && (
					<Badge className="h-5 text-xs" variant="destructive">
						{validation.errorCount}
					</Badge>
				)}
				<span className="sr-only">
					Este paso tiene {validation.errorCount || 1} errores
				</span>
			</div>
		);
	}

	if (validation.hasWarnings) {
		return (
			<div className="flex items-center gap-1">
				<AlertCircle
					aria-hidden="true"
					className={`h-${STEP_ICON_SIZE} w-${STEP_ICON_SIZE} text-yellow-500`}
				/>
				<span className="sr-only">Este paso tiene advertencias</span>
			</div>
		);
	}

	if (validation.isValid) {
		return (
			<div className="flex items-center gap-1">
				<Check
					aria-hidden="true"
					className={`h-${STEP_ICON_SIZE} w-${STEP_ICON_SIZE} text-green-500`}
				/>
				<span className="sr-only">Este paso está completo</span>
			</div>
		);
	}

	return null;
}

// Step icon component
function StepIcon({
	hasErrors,
	hasWarnings,
	isCompleted,
	showStepNumbers,
	index,
}: {
	hasErrors: boolean;
	hasWarnings: boolean;
	isCompleted: boolean;
	showStepNumbers: boolean;
	index: number;
}) {
	if (hasErrors) {
		return (
			<AlertCircle className={`h-${STEP_ICON_SIZE} w-${STEP_ICON_SIZE}`} />
		);
	}
	if (hasWarnings && !isCompleted) {
		return (
			<AlertCircle className={`h-${STEP_ICON_SIZE} w-${STEP_ICON_SIZE}`} />
		);
	}
	if (isCompleted) {
		return <Check className={`h-${STEP_ICON_SIZE} w-${STEP_ICON_SIZE}`} />;
	}
	if (showStepNumbers) {
		return <span className="font-medium text-xs">{index + 1}</span>;
	}
	return <Circle className="h-3 w-3" />;
}

// Mobile progress component
function MobileWizardProgress<T extends WizardData>({
	steps,
	currentStep,
	stepValidation,
}: {
	steps: WizardStep<T>[];
	currentStep: number;
	stepValidation?: Record<
		number,
		{
			isValid: boolean;
			hasErrors: boolean;
			hasWarnings: boolean;
			errorCount?: number;
		}
	>;
}) {
	const progress =
		steps.length > 0
			? ((currentStep + 1) / steps.length) * PROGRESS_PERCENTAGE_MULTIPLIER
			: 0;
	const currentStepValidation = stepValidation?.[currentStep];

	return (
		<div
			aria-valuemax={PROGRESS_PERCENTAGE_MULTIPLIER}
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
					className={`h-${PROGRESS_BAR_HEIGHT}`}
					value={progress}
				/>
			</div>

			{/* Current step info with validation */}
			<div className="text-center">
				<div className="mb-1 flex items-center justify-center gap-2">
					<h3 className="font-medium text-sm">{steps[currentStep]?.title}</h3>
					<ValidationStatus validation={currentStepValidation} />
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

// Step content component for label and descriptions
function StepContent<T extends WizardData>({
	step,
	hasErrors,
	validation,
	getTextClasses,
}: {
	step: WizardStep<T>;
	hasErrors: boolean;
	validation?: {
		isValid: boolean;
		hasErrors: boolean;
		hasWarnings: boolean;
		errorCount?: number;
	};
	getTextClasses: () => string;
}) {
	return (
		<div className={`mt-2 max-w-${STEP_LABEL_MAX_WIDTH} text-center`}>
			<div className={getTextClasses()}>{step.title}</div>

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
	);
}

// Helper functions for StepIndicator
function useStepState(
	index: number,
	currentStep: number,
	validation?: {
		isValid: boolean;
		hasErrors: boolean;
		hasWarnings: boolean;
		errorCount?: number;
	}
) {
	const isCompleted = index < currentStep;
	const isCurrent = index === currentStep;
	const isUpcoming = index > currentStep;
	const hasErrors = validation?.hasErrors ?? false;
	const hasWarnings = validation?.hasWarnings ?? false;

	return { isCompleted, isCurrent, isUpcoming, hasErrors, hasWarnings };
}

function useStepAriaLabel<T extends WizardData>(
	index: number,
	step: WizardStep<T>,
	state: {
		isCompleted: boolean;
		isCurrent: boolean;
		hasErrors: boolean;
		hasWarnings: boolean;
	}
) {
	const { isCompleted, isCurrent, hasErrors, hasWarnings } = state;
	const base = `Paso ${index + 1}: ${step.title}`;

	if (hasErrors) {
		return `${base} (con errores)`;
	}
	if (hasWarnings) {
		return `${base} (con advertencias)`;
	}
	if (isCompleted) {
		return `${base} (completado)`;
	}
	if (isCurrent) {
		return `${base} (actual)`;
	}
	return base;
}

function useStepClasses(
	state: {
		isCompleted: boolean;
		isCurrent: boolean;
		isUpcoming: boolean;
		hasErrors: boolean;
		hasWarnings: boolean;
	},
	onStepClick?: (stepIndex: number) => void
) {
	const { isCompleted, isCurrent, isUpcoming, hasErrors, hasWarnings } = state;

	const getButtonClasses = () =>
		cn(
			`flex h-${STEP_INDICATOR_SIZE} w-${STEP_INDICATOR_SIZE} items-center justify-center rounded-full border-2 transition-all duration-200`,
			"relative z-10 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20",
			isCompleted &&
				!hasErrors &&
				"border-primary bg-primary text-primary-foreground",
			isCurrent && "scale-110 border-primary bg-background text-primary",
			isUpcoming && "border-muted-foreground/30 text-muted-foreground",
			hasErrors && "border-red-500 bg-red-50 text-red-700",
			hasWarnings &&
				!hasErrors &&
				"border-yellow-500 bg-yellow-50 text-yellow-700",
			onStepClick && "cursor-pointer hover:scale-105",
			!onStepClick && "cursor-default"
		);

	const getTextClasses = () =>
		cn(
			"font-medium text-xs transition-colors",
			hasErrors && "text-red-600",
			hasWarnings && !hasErrors && "text-yellow-600",
			isCompleted && !hasErrors && "text-primary",
			isCurrent && !hasErrors && !hasWarnings && "text-foreground",
			isUpcoming && !hasErrors && !hasWarnings && "text-muted-foreground"
		);

	return { getButtonClasses, getTextClasses };
}

// Individual step indicator for desktop view
function StepIndicator<T extends WizardData>({
	step,
	index,
	currentStep,
	validation,
	showStepNumbers,
	onStepClick,
}: {
	step: WizardStep<T>;
	index: number;
	currentStep: number;
	validation?: {
		isValid: boolean;
		hasErrors: boolean;
		hasWarnings: boolean;
		errorCount?: number;
	};
	showStepNumbers: boolean;
	onStepClick?: (stepIndex: number) => void;
}) {
	const state = useStepState(index, currentStep, validation);
	const ariaLabel = useStepAriaLabel(index, step, state);
	const { getButtonClasses, getTextClasses } = useStepClasses(
		state,
		onStepClick
	);

	return (
		<div
			aria-controls={`step-${index}-panel`}
			aria-selected={state.isCurrent}
			className={cn("relative flex flex-col items-center", "min-w-0 flex-1")}
			role="tab"
			tabIndex={onStepClick ? 0 : -1}
		>
			{/* Step circle with click handler */}
			<button
				aria-current={state.isCurrent ? "step" : undefined}
				aria-label={ariaLabel}
				className={getButtonClasses()}
				disabled={!onStepClick}
				onClick={() => onStepClick?.(index)}
				title={`${step.title}${step.description ? ` - ${step.description}` : ""}`}
				type="button"
			>
				<StepIcon
					hasErrors={state.hasErrors}
					hasWarnings={state.hasWarnings}
					index={index}
					isCompleted={state.isCompleted}
					showStepNumbers={showStepNumbers}
				/>
			</button>

			{/* Step content */}
			<StepContent
				getTextClasses={getTextClasses}
				hasErrors={state.hasErrors}
				step={step}
				validation={validation}
			/>
		</div>
	);
}

// Desktop progress component
function DesktopWizardProgress<T extends WizardData>({
	steps,
	currentStep,
	showStepNumbers,
	stepValidation,
	onStepClick,
}: {
	steps: WizardStep<T>[];
	currentStep: number;
	showStepNumbers: boolean;
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
		steps.length > 0
			? ((currentStep + 1) / steps.length) * PROGRESS_PERCENTAGE_MULTIPLIER
			: 0;

	return (
		<div
			aria-valuemax={PROGRESS_PERCENTAGE_MULTIPLIER}
			aria-valuemin={0}
			aria-valuenow={progress}
			className="wizard-progress-desktop"
			role="progressbar"
		>
			{/* Progress bar */}
			<div className="mb-6">
				<Progress
					aria-label="Progreso general del asistente"
					className={`h-${PROGRESS_BAR_HEIGHT}`}
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

				{steps.map((step, index) => (
					<StepIndicator
						currentStep={currentStep}
						index={index}
						key={step.id}
						onStepClick={onStepClick}
						showStepNumbers={showStepNumbers}
						step={step}
						validation={stepValidation?.[index]}
					/>
				))}
			</div>
		</div>
	);
}

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
	if (isMobile) {
		return (
			<MobileWizardProgress
				currentStep={currentStep}
				steps={steps}
				stepValidation={stepValidation}
			/>
		);
	}

	return (
		<DesktopWizardProgress
			currentStep={currentStep}
			onStepClick={onStepClick}
			showStepNumbers={showStepNumbers}
			steps={steps}
			stepValidation={stepValidation}
		/>
	);
}

// Compact progress indicator for tight spaces
export function WizardProgressCompact<T extends WizardData>({
	steps,
	currentStep,
	showStepNumbers = false,
}: Omit<WizardProgressProps<T>, "isMobile">) {
	const progress =
		steps.length > 0
			? ((currentStep + 1) / steps.length) * PROGRESS_PERCENTAGE_MULTIPLIER
			: 0;

	return (
		<div className="wizard-progress-compact flex items-center gap-3">
			<div className="flex items-center gap-1">
				{steps.map((step, index) => (
					<div
						className={cn(
							"h-2 w-2 rounded-full transition-all duration-200",
							index < currentStep && "bg-primary",
							index === currentStep && "scale-125 bg-primary",
							index > currentStep && "bg-muted-foreground/30"
						)}
						key={step.id}
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
		steps.length > 0
			? ((currentStep + 1) / steps.length) * PROGRESS_PERCENTAGE_MULTIPLIER
			: 0;
	const circumference = 2 * Math.PI * (size / 2 - CIRCLE_STROKE_OFFSET);
	const strokeDashoffset =
		circumference - (progress / PROGRESS_PERCENTAGE_MULTIPLIER) * circumference;

	return (
		<div className="wizard-progress-circular relative inline-flex items-center justify-center">
			<svg
				aria-label={`Circular progress indicator showing ${Math.round(progress)}% completion`}
				className="-rotate-90 transform"
				height={size}
				role="img"
				width={size}
			>
				{/* Background circle */}
				<circle
					className="text-muted-foreground/20"
					cx={size / 2}
					cy={size / 2}
					fill="none"
					r={size / 2 - CIRCLE_STROKE_OFFSET}
					stroke="currentColor"
					strokeWidth="2"
				/>

				{/* Progress circle */}
				<circle
					className="text-primary transition-all duration-300 ease-in-out"
					cx={size / 2}
					cy={size / 2}
					fill="none"
					r={size / 2 - CIRCLE_STROKE_OFFSET}
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
	const progress =
		totalSteps > 0
			? ((currentStep + 1) / totalSteps) * PROGRESS_PERCENTAGE_MULTIPLIER
			: 0;
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
