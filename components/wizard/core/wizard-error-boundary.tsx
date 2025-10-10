"use client";

// Comprehensive Wizard Error Boundary with Recovery Strategies

import React, { Component, ReactNode } from "react";
import {
  AlertTriangle,
  RefreshCw,
  SkipForward,
  Save,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WizardError, ErrorRecoveryStrategy } from "@/types/wizard-core";

interface WizardErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: WizardError) => void;
  fallback?: (error: WizardError, recovery: ErrorRecoveryStrategy) => ReactNode;
}

interface WizardErrorBoundaryState {
  error: WizardError | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export class WizardErrorBoundary extends Component<
  WizardErrorBoundaryProps,
  WizardErrorBoundaryState
> {
  private maxRetries = 3;

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

    // Log error for monitoring
    console.error("Wizard Error Boundary caught an error:", error, errorInfo);

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
    const errorReport = {
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

    // For now, just log to console
    console.error("Error Report:", errorReport);
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
        // This would need to be connected to the wizard's navigation
        console.log("Skip recovery strategy triggered");
        this.setState({ error: null, errorInfo: null });
      },
      goToStep: (stepId: string) => {
        // This would need to be connected to the wizard's navigation
        console.log("Go to step recovery strategy triggered:", stepId);
        this.setState({ error: null, errorInfo: null });
      },
      saveDraft: () => {
        // This would need to be connected to the wizard's save functionality
        console.log("Save draft recovery strategy triggered");
      },
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
      <div className="min-h-[400px] flex items-center justify-center p-4">
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
                  onClick={recovery.retry}
                  variant="default"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar ({this.maxRetries - this.state.retryCount} intentos
                  restantes)
                </Button>
              )}

              {error.type === "validation" && (
                <Button
                  onClick={recovery.skip}
                  variant="outline"
                  className="w-full"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Continuar sin validar
                </Button>
              )}

              <Button
                onClick={recovery.saveDraft}
                variant="outline"
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar progreso
              </Button>

              <Button
                onClick={recovery.reset}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reiniciar asistente
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Detalles técnicos (desarrollo)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
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
    const wizardError: WizardError = {
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
