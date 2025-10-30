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
		} catch (_error) {
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
		} catch (_error) {
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
		} catch (_error) {
			if (isTouchDevice) {
				triggerHapticFeedback("heavy");
			}
		}
	};

	// Handle swipe gestures
	React.useEffect(() => {
		if (!(enableTouchGestures && isTouchDevice) || touchState.isPressed) {
			return;
		}

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
				aria-label="Navegación del asistente"
				className="wizard-navigation-mobile"
				{...(enableTouchGestures && isTouchDevice ? handlers : {})}
			>
				{/* Primary Actions Row */}
				<div className="mb-3 flex gap-2">
					{isLastStep ? (
						<Button
							aria-describedby="complete-help"
							aria-label={`Completar asistente${
								canComplete ? "" : " (deshabilitado)"
							}`}
							className={cn("flex-1", mobileClasses.touchButton)}
							disabled={!canComplete || isLoading}
							onClick={handleComplete}
							size="lg"
						>
							{isLoading ? (
								<div
									aria-hidden="true"
									className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2"
								/>
							) : (
								<Check aria-hidden="true" className="mr-2 h-4 w-4" />
							)}
							Completar
						</Button>
					) : (
						<Button
							aria-describedby="next-step-help"
							aria-label={`Ir al siguiente paso${
								canGoNext ? "" : " (deshabilitado)"
							}`}
							className={cn("flex-1", mobileClasses.touchButton)}
							disabled={!canGoNext || isLoading}
							onClick={handleNext}
							size="lg"
						>
							{isLoading ? (
								<div
									aria-hidden="true"
									className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2"
								/>
							) : (
								<ChevronRight aria-hidden="true" className="mr-2 h-4 w-4" />
							)}
							Siguiente
						</Button>
					)}
				</div>

				{/* Secondary Actions Row */}
				<div className="flex gap-2">
					<Button
						aria-label={`Ir al paso anterior${
							canGoPrevious ? "" : " (deshabilitado)"
						}`}
						className={cn("flex-1", mobileClasses.touchButton)}
						disabled={!canGoPrevious || isLoading}
						onClick={onPrevious}
						size="sm"
						variant="outline"
					>
						<ChevronLeft aria-hidden="true" className="mr-1 h-4 w-4" />
						Anterior
					</Button>

					<Button
						aria-label={isSaving ? "Guardando borrador..." : "Guardar borrador"}
						className={cn("flex-1", mobileClasses.touchButton)}
						disabled={isSaving}
						onClick={handleSaveDraft}
						size="sm"
						variant="outline"
					>
						{isSaving ? (
							<div
								aria-hidden="true"
								className="mr-1 h-3 w-3 animate-spin rounded-full border-current border-b-2"
							/>
						) : (
							<Save aria-hidden="true" className="mr-1 h-4 w-4" />
						)}
						Guardar
					</Button>

					{onCancel && (
						<Button
							aria-label="Cancelar asistente"
							className={mobileClasses.touchButton}
							disabled={isLoading}
							onClick={onCancel}
							size="sm"
							variant="ghost"
						>
							<X aria-hidden="true" className="h-4 w-4" />
						</Button>
					)}
				</div>

				{/* Touch gesture hint */}
				{enableTouchGestures && isTouchDevice && (
					<div className="mt-2 py-1 text-center text-muted-foreground text-xs">
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
			aria-label="Navegación del asistente"
			className="wizard-navigation-desktop"
		>
			<div className="flex items-center justify-between">
				{/* Left side - Previous button */}
				<div className="flex items-center gap-2">
					<Button
						aria-label={`Ir al paso anterior${
							canGoPrevious ? "" : " (deshabilitado)"
						}`}
						className={cn(
							"transition-opacity",
							!canGoPrevious && "pointer-events-none opacity-0"
						)}
						disabled={!canGoPrevious || isLoading}
						onClick={onPrevious}
						title="Ctrl+← para navegar al paso anterior"
						variant="outline"
					>
						<ChevronLeft aria-hidden="true" className="mr-2 h-4 w-4" />
						Anterior
					</Button>
				</div>

				{/* Center - Save draft and help buttons */}
				<div className="flex items-center gap-2">
					<Button
						aria-label={isSaving ? "Guardando borrador..." : "Guardar borrador"}
						className="text-muted-foreground hover:text-foreground"
						disabled={isSaving}
						onClick={handleSaveDraft}
						size="sm"
						title="Ctrl+S para guardar borrador"
						variant="ghost"
					>
						{isSaving ? (
							<>
								<div
									aria-hidden="true"
									className="mr-2 h-3 w-3 animate-spin rounded-full border-current border-b-2"
								/>
								Guardando...
							</>
						) : (
							<>
								<Save aria-hidden="true" className="mr-2 h-4 w-4" />
								Guardar borrador
							</>
						)}
					</Button>

					{enableKeyboardNavigation && (
						<Button
							aria-label="Mostrar atajos de teclado"
							className="text-muted-foreground hover:text-foreground"
							onClick={() => {
								const announcement = document.createElement("div");
								announcement.setAttribute("aria-live", "polite");
								announcement.className = "sr-only";
								announcement.textContent =
									"Atajos de teclado: Ctrl+Flecha derecha para siguiente, Ctrl+Flecha izquierda para anterior, Ctrl+S para guardar, Escape para cancelar";
								document.body.appendChild(announcement);
								setTimeout(() => document.body.removeChild(announcement), 3000);
							}}
							size="sm"
							title="Alt+? para ver atajos de teclado"
							variant="ghost"
						>
							<HelpCircle aria-hidden="true" className="h-4 w-4" />
						</Button>
					)}

					{onCancel && (
						<Button
							aria-label="Cancelar asistente"
							className="text-muted-foreground hover:text-foreground"
							disabled={isLoading}
							onClick={onCancel}
							size="sm"
							title="Escape para cancelar"
							variant="ghost"
						>
							<X aria-hidden="true" className="mr-2 h-4 w-4" />
							Cancelar
						</Button>
					)}
				</div>

				{/* Right side - Next/Complete button */}
				<div className="flex items-center gap-2">
					{isLastStep ? (
						<Button
							aria-label={`Completar asistente${
								canComplete ? "" : " (deshabilitado)"
							}`}
							className="min-w-[120px]"
							disabled={!canComplete || isLoading}
							onClick={handleComplete}
							title="Ctrl+Enter para completar el asistente"
						>
							{isLoading ? (
								<>
									<div
										aria-hidden="true"
										className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2"
									/>
									Completando...
								</>
							) : (
								<>
									<Check aria-hidden="true" className="mr-2 h-4 w-4" />
									Completar
								</>
							)}
						</Button>
					) : (
						<Button
							aria-label={`Ir al siguiente paso${
								canGoNext ? "" : " (deshabilitado)"
							}`}
							className="min-w-[120px]"
							disabled={!canGoNext || isLoading}
							onClick={handleNext}
							title="Ctrl+→ para ir al siguiente paso"
						>
							{isLoading ? (
								<>
									<div
										aria-hidden="true"
										className="mr-2 h-4 w-4 animate-spin rounded-full border-white border-b-2"
									/>
									Validando...
								</>
							) : (
								<>
									Siguiente
									<ChevronRight aria-hidden="true" className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
					)}
				</div>
			</div>

			{/* Progress indicator for current action */}
			{(isLoading || isSaving) && (
				<div aria-live="polite" className="mt-3 text-center" role="status">
					<div className="text-muted-foreground text-xs">
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
		if (!isEnabled) {
			return;
		}

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
							"Atajos de teclado: Ctrl+Flecha derecha para siguiente, Ctrl+Flecha izquierda para anterior, Ctrl+S para guardar, Escape para cancelar"
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
	canComplete: boolean
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
