/**
 * Configuración de roles y permisos para Better Auth Admin Plugin
 */

// Definición de permisos disponibles en el sistema
export const PERMISSIONS = {
  // Dashboard y administración
  DASHBOARD_ACCESS: 'dashboard.access',
  ANALYTICS_VIEW: 'analytics.view',
  SETTINGS_VIEW: 'settings.view',
  
  // Gestión de propiedades
  PROPERTIES_VIEW: 'properties.view',
  PROPERTIES_MANAGE: 'properties.manage',
  
  // Gestión de terrenos
  LANDS_VIEW: 'lands.view',
  LANDS_MANAGE: 'lands.manage',
  
  // Gestión de blog
  BLOG_VIEW: 'blog.view',
  BLOG_MANAGE: 'blog.manage',
  
  // Gestión de usuarios
  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',
  
  // Perfil de usuario
  PROFILE_ACCESS: 'profile.access',
  PROFILE_MANAGE: 'profile.manage',
} as const;

// Definición de roles y sus permisos
export const ROLE_PERMISSIONS = {
  admin: [
    // Acceso completo a todo
    PERMISSIONS.DASHBOARD_ACCESS,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.PROPERTIES_VIEW,
    PERMISSIONS.PROPERTIES_MANAGE,
    PERMISSIONS.LANDS_VIEW,
    PERMISSIONS.LANDS_MANAGE,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_MANAGE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.PROFILE_ACCESS,
    PERMISSIONS.PROFILE_MANAGE,
  ],
  agent: [
    // Acceso limitado para agentes
    PERMISSIONS.DASHBOARD_ACCESS,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.PROPERTIES_VIEW,
    PERMISSIONS.PROPERTIES_MANAGE,
    PERMISSIONS.LANDS_VIEW,
    PERMISSIONS.LANDS_MANAGE,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.PROFILE_ACCESS,
    PERMISSIONS.PROFILE_MANAGE,
  ],
  user: [
    // Acceso básico para usuarios
    PERMISSIONS.PROPERTIES_VIEW,
    PERMISSIONS.LANDS_VIEW,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.PROFILE_ACCESS,
    PERMISSIONS.PROFILE_MANAGE,
  ],
} as const;

// Configuración del plugin admin
export const adminConfig = {
  roles: ['admin', 'agent', 'user'] as const,
  defaultRole: 'user' as const,
  permissions: {
    // Dashboard y administración
    [PERMISSIONS.DASHBOARD_ACCESS]: ['admin', 'agent'],
    [PERMISSIONS.ANALYTICS_VIEW]: ['admin'],
    [PERMISSIONS.SETTINGS_VIEW]: ['admin', 'agent'],
    
    // Propiedades
    [PERMISSIONS.PROPERTIES_VIEW]: ['admin', 'agent', 'user'],
    [PERMISSIONS.PROPERTIES_MANAGE]: ['admin', 'agent'],
    
    // Terrenos
    [PERMISSIONS.LANDS_VIEW]: ['admin', 'agent', 'user'],
    [PERMISSIONS.LANDS_MANAGE]: ['admin', 'agent'],
    
    // Blog
    [PERMISSIONS.BLOG_VIEW]: ['admin', 'agent', 'user'],
    [PERMISSIONS.BLOG_MANAGE]: ['admin'],
    
    // Usuarios
    [PERMISSIONS.USERS_VIEW]: ['admin'],
    [PERMISSIONS.USERS_MANAGE]: ['admin'],
    
    // Perfil
    [PERMISSIONS.PROFILE_ACCESS]: ['admin', 'agent', 'user'],
    [PERMISSIONS.PROFILE_MANAGE]: ['admin', 'agent', 'user'],
  },
} as const;

// Tipos TypeScript para mejor type safety
export type UserRole = typeof adminConfig.roles[number];
export type Permission = keyof typeof adminConfig.permissions;

// Mapeo de rutas a permisos requeridos
export const ROUTE_PERMISSIONS = {
  '/dashboard': PERMISSIONS.DASHBOARD_ACCESS,
  '/dashboard/properties': PERMISSIONS.PROPERTIES_MANAGE,
  '/dashboard/lands': PERMISSIONS.LANDS_MANAGE,
  '/dashboard/blog': PERMISSIONS.BLOG_MANAGE,
  '/dashboard/settings': PERMISSIONS.SETTINGS_VIEW,
  '/dashboard/users': PERMISSIONS.USERS_MANAGE,
  '/dashboard/analytics': PERMISSIONS.ANALYTICS_VIEW,
  '/profile': PERMISSIONS.PROFILE_ACCESS,
  '/profile/settings': PERMISSIONS.PROFILE_MANAGE,
  '/profile/favorites': PERMISSIONS.PROFILE_ACCESS,
  '/profile/activity': PERMISSIONS.PROFILE_ACCESS,
  '/profile/notifications': PERMISSIONS.PROFILE_ACCESS,
  '/profile/messages': PERMISSIONS.PROFILE_ACCESS,
} as const;

// Rutas públicas que no requieren autenticación
export const PUBLIC_ROUTES = [
  '/',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth',
  '/properties',
  '/lands',
  '/blog',
  '/about',
  '/contact',
  '/search',
  '/robots.txt',
  '/guides',
  '/help',
] as const;

/**
 * Verifica si una ruta es pública
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

/**
 * Obtiene la URL de redirección apropiada según el rol del usuario
 */
export function getRedirectUrlForRole(role: UserRole): string {
  switch (role) {
    case 'admin':
    case 'agent':
      return '/dashboard';
    case 'user':
    default:
      return '/profile';
  }
}

/**
 * Verifica si un usuario debería ser redirigido desde la ruta actual
 */
export function shouldRedirectUser(pathname: string, role: UserRole): string | null {
  // Admin y Agent intentando acceder a /profile → redirigir a /dashboard
  if (pathname.startsWith('/profile') && (role === 'admin' || role === 'agent')) {
    return '/dashboard';
  }
  
  // User intentando acceder a /dashboard → redirigir a /profile
  if (pathname.startsWith('/dashboard') && role === 'user') {
    return '/profile';
  }
  
  return null;
}

/**
 * Obtiene el permiso requerido para una ruta específica
 */
export function getRequiredPermission(pathname: string): Permission | null {
  // Buscar la ruta más específica que coincida
  const matchingRoute = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length) // Ordenar por longitud decrescente
    .find(route => pathname.startsWith(route));
  
  if (matchingRoute) {
    return ROUTE_PERMISSIONS[matchingRoute as keyof typeof ROUTE_PERMISSIONS];
  }
  
  return null;
}