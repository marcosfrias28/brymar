import { cn } from "@/lib/utils/index";
import { WizardContent } from "./wizard-content";
import { WizardErrorDisplay } from "./wizard-error-display";
import { WizardKeyboardHelp } from "./wizard-keyboard-help";
import { WizardProgressSection } from "./wizard-progress-section";
import type { UseWizardReturn } from "@/hooks/wizard/use-wizard";
import type { WizardConfig, WizardData } from "@/types/wizard-core";

interface WizardContainerProps<T extends WizardData> {
	wizard: UseWizardReturn<T>;
	config: WizardConfig<T>;
	isMobile: boolean;
	className?: string;
	showProgress: boolean;
	showStepNumbers: boolean;
	enableKeyboardNavigation: boolean;
	enableMobileOptimizations: boolean;
	onCancel?: () => void;
}

export function WizardContainer<T extends WizardData>({
	wizard,
	config,
	isMobile,
	className,
	showProgress,
	showStepNumbers,
	enableKeyboardNavigation,
	enableMobileOptimizations,
	onCancel,
}: WizardContainerProps<T>) {
	const mobileOptimizations = enableMobileOptimizations && isMobile;

	return (
		<div
			aria-label={`Asistente: ${config.title}`}
			className={cn(
				"wizard-container",
				"flex min-h-screen flex-col",
				mobileOptimizations && "mobile-optimized",
				className
			)}
			role="application"
		>
			<WizardProgressSection
				currentStepIndex={wizard.currentStepIndex}
				isMobile={isMobile}
				mobileOptimizations={mobileOptimizations}
				showProgress={showProgress}
				showStepNumbers={showStepNumbers}
				steps={config.steps}
			/>

			<WizardContent
				config={config}
				isMobile={isMobile}
				mobileOptimizations={mobileOptimizations}
				onCancel={onCancel}
				wizard={wizard}
			/>

			<WizardErrorDisplay
				error={wizard.error}
				mobileOptimizations={mobileOptimizations}
			/>

			<WizardKeyboardHelp enableKeyboardNavigation={enableKeyboardNavigation} />
		</div>
	);
}
