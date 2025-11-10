/**
 * Shared Wizard Components
 *
 * Simple placeholder components for wizard functionality
 */

import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Loading state component
export function ConsistentLoadingState({
	message = "Cargando...",
	title,
	description,
}: {
	message?: string;
	title?: string;
	description?: string;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Loader2 className="h-4 w-4 animate-spin" />
					{title || message}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{description && (
					<p className="mb-4 text-muted-foreground">{description}</p>
				)}
				<div className="space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-4 w-1/2" />
				</div>
			</CardContent>
		</Card>
	);
}

// Error state component
export function ConsistentErrorState({
	error,
	onRetry,
	actionLabel,
	onAction,
	title,
	description,
}: {
	error: Error | string;
	onRetry?: () => void;
	actionLabel?: string;
	onAction?: () => void;
	title?: string;
	description?: string;
}) {
	const errorMessage = typeof error === "string" ? error : error.message;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-destructive">
					<AlertCircle className="h-4 w-4" />
					{title || "Error"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{description && (
					<p className="mb-2 text-muted-foreground">{description}</p>
				)}
				<p className="mb-4 text-muted-foreground">{errorMessage}</p>
				{(onRetry || onAction) && (
					<div className="flex gap-2">
						{onRetry && (
							<button
								className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
								onClick={onRetry}
								type="button"
							>
								Reintentar
							</button>
						)}
						{onAction && actionLabel && (
							<button
								className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/90"
								onClick={onAction}
								type="button"
							>
								{actionLabel}
							</button>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// Breadcrumb generator function
export function generateWizardBreadcrumbs(type: string, hasDraft: boolean) {
	const baseBreadcrumbs = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Crear", href: `/dashboard/${type}/new` },
	];

	if (hasDraft) {
		return [
			...baseBreadcrumbs,
			{ label: "Borrador", href: `/dashboard/${type}/new?draft=true` },
		];
	}

	return baseBreadcrumbs;
}
