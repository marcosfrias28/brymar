"use client";

// Unified Wizard Navigation Component

import type React from "react";
import { useResponsive } from "@/hooks/use-mobile-responsive";
import type { WizardNavigationProps } from "@/types/wizard-core";
import { useWizardNavigationHandlers } from "./hooks/use-wizard-navigation-handlers";
import { useWizardKeyboardNavigation } from "./hooks/use-wizard-keyboard-navigation";
import { useWizardSwipeGestures } from "./hooks/use-wizard-swipe-gestures";
import { WizardMobileNavigation } from "./wizard-mobile-navigation";
import { WizardDesktopNavigation } from "./wizard-desktop-navigation";

const PROGRESS_PERCENTAGE = 100;

export function WizardNavigation({
	canGoNext,
	canGoPrevious,
	canComplete,
	isLastStep,
	onNext,
	onPrevious,
	onComplete,
	onSaveDraft,
	onCancel,
	isLoading,
	isSaving,
	isMobile,
	enableTouchGestures = true,
	enableKeyboardNavigation = true,
}: WizardNavigationProps & {
	enableTouchGestures?: boolean;
	enableKeyboardNavigation?: boolean;
}) {
	const { isTouchDevice } = useResponsive();
	const { handleNext, handleComplete, handleSaveDraft } =
		useWizardNavigationHandlers({
			onNext,
			onComplete,
			onSaveDraft,
			isTouchDevice,
		});

	const { handlers } = useWizardSwipeGestures({
		enableTouchGestures,
		isTouchDevice,
		canGoNext,
		canGoPrevious,
		onPrevious,
		onNext: handleNext,
	});

	useWizardKeyboardNavigation({
		onNext: handleNext,
		onPrevious,
		onComplete: handleComplete,
		onSaveDraft: handleSaveDraft,
		onCancel,
		canGoNext,
		canComplete,
		isEnabled: enableKeyboardNavigation,
	});

	const commonProps = {
		canGoNext,
		canGoPrevious,
		canComplete,
		isLastStep,
		onNext: handleNext,
		onPrevious,
		onComplete: handleComplete,
		onSaveDraft: handleSaveDraft,
		onCancel,
		isLoading,
		isSaving,
	};

	return isMobile
		? renderMobileNavigation({
				...commonProps,
				enableTouchGestures,
				isTouchDevice,
				handlers,
			})
		: renderDesktopNavigation({
				...commonProps,
				enableKeyboardNavigation,
			});
}

function renderMobileNavigation(
	props: React.ComponentProps<typeof WizardMobileNavigation>
) {
	return <WizardMobileNavigation {...props} />;
}

function renderDesktopNavigation(
	props: React.ComponentProps<typeof WizardDesktopNavigation>
) {
	return <WizardDesktopNavigation {...props} />;
}

// Navigation state hook for external components
export function useWizardNavigationState(
	currentStep: number,
	totalSteps: number,
	canGoNext: boolean,
	canComplete: boolean
) {
	const isFirstStep = currentStep === 0;
	const isLastStep = currentStep === totalSteps - 1;
	const progress =
		totalSteps > 0 ? ((currentStep + 1) / totalSteps) * PROGRESS_PERCENTAGE : 0;

	return {
		isFirstStep,
		isLastStep,
		progress,
		canGoNext,
		canComplete,
		currentStep: currentStep + 1, // 1-based for display
		totalSteps,
	};
}
