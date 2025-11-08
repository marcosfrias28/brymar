"use client";

// Main Wizard Component with TypeScript Generics Support

import { useIsMobile } from "@/hooks/use-mobile";
import { useWizard } from "@/hooks/wizard/use-wizard";
import { useWizardKeyboard } from "@/hooks/wizard/use-wizard-keyboard";
import type { WizardData, WizardProps } from "@/types/wizard-core";
import { WizardContainer } from "./wizard-container";
import { WizardErrorBoundary } from "./wizard-error-boundary";

export function Wizard<T extends WizardData>({
	config,
	initialData,
	draftId,
	onComplete,
	onSaveDraft,
	onCancel,
	className,
	showProgress = true,
	showStepNumbers = true,
	enableKeyboardNavigation = true,
	enableMobileOptimizations = true,
}: WizardProps<T>) {
	const isMobile = useIsMobile();

	const wizard = useWizard({
		config,
		initialData,
		draftId,
		onComplete,
		onSaveDraft,
	});

	// Keyboard navigation
	useWizardKeyboard({
		enableKeyboardNavigation,
		wizard,
		onCancel,
	});

	return (
		<WizardErrorBoundary>
			<WizardContainer
				className={className}
				config={config}
				enableKeyboardNavigation={enableKeyboardNavigation}
				enableMobileOptimizations={enableMobileOptimizations}
				isMobile={isMobile}
				onCancel={onCancel}
				showProgress={showProgress}
				showStepNumbers={showStepNumbers}
				wizard={wizard}
			/>
		</WizardErrorBoundary>
	);
}

// Export default wizard component
export default Wizard;
