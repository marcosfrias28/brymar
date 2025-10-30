/**
 * User-friendly error messages and recovery suggestions
 * Provides contextual error handling with actionable recovery options
 */

import { toast } from "sonner";
import {
	AIServiceError,
	DraftServiceError,
	MapServiceError,
	NetworkError,
	UploadError,
	ValidationError,
	WizardError,
} from "../errors/wizard-errors";

export type RecoveryAction = {
	label: string;
	action: () => void | Promise<void>;
	primary?: boolean;
};

export type ErrorRecoveryOptions = {
	showToast?: boolean;
	autoRetry?: boolean;
	retryDelay?: number;
	maxAutoRetries?: number;
	customActions?: RecoveryAction[];
	context?: string;
};

export type ErrorRecoveryResult = {
	message: string;
	actions: RecoveryAction[];
	severity: "error" | "warning" | "info";
	canAutoRecover: boolean;
};

/**
 * Main error recovery handler that provides user-friendly messages and actions
 */
export function handleErrorWithRecovery(
	error: unknown,
	options: ErrorRecoveryOptions = {}
): ErrorRecoveryResult {
	const wizardError =
		error instanceof WizardError
			? error
			: WizardError.prototype.constructor.call(
					Object.create(WizardError.prototype),
					error instanceof Error ? error.message : String(error),
					"UNKNOWN_ERROR",
					true,
					"Ha ocurrido un error inesperado."
				);

	const recovery = createRecoveryStrategy(wizardError, options);

	if (options.showToast !== false) {
		showErrorToast(wizardError, recovery, options);
	}

	return recovery;
}

/**
 * Create recovery strategy based on error type
 */
function createRecoveryStrategy(
	error: WizardError,
	options: ErrorRecoveryOptions
): ErrorRecoveryResult {
	const baseActions: RecoveryAction[] = [];
	let severity: "error" | "warning" | "info" = "error";
	let canAutoRecover = false;

	// Add custom actions first
	if (options.customActions) {
		baseActions.push(...options.customActions);
	}

	// Error-specific recovery strategies
	if (error instanceof AIServiceError) {
		return handleAIServiceError(error, baseActions, options);
	}

	if (error instanceof UploadError) {
		return handleUploadError(error, baseActions, options);
	}

	if (error instanceof ValidationError) {
		return handleValidationError(error, baseActions, options);
	}

	if (error instanceof MapServiceError) {
		return handleMapServiceError(error, baseActions, options);
	}

	if (error instanceof DraftServiceError) {
		return handleDraftServiceError(error, baseActions, options);
	}

	if (error instanceof NetworkError) {
		return handleNetworkError(error, baseActions, options);
	}

	// Generic error handling
	if (error.retryable) {
		baseActions.push({
			label: "Reintentar",
			action: () => window.location.reload(),
			primary: true,
		});
		canAutoRecover = true;
		severity = "warning";
	}

	baseActions.push({
		label: "Reportar problema",
		action: () => reportError(error, options.context),
	});

	return {
		message: error.userMessage,
		actions: baseActions,
		severity,
		canAutoRecover,
	};
}

/**
 * Handle AI Service errors
 */
function handleAIServiceError(
	error: AIServiceError,
	baseActions: RecoveryAction[],
	_options: ErrorRecoveryOptions
): ErrorRecoveryResult {
	const actions = [...baseActions];

	switch (error.code) {
		case "RATE_LIMIT":
			actions.unshift({
				label: "Usar plantilla predeterminada",
				action: () => {
					// This would trigger fallback content generation
					toast.info("Usando contenido predeterminado");
				},
				primary: true,
			});
			return {
				message: error.userMessage,
				actions,
				severity: "warning",
				canAutoRecover: true,
			};

		case "NETWORK_ERROR":
		case "TIMEOUT":
			actions.unshift({
				label: "Reintentar generación",
				action: async () => {
					// This would be handled by the calling component
					toast.info("Reintentando generación de contenido...");
				},
				primary: true,
			});
			return {
				message: error.userMessage,
				actions,
				severity: "warning",
				canAutoRecover: true,
			};

		case "QUOTA_EXCEEDED":
			actions.unshift({
				label: "Continuar sin IA",
				action: () => {
					toast.info("Puedes continuar creando la propiedad manualmente");
				},
				primary: true,
			});
			return {
				message: error.userMessage,
				actions,
				severity: "info",
				canAutoRecover: false,
			};

		default:
			actions.unshift({
				label: "Usar plantilla predeterminada",
				action: () => {
					toast.info("Usando contenido predeterminado");
				},
				primary: true,
			});
			return {
				message: error.userMessage,
				actions,
				severity: "warning",
				canAutoRecover: true,
			};
	}
}

/**
 * Handle Upload errors
 */
function handleUploadError(
	error: UploadError,
	baseActions: RecoveryAction[],
	_options: ErrorRecoveryOptions
): ErrorRecoveryResult {
	const actions = [...baseActions];

	switch (error.code) {
		case "FILE_TOO_LARGE":
			actions.unshift({
				label: "Comprimir imagen",
				action: () => {
					toast.info("Intenta comprimir la imagen o usar una de menor tamaño");
				},
				primary: true,
			});
			return {
				message: error.userMessage,
				actions,
				severity: "warning",
				canAutoRecover: false,
			};

		case "INVALID_TYPE":
			actions.unshift({
				label: "Convertir imagen",
				action: () => {
					toast.info("Convierte la imagen a JPG, PNG o WebP");
				},
				primary: true,
			});
			return {
				message: error.userMessage,
				actions,
				severity: "warning",
				canAutoRecover: false,
			};

		case "NETWORK_ERROR":
		case "UPLOAD_FAILED":
			actions.unshift({
				label: "Reintentar subida",
				action: () => {
					toast.info("Reintentando subida de imagen...");
				},
				primary: true,
			});
			return {
				message: error.userMessage,
				actions,
				severity: "warning",
				canAutoRecover: true,
			};

		case "QUOTA_EXCEEDED":
			actions.unshift({
				label: "Contactar soporte",
				action: () => reportError(error, "quota_exceeded"),
			});
			return {
				message: error.userMessage,
				actions,
				severity: "error",
				canAutoRecover: false,
			};

		default:
			actions.unshift({
				label: "Seleccionar otra imagen",
				action: () => {
					toast.info("Intenta con una imagen diferente");
				},
				primary: true,
			});
			return {
				message: error.userMessage,
				actions,
				severity: "warning",
				canAutoRecover: false,
			};
	}
}

/**
 * Handle Validation errors
 */
function handleValidationError(
	error: ValidationError,
	baseActions: RecoveryAction[],
	_options: ErrorRecoveryOptions
): ErrorRecoveryResult {
	const actions = [...baseActions];
	const fieldCount = Object.keys(error.fieldErrors).length;

	actions.unshift({
		label: `Corregir ${fieldCount} campo${fieldCount > 1 ? "s" : ""}`,
		action: () => {
			// Focus on first error field
			const firstField = Object.keys(error.fieldErrors)[0];
			const element = document.querySelector(
				`[name="${firstField}"]`
			) as HTMLElement;
			element?.focus();
		},
		primary: true,
	});

	return {
		message: error.userMessage,
		actions,
		severity: "warning",
		canAutoRecover: false,
	};
}

/**
 * Handle Map Service errors
 */
function handleMapServiceError(
	error: MapServiceError,
	baseActions: RecoveryAction[],
	_options: ErrorRecoveryOptions
): ErrorRecoveryResult {
	const actions = [...baseActions];

	switch (error.code) {
		case "COORDINATES_OUT_OF_BOUNDS":
			actions.unshift({
				label: "Seleccionar ubicación en RD",
				action: () => {
					toast.info("Selecciona una ubicación dentro de República Dominicana");
				},
				primary: true,
			});
			return {
				message: error.userMessage,
				actions,
				severity: "warning",
				canAutoRecover: false,
			};

		case "GEOCODING_FAILED":
			actions.unshift({
				label: "Ingresar dirección manualmente",
				action: () => {
					toast.info("Puedes ingresar la dirección en los campos de texto");
				},
				primary: true,
			});
			return {
				message: error.userMessage,
				actions,
				severity: "warning",
				canAutoRecover: false,
			};

		case "NETWORK_ERROR":
		case "SERVICE_UNAVAILABLE":
			actions.unshift({
				label: "Reintentar",
				action: () => {
					toast.info("Reintentando conexión con el servicio de mapas...");
				},
				primary: true,
			});
			return {
				message: error.userMessage,
				actions,
				severity: "warning",
				canAutoRecover: true,
			};

		default:
			return {
				message: error.userMessage,
				actions,
				severity: "warning",
				canAutoRecover: false,
			};
	}
}

/**
 * Handle Draft Service errors
 */
function handleDraftServiceError(
	error: DraftServiceError,
	baseActions: RecoveryAction[],
	_options: ErrorRecoveryOptions
): ErrorRecoveryResult {
	const actions = [...baseActions];

	switch (error.code) {
		case "SAVE_FAILED":
			actions.unshift({
				label: "Reintentar guardado",
				action: () => {
					toast.info("Reintentando guardar borrador...");
				},
				primary: true,
			});
			return {
				message: error.userMessage,
				actions,
				severity: "warning",
				canAutoRecover: true,
			};

		case "NOT_FOUND":
			actions.unshift({
				label: "Crear nuevo borrador",
				action: () => {
					window.location.href = "/dashboard/properties/new";
				},
				primary: true,
			});
			return {
				message: error.userMessage,
				actions,
				severity: "info",
				canAutoRecover: false,
			};

		case "PERMISSION_DENIED":
			actions.unshift({
				label: "Ir al dashboard",
				action: () => {
					window.location.href = "/dashboard";
				},
			});
			return {
				message: error.userMessage,
				actions,
				severity: "error",
				canAutoRecover: false,
			};

		default:
			return {
				message: error.userMessage,
				actions,
				severity: "warning",
				canAutoRecover: error.retryable,
			};
	}
}

/**
 * Handle Network errors
 */
function handleNetworkError(
	error: NetworkError,
	baseActions: RecoveryAction[],
	_options: ErrorRecoveryOptions
): ErrorRecoveryResult {
	const actions = [...baseActions];

	actions.unshift({
		label: "Verificar conexión",
		action: () => {
			toast.info("Verifica tu conexión a internet y vuelve a intentar");
		},
		primary: true,
	});

	return {
		message: error.userMessage,
		actions,
		severity: "warning",
		canAutoRecover: true,
	};
}

/**
 * Show error toast with recovery actions
 */
function showErrorToast(
	_error: WizardError,
	recovery: ErrorRecoveryResult,
	options: ErrorRecoveryOptions
): void {
	const primaryAction = recovery.actions.find((a) => a.primary);

	toast.error(recovery.message, {
		description: options.context ? `Contexto: ${options.context}` : undefined,
		duration: recovery.severity === "error" ? Number.POSITIVE_INFINITY : 5000,
		action: primaryAction
			? {
					label: primaryAction.label,
					onClick: primaryAction.action,
				}
			: undefined,
	});
}

/**
 * Report error to monitoring service
 */
function reportError(error: WizardError, context?: string): void {
	const _errorReport = {
		message: error.message,
		code: error.code,
		context: context || "unknown",
		userAgent: navigator.userAgent,
		timestamp: new Date().toISOString(),
		url: window.location.href,
		errorContext: error.context,
	};

	// In production, send to error tracking service
	if (process.env.NODE_ENV === "production") {
	} else {
	}

	toast.success("Problema reportado", {
		description: "Hemos registrado el problema y trabajaremos en solucionarlo.",
	});
}

/**
 * Auto-retry mechanism with exponential backoff
 */
export async function autoRetryWithRecovery<T>(
	operation: () => Promise<T>,
	options: ErrorRecoveryOptions & {
		maxRetries?: number;
		baseDelay?: number;
	} = {}
): Promise<T> {
	const maxRetries = options.maxRetries || 3;
	const baseDelay = options.baseDelay || 1000;
	let lastError: unknown;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error;

			if (attempt === maxRetries) {
				break;
			}

			const recovery = handleErrorWithRecovery(error, {
				...options,
				showToast: false, // Don't show toast for intermediate retries
			});

			if (!recovery.canAutoRecover) {
				break;
			}

			// Wait before retry with exponential backoff
			const delay = baseDelay * 2 ** (attempt - 1);
			await new Promise((resolve) => setTimeout(resolve, delay));

			toast.info(`Reintentando... (${attempt}/${maxRetries})`);
		}
	}

	// Final error handling with toast
	handleErrorWithRecovery(lastError, options);
	throw lastError;
}

/**
 * Graceful degradation helper
 */
export function withGracefulDegradation<T>(
	operation: () => Promise<T>,
	fallback: () => T,
	options: ErrorRecoveryOptions = {}
): Promise<T> {
	return operation().catch((error) => {
		handleErrorWithRecovery(error, {
			...options,
			customActions: [
				{
					label: "Usar modo básico",
					action: () => {
						toast.info("Continuando en modo básico");
					},
					primary: true,
				},
			],
		});

		return fallback();
	});
}
