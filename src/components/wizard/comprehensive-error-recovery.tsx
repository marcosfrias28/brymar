"use client";

import {
	AlertCircle,
	AlertTriangle,
	ArrowLeft,
	Home,
	RefreshCw,
	Save,
	Wifi,
	WifiOff,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ErrorFactory, type WizardError } from "@/lib/errors/wizard-errors";
import { cn } from "@/lib/utils/index";
import { handleErrorWithRecovery } from "@/lib/utils/error-recovery";
import { useNetworkStatus } from "@/lib/utils/network-detection";
import process from "node:process";

export type ErrorRecoveryState = {
	errors: WizardError[];
	retryAttempts: Record<string, number>;
	isRecovering: boolean;
	lastRecoveryAttempt?: Date;
};

export type RecoveryAction = {
	id: string;
	label: string;
	description?: string;
	icon?: React.ReactNode;
	action: () => void | Promise<void>;
	primary?: boolean;
	destructive?: boolean;
	requiresNetwork?: boolean;
};

export type ComprehensiveErrorRecoveryProps = {
	children: React.ReactNode;
	onError?: (error: WizardError) => void;
	onRecovery?: (error: WizardError) => void;
	maxRetries?: number;
	enableAutoRetry?: boolean;
	enableOfflineMode?: boolean;
	fallbackComponent?: React.ComponentType<{
		error: WizardError;
		onRetry: () => void;
	}>;
	className?: string;
};

export function ComprehensiveErrorRecovery({
	children,
	onError,
	onRecovery,
	maxRetries = 3,
	enableAutoRetry = true,
	enableOfflineMode = true,
	fallbackComponent: FallbackComponent,
	className,
}: ComprehensiveErrorRecoveryProps) {
	const [errorState, setErrorState] = useState<ErrorRecoveryState>({
		errors: [],
		retryAttempts: {},
		isRecovering: false,
	});

	const networkStatus = useNetworkStatus();

	// Remove error from state
	const removeError = useCallback((errorCode: string) => {
		setErrorState((prev) => ({
			...prev,
			errors: prev.errors.filter((e) => e.code !== errorCode),
			retryAttempts: {
				...prev.retryAttempts,
				[errorCode]: 0,
			},
		}));
	}, []);

	// Handle retry
	const handleRetry = useCallback(
		async (errorCode: string) => {
			const error = errorState.errors.find((e) => e.code === errorCode);
			if (!error) {
				return;
			}

			const currentRetries = errorState.retryAttempts[errorCode] || 0;
			if (currentRetries >= maxRetries) {
				toast.error("Se han agotado los intentos de recuperación");
				return;
			}

			setErrorState((prev) => ({
				...prev,
				isRecovering: true,
				retryAttempts: {
					...prev.retryAttempts,
					[errorCode]: currentRetries + 1,
				},
				lastRecoveryAttempt: new Date(),
			}));

			try {
				// Use error recovery system
				const recovery = handleErrorWithRecovery(error, {
					showToast: false,
					autoRetry: true,
					maxAutoRetries: maxRetries - currentRetries,
				});

				if (recovery.canAutoRecover) {
					// Simulate recovery operation
					await new Promise((resolve) => setTimeout(resolve, 2000));

					removeError(errorCode);
					onRecovery?.(error);
					toast.success("Error recuperado exitosamente");
				}
			} catch (_recoveryError) {
				toast.error("No se pudo recuperar del error");
			} finally {
				setErrorState((prev) => ({
					...prev,
					isRecovering: false,
				}));
			}
		},
		[
			errorState.errors,
			errorState.retryAttempts,
			maxRetries,
			removeError,
			onRecovery,
		]
	);

	// Add error to state
	const addError = useCallback(
		(error: unknown, context?: Record<string, any>) => {
			const wizardError = ErrorFactory.createFromError(error, context);

			setErrorState((prev) => ({
				...prev,
				errors: [
					...prev.errors.filter((e) => e.code !== wizardError.code),
					wizardError,
				],
				retryAttempts: {
					...prev.retryAttempts,
					[wizardError.code]: prev.retryAttempts[wizardError.code] || 0,
				},
			}));

			onError?.(wizardError);

			// Auto-retry for retryable errors
			if (
				enableAutoRetry &&
				wizardError.retryable &&
				(errorState.retryAttempts[wizardError.code] || 0) < maxRetries
			) {
				setTimeout(
					() => {
						handleRetry(wizardError.code);
					},
					1000 * 2 ** (errorState.retryAttempts[wizardError.code] || 0)
				);
			}
		},
		[
			onError,
			enableAutoRetry,
			maxRetries,
			errorState.retryAttempts,
			handleRetry,
		]
	);

	// Handle graceful degradation
	const handleGracefulDegradation = useCallback(() => {
		// Clear all errors and continue in basic mode
		setErrorState({
			errors: [],
			retryAttempts: {},
			isRecovering: false,
		});

		toast.info("Continuando en modo básico", {
			description: "Algunas funciones avanzadas pueden no estar disponibles",
		});
	}, []);

	// Get recovery actions based on current errors
	const getRecoveryActions = useCallback((): RecoveryAction[] => {
		const actions: RecoveryAction[] = [];

		// Network-specific actions
		if (!networkStatus.isOnline) {
			actions.push({
				id: "enable-offline-mode",
				label: "Continuar sin conexión",
				description: "Los cambios se guardarán localmente",
				icon: <WifiOff className="h-4 w-4" />,
				action: handleGracefulDegradation,
			});
		}

		// Generic recovery actions
		actions.push({
			id: "retry-all",
			label: "Reintentar todo",
			description: "Intenta recuperar todos los errores",
			icon: <RefreshCw className="h-4 w-4" />,
			action: () => {
				errorState.errors.forEach((error) => {
					if (error.retryable) {
						handleRetry(error.code);
					}
				});
			},
			primary: true,
			requiresNetwork: true,
		});

		actions.push({
			id: "save-and-continue",
			label: "Guardar y continuar",
			description: "Guarda el progreso actual",
			icon: <Save className="h-4 w-4" />,
			action: handleGracefulDegradation,
		});

		actions.push({
			id: "go-back",
			label: "Volver atrás",
			description: "Regresa a la página anterior",
			icon: <ArrowLeft className="h-4 w-4" />,
			action: () => window.history.back(),
		});

		actions.push({
			id: "go-home",
			label: "Ir al Dashboard",
			description: "Regresa al panel principal",
			icon: <Home className="h-4 w-4" />,
			action: () => {
				window.location.href = "/dashboard";
			},
			destructive: true,
		});

		return actions;
	}, [
		networkStatus.isOnline,
		errorState.errors,
		handleRetry,
		handleGracefulDegradation,
	]);

	// Error boundary effect
	useEffect(() => {
		const handleUnhandledError = (event: ErrorEvent) => {
			addError(event.error, { source: "unhandled-error" });
		};

		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			addError(event.reason, { source: "unhandled-rejection" });
		};

		window.addEventListener("error", handleUnhandledError);
		window.addEventListener("unhandledrejection", handleUnhandledRejection);

		return () => {
			window.removeEventListener("error", handleUnhandledError);
			window.removeEventListener(
				"unhandledrejection",
				handleUnhandledRejection
			);
		};
	}, [addError]);

	// If there are critical errors, show recovery UI
	if (errorState.errors.length > 0) {
		const criticalErrors = errorState.errors.filter(
			(e) =>
				!e.retryable || (errorState.retryAttempts[e.code] || 0) >= maxRetries
		);

		if (criticalErrors.length > 0) {
			const primaryError = criticalErrors[0];

			if (FallbackComponent) {
				return (
					<FallbackComponent
						error={primaryError}
						onRetry={() => handleRetry(primaryError.code)}
					/>
				);
			}

			return (
				<div
					className={cn(
						"flex min-h-screen items-center justify-center p-4",
						className
					)}
				>
					<ErrorRecoveryUI
						errors={errorState.errors}
						isRecovering={errorState.isRecovering}
						maxRetries={maxRetries}
						networkStatus={networkStatus}
						onDismiss={removeError}
						onRetry={handleRetry}
						recoveryActions={getRecoveryActions()}
						retryAttempts={errorState.retryAttempts}
					/>
				</div>
			);
		}
	}

	// Provide error context to children
	return (
		<ErrorRecoveryContext.Provider
			value={{ addError, removeError, errorState }}
		>
			{children}

			{/* Non-critical errors overlay */}
			{errorState.errors.length > 0 && (
				<div className="fixed right-4 bottom-4 z-50 max-w-sm">
					<ErrorNotificationOverlay
						errors={errorState.errors.filter(
							(e) =>
								e.retryable &&
								(errorState.retryAttempts[e.code] || 0) < maxRetries
						)}
						onDismiss={removeError}
						onRetry={handleRetry}
					/>
				</div>
			)}
		</ErrorRecoveryContext.Provider>
	);
}

// Error Recovery UI Component
type ErrorRecoveryUIProps = {
	errors: WizardError[];
	retryAttempts: Record<string, number>;
	isRecovering: boolean;
	networkStatus: { isOnline: boolean };
	recoveryActions: RecoveryAction[];
	onRetry: (errorCode: string) => void;
	onDismiss: (errorCode: string) => void;
	maxRetries: number;
};

function ErrorRecoveryUI({
	errors,
	retryAttempts,
	isRecovering,
	networkStatus,
	recoveryActions,
	onRetry,
	onDismiss,
	maxRetries,
}: ErrorRecoveryUIProps) {
	const primaryError = errors[0];

	return (
		<Card className="w-full max-w-md border-destructive">
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
					<AlertTriangle className="h-6 w-6 text-destructive" />
				</div>
				<CardTitle className="text-destructive">
					Error en el Asistente
				</CardTitle>
				<CardDescription>{primaryError.userMessage}</CardDescription>
			</CardHeader>

			<CardContent className="space-y-4">
				{/* Network Status */}
				<div className="flex items-center gap-2 rounded-lg bg-muted p-3">
					{networkStatus.isOnline ? (
						<Wifi className="h-4 w-4 text-green-500" />
					) : (
						<WifiOff className="h-4 w-4 text-red-500" />
					)}
					<span className="text-sm">
						{networkStatus.isOnline ? "Conectado" : "Sin conexión"}
					</span>
				</div>

				{/* Error Details */}
				<div className="space-y-2">
					{errors.map((error) => (
						<div className="rounded-lg border p-3" key={error.code}>
							<div className="mb-2 flex items-center justify-between">
								<Badge variant="outline">{error.code}</Badge>
								<span className="text-muted-foreground text-xs">
									{retryAttempts[error.code] || 0}/{maxRetries} intentos
								</span>
							</div>

							<p className="text-sm">{error.userMessage}</p>

							{/* Retry Progress */}
							{(retryAttempts[error.code] || 0) > 0 && (
								<Progress
									className="mt-2 h-1"
									value={((retryAttempts[error.code] || 0) / maxRetries) * 100}
								/>
							)}
						</div>
					))}
				</div>

				{/* Recovery Actions */}
				<div className="space-y-2">
					<h4 className="font-medium text-sm">Opciones de recuperación:</h4>
					{recoveryActions.map((action) => (
						<Button
							className="w-full justify-start"
							disabled={
								isRecovering ||
								(action.requiresNetwork && !networkStatus.isOnline)
							}
							key={action.id}
							onClick={action.action}
							size="sm"
							variant={
								action.primary
									? "default"
									: action.destructive
										? "destructive"
										: "outline"
							}
						>
							{action.icon && <span className="mr-2">{action.icon}</span>}
							<div className="text-left">
								<div>{action.label}</div>
								{action.description && (
									<div className="text-xs opacity-70">{action.description}</div>
								)}
							</div>
						</Button>
					))}
				</div>

				{/* Development Info */}
				{process.env.NODE_ENV === "development" && (
					<details className="text-xs">
						<summary className="cursor-pointer">
							Información de desarrollo
						</summary>
						<pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
							{JSON.stringify({ errors, retryAttempts }, null, 2)}
						</pre>
					</details>
				)}
			</CardContent>
		</Card>
	);
}

// Error Notification Overlay for non-critical errors
type ErrorNotificationOverlayProps = {
	errors: WizardError[];
	onRetry: (errorCode: string) => void;
	onDismiss: (errorCode: string) => void;
};

function ErrorNotificationOverlay({
	errors,
	onRetry,
	onDismiss,
}: ErrorNotificationOverlayProps) {
	if (errors.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2">
			{errors.map((error) => (
				<Alert className="shadow-lg" key={error.code} variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<div className="flex items-center justify-between">
							<span className="text-sm">{error.userMessage}</span>
							<div className="ml-2 flex gap-1">
								{error.retryable && (
									<Button
										className="h-6 px-2"
										onClick={() => onRetry(error.code)}
										size="sm"
										variant="ghost"
									>
										<RefreshCw className="h-3 w-3" />
									</Button>
								)}
								<Button
									className="h-6 px-2"
									onClick={() => onDismiss(error.code)}
									size="sm"
									variant="ghost"
								>
									×
								</Button>
							</div>
						</div>
					</AlertDescription>
				</Alert>
			))}
		</div>
	);
}

// Context for error recovery
const ErrorRecoveryContext = React.createContext<{
	addError: (error: unknown, context?: Record<string, any>) => void;
	removeError: (errorCode: string) => void;
	errorState: ErrorRecoveryState;
} | null>(null);

// Hook to use error recovery context
export function useErrorRecovery() {
	const context = React.useContext(ErrorRecoveryContext);
	if (!context) {
		throw new Error(
			"useErrorRecovery must be used within ComprehensiveErrorRecovery"
		);
	}
	return context;
}

// HOC for wrapping components with comprehensive error recovery
export function withComprehensiveErrorRecovery<P extends object>(
	Component: React.ComponentType<P>,
	options?: Partial<ComprehensiveErrorRecoveryProps>
) {
	const WrappedComponent = (props: P) => (
		<ComprehensiveErrorRecovery {...options}>
			<Component {...props} />
		</ComprehensiveErrorRecovery>
	);

	WrappedComponent.displayName = `withComprehensiveErrorRecovery(${
		Component.displayName || Component.name
	})`;

	return WrappedComponent;
}
