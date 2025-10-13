"use client";

import { useUser } from '@/hooks/use-user';
import { PERMISSIONS, ROUTE_PERMISSIONS, type Permission, type UserRole } from '@/lib/auth/admin-config';

/**
 * Hook para funcionalidades admin usando Better Auth Admin Plugin
 * Reemplaza el hook usePermissions personalizado
 */
export function useAdmin() {
  const { user, loading } = useUser();

  // Si está cargando o no hay usuario, retornar estado de carga
  if (loading || !user) {
    return {
      user: null,
      loading,
      hasPermission: () => false,
      hasRole: () => false,
      canAccessRoute: () => false,
      isAdmin: false,
      isAgent: false,
      isUser: false,
      permissions: [],
    };
  }

  const userRole = user.role as UserRole;

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!user || !user.role) return false;
    
    // Usar la lógica nativa del plugin admin si está disponible
    // Por ahora, usar nuestra configuración local
    const allowedRoles = {
      // Dashboard y administración
      'dashboard.access': ['admin', 'agent'],
      'analytics.view': ['admin'],
      'settings.view': ['admin', 'agent'],
      
      // Propiedades
      'properties.view': ['admin', 'agent', 'user'],
      'properties.manage': ['admin', 'agent'],
      
      // Terrenos
      'lands.view': ['admin', 'agent', 'user'],
      'lands.manage': ['admin', 'agent'],
      
      // Blog
      'blog.view': ['admin', 'agent', 'user'],
      'blog.manage': ['admin'],
      
      // Usuarios
      'users.view': ['admin'],
      'users.manage': ['admin'],
      
      // Perfil
      'profile.access': ['admin', 'agent', 'user'],
      'profile.manage': ['admin', 'agent', 'user'],
    } as const;

    const rolesForPermission = allowedRoles[permission as keyof typeof allowedRoles];
    return rolesForPermission ? rolesForPermission.includes(userRole as any) : false;
  };

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  /**
   * Verifica si el usuario puede acceder a una ruta específica
   */
  const canAccessRoute = (pathname: string): boolean => {
    // Buscar el permiso requerido para la ruta
    const matchingRoute = Object.keys(ROUTE_PERMISSIONS)
      .sort((a, b) => b.length - a.length)
      .find(route => pathname.startsWith(route));
    
    if (matchingRoute) {
      const requiredPermission = ROUTE_PERMISSIONS[matchingRoute as keyof typeof ROUTE_PERMISSIONS];
      return hasPermission(requiredPermission);
    }
    
    // Si no hay permiso específico requerido, permitir acceso
    return true;
  };

  /**
   * Obtiene todos los permisos del usuario actual
   */
  const getUserPermissions = (): Permission[] => {
    const allPermissions = Object.values(PERMISSIONS);
    return allPermissions.filter(permission => hasPermission(permission));
  };

  return {
    user,
    loading: false,
    role: userRole,
    hasPermission,
    hasRole,
    canAccessRoute,
    
    // Shortcuts para roles comunes
    isAdmin: hasRole('admin'),
    isAgent: hasRole('agent'),
    isUser: hasRole('user'),
    
    // Lista de permisos del usuario
    permissions: getUserPermissions(),
    
    // Permisos específicos para facilidad de uso
    canAccessDashboard: hasPermission(PERMISSIONS.DASHBOARD_ACCESS),
    canManageProperties: hasPermission(PERMISSIONS.PROPERTIES_MANAGE),
    canManageLands: hasPermission(PERMISSIONS.LANDS_MANAGE),
    canManageBlog: hasPermission(PERMISSIONS.BLOG_MANAGE),
    canManageUsers: hasPermission(PERMISSIONS.USERS_MANAGE),
    canViewSettings: hasPermission(PERMISSIONS.SETTINGS_VIEW),
    canViewAnalytics: hasPermission(PERMISSIONS.ANALYTICS_VIEW),
  };
}

/**
 * Hook específico para verificar si el usuario es admin
 */
export function useIsAdmin() {
  const { isAdmin } = useAdmin();
  return isAdmin;
}

/**
 * Hook específico para verificar si el usuario es agent
 */
export function useIsAgent() {
  const { isAgent } = useAdmin();
  return isAgent;
}

/**
 * Hook específico para verificar si el usuario es user normal
 */
export function useIsUser() {
  const { isUser } = useAdmin();
  return isUser;
}

/**
 * Hook para verificar permisos específicos
 */
export function usePermission(permission: Permission) {
  const { hasPermission } = useAdmin();
  return hasPermission(permission);
}

/**
 * Hook para verificar acceso a rutas
 */
export function useRouteAccess(pathname: string) {
  const { canAccessRoute } = useAdmin();
  return canAccessRoute(pathname);
}