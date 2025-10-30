/**
 * Advanced Error Handling for TanStack Query
 */

import React from "react";
import { toast } from "sonner";

// Error types
export class NetworkError extends Error {
	constructor(message = "Error de conexión") {
		super(message);
		this.name = "NetworkError";
	}
}

export class ValidationError extends Error {
	public fieldErrors: Record<string, string[]>;

	constructor(
		fieldErrors: Record<string, string[]> = {},
		message = "Error de validación"
	) {
		super(message);
		this.name = "ValidationError";
		this.fieldErrors = fieldErrors;
	}
}

export class ServerError extends Error {
	public status: number;

	constructor(status: number, message = "Error del servidor") {
		super(message);
		this.name = "ServerError";
		this.status = status;
	}
}

// Error classification
export function classifyError(error: unknown): {
	type: "network" | "validation" | "server" | "client" | "unknown";
	message: string;
	canRetry: boolean;
} {
	if (error instanceof NetworkError) {
		return {
			type: "network",
			message: "Error de conexión. Verifica tu conexión a internet.",
			canRetry: true,
		};
	}

	if (error instanceof ValidationError) {
		return {
			type: "validation",
			message: "Los datos ingresados no son válidos.",
			canRetry: false,
		};
	}

	if (error instanceof ServerError) {
		return {
			type: "server",
			message:
				error.status >= 500
					? "Error interno del servidor. Inténtalo más tarde."
					: "Error en la solicitud.",
			canRetry: error.status >= 500,
		};
	}

	if (error instanceof Error) {
		// Check for common error patterns
		if (error.message.includes("fetch")) {
			return {
				type: "network",
				message: "Error de conexión.",
				canRetry: true,
			};
		}

		if (error.message.includes("4")) {
			return {
				type: "client",
				message: "Error en la solicitud.",
				canRetry: false,
			};
		}

		return {
			type: "unknown",
			message: error.message || "Ha ocurrido un error inesperado.",
			canRetry: true,
		};
	}

	return {
		type: "unknown",
		message: "Ha ocurrido un error inesperado.",
		canRetry: true,
	};
}

// Retry configuration
export type RetryConfig = {
	attempts: number;
	delay: (attempt: number) => number;
	shouldRetry: (error: Error) => boolean;
};

export function createRetryConfig(type: "query" | "mutation"): RetryConfig {
	const baseConfig = {
		query: {
			attempts: 3,
			delay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30_000), // Exponential backoff
			shouldRetry: (error: Error) => {
				const { type, canRetry } = classifyError(error);
				return canRetry && type !== "validation" && type !== "client";
			},
		},
		mutation: {
			attempts: 1, // Usually don't retry mutations
			delay: (_attempt: number) => 1000,
			shouldRetry: (error: Error) => {
				const { type } = classifyError(error);
				return type === "network"; // Only retry network errors for mutations
			},
		},
	};

	return baseConfig[type];
}

// Global error handler
export function handleGlobalError(error: unknown, _context?: string) {
	const { type, message, canRetry } = classifyError(error);

	// Show appropriate toast
	toast.error(message, {
		action: canRetry
			? {
					label: "Reintentar",
					onClick: () => {
						// This will be handled by the specific component/hook
						(window as any).location.reload();
					},
				}
			: undefined,
	});

	// Report to error tracking service
	if (process.env.NODE_ENV === "production") {
		// Example: Sentry.captureException(error);
	}
}

// Network status detection
export function useNetworkStatus() {
	const [isOnline, setIsOnline] = React.useState(
		typeof navigator !== "undefined" ? navigator.onLine : true
	);

	React.useEffect(() => {
		const handleOnline = () => {
			setIsOnline(true);
			toast.success("Conexión restaurada");
		};

		const handleOffline = () => {
			setIsOnline(false);
			toast.error("Sin conexión a internet", {
				duration: Number.POSITIVE_INFINITY,
				action: {
					label: "Reintentar",
					onClick: () => (window as any).location.reload(),
				},
			});
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	return isOnline;
}

// Error recovery strategies
export const errorRecoveryStrategies = {
	// Refresh the page
	refresh: () => {
		if (typeof window !== "undefined") {
			(window as any).location.reload();
		}
	},

	// Go back in history
	goBack: () => {
		window.history.back();
	},

	// Go to home page
	goHome: () => {
		if (typeof window !== "undefined") {
			(window as any).location.href = "/";
		}
	},

	// Clear cache and refresh
	clearCacheAndRefresh: () => {
		if (typeof window !== "undefined" && "caches" in window) {
			caches
				.keys()
				.then((names) => {
					names.forEach((name) => caches.delete(name));
				})
				.finally(() => {
					(window as any).location.reload();
				});
		} else if (typeof window !== "undefined") {
			(window as any).location.reload();
		}
	},
};
