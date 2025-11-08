import { cn } from "@/lib/utils/index";
import { WizardProgress } from "./wizard-progress";
import type { WizardStep, WizardData } from "@/types/wizard-core";

type WizardProgressSectionProps<T extends WizardData> = {
	currentStepIndex: number;
	isMobile: boolean;
	showProgress: boolean;
	showStepNumbers: boolean;
	steps: WizardStep<T>[];
	mobileOptimizations: boolean;
};

export function WizardProgressSection<T extends WizardData>({
	currentStepIndex,
	isMobile,
	showProgress,
	showStepNumbers,
	steps,
	mobileOptimizations,
}: WizardProgressSectionProps<T>) {
	if (!showProgress) {
		return null;
	}

	return (
		<div
			className={cn(
				"wizard-progress-container",
				"sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
				"border-border border-b",
				(mobileOptimizations && "px-4 py-2") || "px-6 py-4"
			)}
		>
			<WizardProgress
				currentStep={currentStepIndex}
				isMobile={isMobile}
				showStepNumbers={showStepNumbers}
				steps={steps}
			/>
		</div>
	);
}
