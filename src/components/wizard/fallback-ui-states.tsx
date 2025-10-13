/**
 * Wizard Fallback UI States
 *
 * Provides consistent fallback UI components for loading states,
 * error states, and empty states across all wizard implementations.
 */

import React from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";

interface WizardFallbackUIProps {
  loading?: boolean;
  error?: Error | string;
  empty?: boolean;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

export function WizardFallbackUI({
  loading = false,
  error,
  empty = false,
  onRetry,
  onGoBack,
  onGoHome,
  title,
  description,
  showDetails = false,
}: WizardFallbackUIProps) {
  // Loading State
  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </div>
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-2 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Form skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4 md:col-span-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>

          {/* Navigation skeleton */}
          <div className="flex justify-between pt-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (error) {
    const errorMessage = typeof error === "string" ? error : error.message;

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-destructive">
            {title || "Error en el Asistente"}
          </CardTitle>
          <p className="text-muted-foreground">
            {description ||
              "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDetails && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive font-mono">
                {errorMessage}
              </p>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            {onRetry && (
              <Button onClick={onRetry} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            )}
            {onGoBack && (
              <Button onClick={onGoBack} variant="outline">
                Volver
              </Button>
            )}
            {onGoHome && (
              <Button onClick={onGoHome} variant="secondary">
                Inicio
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (empty) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>{title || "No hay datos disponibles"}</CardTitle>
          <p className="text-muted-foreground">
            {description ||
              "No se encontraron datos para mostrar en este momento."}
          </p>
        </CardHeader>
        <CardContent className="text-center">
          {onGoBack && (
            <Button onClick={onGoBack} variant="outline">
              Volver
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default fallback
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8 text-center">
        <p className="text-muted-foreground">Cargando asistente...</p>
      </CardContent>
    </Card>
  );
}

// Specialized fallback components
export function WizardLoadingSkeleton() {
  return <WizardFallbackUI loading={true} />;
}

export function WizardErrorFallback({
  error,
  onRetry,
}: {
  error: Error;
  onRetry: () => void;
}) {
  return (
    <WizardFallbackUI
      error={error}
      onRetry={onRetry}
      title="Error en el Asistente"
      description="Ha ocurrido un error al cargar el asistente. Por favor, inténtalo de nuevo."
    />
  );
}

export function WizardEmptyState({
  title,
  description,
  onGoBack,
}: {
  title?: string;
  description?: string;
  onGoBack?: () => void;
}) {
  return (
    <WizardFallbackUI
      empty={true}
      title={title}
      description={description}
      onGoBack={onGoBack}
    />
  );
}
