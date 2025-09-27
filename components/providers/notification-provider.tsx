"use client";

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { toast } from "sonner";

interface NotificationContextType {
  notifySuccess: (message: string, description?: string) => void;
  notifyError: (message: string, description?: string) => void;
  notifyLoading: (message: string) => string;
  notifyInfo: (message: string, description?: string) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  // Specialized notification methods
  notifyMutationStart: (operation: string) => string;
  notifyMutationSuccess: (operation: string, loadingId?: string) => void;
  notifyMutationError: (
    operation: string,
    error?: string,
    loadingId?: string
  ) => void;
  notifyOffline: () => void;
  notifyOnline: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const activeLoadingToasts = useRef<Map<string, string>>(new Map());
  const offlineToastId = useRef<string | null>(null);

  const notifySuccess = useCallback((message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  }, []);

  const notifyError = useCallback((message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 6000,
      action: {
        label: "Cerrar",
        onClick: () => {},
      },
    });
  }, []);

  const notifyLoading = useCallback((message: string): string => {
    return String(
      toast.loading(message, {
        duration: Infinity,
      })
    );
  }, []);

  const notifyInfo = useCallback((message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    toast.dismiss(id);
  }, []);

  const dismissAll = useCallback(() => {
    toast.dismiss();
    activeLoadingToasts.current.clear();
  }, []);

  // Specialized methods for mutations
  const notifyMutationStart = useCallback(
    (operation: string): string => {
      const messages = {
        create: "Creando...",
        update: "Actualizando...",
        delete: "Eliminando...",
        save: "Guardando...",
      };

      const message =
        messages[operation as keyof typeof messages] || "Procesando...";
      const id = notifyLoading(message);
      activeLoadingToasts.current.set(operation, id);
      return id;
    },
    [notifyLoading]
  );

  const notifyMutationSuccess = useCallback(
    (operation: string, loadingId?: string) => {
      const messages = {
        create: "Creado exitosamente",
        update: "Actualizado exitosamente",
        delete: "Eliminado exitosamente",
        save: "Guardado exitosamente",
      };

      // Dismiss loading toast
      const toastId = loadingId || activeLoadingToasts.current.get(operation);
      if (toastId) {
        dismiss(toastId);
        activeLoadingToasts.current.delete(operation);
      }

      const message =
        messages[operation as keyof typeof messages] || "Operación completada";
      notifySuccess(message);
    },
    [dismiss, notifySuccess]
  );

  const notifyMutationError = useCallback(
    (operation: string, error?: string, loadingId?: string) => {
      const messages = {
        create: "Error al crear",
        update: "Error al actualizar",
        delete: "Error al eliminar",
        save: "Error al guardar",
      };

      // Dismiss loading toast
      const toastId = loadingId || activeLoadingToasts.current.get(operation);
      if (toastId) {
        dismiss(toastId);
        activeLoadingToasts.current.delete(operation);
      }

      const message =
        messages[operation as keyof typeof messages] || "Error en la operación";
      notifyError(message, error || "Por favor, inténtalo de nuevo");
    },
    [dismiss, notifyError]
  );

  // Network status notifications
  const notifyOffline = useCallback(() => {
    if (offlineToastId.current) return; // Don't show multiple offline toasts

    offlineToastId.current = String(
      toast.error("Sin conexión a internet", {
        description: "Algunos datos pueden no estar actualizados",
        duration: Infinity,
        action: {
          label: "Reintentar",
          onClick: () => {
            window.location.reload();
          },
        },
      })
    );
  }, []);

  const notifyOnline = useCallback(() => {
    if (offlineToastId.current) {
      dismiss(offlineToastId.current);
      offlineToastId.current = null;
    }

    notifySuccess("Conexión restaurada", "Los datos se están sincronizando");
  }, [dismiss, notifySuccess]);

  const value: NotificationContextType = {
    notifySuccess,
    notifyError,
    notifyLoading,
    notifyInfo,
    dismiss,
    dismissAll,
    notifyMutationStart,
    notifyMutationSuccess,
    notifyMutationError,
    notifyOffline,
    notifyOnline,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
}
