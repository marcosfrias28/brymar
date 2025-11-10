/**
 * Lazy Wizard Wrapper Component
 *
 * Provides lazy loading functionality for wizard components with
 * proper error boundaries and loading states.
 */

import { type ComponentType, lazy, Suspense } from "react";
import type { WizardData, WizardProps } from "@/types/wizard-core";
import { WizardErrorBoundary } from "./wizard-error-boundary";
import { WizardFallbackUI } from "./fallback-ui-states";

interface LazyWizardWrapperProps<T extends WizardData>
	extends Omit<WizardProps<T>, "config"> {
	wizardType?: "property" | "land" | "blog";
	type?: "property" | "land" | "blog";
	wizardId?: string;
	userId?: string;
	loadingComponent?: ComponentType;
	errorComponent?: ComponentType<{ error: Error; retry: () => void }>;
	enablePerformanceMonitoring?: boolean;
	enableErrorRecovery?: boolean;
	enablePerformanceOptimizations?: boolean;
	onUpdate?: (data: Partial<T>) => void;
}

// Lazy load wizard components
const LazyPropertyWizard = lazy(() =>
	import("./property-wizard").then((module) => ({
		default: module.PropertyWizard,
	}))
);

const LazyLandWizard = lazy(() =>
	import("./land-wizard").then((module) => ({
		default: module.LandWizard,
	}))
);

const LazyBlogWizard = lazy(() =>
	import("./blog-wizard").then((module) => ({
		default: module.BlogWizard,
	}))
);

export function LazyWizardWrapper<T extends WizardData>({
	wizardType,
	type,
	wizardId,
	userId,
	loadingComponent: LoadingComponent,
	errorComponent: ErrorComponent,
	enablePerformanceMonitoring,
	enableErrorRecovery,
	enablePerformanceOptimizations,
	onUpdate,
	...wizardProps
}: LazyWizardWrapperProps<T>) {
	const actualWizardType = wizardType || type || "property";
	const getWizardComponent = () => {
		switch (actualWizardType) {
			case "property":
				return LazyPropertyWizard;
			case "land":
				return LazyLandWizard;
			case "blog":
				return LazyBlogWizard;
			default:
				throw new Error(`Unknown wizard type: ${actualWizardType}`);
		}
	};

	const WizardComponent = getWizardComponent();

	return (
		<WizardErrorBoundary
			fallback={
				ErrorComponent
					? (error, recovery) => {
							const jsError = new Error(error.message);
							jsError.name = error.type;
							return <ErrorComponent error={jsError} retry={recovery.retry} />;
						}
					: (error, recovery) => {
							const jsError = new Error(error.message);
							jsError.name = error.type;
							return (
								<WizardFallbackUI error={jsError} onRetry={recovery.retry} />
							);
						}
			}
		>
			<Suspense
				fallback={
					LoadingComponent ? (
						<LoadingComponent />
					) : (
						<WizardFallbackUI loading={true} />
					)
				}
			>
				<WizardComponent {...(wizardProps as WizardProps<T>)} />
			</Suspense>
		</WizardErrorBoundary>
	);
}
