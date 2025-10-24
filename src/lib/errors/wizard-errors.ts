/**
 * Custom error classes for the AI Property Wizard
 * Provides specific error types for different failure scenarios
 */

// Base wizard error class
export class WizardError extends Error {
	public readonly code: string;
	public readonly retryable: boolean;
	public readonly userMessage: string;
	public readonly context?: Record<string, any>;

	constructor(
		message: string,
		code: string,
		retryable: boolean = false,
		userMessage?: string,
		context?: Record<string, any>,
	) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.retryable = retryable;
		this.userMessage = userMessage || message;
		this.context = context;
	}
}

// AI Service Errors
export class AIServiceError extends WizardError {
	constructor(
		message: string,
		code:
			| "RATE_LIMIT"
			| "API_ERROR"
			| "INVALID_RESPONSE"
			| "NETWORK_ERROR"
			| "TIMEOUT"
			| "QUOTA_EXCEEDED"
			| "MODEL_NOT_FOUND",
		retryable: boolean = false,
		context?: Record<string, any>,
	) {
		const userMessages = {
			RATE_LIMIT:
				"El servicio de IA está temporalmente ocupado. Inténtalo en unos minutos.",
			API_ERROR: "Error en el servicio de IA. Usando contenido predeterminado.",
			INVALID_RESPONSE:
				"Respuesta inválida del servicio de IA. Usando contenido predeterminado.",
			NETWORK_ERROR:
				"Error de conexión con el servicio de IA. Verifica tu conexión.",
			TIMEOUT:
				"El servicio de IA tardó demasiado en responder. Inténtalo nuevamente.",
			QUOTA_EXCEEDED:
				"Se ha alcanzado el límite de uso del servicio de IA por hoy.",
			MODEL_NOT_FOUND: "Modelo de IA no disponible. Usando modelo alternativo.",
		};

		super(message, code, retryable, userMessages[code], context);
	}
}

// Upload Service Errors
export class UploadError extends WizardError {
	constructor(
		message: string,
		code:
			| "FILE_TOO_LARGE"
			| "INVALID_TYPE"
			| "UPLOAD_FAILED"
			| "NETWORK_ERROR"
			| "QUOTA_EXCEEDED"
			| "PROCESSING_ERROR"
			| "SECURITY_VALIDATION_FAILED",
		retryable: boolean = false,
		context?: Record<string, any>,
	) {
		const userMessages = {
			FILE_TOO_LARGE:
				"El archivo es demasiado grande. El tamaño máximo permitido es 10MB.",
			INVALID_TYPE:
				"Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG y WebP.",
			UPLOAD_FAILED: "Error al subir el archivo. Inténtalo nuevamente.",
			NETWORK_ERROR:
				"Error de conexión durante la subida. Verifica tu conexión.",
			QUOTA_EXCEEDED: "Se ha alcanzado el límite de almacenamiento.",
			PROCESSING_ERROR:
				"Error al procesar la imagen. Inténtalo con otra imagen.",
			SECURITY_VALIDATION_FAILED:
				"El archivo no pasó las validaciones de seguridad.",
		};

		super(message, code, retryable, userMessages[code], context);
	}
}

// Validation Errors
export class ValidationError extends WizardError {
	public readonly fieldErrors: Record<string, string[]>;

	constructor(
		fieldErrors: Record<string, string[]>,
		message: string = "Error de validación",
		context?: Record<string, any>,
	) {
		super(
			message,
			"VALIDATION_ERROR",
			false,
			"Por favor corrige los errores en el formulario.",
			context,
		);
		this.fieldErrors = fieldErrors;
	}
}

// Map Service Errors
export class MapServiceError extends WizardError {
	constructor(
		message: string,
		code:
			| "GEOCODING_FAILED"
			| "COORDINATES_OUT_OF_BOUNDS"
			| "NETWORK_ERROR"
			| "SERVICE_UNAVAILABLE",
		retryable: boolean = false,
		context?: Record<string, any>,
	) {
		const userMessages = {
			GEOCODING_FAILED:
				"No se pudo obtener la ubicación. Verifica la dirección ingresada.",
			COORDINATES_OUT_OF_BOUNDS:
				"La ubicación debe estar dentro de República Dominicana.",
			NETWORK_ERROR: "Error de conexión con el servicio de mapas.",
			SERVICE_UNAVAILABLE:
				"El servicio de mapas no está disponible temporalmente.",
		};

		super(message, code, retryable, userMessages[code], context);
	}
}

// Draft Service Errors
export class DraftServiceError extends WizardError {
	constructor(
		message: string,
		code:
			| "SAVE_FAILED"
			| "LOAD_FAILED"
			| "DELETE_FAILED"
			| "NOT_FOUND"
			| "PERMISSION_DENIED",
		retryable: boolean = false,
		context?: Record<string, any>,
	) {
		const userMessages = {
			SAVE_FAILED: "Error al guardar el borrador. Inténtalo nuevamente.",
			LOAD_FAILED: "Error al cargar el borrador.",
			DELETE_FAILED: "Error al eliminar el borrador.",
			NOT_FOUND: "El borrador no fue encontrado.",
			PERMISSION_DENIED: "No tienes permisos para acceder a este borrador.",
		};

		super(message, code, retryable, userMessages[code], context);
	}
}

// Network Connectivity Error
export class NetworkError extends WizardError {
	constructor(
		message: string = "Error de conexión",
		context?: Record<string, any>,
	) {
		super(
			message,
			"NETWORK_ERROR",
			true,
			"Sin conexión a internet. Verifica tu conexión y vuelve a intentar.",
			context,
		);
	}
}

// Error factory for creating appropriate error instances
export class ErrorFactory {
	static createFromResponse(
		response: Response,
		context?: Record<string, any>,
	): WizardError {
		const status = response.status;

		if (status >= 500) {
			return new WizardError(
				`Server error: ${status}`,
				"SERVER_ERROR",
				true,
				"Error interno del servidor. Inténtalo más tarde.",
				{ status, ...context },
			);
		}

		if (status === 429) {
			return new AIServiceError(
				"Rate limit exceeded",
				"RATE_LIMIT",
				true,
				context,
			);
		}

		if (status === 413) {
			return new UploadError(
				"Payload too large",
				"FILE_TOO_LARGE",
				false,
				context,
			);
		}

		if (status >= 400) {
			return new WizardError(
				`Client error: ${status}`,
				"CLIENT_ERROR",
				false,
				"Error en la solicitud. Verifica los datos ingresados.",
				{ status, ...context },
			);
		}

		return new WizardError(
			`Unknown error: ${status}`,
			"UNKNOWN_ERROR",
			true,
			"Ha ocurrido un error inesperado.",
			{ status, ...context },
		);
	}

	static createFromError(
		error: unknown,
		context?: Record<string, any>,
	): WizardError {
		if (error instanceof WizardError) {
			return error;
		}

		if (error instanceof Error) {
			// Check for network errors
			if (
				error.message.includes("fetch") ||
				error.message.includes("network")
			) {
				return new NetworkError(error.message, context);
			}

			// Check for timeout errors
			if (error.message.includes("timeout")) {
				return new AIServiceError(error.message, "TIMEOUT", true, context);
			}

			return new WizardError(
				error.message,
				"UNKNOWN_ERROR",
				true,
				"Ha ocurrido un error inesperado.",
				context,
			);
		}

		return new WizardError(
			"Unknown error occurred",
			"UNKNOWN_ERROR",
			true,
			"Ha ocurrido un error inesperado.",
			context,
		);
	}
}
