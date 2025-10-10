"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Wifi, WifiOff, CloudOff, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useNetworkStatus,
  useOfflineQueue,
  executeWithOfflineSupport,
} from "@/lib/utils/network-detection";
import { NetworkError } from "@/lib/errors/wizard-errors";

export interface NetworkAwareWizardProps {
  children: React.ReactNode;
  onNetworkError?: (error: NetworkError) => void;
  onNetworkRecovery?: () => void;
  enableOfflineMode?: boolean;
  autoSaveInterval?: number;
  className?: string;
}

export function NetworkAwareWizard({
  children,
  onNetworkError,
  onNetworkRecovery,
  enableOfflineMode = true,
  autoSaveInterval = 30000,
  className,
}: NetworkAwareWizardProps) {
  const networkStatus = useNetworkStatus();
  const { queuedOperations, queueOperation, removeOperation, clearQueue } =
    useOfflineQueue();
  const [wasOffline, setWasOffline] = useState(false);
  const [showOfflineMode, setShowOfflineMode] = useState(false);

  // Handle network status changes
  useEffect(() => {
    if (!networkStatus.isOnline && !wasOffline) {
      // Just went offline
      setWasOffline(true);
      setShowOfflineMode(enableOfflineMode);

      const networkError = new NetworkError("Conexión perdida");
      onNetworkError?.(networkError);

      if (enableOfflineMode) {
        toast.info("Modo sin conexión activado", {
          description: "Los cambios se guardarán localmente",
          duration: 5000,
        });
      } else {
        toast.error("Sin conexión a internet", {
          description: "Algunas funciones no estarán disponibles",
          duration: Infinity,
        });
      }
    } else if (networkStatus.isOnline && wasOffline) {
      // Just came back online
      setWasOffline(false);
      setShowOfflineMode(false);

      onNetworkRecovery?.();

      toast.success("Conexión restaurada", {
        description:
          queuedOperations.length > 0
            ? `Procesando ${queuedOperations.length} operación(es) pendiente(s)`
            : "Todas las funciones están disponibles",
      });
    }
  }, [
    networkStatus.isOnline,
    wasOffline,
    enableOfflineMode,
    onNetworkError,
    onNetworkRecovery,
    queuedOperations.length,
  ]);

  // Network-aware operation wrapper
  const executeNetworkOperation = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      options: {
        description: string;
        fallback?: () => T;
        showToast?: boolean;
      }
    ): Promise<T> => {
      try {
        return await executeWithOfflineSupport(operation, {
          type: "general",
          description: options.description,
          fallback: options.fallback,
        });
      } catch (error) {
        if (options.showToast !== false) {
          toast.error("Error de red", {
            description: options.description + " falló",
          });
        }
        throw error;
      }
    },
    []
  );

  // Retry failed operations
  const retryFailedOperations = useCallback(async () => {
    if (!networkStatus.isOnline) {
      toast.error("Sin conexión", {
        description: "Verifica tu conexión a internet",
      });
      return;
    }

    toast.info("Reintentando operaciones...", {
      description: `${queuedOperations.length} operación(es) en cola`,
    });

    // The network detection service will automatically process queued operations
    // when network comes back online, so we just need to wait
  }, [networkStatus.isOnline, queuedOperations.length]);

  return (
    <div className={cn("relative", className)}>
      {/* Network Status Bar */}
      <NetworkStatusBar
        isOnline={networkStatus.isOnline}
        connectionType={networkStatus.effectiveType}
        queuedOperations={queuedOperations.length}
        onRetry={retryFailedOperations}
        showOfflineMode={showOfflineMode}
      />

      {/* Offline Mode Alert */}
      {showOfflineMode && (
        <OfflineModeAlert
          queuedOperations={queuedOperations}
          onClearQueue={clearQueue}
          onRetry={retryFailedOperations}
        />
      )}

      {/* Network-aware context provider */}
      <NetworkAwareContext.Provider
        value={{
          isOnline: networkStatus.isOnline,
          executeNetworkOperation,
          queueOperation,
          queuedOperations,
        }}
      >
        {children}
      </NetworkAwareContext.Provider>
    </div>
  );
}

// Network Status Bar Component
interface NetworkStatusBarProps {
  isOnline: boolean;
  connectionType?: string;
  queuedOperations: number;
  onRetry: () => void;
  showOfflineMode: boolean;
}

function NetworkStatusBar({
  isOnline,
  connectionType,
  queuedOperations,
  onRetry,
  showOfflineMode,
}: NetworkStatusBarProps) {
  if (isOnline && queuedOperations === 0) {
    return null; // Don't show when everything is normal
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        !isOnline
          ? "border-orange-200 bg-orange-50/95"
          : "border-green-200 bg-green-50/95"
      )}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-600" />
          ) : (
            <WifiOff className="w-4 h-4 text-orange-600" />
          )}

          <span className="text-sm font-medium">
            {isOnline ? "Conectado" : "Sin conexión"}
          </span>

          {connectionType && isOnline && (
            <Badge variant="outline" className="text-xs">
              {connectionType}
            </Badge>
          )}

          {queuedOperations > 0 && (
            <Badge variant="secondary" className="text-xs">
              {queuedOperations} pendiente{queuedOperations !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {queuedOperations > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-6 px-2"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}

// Offline Mode Alert Component
interface OfflineModeAlertProps {
  queuedOperations: Array<{
    id: string;
    description: string;
    timestamp: number;
  }>;
  onClearQueue: () => void;
  onRetry: () => void;
}

function OfflineModeAlert({
  queuedOperations,
  onClearQueue,
  onRetry,
}: OfflineModeAlertProps) {
  return (
    <Alert className="m-4 border-orange-200 bg-orange-50">
      <CloudOff className="w-4 h-4" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <p className="font-medium">Modo sin conexión activo</p>
            <p className="text-sm">
              Los cambios se guardan localmente y se sincronizarán cuando se
              restaure la conexión.
            </p>
          </div>

          {queuedOperations.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                Operaciones pendientes ({queuedOperations.length}):
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {queuedOperations.slice(0, 5).map((op) => (
                  <div
                    key={op.id}
                    className="text-xs p-2 bg-white rounded border"
                  >
                    <div className="font-medium">{op.description}</div>
                    <div className="text-gray-500">
                      {new Date(op.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {queuedOperations.length > 5 && (
                  <div className="text-xs text-gray-500 text-center">
                    ... y {queuedOperations.length - 5} más
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar conexión
            </Button>

            {queuedOperations.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearQueue}
                className="flex-1"
              >
                Limpiar cola
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Context for network-aware operations
const NetworkAwareContext = React.createContext<{
  isOnline: boolean;
  executeNetworkOperation: <T>(
    operation: () => Promise<T>,
    options: { description: string; fallback?: () => T; showToast?: boolean }
  ) => Promise<T>;
  queueOperation: (
    operation: () => Promise<any>,
    options: { type: any; description: string; data?: any; maxRetries?: number }
  ) => Promise<string>;
  queuedOperations: Array<{
    id: string;
    description: string;
    timestamp: number;
  }>;
} | null>(null);

// Hook to use network-aware operations
export function useNetworkAwareOperations() {
  const context = React.useContext(NetworkAwareContext);
  if (!context) {
    throw new Error(
      "useNetworkAwareOperations must be used within NetworkAwareWizard"
    );
  }
  return context;
}

// Network-aware fetch wrapper
export function useNetworkAwareFetch() {
  const { executeNetworkOperation } = useNetworkAwareOperations();

  return useCallback(
    async (
      url: string,
      options?: RequestInit & {
        description?: string;
        fallback?: () => any;
        timeout?: number;
      }
    ) => {
      const {
        description = "Operación de red",
        fallback,
        timeout = 10000,
        ...fetchOptions
      } = options || {};

      return executeNetworkOperation(
        async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          try {
            const response = await fetch(url, {
              ...fetchOptions,
              signal: controller.signal,
            });

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status}: ${response.statusText}`
              );
            }

            return response;
          } finally {
            clearTimeout(timeoutId);
          }
        },
        { description, fallback }
      );
    },
    [executeNetworkOperation]
  );
}

// HOC for wrapping components with network awareness
export function withNetworkAwareness<P extends object>(
  Component: React.ComponentType<P>,
  options?: Partial<NetworkAwareWizardProps>
) {
  const WrappedComponent = (props: P) => (
    <NetworkAwareWizard {...options}>
      <Component {...props} />
    </NetworkAwareWizard>
  );

  WrappedComponent.displayName = `withNetworkAwareness(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
