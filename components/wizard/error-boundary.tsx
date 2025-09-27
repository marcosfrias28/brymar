"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WizardError } from "../../lib/errors/wizard-errors";
import { handleErrorWithRecovery } from "../../lib/utils/error-recovery";
import { useNetworkStatus } from "../../lib/utils/network-detection";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  retryCount: number;
}

export class WizardErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Handle error with recovery system
    handleErrorWithRecovery(error, {
      context: "React Error Boundary",
      showToast: false, // Don't show toast as we'll show UI
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error("Wizard Error Boundary caught an error:", error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetError();
      }
    }
  }

  resetError = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState((prevState) => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError && error) {
      if (Fallback) {
        return (
          <Fallback
            error={error}
            resetError={this.resetError}
            retryCount={retryCount}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={error}
          resetError={this.resetError}
          retryCount={retryCount}
        />
      );
    }

    return children;
  }
}

function DefaultErrorFallback({
  error,
  resetError,
  retryCount,
}: ErrorFallbackProps) {
  const networkStatus = useNetworkStatus();
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);

    // Add a small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 1000));

    resetError();
    setIsRetrying(false);
  };

  const handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleReload = () => {
    window.location.reload();
  };

  // Determine error type and appropriate actions
  const isNetworkError =
    !networkStatus.isOnline ||
    error.message.includes("network") ||
    error.message.includes("fetch");
  const isWizardError = error instanceof WizardError;
  const canRetry = isWizardError ? (error as WizardError).retryable : true;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {isNetworkError ? "Error de Conexión" : "Algo salió mal"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isNetworkError
              ? "No se pudo conectar al servidor. Verifica tu conexión a internet."
              : isWizardError
              ? (error as WizardError).userMessage
              : "Ha ocurrido un error inesperado en el asistente de propiedades."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Network Status */}
          {isNetworkError && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    networkStatus.isOnline ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-yellow-800">
                  {networkStatus.isOnline ? "Conectado" : "Sin conexión"}
                </span>
              </div>
            </div>
          )}

          {/* Retry Information */}
          {retryCount > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Intentos de recuperación: {retryCount}
              </p>
            </div>
          )}

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === "development" && (
            <details className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                Detalles del error (desarrollo)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {canRetry && (
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Reintentando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reintentar
                  </>
                )}
              </Button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>

              <Button
                variant="outline"
                onClick={handleGoHome}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Inicio
              </Button>
            </div>

            {!canRetry && (
              <Button
                variant="secondary"
                onClick={handleReload}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recargar página
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Si el problema persiste, contacta al soporte técnico.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for using error boundary programmatically
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    // This will be caught by the nearest error boundary
    throw error;
  }, []);
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <WizardErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </WizardErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

// Async error boundary for handling promise rejections
export function AsyncErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);

      handleErrorWithRecovery(event.reason, {
        context: "Unhandled Promise Rejection",
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  return <>{children}</>;
}
