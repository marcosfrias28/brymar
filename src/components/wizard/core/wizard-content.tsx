import { cn } from "@/lib/utils/index";
import { WizardNavigation } from "./wizard-navigation";
import { WizardStepRenderer } from "./wizard-step-renderer";
import type { UseWizardReturn } from "@/hooks/wizard/use-wizard";
import type { WizardConfig, WizardData } from "@/types/wizard-core";

type WizardContentProps<T extends WizardData> = {
	wizard: Pick<UseWizardReturn<T>,
		| "data"
		| "getStepErrors"
		| "isLoading"
		| "isValidating"
		| "nextStep"
		| "previousStep"
		| "updateData"
		| "saveDraft"
		| "canComplete"
		| "canGoNext"
		| "canGoPrevious"
		| "isSaving"
		| "complete"
		| "currentStepIndex"
	>;
	config: WizardConfig<T>;
	isMobile: boolean;
	mobileOptimizations: boolean;
	onCancel?: () => void;
};

export function WizardContent<T extends WizardData>({
	wizard,
	config,
	isMobile,
	mobileOptimizations,
	onCancel,
}: WizardContentProps<T>) {
	return (
		<div
			className={cn(
				"wizard-content",
				"flex flex-1 flex-col",
				(mobileOptimizations && "px-4 py-4") || "px-6 py-8"
			)}
		>
			{/* Step Content */}
			<div className="flex-1">
				<WizardStepRenderer
					data={wizard.data}
					errors={wizard.getStepErrors()}
					isLoading={wizard.isLoading || wizard.isValidating}
					isMobile={isMobile}
					onNext={wizard.nextStep}
					onPrevious={wizard.previousStep}
					onUpdate={wizard.updateData}
					step={config.steps[wizard.currentStepIndex]}
				/>
			</div>

			{/* Navigation */}
			<div
				className={cn(
					"wizard-navigation-container",
					"mt-8 border-border border-t pt-6",
					mobileOptimizations &&
						"-mx-4 sticky bottom-0 bg-background/95 px-4 py-4 backdrop-blur"
				)}
			>
				<WizardNavigation
					canComplete={wizard.canComplete}
					canGoNext={wizard.canGoNext}
					canGoPrevious={wizard.canGoPrevious}
					isFirstStep={wizard.currentStepIndex === 0}
					isLastStep={wizard.currentStepIndex === config.steps.length - 1}
					isLoading={wizard.isLoading}
					isMobile={isMobile}
					isSaving={wizard.isSaving}
					onCancel={onCancel}
					onComplete={async () => {
						await wizard.complete();
					}}
					onNext={async () => {
						await wizard.nextStep();
					}}
					onPrevious={() => {
						wizard.previousStep();
					}}
					onSaveDraft={async () => {
						await wizard.saveDraft();
					}}
				/>
			</div>
		</div>
	);
}
