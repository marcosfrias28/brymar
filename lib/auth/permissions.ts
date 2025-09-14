/**
 * Sistema di gestione dei permessi per l'applicazione
 * Questo file centralizza la logica dei permessi per garantire coerenza
 * tra il middleware e i componenti dell'applicazione
 */

// Definizione dei ruoli utente
export type UserRole = "admin" | "agent" | "user";

// Interfaccia per i permessi
export interface RolePermissions {
  canAccessDashboard: boolean;
  canManageProperties: boolean;
  canManageLands: boolean;
  canManageBlog: boolean;
  canManageUsers: boolean;
  canViewSettings: boolean;
}

// Configurazione dei permessi per ogni ruolo
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canAccessDashboard: true,
    canManageProperties: true,
    canManageLands: true,
    canManageBlog: true,
    canManageUsers: true,
    canViewSettings: true,
  },
  agent: {
    canAccessDashboard: true,
    canManageProperties: true,
    canManageLands: true,
    canManageBlog: false,
    canManageUsers: false,
    canViewSettings: true,
  },
  user: {
    canAccessDashboard: false,
    canManageProperties: false,
    canManageLands: false,
    canManageBlog: false,
    canManageUsers: false,
    canViewSettings: false,
  },
};

// Mapping delle route ai permessi richiesti
export const PROTECTED_ROUTES = {
  "/dashboard": "canAccessDashboard",
  "/dashboard/properties": "canManageProperties",
  "/dashboard/lands": "canManageLands",
  "/dashboard/blog": "canManageBlog",
  "/dashboard/settings": "canViewSettings",
} as const;

// Route pubbliche che non richiedono autenticazione
export const PUBLIC_ROUTES = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/verify-email",
  "/api/auth",
  "/properties",
  "/lands",
  "/blog",
  "/about",
  "/contact",
  "/search",
  "/robots.txt",
];

/**
 * Verifica se una route è pubblica
 * @param pathname - Il percorso da verificare
 * @returns true se la route è pubblica, false altrimenti
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(route);
  });
}

/**
 * Ottiene i permessi per un ruolo specifico
 * @param role - Il ruolo dell'utente
 * @returns I permessi associati al ruolo
 */
export function getRolePermissions(role: string): RolePermissions {
  const userRole = role as UserRole;
  return ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.user;
}

/**
 * Verifica se l'utente ha il permesso per accedere a una route specifica
 * @param pathname - Il percorso da verificare
 * @param userRole - Il ruolo dell'utente
 * @returns true se l'utente ha il permesso, false altrimenti
 */
export function hasPermissionForRoute(pathname: string, userRole: string): boolean {
  // Trova la route protetta più specifica che corrisponde al pathname
  const matchingRoute = Object.keys(PROTECTED_ROUTES)
    .sort((a, b) => b.length - a.length) // Ordina per lunghezza decrescente per match più specifici
    .find(route => pathname.startsWith(route));

  if (!matchingRoute) {
    return true; // Se non è una route protetta, permetti l'accesso
  }

  const requiredPermission = PROTECTED_ROUTES[matchingRoute as keyof typeof PROTECTED_ROUTES];
  const permissions = getRolePermissions(userRole);
  
  return permissions[requiredPermission as keyof RolePermissions];
}

/**
 * Verifica se un utente può eseguire un'azione specifica
 * @param userRole - Il ruolo dell'utente
 * @param permission - Il permesso da verificare
 * @returns true se l'utente ha il permesso, false altrimenti
 */
export function hasPermission(userRole: string, permission: keyof RolePermissions): boolean {
  const permissions = getRolePermissions(userRole);
  return permissions[permission];
}

/**
 * Ottiene tutti i ruoli disponibili
 * @returns Array dei ruoli disponibili
 */
export function getAvailableRoles(): UserRole[] {
  return Object.keys(ROLE_PERMISSIONS) as UserRole[];
}

/**
 * Verifica se un ruolo è valido
 * @param role - Il ruolo da verificare
 * @returns true se il ruolo è valido, false altrimenti
 */
export function isValidRole(role: string): role is UserRole {
  return getAvailableRoles().includes(role as UserRole);
}