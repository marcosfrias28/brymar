"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from '@/hooks/use-admin';
import { Loader2 } from "lucide-react";
import type { Permission, UserRole } from '@/lib/auth/admin-config';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
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
  const { hasPermission, canAccessRoute, loading, user } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Se non c'è un utente autenticato, reindirizza al login
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Verifica permesso specifico
    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push(redirectTo);
      return;
    }

    // Verifica permesso per route specifica
    if (requiredRoute && !canAccessRoute(requiredRoute)) {
      router.push(redirectTo);
      return;
    }
  }, [loading, user, hasPermission, canAccessRoute, requiredPermission, requiredRoute, router, redirectTo]);

  // Mostra loader durante il caricamento
  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
    );
  }

  // Se non c'è utente, non mostrare nulla (il redirect è gestito nell'useEffect)
  if (!user) {
    return null;
  }

  // Verifica permessi
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || null;
  }

  if (requiredRoute && !canAccessRoute(requiredRoute)) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Componente per mostrare contenuto solo se l'utente ha un permesso specifico
 */
interface PermissionGateProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}

export function PermissionGate({ children, permission, fallback }: PermissionGateProps) {
  const { hasPermission, loading } = useAdmin();

  if (loading) {
    return null;
  }

  if (!hasPermission(permission)) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Componente per mostrare contenuto solo per ruoli specifici
 */
interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { hasRole, loading } = useAdmin();

  if (loading) {
    return null;
  }

  if (!allowedRoles.some(role => hasRole(role))) {
    return fallback || null;
  }

  return <>{children}</>;
}