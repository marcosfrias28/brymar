"use client";

import {
	AlertTriangle,
	ArrowLeft,
	Bug,
	FileX,
	Home,
	RefreshCw,
	ServerCrash,
	Shield,
	WifiOff,
} from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

type ErrorStateProps = {
	title?: string;
	description?: string;
	error?: Error | string;
	onRetry?: () => void;
	onGoHome?: () => void;
	onGoBack?: () => void;
	showDetails?: boolean;
	className?: string;
	variant?: "default" | "network" | "server" | "permission" | "notFound";
};

const errorVariants = {
	default: {
		icon: AlertTriangle,
		title: "Algo salió mal",
		description:
			"Ha ocurrido un error inesperado. Puedes intentar recargar la página.",
		iconColor: "text-destructive",
		bgColor: "bg-destructive/10",
	},
	network: {
		icon: WifiOff,
		title: "Sin conexión",
		description:
			"No se pudo conectar al servidor. Verifica tu conexión a internet.",
		iconColor: "text-orange-500",
		bgColor: "bg-orange-500/10",
	},
	server: {
		icon: ServerCrash,
		title: "Error del servidor",
		description:
			"El servidor está experimentando problemas. Inténtalo de nuevo más tarde.",
		iconColor: "text-red-500",
		bgColor: "bg-red-500/10",
	},
	permission: {
		icon: Shield,
		title: "Acceso denegado",
		description: "No tienes permisos para acceder a este recurso.",
		iconColor: "text-amber-500",
		bgColor: "bg-amber-500/10",
	},
	notFound: {
		icon: FileX,
		title: "Página no encontrada",
		description: "La página que buscas no existe o ha sido movida.",
		iconColor: "text-blue-500",
		bgColor: "bg-blue-500/10",
	},
};

export function ErrorState({
	title,
	description,
	error,
	onRetry,
	onGoHome,
	onGoBack,
	showDetails = false,
	className,
	variant = "default",
}: ErrorStateProps) {
	const config = errorVariants[variant];
	const Icon = config.icon;

	const handleGoHome = () => {
		if (onGoHome) {
			onGoHome();
		} else {
			window.location.href = "/dashboard";
		}
	};

	const handleGoBack = () => {
		if (onGoBack) {
			onGoBack();
		} else {
			window.history.back();
		}
	};

	return (
		<div className={cn("flex items-center justify-center p-4", className)}>
			<Card className={cn("w-full max-w-md", secondaryColorClasses.cardHover)}>
				<CardHeader className="text-center">
					<div
						className={cn(
							"mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full",
							config.bgColor
						)}
					>
						<Icon className={cn("h-6 w-6", config.iconColor)} />
					</div>
					<CardTitle>{title || config.title}</CardTitle>
					<CardDescription>{description || config.description}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{showDetails && error && (
						<div
							className={cn(
								"rounded-md border p-3",
								secondaryColorClasses.accent
							)}
						>
							<div className="mb-2 flex items-center gap-2">
								<Bug className="h-4 w-4 text-muted-foreground" />
								<p className="font-medium text-muted-foreground text-sm">
									Detalles del error:
								</p>
							</div>
							<p className="break-all font-mono text-muted-foreground text-xs">
								{typeof error === "string" ? error : error.message}
							</p>
						</div>
					)}

					<div className="flex gap-2">
						{onRetry && (
							<Button
								className={cn("flex-1", secondaryColorClasses.focusRing)}
								onClick={onRetry}
								variant="outline"
							>
								<RefreshCw className="mr-2 h-4 w-4" />
								Reintentar
							</Button>
						)}

						{variant !== "notFound" && (
							<Button
								className="flex-1"
								onClick={handleGoBack}
								variant="outline"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Volver
							</Button>
						)}

						<Button
							className={cn("flex-1", secondaryColorClasses.buttonSecondary)}
							onClick={handleGoHome}
						>
							<Home className="mr-2 h-4 w-4" />
							Inicio
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Inline error state for smaller components
 */
export function InlineErrorState({
	message = "Error al cargar los datos",
	onRetry,
	className,
}: {
	message?: string;
	onRetry?: () => void;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex items-center justify-center p-4 text-center",
				className
			)}
		>
			<div className="space-y-3">
				<div
					className={cn(
						"mx-auto flex h-8 w-8 items-center justify-center rounded-full",
						"bg-destructive/10"
					)}
				>
					<AlertTriangle className="h-4 w-4 text-destructive" />
				</div>
				<p className="text-muted-foreground text-sm">{message}</p>
				{onRetry && (
					<Button
						className={secondaryColorClasses.focusRing}
						onClick={onRetry}
						size="sm"
						variant="outline"
					>
						<RefreshCw className="mr-2 h-3 w-3" />
						Reintentar
					</Button>
				)}
			</div>
		</div>
	);
}

/**
 * Empty state component for when no data is available
 */
export function EmptyState({
	title = "No hay datos",
	description = "No se encontraron elementos para mostrar.",
	action,
	icon: Icon = FileX,
	className,
}: {
	title?: string;
	description?: string;
	action?: React.ReactNode;
	icon?: React.ComponentType<{ className?: string }>;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center p-8 text-center",
				className
			)}
		>
			<div
				className={cn(
					"mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full",
					secondaryColorClasses.accent
				)}
			>
				<Icon className="h-6 w-6 text-muted-foreground" />
			</div>
			<h3 className="mb-2 font-semibold text-lg">{title}</h3>
			<p className="mb-4 max-w-sm text-muted-foreground">{description}</p>
			{action}
		</div>
	);
}

/**
 * Loading state with message
 */
export function LoadingState({
	message = "Cargando...",
	className,
}: {
	message?: string;
	className?: string;
}) {
	return (
		<div className={cn("flex items-center justify-center p-8", className)}>
			<div className="space-y-3 text-center">
				<div
					className={cn(
						"mx-auto h-8 w-8 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary"
					)}
				/>
				<p className="text-muted-foreground text-sm">{message}</p>
			</div>
		</div>
	);
}

/**
 * Form loading overlay
 */
export function FormLoadingOverlay({
	message = "Guardando...",
	isVisible = false,
}: {
	message?: string;
	isVisible?: boolean;
}) {
	if (!isVisible) {
		return null;
	}

	return (
		<div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
			<div className="space-y-3 text-center">
				<div
					className={cn(
						"mx-auto h-6 w-6 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary"
					)}
				/>
				<p className="text-muted-foreground text-sm">{message}</p>
			</div>
		</div>
	);
}

/**
 * Status badge with secondary color variants
 */
export function StatusBadge({
	status,
	variant = "default",
	className,
}: {
	status: string;
	variant?: "default" | "success" | "warning" | "error" | "secondary";
	className?: string;
}) {
	const variants = {
		default: "bg-muted text-muted-foreground",
		success:
			"bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
		warning:
			"bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
		error: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
		secondary: secondaryColorClasses.badge,
	};

	return (
		<Badge className={cn(variants[variant], className)} variant="outline">
			{status}
		</Badge>
	);
}
