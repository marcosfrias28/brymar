"use client";

// Dynamic Step Rendering Component

import React, { Suspense, useMemo } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { WizardData, WizardStepRendererProps } from "@/types/wizard-core";
import { WizardErrorBoundary } from "./wizard-error-boundary";

export function WizardStepRenderer<T extends WizardData>({
	step,
	data,
	onUpdate,
	onNext,
	onPrevious,
	errors,
	isLoading,
	isMobile,
}: WizardStepRendererProps<T>) {
	// Memoize step props to prevent unnecessary re-renders
	const stepProps = useMemo(
		() => ({
			data,
			onUpdate,
			onNext,
			onPrevious,
			errors,
			isLoading,
			isMobile,
		}),
		[data, onUpdate, onNext, onPrevious, errors, isLoading, isMobile]
	);

	// Loading skeleton for step content
	const StepSkeleton = () => (
		<Card className="w-full">
			<CardHeader>
				<Skeleton className="h-6 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
			</CardHeader>
			<CardContent className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-20 w-full" />
				<div className="flex gap-2">
					<Skeleton className="h-10 w-24" />
					<Skeleton className="h-10 w-24" />
				</div>
			</CardContent>
		</Card>
	);

	// Error fallback for step rendering
	const StepErrorFallback = () => {
		// Special handling for location steps
		if (step.id.includes("location")) {
			return (
				<Card className="w-full border-orange-200 bg-orange-50">
					<CardHeader>
						<CardTitle className="text-orange-800">
							Problema con el paso de ubicación
						</CardTitle>
						<CardDescription className="text-orange-700">
							El mapa interactivo no se pudo cargar. Usa el formulario simple
							para continuar.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2 text-orange-700 text-sm">
							<p>Posibles soluciones:</p>
							<ul className="list-inside list-disc space-y-1 text-xs">
								<li>Recargar la página</li>
								<li>Verificar la conexión a internet</li>
								<li>Desactivar bloqueadores de anuncios temporalmente</li>
								<li>Usar un navegador diferente</li>
							</ul>
						</div>
					</CardContent>
				</Card>
			);
		}

		return (
			<Card className="w-full border-destructive">
				<CardHeader>
					<CardTitle className="text-destructive">
						Error al cargar el paso
					</CardTitle>
					<CardDescription>
						No se pudo cargar el contenido del paso "{step.title}".
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						Por favor, intenta recargar la página o contacta al soporte técnico.
					</p>
				</CardContent>
			</Card>
		);
	};

	return (
		<div className="wizard-step-renderer w-full">
			{/* Step Header */}
			<div className="mb-6">
				<h2 className="font-semibold text-2xl tracking-tight">{step.title}</h2>
				{step.description && (
					<p className="mt-1 text-muted-foreground">{step.description}</p>
				)}
			</div>

			{/* Step Content */}
			<WizardErrorBoundary
				fallback={() => <StepErrorFallback />}
				onError={(_error) => {}}
			>
				<Suspense fallback={<StepSkeleton />}>
					<StepContent
						isLoading={isLoading}
						step={step}
						stepProps={stepProps}
					/>
				</Suspense>
			</WizardErrorBoundary>

			{/* Step Errors Display */}
			{Object.keys(errors).length > 0 && (
				<div className="mt-4 space-y-2">
					{Object.entries(errors).map(([field, message]) => (
						<div
							aria-live="polite"
							className="rounded-md bg-destructive/10 p-2 text-destructive text-sm"
							key={field}
							role="alert"
						>
							{message}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// Separate component for step content to enable better error boundaries
function StepContent<T extends WizardData>({
	step,
	stepProps,
	isLoading,
}: {
	step: WizardStepRendererProps<T>["step"];
	stepProps: any;
	isLoading: boolean;
}) {
	const StepComponent = step.component;

	// Add loading overlay if step is loading
	return (
		<div className="relative">
			{isLoading && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<div className="h-4 w-4 animate-spin rounded-full border-primary border-b-2" />
						Cargando...
					</div>
				</div>
			)}

			<StepComponent {...stepProps} />
		</div>
	);
}

// Higher-order component for lazy loading step components
export function withLazyLoading<P extends object>(
	importFn: () => Promise<{ default: React.ComponentType<P> }>
) {
	return React.lazy(importFn);
}

// Utility function to create step configurations with lazy loading
export function createLazyStep<_T extends WizardData>(
	id: string,
	title: string,
	importFn: () => Promise<{ default: React.ComponentType<any> }>,
	options?: {
		description?: string;
		validation?: any;
		isOptional?: boolean;
		canSkip?: boolean;
	}
) {
	return {
		id,
		title,
		description: options?.description,
		component: withLazyLoading(importFn),
		validation: options?.validation,
		isOptional: options?.isOptional,
		canSkip: options?.canSkip,
	};
}

// Performance monitoring hook for step rendering
export function useStepPerformance(_stepId: string) {
	React.useEffect(() => {
		const startTime = performance.now();

		return () => {
			const endTime = performance.now();
			const renderTime = endTime - startTime;

			// Log performance metrics (in development)
			if (process.env.NODE_ENV === "development") {
				// Warn about slow renders
				if (renderTime > 100) {
				}
			}
		};
	}, []);
}

// Accessibility helper for step navigation
export function useStepAccessibility(stepId: string, isActive: boolean) {
	React.useEffect(() => {
		if (isActive) {
			// Announce step change to screen readers
			const announcement = document.createElement("div");
			announcement.setAttribute("aria-live", "polite");
			announcement.setAttribute("aria-atomic", "true");
			announcement.className = "sr-only";
			announcement.textContent = `Paso activo: ${stepId}`;

			document.body.appendChild(announcement);

			// Clean up after announcement
			setTimeout(() => {
				document.body.removeChild(announcement);
			}, 1000);
		}
	}, [stepId, isActive]);
}
