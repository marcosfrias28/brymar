"use client";

import { useUserRoleInOrganization } from "@/hooks/use-organization";
import { Loader2 } from "lucide-react";

interface OrganizationRoleGateProps {
  children: React.ReactNode;
  organizationId: string;
  allowedRoles: string[];
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

/**
 * Componente para mostrar contenido solo si el usuario tiene un rol específico
 * dentro de una organización determinada
 */
export function OrganizationRoleGate({
  children,
  organizationId,
  allowedRoles,
  fallback,
  loadingFallback,
}: OrganizationRoleGateProps) {
  const { role, loading, error } = useUserRoleInOrganization(organizationId);

  if (loading) {
    return (
      loadingFallback || (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            Verificando permisos...
          </span>
        </div>
      )
    );
  }

  if (error || !role || !allowedRoles.includes(role)) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface OrganizationPermissionGateProps {
  children: React.ReactNode;
  organizationId: string;
  requiredPermissions: string[];
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

/**
 * Mapeo de roles a permisos dentro de organizaciones
 * Basado en la configuración de Better Auth
 */
const ORGANIZATION_ROLE_PERMISSIONS = {
  admin: ["create", "read", "update", "delete", "invite", "remove"],
  agent: ["read", "update"],
  viewer: ["read"],
} as const;

/**
 * Componente para mostrar contenido solo si el usuario tiene permisos específicos
 * dentro de una organización determinada
 */
export function OrganizationPermissionGate({
  children,
  organizationId,
  requiredPermissions,
  fallback,
  loadingFallback,
}: OrganizationPermissionGateProps) {
  const { role, loading, error } = useUserRoleInOrganization(organizationId);

  if (loading) {
    return (
      loadingFallback || (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            Verificando permisos...
          </span>
        </div>
      )
    );
  }

  if (error || !role) {
    return fallback || null;
  }

  // Verificar si el rol tiene todos los permisos requeridos
  const rolePermissions = ORGANIZATION_ROLE_PERMISSIONS[role as keyof typeof ORGANIZATION_ROLE_PERMISSIONS] || [];
  const hasAllPermissions = requiredPermissions.every(permission => 
    rolePermissions.includes(permission as any)
  );

  if (!hasAllPermissions) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface OrganizationMemberGateProps {
  children: React.ReactNode;
  organizationId: string;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

/**
 * Componente para mostrar contenido solo si el usuario es miembro de la organización
 */
export function OrganizationMemberGate({
  children,
  organizationId,
  fallback,
  loadingFallback,
}: OrganizationMemberGateProps) {
  const { role, loading, error } = useUserRoleInOrganization(organizationId);

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

  // Si hay error o no tiene rol, no es miembro
  if (error || !role) {
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
    const rolePermissions = ORGANIZATION_ROLE_PERMISSIONS[role as keyof typeof ORGANIZATION_ROLE_PERMISSIONS] || [];
    return rolePermissions.includes(permission as any);
  },

  /**
   * Obtiene todos los permisos de un rol
   */
  getRolePermissions: (role: string): string[] => {
    return [...(ORGANIZATION_ROLE_PERMISSIONS[role as keyof typeof ORGANIZATION_ROLE_PERMISSIONS] || [])];
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
    return organizationUtils.hasPermission(role, "delete") && 
           organizationUtils.hasPermission(role, "update");
  },
};