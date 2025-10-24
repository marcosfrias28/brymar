// Configuración del logger basada en variables de entorno
const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";

// Define our own LogLevel enum since better-auth doesn't export it
enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARNING = 2,
	ERROR = 3,
	CRITICAL = 4,
}

interface LoggerConfig {
	level: LogLevel;
	enableConsole: boolean;
	enableFile: boolean;
	filePath?: string;
	sanitizeErrors: boolean;
}

// Función para obtener el nivel de log desde variables de entorno
function getLogLevel(): LogLevel {
	const envLevel = process.env.LOG_LEVEL?.toLowerCase();
	switch (envLevel) {
		case "debug":
			return LogLevel.DEBUG;
		case "info":
			return LogLevel.INFO;
		case "warn":
			return LogLevel.WARNING;
		case "error":
			return LogLevel.ERROR;
		default:
			return LogLevel.INFO;
	}
}

// Función para parsear valores booleanos de variables de entorno
function parseEnvBoolean(
	value: string | undefined,
	defaultValue: boolean,
): boolean {
	if (value === undefined) return defaultValue;
	return value.toLowerCase() === "true";
}

// Configuración por defecto basada en el entorno
const getDefaultConfig = (): LoggerConfig => {
	return {
		level: getLogLevel(),
		enableConsole: parseEnvBoolean(process.env.LOG_CONSOLE, isDevelopment),
		enableFile: parseEnvBoolean(process.env.LOG_FILE, true),
		filePath: process.env.LOG_FILE_PATH || "./logs/app.log",
		sanitizeErrors: parseEnvBoolean(process.env.LOG_SANITIZE, isProduction),
	};
};

// Configuración global del logger
const config = getDefaultConfig();

// Funciones auxiliares del logger
function shouldLog(level: LogLevel): boolean {
	return level >= config.level;
}

function formatMessage(
	level: LogLevel,
	message: string,
	context?: any,
): string {
	const timestamp = new Date().toISOString();
	const levelName = LogLevel[level];
	const contextStr = context
		? ` | Context: ${JSON.stringify(context, null, 2)}`
		: "";

	return `[${timestamp}] [${levelName}] ${message}${contextStr}`;
}

function sanitizeError(error: any): string {
	if (!config.sanitizeErrors) {
		return typeof error === "string" ? error : JSON.stringify(error, null, 2);
	}

	// En producción, sanitizar errores sensibles
	if (typeof error === "string") {
		// Remover información sensible común
		return error
			.replace(/api[_-]?key[s]?[\s]*[:=][\s]*[\w-]+/gi, "api_key=***")
			.replace(/token[s]?[\s]*[:=][\s]*[\w\-.]+/gi, "token=***")
			.replace(/password[s]?[\s]*[:=][\s]*[\w-]+/gi, "password=***")
			.replace(/secret[s]?[\s]*[:=][\s]*[\w-]+/gi, "secret=***")
			.replace(/resend[\s]*error/gi, "email service error")
			.replace(/domain[\s]+not[\s]+verified/gi, "email configuration issue");
	}

	if (error && typeof error === "object") {
		// Para objetos de error, devolver solo información segura
		return "System error occurred";
	}

	return "Unknown error occurred";
}

function logMessage(level: LogLevel, message: string, context?: any): void {
	if (!shouldLog(level)) return;

	const formattedMessage = formatMessage(level, message, context);

	// Log a consola solo en desarrollo
	if (config.enableConsole) {
		const consoleMethod =
			level >= LogLevel.ERROR
				? "error"
				: level >= LogLevel.WARNING
					? "warn"
					: level >= LogLevel.INFO
						? "info"
						: "log";
		console[consoleMethod](formattedMessage);
	}

	// En producción, aquí se podría implementar logging a archivo o servicio externo
	if (config.enableFile && process.env.NODE_ENV === "production") {
		// TODO: Implementar logging a archivo o servicio de monitoreo
		// Por ejemplo: Winston, Pino, o servicio como DataDog, Sentry
	}
}

// Funciones públicas del logger
export async function debug(message: string, context?: any): Promise<void> {
	logMessage(LogLevel.DEBUG, message, context);
}

export async function info(message: string, context?: any): Promise<void> {
	logMessage(LogLevel.INFO, message, context);
}

export async function warning(message: string, context?: any): Promise<void> {
	logMessage(LogLevel.WARNING, message, context);
}

export async function error(
	message: string,
	errorObj?: any,
	context?: any,
): Promise<void> {
	const sanitizedError = errorObj ? sanitizeError(errorObj) : "";
	const fullMessage = sanitizedError
		? `${message}: ${sanitizedError}`
		: message;
	logMessage(LogLevel.ERROR, fullMessage, context);
}

export async function critical(
	message: string,
	errorObj?: any,
	context?: any,
): Promise<void> {
	const sanitizedError = errorObj ? sanitizeError(errorObj) : "";
	const fullMessage = sanitizedError
		? `${message}: ${sanitizedError}`
		: message;
	logMessage(LogLevel.CRITICAL, fullMessage, context);
}

// Utilidades para mensajes de usuario
export const UserMessages = {
	EMAIL_SEND_ERROR:
		"No se pudo enviar el código de verificación. Por favor, inténtalo de nuevo.",
	EMAIL_VERIFICATION_ERROR: "Código de verificación inválido o expirado.",
	AUTH_ERROR: "Error de autenticación. Por favor, verifica tus credenciales.",
	SYSTEM_ERROR:
		"Ha ocurrido un error del sistema. Por favor, inténtalo más tarde.",
	NETWORK_ERROR:
		"Error de conexión. Por favor, verifica tu conexión a internet.",
	VALIDATION_ERROR: "Los datos proporcionados no son válidos.",
} as const;

// Función para obtener mensaje de usuario seguro
export async function getSafeUserMessage(
	errorType: keyof typeof UserMessages,
): Promise<string> {
	return UserMessages[errorType];
}
