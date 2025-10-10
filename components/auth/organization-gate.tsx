"use client";

import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";

interface OrganizationRoleGateProps {
  children: React.ReactNode;
  organizationId?: string; // Opcional por ahora
  allowedRoles: string[];
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

/**
 * Componente para mostrar contenido solo si el usuario tiene un rol específico
 * Simplificado para usar el sistema de roles básico
 */
export function OrganizationRoleGate({
  children,
  organizationId,
  allowedRoles,
  fallback,
  loadingFallback,
}: OrganizationRoleGateProps) {
  const { user, loading } = useUser();

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface OrganizationPermissionGateProps {
  children: React.ReactNode;
  organizationId?: string; // Opcional por ahora
  requiredPermissions: string[];
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

/**
 * Mapeo de roles a permisos
 * Basado en el sistema de roles del proyecto
 */
const ROLE_PERMISSIONS = {
  admin: ["create", "read", "update", "delete", "invite", "remove"],
  agent: ["read", "update", "create"],
  user: ["read"],
} as const;

/**
 * Componente para mostrar contenido solo si el usuario tiene permisos específicos
 * Simplificado para usar el sistema de roles básico
 */
export function OrganizationPermissionGate({
  children,
  organizationId,
  requiredPermissions,
  fallback,
  loadingFallback,
}: OrganizationPermissionGateProps) {
  const { user, loading } = useUser();

  if (!user || !user.role) {
    return fallback || null;
  }

  // Verificar si el rol tiene todos los permisos requeridos
  const rolePermissions =
    ROLE_PERMISSIONS[user.role as keyof typeof ROLE_PERMISSIONS] || [];
  const hasAllPermissions = requiredPermissions.every((permission) =>
    rolePermissions.includes(permission as any)
  );

  if (!hasAllPermissions) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface OrganizationMemberGateProps {
  children: React.ReactNode;
  organizationId?: string; // Opcional por ahora
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

/**
 * Componente para mostrar contenido solo si el usuario es miembro de la organización
 * Simplificado para verificar solo si el usuario está autenticado
 */
export function OrganizationMemberGate({
  children,
  organizationId,
  fallback,
  loadingFallback,
}: OrganizationMemberGateProps) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      loadingFallback || (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            Verificando membresía...
          </span>
        </div>
      )
    );
  }

  // Si no hay usuario, no es miembro
  if (!user) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Utilidades para verificar permisos de organización
 */
export const organizationUtils = {
  /**
   * Verifica si un rol tiene un permiso específico
   */
  hasPermission: (role: string, permission: string): boolean => {
    const rolePermissions =
      ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
    return rolePermissions.includes(permission as any);
  },

  /**
   * Obtiene todos los permisos de un rol
   */
  getRolePermissions: (role: string): string[] => {
    return [...(ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [])];
  },

  /**
   * Verifica si un rol puede invitar usuarios
   */
  canInvite: (role: string): boolean => {
    return organizationUtils.hasPermission(role, "invite");
  },

  /**
   * Verifica si un rol puede remover usuarios
   */
  canRemove: (role: string): boolean => {
    return organizationUtils.hasPermission(role, "remove");
  },

  /**
   * Verifica si un rol puede gestionar la organización
   */
  canManage: (role: string): boolean => {
    return (
      organizationUtils.hasPermission(role, "delete") &&
      organizationUtils.hasPermission(role, "update")
    );
  },
};
