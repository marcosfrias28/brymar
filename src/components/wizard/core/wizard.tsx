"use client";

// Main Wizard Component with TypeScript Generics Support

import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWizard } from "@/hooks/wizard/use-wizard";
import { cn } from "@/lib/utils";
import type { WizardData, WizardProps } from "@/types/wizard-core";
import { WizardErrorBoundary } from "./wizard-error-boundary";
import { WizardNavigation } from "./wizard-navigation";
import { WizardProgress } from "./wizard-progress";
import { WizardStepRenderer } from "./wizard-step-renderer";

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
	useEffect(() => {
		if (!enableKeyboardNavigation) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			// Don't interfere with form inputs
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement ||
				event.target instanceof HTMLSelectElement
			) {
				return;
			}

			switch (event.key) {
				case "ArrowRight":
				case "PageDown":
					if (event.ctrlKey || event.metaKey) {
						event.preventDefault();
						wizard.nextStep();
					}
					break;
				case "ArrowLeft":
				case "PageUp":
					if (event.ctrlKey || event.metaKey) {
						event.preventDefault();
						wizard.previousStep();
					}
					break;
				case "s":
					if (event.ctrlKey || event.metaKey) {
						event.preventDefault();
						wizard.saveDraft();
					}
					break;
				case "Enter":
					if (event.ctrlKey || event.metaKey) {
						event.preventDefault();
						if (wizard.canComplete) {
							wizard.complete();
						} else if (wizard.canGoNext) {
							wizard.nextStep();
						}
					}
					break;
				case "Escape":
					if (onCancel) {
						event.preventDefault();
						onCancel();
					}
					break;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [
		enableKeyboardNavigation,
		wizard.nextStep,
		wizard.previousStep,
		wizard.saveDraft,
		wizard.complete,
		wizard.canGoNext,
		wizard.canComplete,
		onCancel,
	]);

	// Mobile optimizations
	const mobileOptimizations = enableMobileOptimizations && isMobile;

	return (
		<WizardErrorBoundary onError={(_error) => {}}>
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
				{/* Progress Indicator */}
				{showProgress && (
					<div
						className={cn(
							"wizard-progress-container",
							"sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
							"border-border border-b",
							(mobileOptimizations && "px-4 py-2") || "px-6 py-4"
						)}
					>
						<WizardProgress
							currentStep={wizard.currentStepIndex}
							isMobile={isMobile}
							showStepNumbers={showStepNumbers}
							steps={config.steps}
						/>
					</div>
				)}

				{/* Main Content */}
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

				{/* Error Display */}
				{wizard.error && (
					<div
						aria-live="polite"
						className={cn(
							"wizard-error-container",
							"border-destructive/20 border-t bg-destructive/10 p-4",
							(mobileOptimizations && "px-4") || "px-6"
						)}
						role="alert"
					>
						<p className="text-destructive text-sm">{wizard.error}</p>
					</div>
				)}

				{/* Keyboard Shortcuts Help (Development) */}
				{process.env.NODE_ENV === "development" && enableKeyboardNavigation && (
					<div className="fixed right-4 bottom-4 z-50">
						<details className="rounded-lg border border-border bg-background shadow-lg">
							<summary className="cursor-pointer p-2 text-xs">
								Atajos de teclado
							</summary>
							<div className="min-w-48 space-y-1 p-3 text-xs">
								<div>
									<kbd>Ctrl/Cmd + →</kbd> Siguiente paso
								</div>
								<div>
									<kbd>Ctrl/Cmd + ←</kbd> Paso anterior
								</div>
								<div>
									<kbd>Ctrl/Cmd + S</kbd> Guardar borrador
								</div>
								<div>
									<kbd>Ctrl/Cmd + Enter</kbd> Completar/Siguiente
								</div>
								<div>
									<kbd>Esc</kbd> Cancelar
								</div>
							</div>
						</details>
					</div>
				)}
			</div>
		</WizardErrorBoundary>
	);
}

// Wizard wrapper with additional features
export function WizardWithFeatures<T extends WizardData>(
	props: WizardProps<T> & {
		enableAnalytics?: boolean;
		enableAutoSave?: boolean;
		enableOfflineSupport?: boolean;
	}
) {
	const {
		enableAnalytics = false,
		enableAutoSave = true,
		enableOfflineSupport = false,
		...wizardProps
	} = props;

	// Analytics tracking
	useEffect(() => {
		if (enableAnalytics) {
		}
	}, [enableAnalytics]);

	// Offline support
	useEffect(() => {
		if (enableOfflineSupport) {
			const handleOnline = () => {};

			const handleOffline = () => {};

			window.addEventListener("online", handleOnline);
			window.addEventListener("offline", handleOffline);

			return () => {
				window.removeEventListener("online", handleOnline);
				window.removeEventListener("offline", handleOffline);
			};
		}
	}, [enableOfflineSupport]);

	return <Wizard {...wizardProps} />;
}

// Export default wizard component
export default Wizard;
