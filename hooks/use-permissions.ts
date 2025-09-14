"use client";

import { useUser } from "@/hooks/use-user";
import {
  hasPermission,
  hasPermissionForRoute,
  getRolePermissions,
  isValidRole,
  type UserRole,
  type RolePermissions
} from "@/lib/auth/permissions";

/**
 * Hook personalizzato per gestire i permessi dell'utente
 * Fornisce funzioni per verificare i permessi basati sul ruolo dell'utente corrente
 */
export function usePermissions() {
  const { user, loading } = useUser();

  // Se l'utente non è caricato o non esiste, restituisci permessi vuoti
  if (loading || !user || !user.role || !isValidRole(user.role)) {
    return {
      permissions: null,
      userRole: null,
      isLoading: loading,
      hasPermission: () => false,
      hasRoutePermission: () => false,
      canAccessDashboard: false,
      canManageProperties: false,
      canManageLands: false,
      canManageBlog: false,
      canManageUsers: false,
      canViewSettings: false,
    };
  }

  const userRole = user.role as UserRole;
  const permissions = getRolePermissions(userRole);

  return {
    permissions,
    userRole,
    isLoading: false,
    
    /**
     * Verifica se l'utente ha un permesso specifico
     * @param permission - Il permesso da verificare
     * @returns true se l'utente ha il permesso, false altrimenti
     */
    hasPermission: (permission: keyof RolePermissions) => {
      return hasPermission(userRole, permission);
    },

    /**
     * Verifica se l'utente può accedere a una route specifica
     * @param pathname - Il percorso da verificare
     * @returns true se l'utente può accedere, false altrimenti
     */
    hasRoutePermission: (pathname: string) => {
      return hasPermissionForRoute(pathname, userRole);
    },

    // Permessi specifici per facilità d'uso
    canAccessDashboard: permissions.canAccessDashboard,
    canManageProperties: permissions.canManageProperties,
    canManageLands: permissions.canManageLands,
    canManageBlog: permissions.canManageBlog,
    canManageUsers: permissions.canManageUsers,
    canViewSettings: permissions.canViewSettings,
  };
}

/**
 * Hook per verificare se l'utente corrente è un amministratore
 */
export function useIsAdmin() {
  const { userRole } = usePermissions();
  return userRole === "admin";
}

/**
 * Hook per verificare se l'utente corrente è un agente
 */
export function useIsAgent() {
  const { userRole } = usePermissions();
  return userRole === "agent";
}

/**
 * Hook per verificare se l'utente corrente è un utente normale
 */
export function useIsUser() {
  const { userRole } = usePermissions();
  return userRole === "user";
}