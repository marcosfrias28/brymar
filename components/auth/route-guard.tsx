"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { Loader2 } from "lucide-react";
import type { RolePermissions } from "@/lib/auth/permissions";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: keyof RolePermissions;
  requiredRoute?: string;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Componente per proteggere le route basato sui permessi dell'utente
 * Può essere utilizzato per avvolgere componenti che richiedono permessi specifici
 */
export function RouteGuard({
  children,
  requiredPermission,
  requiredRoute,
  fallback,
  redirectTo = "/sign-in"
}: RouteGuardProps) {
  const { hasPermission, hasRoutePermission, isLoading, userRole } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Se non c'è un utente autenticato, reindirizza al login
    if (!userRole) {
      router.push(redirectTo);
      return;
    }

    // Verifica permesso specifico
    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push(redirectTo);
      return;
    }

    // Verifica permesso per route specifica
    if (requiredRoute && !hasRoutePermission(requiredRoute)) {
      router.push(redirectTo);
      return;
    }
  }, [isLoading, userRole, hasPermission, hasRoutePermission, requiredPermission, requiredRoute, router, redirectTo]);

  // Mostra loading durante la verifica
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verificando permisos...</span>
      </div>
    );
  }

  // Se non c'è un utente autenticato, mostra fallback o nulla
  if (!userRole) {
    return fallback || null;
  }

  // Verifica permesso specifico
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  // Verifica permesso per route specifica
  if (requiredRoute && !hasRoutePermission(requiredRoute)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  // Se tutti i controlli passano, mostra il contenuto
  return <>{children}</>;
}

/**
 * Componente per mostrare contenuto solo se l'utente ha un permesso specifico
 */
interface PermissionGateProps {
  children: React.ReactNode;
  permission: keyof RolePermissions;
  fallback?: React.ReactNode;
}

export function PermissionGate({ children, permission, fallback }: PermissionGateProps) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  if (!hasPermission(permission)) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Componente per mostrare contenuto solo per ruoli specifici
 * Supporta sia ruoli globali che ruoli specifici di organizzazione
 */
interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: string[];
  organizationId?: string; // Per verificare ruoli specifici di organizzazione
  fallback?: React.ReactNode;
}

export function RoleGate({ children, allowedRoles, organizationId, fallback }: RoleGateProps) {
  const { userRole, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  // Verifica ruolo globale se non è specificata un'organizzazione
  if (!organizationId) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      return fallback || null;
    }
    return <>{children}</>;
  }

  // TODO: Implementare verifica ruolo specifico di organizzazione
  // Per ora, usa il ruolo globale come fallback
  if (!userRole || !allowedRoles.includes(userRole)) {
    return fallback || null;
  }

  return <>{children}</>;
}