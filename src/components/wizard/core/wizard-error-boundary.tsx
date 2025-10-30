"use client";

// Comprehensive Wizard Error Boundary with Recovery Strategies

import {
	AlertTriangle,
	RefreshCw,
	RotateCcw,
	Save,
	SkipForward,
} from "lucide-react";
import type React from "react";
import { Component, type ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { ErrorRecoveryStrategy, WizardError } from "@/types/wizard-core";

type WizardErrorBoundaryProps = {
	children: ReactNode;
	onError?: (error: WizardError) => void;
	fallback?: (error: WizardError, recovery: ErrorRecoveryStrategy) => ReactNode;
};

type WizardErrorBoundaryState = {
	error: WizardError | null;
	errorInfo: React.ErrorInfo | null;
	retryCount: number;
};

export class WizardErrorBoundary extends Component<
	WizardErrorBoundaryProps,
	WizardErrorBoundaryState
> {
	private readonly maxRetries = 3;

	constructor(props: WizardErrorBoundaryProps) {
		super(props);
		this.state = {
			error: null,
			errorInfo: null,
			retryCount: 0,
		};
	}

	static getDerivedStateFromError(
		error: Error
	): Partial<WizardErrorBoundaryState> {
		// Convert generic error to WizardError
		const wizardError: WizardError = {
			type: WizardErrorBoundary.classifyError(error),
			message: error.message,
			recoverable: WizardErrorBoundary.isRecoverable(error),
			timestamp: new Date(),
		};

		return {
			error: wizardError,
		};
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		this.setState({ errorInfo });

		// Call onError callback if provided
		if (this.props.onError && this.state.error) {
			this.props.onError(this.state.error);
		}

		// Report to error tracking service
		this.reportError(error, errorInfo);
	}

	static classifyError(error: Error): WizardError["type"] {
		const message = error.message.toLowerCase();

		if (message.includes("network") || message.includes("fetch")) {
			return "network";
		}

		if (message.includes("validation") || message.includes("invalid")) {
			return "validation";
		}

		if (message.includes("permission") || message.includes("unauthorized")) {
			return "permission";
		}

		if (message.includes("storage") || message.includes("quota")) {
			return "storage";
		}

		return "validation"; // Default fallback
	}

	static isRecoverable(error: Error): boolean {
		const message = error.message.toLowerCase();

		// Network errors are usually recoverable
		if (message.includes("network") || message.includes("fetch")) {
			return true;
		}

		// Storage errors might be recoverable
		if (message.includes("storage")) {
			return true;
		}

		// Permission errors are usually not recoverable by retry
		if (message.includes("permission") || message.includes("unauthorized")) {
			return false;
		}

		return true; // Default to recoverable
	}

	private reportError(error: Error, errorInfo: React.ErrorInfo) {
		// In a real implementation, this would send to an error tracking service
		// like Sentry, LogRocket, etc.
		const _errorReport = {
			error: {
				name: error.name,
				message: error.message,
				stack: error.stack,
			},
			errorInfo: {
				componentStack: errorInfo.componentStack,
			},
			timestamp: new Date().toISOString(),
			userAgent: navigator.userAgent,
			url: window.location.href,
		};
	}

	private createRecoveryStrategy(): ErrorRecoveryStrategy {
		return {
			retry: () => {
				if (this.state.retryCount < this.maxRetries) {
					this.setState((prevState) => ({
						error: null,
						errorInfo: null,
						retryCount: prevState.retryCount + 1,
					}));
				}
			},
			skip: () => {
				this.setState({ error: null, errorInfo: null });
			},
			goToStep: (_stepId: string) => {
				this.setState({ error: null, errorInfo: null });
			},
			saveDraft: () => {},
			reset: () => {
				this.setState({
					error: null,
					errorInfo: null,
					retryCount: 0,
				});
				// This would need to reset the wizard state
			},
		};
	}

	private renderErrorUI(error: WizardError, recovery: ErrorRecoveryStrategy) {
		const canRetry =
			error.recoverable && this.state.retryCount < this.maxRetries;

		return (
			<div className="flex min-h-[400px] items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader>
						<div className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-destructive" />
							<CardTitle>Error en el Asistente</CardTitle>
						</div>
						<CardDescription>
							{this.getErrorDescription(error.type)}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Alert>
							<AlertDescription>{error.message}</AlertDescription>
						</Alert>

						<div className="flex flex-col gap-2">
							{canRetry && (
								<Button
									className="w-full"
									onClick={recovery.retry}
									variant="default"
								>
									<RefreshCw className="mr-2 h-4 w-4" />
									Reintentar ({this.maxRetries - this.state.retryCount} intentos
									restantes)
								</Button>
							)}

							{error.type === "validation" && (
								<Button
									className="w-full"
									onClick={recovery.skip}
									variant="outline"
								>
									<SkipForward className="mr-2 h-4 w-4" />
									Continuar sin validar
								</Button>
							)}

							<Button
								className="w-full"
								onClick={recovery.saveDraft}
								variant="outline"
							>
								<Save className="mr-2 h-4 w-4" />
								Guardar progreso
							</Button>

							<Button
								className="w-full"
								onClick={recovery.reset}
								variant="outline"
							>
								<RotateCcw className="mr-2 h-4 w-4" />
								Reiniciar asistente
							</Button>
						</div>

						{process.env.NODE_ENV === "development" && this.state.errorInfo && (
							<details className="mt-4">
								<summary className="cursor-pointer text-muted-foreground text-sm">
									Detalles técnicos (desarrollo)
								</summary>
								<pre className="mt-2 max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
									{this.state.errorInfo.componentStack}
								</pre>
							</details>
						)}
					</CardContent>
				</Card>
			</div>
		);
	}

	private getErrorDescription(type: WizardError["type"]): string {
		switch (type) {
			case "network":
				return "Problema de conexión. Verifica tu conexión a internet.";
			case "validation":
				return "Error de validación en los datos ingresados.";
			case "storage":
				return "Error al guardar los datos. Puede que el almacenamiento esté lleno.";
			case "permission":
				return "No tienes permisos para realizar esta acción.";
			default:
				return "Ha ocurrido un error inesperado.";
		}
	}

	render() {
		const { error } = this.state;
		const { children, fallback } = this.props;

		if (error) {
			const recovery = this.createRecoveryStrategy();

			if (fallback) {
				return fallback(error, recovery);
			}

			return this.renderErrorUI(error, recovery);
		}

		return children;
	}
}

// Hook for programmatic error handling
export function useWizardErrorHandler() {
	const handleError = (error: Error, context?: string) => {
		const _wizardError: WizardError = {
			type: WizardErrorBoundary.classifyError(error),
			message: error.message,
			recoverable: WizardErrorBoundary.isRecoverable(error),
			timestamp: new Date(),
			step: context,
		};

		// This could dispatch to a global error state or throw to be caught by boundary
		throw error;
	};

	return { handleError };
}

// Higher-order component for wrapping wizard steps with error boundaries
export function withWizardErrorBoundary<P extends object>(
	Component: React.ComponentType<P>
) {
	return function WrappedComponent(props: P) {
		return (
			<WizardErrorBoundary>
				<Component {...props} />
			</WizardErrorBoundary>
		);
	};
}
