"use client";

// Unified Wizard Navigation Component

import {
	Check,
	ChevronLeft,
	ChevronRight,
	HelpCircle,
	Save,
	X,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { useResponsive, useTouchGestures } from "@/hooks/use-mobile-responsive";
import { cn } from "@/lib/utils";
import { mobileClasses, triggerHapticFeedback } from "@/lib/utils/mobile-utils";
import type { WizardNavigationProps } from "@/types/wizard-core";

export function WizardNavigation({
	canGoNext,
	canGoPrevious,
	canComplete,
	isFirstStep,
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
	// Touch gesture support
	const { touchState, handlers } = useTouchGestures();
	const { isTouchDevice } = useResponsive();

	// Enhanced navigation handlers with haptic feedback
	const handleNext = async () => {
		try {
			if (isTouchDevice) {
				triggerHapticFeedback("light");
			}
			await onNext();
		} catch (error) {
			console.error("Navigation error:", error);
			if (isTouchDevice) {
				triggerHapticFeedback("heavy");
			}
		}
	};

	const handleComplete = async () => {
		try {
			if (isTouchDevice) {
				triggerHapticFeedback("medium");
			}
			await onComplete();
		} catch (error) {
			console.error("Completion error:", error);
			if (isTouchDevice) {
				triggerHapticFeedback("heavy");
			}
		}
	};

	const handleSaveDraft = async () => {
		try {
			if (isTouchDevice) {
				triggerHapticFeedback("light");
			}
			await onSaveDraft();
		} catch (error) {
			console.error("Save draft error:", error);
			if (isTouchDevice) {
				triggerHapticFeedback("heavy");
			}
		}
	};

	// Handle swipe gestures
	React.useEffect(() => {
		if (!enableTouchGestures || !isTouchDevice || touchState.isPressed) return;

		const { deltaX, distance } = touchState;
		const swipeThreshold = 50;

		if (distance > swipeThreshold) {
			if (deltaX > swipeThreshold && canGoPrevious) {
				onPrevious();
				triggerHapticFeedback("light");
			} else if (deltaX < -swipeThreshold && canGoNext) {
				handleNext();
			}
		}
	}, [
		touchState,
		enableTouchGestures,
		isTouchDevice,
		canGoNext,
		canGoPrevious,
		onPrevious,
		handleNext,
	]);

	// Keyboard navigation
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

	// Mobile layout with enhanced accessibility and touch support
	if (isMobile) {
		return (
			<nav
				className="wizard-navigation-mobile"
				aria-label="Navegación del asistente"
				{...(enableTouchGestures && isTouchDevice ? handlers : {})}
			>
				{/* Primary Actions Row */}
				<div className="flex gap-2 mb-3">
					{!isLastStep ? (
						<Button
							onClick={handleNext}
							disabled={!canGoNext || isLoading}
							className={cn("flex-1", mobileClasses.touchButton)}
							size="lg"
							aria-label={`Ir al siguiente paso${
								canGoNext ? "" : " (deshabilitado)"
							}`}
							aria-describedby="next-step-help"
						>
							{isLoading ? (
								<div
									className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
									aria-hidden="true"
								/>
							) : (
								<ChevronRight className="h-4 w-4 mr-2" aria-hidden="true" />
							)}
							Siguiente
						</Button>
					) : (
						<Button
							onClick={handleComplete}
							disabled={!canComplete || isLoading}
							className={cn("flex-1", mobileClasses.touchButton)}
							size="lg"
							aria-label={`Completar asistente${
								canComplete ? "" : " (deshabilitado)"
							}`}
							aria-describedby="complete-help"
						>
							{isLoading ? (
								<div
									className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
									aria-hidden="true"
								/>
							) : (
								<Check className="h-4 w-4 mr-2" aria-hidden="true" />
							)}
							Completar
						</Button>
					)}
				</div>

				{/* Secondary Actions Row */}
				<div className="flex gap-2">
					<Button
						onClick={onPrevious}
						disabled={!canGoPrevious || isLoading}
						variant="outline"
						size="sm"
						className={cn("flex-1", mobileClasses.touchButton)}
						aria-label={`Ir al paso anterior${
							canGoPrevious ? "" : " (deshabilitado)"
						}`}
					>
						<ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
						Anterior
					</Button>

					<Button
						onClick={handleSaveDraft}
						disabled={isSaving}
						variant="outline"
						size="sm"
						className={cn("flex-1", mobileClasses.touchButton)}
						aria-label={isSaving ? "Guardando borrador..." : "Guardar borrador"}
					>
						{isSaving ? (
							<div
								className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"
								aria-hidden="true"
							/>
						) : (
							<Save className="h-4 w-4 mr-1" aria-hidden="true" />
						)}
						Guardar
					</Button>

					{onCancel && (
						<Button
							onClick={onCancel}
							disabled={isLoading}
							variant="ghost"
							size="sm"
							className={mobileClasses.touchButton}
							aria-label="Cancelar asistente"
						>
							<X className="h-4 w-4" aria-hidden="true" />
						</Button>
					)}
				</div>

				{/* Touch gesture hint */}
				{enableTouchGestures && isTouchDevice && (
					<div className="text-center text-xs text-muted-foreground mt-2 py-1">
						<span aria-live="polite" className="sr-only">
							Puedes deslizar hacia la izquierda o derecha para navegar entre
							pasos
						</span>
						Desliza ← → para navegar
					</div>
				)}

				{/* Hidden help text for screen readers */}
				<div className="sr-only">
					<div id="next-step-help">
						Presiona Ctrl+Flecha derecha o desliza hacia la izquierda para
						avanzar
					</div>
					<div id="complete-help">
						Presiona Ctrl+Enter para completar el asistente
					</div>
				</div>
			</nav>
		);
	}

	// Desktop layout with enhanced accessibility
	return (
		<nav
			className="wizard-navigation-desktop"
			aria-label="Navegación del asistente"
		>
			<div className="flex items-center justify-between">
				{/* Left side - Previous button */}
				<div className="flex items-center gap-2">
					<Button
						onClick={onPrevious}
						disabled={!canGoPrevious || isLoading}
						variant="outline"
						className={cn(
							"transition-opacity",
							!canGoPrevious && "opacity-0 pointer-events-none",
						)}
						aria-label={`Ir al paso anterior${
							canGoPrevious ? "" : " (deshabilitado)"
						}`}
						title="Ctrl+← para navegar al paso anterior"
					>
						<ChevronLeft className="h-4 w-4 mr-2" aria-hidden="true" />
						Anterior
					</Button>
				</div>

				{/* Center - Save draft and help buttons */}
				<div className="flex items-center gap-2">
					<Button
						onClick={handleSaveDraft}
						disabled={isSaving}
						variant="ghost"
						size="sm"
						className="text-muted-foreground hover:text-foreground"
						aria-label={isSaving ? "Guardando borrador..." : "Guardar borrador"}
						title="Ctrl+S para guardar borrador"
					>
						{isSaving ? (
							<>
								<div
									className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"
									aria-hidden="true"
								/>
								Guardando...
							</>
						) : (
							<>
								<Save className="h-4 w-4 mr-2" aria-hidden="true" />
								Guardar borrador
							</>
						)}
					</Button>

					{enableKeyboardNavigation && (
						<Button
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-foreground"
							aria-label="Mostrar atajos de teclado"
							title="Alt+? para ver atajos de teclado"
							onClick={() => {
								const announcement = document.createElement("div");
								announcement.setAttribute("aria-live", "polite");
								announcement.className = "sr-only";
								announcement.textContent =
									"Atajos de teclado: Ctrl+Flecha derecha para siguiente, Ctrl+Flecha izquierda para anterior, Ctrl+S para guardar, Escape para cancelar";
								document.body.appendChild(announcement);
								setTimeout(() => document.body.removeChild(announcement), 3000);
							}}
						>
							<HelpCircle className="h-4 w-4" aria-hidden="true" />
						</Button>
					)}

					{onCancel && (
						<Button
							onClick={onCancel}
							disabled={isLoading}
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-foreground"
							aria-label="Cancelar asistente"
							title="Escape para cancelar"
						>
							<X className="h-4 w-4 mr-2" aria-hidden="true" />
							Cancelar
						</Button>
					)}
				</div>

				{/* Right side - Next/Complete button */}
				<div className="flex items-center gap-2">
					{!isLastStep ? (
						<Button
							onClick={handleNext}
							disabled={!canGoNext || isLoading}
							className="min-w-[120px]"
							aria-label={`Ir al siguiente paso${
								canGoNext ? "" : " (deshabilitado)"
							}`}
							title="Ctrl+→ para ir al siguiente paso"
						>
							{isLoading ? (
								<>
									<div
										className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
										aria-hidden="true"
									/>
									Validando...
								</>
							) : (
								<>
									Siguiente
									<ChevronRight className="h-4 w-4 ml-2" aria-hidden="true" />
								</>
							)}
						</Button>
					) : (
						<Button
							onClick={handleComplete}
							disabled={!canComplete || isLoading}
							className="min-w-[120px]"
							aria-label={`Completar asistente${
								canComplete ? "" : " (deshabilitado)"
							}`}
							title="Ctrl+Enter para completar el asistente"
						>
							{isLoading ? (
								<>
									<div
										className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
										aria-hidden="true"
									/>
									Completando...
								</>
							) : (
								<>
									<Check className="h-4 w-4 mr-2" aria-hidden="true" />
									Completar
								</>
							)}
						</Button>
					)}
				</div>
			</div>

			{/* Progress indicator for current action */}
			{(isLoading || isSaving) && (
				<div className="mt-3 text-center" role="status" aria-live="polite">
					<div className="text-xs text-muted-foreground">
						{isLoading && "Procesando..."}
						{isSaving && "Guardando borrador..."}
					</div>
				</div>
			)}
		</nav>
	);
}

// Enhanced keyboard navigation with accessibility
export function useWizardKeyboardNavigation({
	onNext,
	onPrevious,
	onComplete,
	onSaveDraft,
	onCancel,
	canGoNext,
	canComplete,
	isEnabled = true,
}: {
	onNext: () => void;
	onPrevious: () => void;
	onComplete: () => void;
	onSaveDraft: () => void;
	onCancel?: () => void;
	canGoNext: boolean;
	canComplete: boolean;
	isEnabled?: boolean;
}) {
	React.useEffect(() => {
		if (!isEnabled) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			// Only handle keyboard shortcuts when not in form inputs
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement ||
				event.target instanceof HTMLSelectElement ||
				(event.target as HTMLElement)?.contentEditable === "true"
			) {
				return;
			}

			const isCtrlOrCmd = event.ctrlKey || event.metaKey;
			const isAltKey = event.altKey;

			// Announce keyboard shortcuts to screen readers
			const announceAction = (action: string) => {
				const announcement = document.createElement("div");
				announcement.setAttribute("aria-live", "polite");
				announcement.setAttribute("aria-atomic", "true");
				announcement.className = "sr-only";
				announcement.textContent = action;
				document.body.appendChild(announcement);
				setTimeout(() => document.body.removeChild(announcement), 1000);
			};

			switch (event.key) {
				case "ArrowRight":
					if (isCtrlOrCmd && canGoNext) {
						event.preventDefault();
						announceAction("Navegando al siguiente paso");
						onNext();
					}
					break;
				case "ArrowLeft":
					if (isCtrlOrCmd) {
						event.preventDefault();
						announceAction("Navegando al paso anterior");
						onPrevious();
					}
					break;
				case "Enter":
					if (isCtrlOrCmd) {
						event.preventDefault();
						if (canComplete) {
							announceAction("Completando asistente");
							onComplete();
						} else if (canGoNext) {
							announceAction("Navegando al siguiente paso");
							onNext();
						}
					}
					break;
				case "s":
					if (isCtrlOrCmd) {
						event.preventDefault();
						announceAction("Guardando borrador");
						onSaveDraft();
					}
					break;
				case "Escape":
					if (onCancel) {
						event.preventDefault();
						announceAction("Cancelando asistente");
						onCancel();
					}
					break;
				case "?":
					if (isAltKey) {
						event.preventDefault();
						announceAction(
							"Atajos de teclado: Ctrl+Flecha derecha para siguiente, Ctrl+Flecha izquierda para anterior, Ctrl+S para guardar, Escape para cancelar",
						);
					}
					break;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [
		onNext,
		onPrevious,
		onComplete,
		onSaveDraft,
		onCancel,
		canGoNext,
		canComplete,
		isEnabled,
	]);
}

// Navigation state hook for external components
export function useWizardNavigationState(
	currentStep: number,
	totalSteps: number,
	canGoNext: boolean,
	canComplete: boolean,
) {
	const isFirstStep = currentStep === 0;
	const isLastStep = currentStep === totalSteps - 1;
	const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

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
