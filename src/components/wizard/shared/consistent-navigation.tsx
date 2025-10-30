"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import type { WizardNavigationConfig } from "@/types/universal-wizard";

/**
 * Consistent navigation patterns for all wizards
 * Ensures uniform behavior across property, land, and blog wizards
 */

export type ConsistentNavigationProps = {
	currentStep: number;
	totalSteps: number;
	canGoNext: boolean;
	canGoPrevious: boolean;
	isLoading: boolean;
	hasErrors: boolean;
	onNext: () => void;
	onPrevious: () => void;
	onComplete: () => void;
	onCancel?: () => void;
	onSaveDraft?: () => void;
	config?: WizardNavigationConfig;
};

/**
 * Wizard Step Layout Component
 * Provides consistent layout structure for all wizard steps
 */
export function WizardStepLayout({
	title,
	description,
	children,
	className = "",
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={`space-y-6 ${className}`}>
			<div className="space-y-2">
				<h2 className="font-bold text-2xl tracking-tight">{title}</h2>
				{description && (
					<p className="text-lg text-muted-foreground">{description}</p>
				)}
			</div>
			{children}
		</div>
	);
}

/**
 * Wizard Form Section Component
 * Provides consistent section structure within wizard steps
 */
export function WizardFormSection({
	title,
	description,
	children,
	icon,
	optional = false,
	className = "",
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
	icon?: React.ReactNode;
	optional?: boolean;
	className?: string;
}) {
	return (
		<div className={`space-y-4 ${className}`}>
			<div className="flex items-center gap-3">
				{icon && <div className="text-muted-foreground">{icon}</div>}
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<h3 className="font-semibold text-lg">{title}</h3>
						{optional && (
							<Badge className="text-xs" variant="outline">
								Opcional
							</Badge>
						)}
					</div>
					{description && (
						<p className="mt-1 text-muted-foreground text-sm">{description}</p>
					)}
				</div>
			</div>
			<div className="pl-8">{children}</div>
		</div>
	);
}

/**
 * Wizard Form Field Component
 * Provides consistent field structure within wizard forms
 */
export function WizardFormField({
	label,
	description,
	children,
	required = false,
	error,
	className = "",
}: {
	label: string;
	description?: string;
	children: React.ReactNode;
	required?: boolean;
	error?: string;
	className?: string;
}) {
	return (
		<fieldset className={`space-y-2 ${className}`}>
			<div className="space-y-1">
				<label className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
					{label}
					{required && <span className="ml-1 text-destructive">*</span>}
				</label>
				{description && (
					<p className="text-muted-foreground text-xs">{description}</p>
				)}
			</div>
			{children}
			<p className="text-destructive text-xs">{error && error}</p>
		</fieldset>
	);
}

/**
 * Wizard Selection Grid Component
 * Provides consistent grid layout for selection options
 */
export function WizardSelectionGrid({
	children,
	columns = 2,
	className = "",
}: {
	children: React.ReactNode;
	columns?: number;
	className?: string;
}) {
	const gridCols = {
		1: "grid-cols-1",
		2: "grid-cols-1 md:grid-cols-2",
		3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
	};

	return (
		<div
			className={`grid ${
				gridCols[columns as keyof typeof gridCols]
			} gap-4 ${className}`}
		>
			{children}
		</div>
	);
}

/**
 * Default navigation configuration for all wizards
 */
export const defaultNavigationConfig: Required<WizardNavigationConfig> = {
	showProgress: true,
	showStepList: true,
	enableKeyboardNavigation: true,
	cancelLabel: "Cancelar",
	nextLabel: "Siguiente",
	previousLabel: "Anterior",
	completeLabel: "Completar",
	saveDraftLabel: "Guardar Borrador",
	showCancel: true,
	showSaveDraft: true,
};

/**
 * Get navigation configuration with defaults
 */
export function getNavigationConfig(
	config?: WizardNavigationConfig
): Required<WizardNavigationConfig> {
	return {
		...defaultNavigationConfig,
		...config,
	};
}

/**
 * Consistent step validation logic
 */
export function useConsistentStepValidation() {
	const canNavigateToStep = useCallback(
		(
			targetStep: number,
			currentStep: number,
			completedSteps: Set<number>,
			allowSkipAhead = false
		): boolean => {
			// Can always go to current step
			if (targetStep === currentStep) {
				return true;
			}

			// Can always go backwards to completed steps
			if (targetStep < currentStep) {
				return true;
			}

			// Can go to next step if current step is completed
			if (targetStep === currentStep + 1 && completedSteps.has(currentStep)) {
				return true;
			}

			// Can skip ahead if explicitly allowed and all previous steps are completed
			if (allowSkipAhead) {
				for (let i = 0; i < targetStep; i++) {
					if (!completedSteps.has(i)) {
						return false;
					}
				}
				return true;
			}

			return false;
		},
		[]
	);

	const getNextIncompleteStep = useCallback(
		(completedSteps: Set<number>, totalSteps: number): number | null => {
			for (let i = 0; i < totalSteps; i++) {
				if (!completedSteps.has(i)) {
					return i;
				}
			}
			return null;
		},
		[]
	);

	return {
		canNavigateToStep,
		getNextIncompleteStep,
	};
}

/**
 * Consistent breadcrumb generation
 */
export function generateWizardBreadcrumbs(
	wizardType: "property" | "land" | "blog",
	isDraft = false
) {
	const typeLabels = {
		property: { singular: "Propiedad", plural: "Propiedades" },
		land: { singular: "Terreno", plural: "Terrenos" },
		blog: { singular: "Artículo", plural: "Blog" },
	};

	const typeLabel = typeLabels[wizardType];
	const actionLabel = isDraft
		? "Continuar Borrador"
		: `Nuevo ${typeLabel.singular}`;

	return [
		{ label: "Dashboard", href: "/dashboard" },
		{
			label: typeLabel.plural,
			href: `/dashboard/${wizardType === "blog" ? "blog" : `${wizardType}s`}`,
		},
		{ label: actionLabel },
	];
}

/**
 * Consistent loading state component
 */
export function ConsistentLoadingState({
	title = "Cargando...",
	description = "Preparando el asistente con tus datos guardados",
	breadcrumbs,
}: {
	title?: string;
	description?: string;
	breadcrumbs: Array<{ label: string; href?: string }>;
}) {
	return (
		<div className="flex min-h-[400px] items-center justify-center">
			<div className="text-center">
				<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
				<h2 className="mb-2 font-semibold text-xl">{title}</h2>
				<p className="text-muted-foreground">{description}</p>
			</div>
		</div>
	);
}

/**
 * Consistent error state component
 */
export function ConsistentErrorState({
	title = "Error de autenticación",
	description = "No se pudo verificar tu identidad",
	actionLabel = "Volver",
	onAction,
}: {
	title?: string;
	description?: string;
	actionLabel?: string;
	onAction: () => void;
}) {
	return (
		<div className="flex min-h-[400px] items-center justify-center">
			<div className="text-center">
				<h2 className="mb-2 font-semibold text-xl">{title}</h2>
				<p className="mb-4 text-muted-foreground">{description}</p>
				<button
					className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
					onClick={onAction}
				>
					{actionLabel}
				</button>
			</div>
		</div>
	);
}

/**
 * Consistent step progression validation
 */
export function validateStepProgression(
	currentStep: number,
	targetStep: number,
	stepValidation: Record<number, boolean>,
	allowSkipAhead = false
): { canProceed: boolean; reason?: string } {
	// Moving backwards is always allowed
	if (targetStep < currentStep) {
		return { canProceed: true };
	}

	// Moving to next step requires current step to be valid
	if (targetStep === currentStep + 1) {
		if (!stepValidation[currentStep]) {
			return {
				canProceed: false,
				reason: "Completa el paso actual antes de continuar",
			};
		}
		return { canProceed: true };
	}

	// Skipping ahead
	if (targetStep > currentStep + 1) {
		if (!allowSkipAhead) {
			return {
				canProceed: false,
				reason: "Debes completar los pasos en orden",
			};
		}

		// Check all previous steps are valid
		for (let i = 0; i < targetStep; i++) {
			if (!stepValidation[i]) {
				return {
					canProceed: false,
					reason: `Completa el paso ${i + 1} antes de continuar`,
				};
			}
		}
	}

	return { canProceed: true };
}
