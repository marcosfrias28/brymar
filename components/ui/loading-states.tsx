"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Loader2,
  RefreshCw,
  Download,
  Upload,
  Save,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
      loading={loading}
      loadingText={loadingText}
      icon={Save}
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
      loading={loading}
      loadingText={loadingText}
      icon={Search}
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
      loading={loading}
      loadingText={loadingText}
      icon={RefreshCw}
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
      loading={loading}
      loadingText={loadingText}
      icon={Upload}
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
      loading={loading}
      loadingText={loadingText}
      icon={Download}
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
          "rounded-full border-2 border-secondary/30 border-t-secondary animate-spin",
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
          key={i}
          className={cn(
            "h-2 w-2 rounded-full bg-secondary animate-pulse",
            `animation-delay-${i * 200}ms`
          )}
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
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progreso</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2">
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
        "flex items-center gap-2 text-sm text-muted-foreground",
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
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg",
        secondaryColorClasses.accent,
        className
      )}
    >
      <div className="text-center space-y-3">
        <LoadingSpinner />
        <p className="text-sm text-muted-foreground">{message}</p>
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
        "flex flex-col items-center justify-center p-8 space-y-4",
        className
      )}
    >
      <div className={cn("p-4 rounded-full", secondaryColorClasses.accent)}>
        <LoadingSpinner size="lg" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-medium">{message}</p>
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
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className={cn(
                "h-4 rounded animate-pulse",
                j === 0 ? "w-24 bg-secondary/20" : "flex-1 bg-muted"
              )}
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
      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      <div
        className={cn(
          "h-10 w-full rounded-md border animate-pulse",
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
      <div className="h-6 w-48 bg-muted animate-pulse rounded" />
      <div className="space-y-3">
        <FieldLoadingState />
        <FieldLoadingState />
        <FieldLoadingState />
      </div>
      <div className="flex justify-between pt-4">
        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
      </div>
    </div>
  ),

  NavigationLoading: () => (
    <div className="space-y-4">
      <div className="h-2 w-full bg-muted animate-pulse rounded" />
      <div className="flex justify-between">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-muted animate-pulse rounded-full" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  ),

  MapLoading: () => (
    <div className="w-full h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-center space-y-2">
        <LoadingSpinner />
        <p className="text-sm text-muted-foreground">Cargando mapa...</p>
      </div>
    </div>
  ),

  ImageUploadLoading: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="aspect-video bg-muted animate-pulse rounded-lg"
        />
      ))}
    </div>
  ),
};
