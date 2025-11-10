"use client";

import {
	Download,
	Loader2,
	RefreshCw,
	Save,
	Search,
	Upload,
} from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

interface LoadingButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	loading?: boolean;
	loadingText?: string;
	icon?: React.ComponentType<{ className?: string }>;
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
}

/**
 * Button with integrated loading state
 */
export function LoadingButton({
	children,
	loading = false,
	loadingText,
	icon: Icon,
	className,
	disabled,
	...props
}: LoadingButtonProps) {
	return (
		<Button
			className={cn(
				loading && "cursor-not-allowed",
				secondaryColorClasses.focusRing,
				className
			)}
			disabled={disabled || loading}
			{...props}
		>
			{loading ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					{loadingText || "Cargando..."}
				</>
			) : (
				<>
					{Icon && <Icon className="mr-2 h-4 w-4" />}
					{children}
				</>
			)}
		</Button>
	);
}

/**
 * Specialized loading buttons for common actions
 */
export function SaveButton({
	loading,
	children = "Guardar",
	loadingText = "Guardando...",
	...props
}: LoadingButtonProps) {
	return (
		<LoadingButton
			icon={Save}
			loading={loading}
			loadingText={loadingText}
			{...props}
		>
			{children}
		</LoadingButton>
	);
}

export function SearchButton({
	loading,
	children = "Buscar",
	loadingText = "Buscando...",
	...props
}: LoadingButtonProps) {
	return (
		<LoadingButton
			icon={Search}
			loading={loading}
			loadingText={loadingText}
			variant="outline"
			{...props}
		>
			{children}
		</LoadingButton>
	);
}

export function RefreshButton({
	loading,
	children = "Actualizar",
	loadingText = "Actualizando...",
	...props
}: LoadingButtonProps) {
	return (
		<LoadingButton
			icon={RefreshCw}
			loading={loading}
			loadingText={loadingText}
			variant="outline"
			{...props}
		>
			{children}
		</LoadingButton>
	);
}

export function UploadButton({
	loading,
	children = "Subir archivo",
	loadingText = "Subiendo...",
	...props
}: LoadingButtonProps) {
	return (
		<LoadingButton
			icon={Upload}
			loading={loading}
			loadingText={loadingText}
			variant="outline"
			{...props}
		>
			{children}
		</LoadingButton>
	);
}

export function DownloadButton({
	loading,
	children = "Descargar",
	loadingText = "Descargando...",
	...props
}: LoadingButtonProps) {
	return (
		<LoadingButton
			icon={Download}
			loading={loading}
			loadingText={loadingText}
			variant="outline"
			{...props}
		>
			{children}
		</LoadingButton>
	);
}

/**
 * Loading spinner with secondary color accents
 */
export function LoadingSpinner({
	size = "default",
	className,
}: {
	size?: "sm" | "default" | "lg";
	className?: string;
}) {
	const sizeClasses = {
		sm: "h-4 w-4",
		default: "h-6 w-6",
		lg: "h-8 w-8",
	};

	return (
		<div className={cn("flex items-center justify-center", className)}>
			<div
				className={cn(
					"animate-spin rounded-full border-2 border-secondary/30 border-t-secondary",
					sizeClasses[size]
				)}
			/>
		</div>
	);
}

/**
 * Loading dots animation
 */
export function LoadingDots({ className }: { className?: string }) {
	return (
		<div className={cn("flex space-x-1", className)}>
			{[0, 1, 2].map((i) => (
				<div
					className={cn(
						"h-2 w-2 animate-pulse rounded-full bg-secondary",
						`animation-delay-${i * 200}ms`
					)}
					key={i}
					style={{ animationDelay: `${i * 200}ms` }}
				/>
			))}
		</div>
	);
}

/**
 * Progress bar with secondary color
 */
export function LoadingProgress({
	progress = 0,
	className,
	showPercentage = false,
}: {
	progress?: number;
	className?: string;
	showPercentage?: boolean;
}) {
	return (
		<div className={cn("space-y-2", className)}>
			{showPercentage && (
				<div className="flex justify-between text-muted-foreground text-sm">
					<span>Progreso</span>
					<span>{Math.round(progress)}%</span>
				</div>
			)}
			<div className="h-2 w-full rounded-full bg-muted">
				<div
					className={cn(
						"h-2 rounded-full transition-all duration-300 ease-out",
						"bg-gradient-to-r from-secondary to-secondary/80"
					)}
					style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
				/>
			</div>
		</div>
	);
}

/**
 * Inline loading indicator for text
 */
export function InlineLoading({
	text = "Cargando",
	className,
}: {
	text?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex items-center gap-2 text-muted-foreground text-sm",
				className
			)}
		>
			<LoadingSpinner size="sm" />
			<span>{text}</span>
			<LoadingDots />
		</div>
	);
}

/**
 * Card loading overlay
 */
export function CardLoadingOverlay({
	isVisible = false,
	message = "Cargando...",
	className,
}: {
	isVisible?: boolean;
	message?: string;
	className?: string;
}) {
	if (!isVisible) {
		return null;
	}

	return (
		<div
			className={cn(
				"absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm",
				secondaryColorClasses.accent,
				className
			)}
		>
			<div className="space-y-3 text-center">
				<LoadingSpinner />
				<p className="text-muted-foreground text-sm">{message}</p>
			</div>
		</div>
	);
}

/**
 * Data fetching loading state
 */
export function DataLoadingState({
	message = "Cargando datos...",
	className,
}: {
	message?: string;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center space-y-4 p-8",
				className
			)}
		>
			<div className={cn("rounded-full p-4", secondaryColorClasses.accent)}>
				<LoadingSpinner size="lg" />
			</div>
			<div className="space-y-2 text-center">
				<p className="font-medium text-sm">{message}</p>
				<LoadingDots />
			</div>
		</div>
	);
}

/**
 * Table loading state
 */
export function TableLoadingState({
	rows = 5,
	columns = 4,
	className,
}: {
	rows?: number;
	columns?: number;
	className?: string;
}) {
	return (
		<div className={cn("space-y-3", className)}>
			{Array.from({ length: rows }).map((_, i) => (
				<div className="flex gap-4" key={i}>
					{Array.from({ length: columns }).map((_, j) => (
						<div
							className={cn(
								"h-4 animate-pulse rounded",
								j === 0 ? "w-24 bg-secondary/20" : "flex-1 bg-muted"
							)}
							key={j}
						/>
					))}
				</div>
			))}
		</div>
	);
}

/**
 * Form field loading state
 */
export function FieldLoadingState({ className }: { className?: string }) {
	return (
		<div className={cn("space-y-2", className)}>
			<div className="h-4 w-20 animate-pulse rounded bg-muted" />
			<div
				className={cn(
					"h-10 w-full animate-pulse rounded-md border",
					secondaryColorClasses.accent
				)}
			/>
		</div>
	);
}

/**
 * Wizard-specific loading states
 */
export const LoadingStates = {
	StepLoading: () => (
		<div className="space-y-4 p-6">
			<div className="h-6 w-48 animate-pulse rounded bg-muted" />
			<div className="space-y-3">
				<FieldLoadingState />
				<FieldLoadingState />
				<FieldLoadingState />
			</div>
			<div className="flex justify-between pt-4">
				<div className="h-10 w-24 animate-pulse rounded bg-muted" />
				<div className="h-10 w-24 animate-pulse rounded bg-muted" />
			</div>
		</div>
	),

	NavigationLoading: () => (
		<div className="space-y-4">
			<div className="h-2 w-full animate-pulse rounded bg-muted" />
			<div className="flex justify-between">
				{[1, 2, 3, 4].map((i) => (
					<div className="flex flex-col items-center space-y-2" key={i}>
						<div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
						<div className="h-3 w-16 animate-pulse rounded bg-muted" />
					</div>
				))}
			</div>
		</div>
	),

	MapLoading: () => (
		<div className="flex h-64 w-full animate-pulse items-center justify-center rounded-lg bg-muted">
			<div className="space-y-2 text-center">
				<LoadingSpinner />
				<p className="text-muted-foreground text-sm">Cargando mapa...</p>
			</div>
		</div>
	),

	ImageUploadLoading: () => (
		<div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
			{[1, 2, 3, 4, 5, 6].map((i) => (
				<div
					className="aspect-video animate-pulse rounded-lg bg-muted"
					key={i}
				/>
			))}
		</div>
	),
};
