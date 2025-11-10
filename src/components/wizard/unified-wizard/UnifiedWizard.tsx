import { cn } from "@/lib/utils/index";
import { WizardHeader } from "./components/WizardHeader";
import { WizardStepsNavigation } from "./components/WizardStepsNavigation";
import { WizardCurrentStep } from "./components/WizardCurrentStep";
import { WizardNavigation } from "./components/WizardNavigation";
import { useWizardLogic } from "./hooks/useWizardLogic";
import type { UnifiedWizardProps } from "./types";

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
