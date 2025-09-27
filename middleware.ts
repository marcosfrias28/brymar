import { auth } from "@/lib/auth/auth";
import {
  isPublicRoute,
  getRequiredPermission,
  shouldRedirectUser,
  getRedirectUrlForRole,
  type UserRole,
} from "@/lib/auth/admin-config";
import { NextResponse, NextRequest } from "next/server";
// Note: Security middleware disabled in Edge Runtime due to Node.js API limitations
// Full security features are available in API routes running in Node.js runtime

/**
 * Crea una risposta di errore per accesso non autorizzato
 */
function createUnauthorizedResponse(reason: string): NextResponse {
  const response = NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));

  // Aggiungi header per debugging (solo in development)
  if (process.env.NODE_ENV === "development") {
    response.headers.set("X-Middleware-Reason", reason);
  }

  return response;
}
/**
 * Middleware principale per la gestione dell'autenticazione e autorizzazione
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Log para debug del problema de infinitas peticiones
  if (pathname === '/sign-in' && request.method === 'POST') {
    console.log('🔄 POST /sign-in detected in middleware');
  }

  // Permetti l'accesso alle route pubbliche
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  try {
    // Basic security checks (Edge Runtime compatible)
    // Full security middleware runs in API routes
    // Verifica la sessione dell'utente utilizzando better-auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Se non c'è una sessione valida, reindirizza al login
    if (!session || !session.user) {
      return createUnauthorizedResponse("No valid session found");
    }

    const { user } = session;

    // Gestione speciale per la pagina di verify-email
    if (pathname.includes('verify-email')) {
      // Solo utenti con sessione attiva possono accedere
      if (!user.id) {
        return createUnauthorizedResponse("Session required for email verification");
      }
      // Se l'utente è già verificato, reindirizza al dashboard/profile
      if (user.emailVerified) {
        const redirectUrl = user.role === "user" ? "/profile" : "/dashboard";
        return NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
      }
      // Permetti l'accesso alla pagina di verifica
      return NextResponse.next();
    }

    // Redirigir usuarios autenticados de páginas de auth
    if (user.id && (pathname.includes('sign-in') || pathname.includes('sign-up') || pathname.includes('forgot-password') || pathname.includes('reset-password'))) {
      // Redirigir según el rol del usuario (sin requerir verificación de email)
      const redirectUrl = getRedirectUrlForRole(user.role as UserRole);
      return NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Redirecciones basadas en roles para mejorar UX
    const userRole = user.role as UserRole;
    const redirectUrl = shouldRedirectUser(pathname, userRole);

    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Verifica que el usuario tenga un rol válido
    const validRoles: UserRole[] = ['admin', 'agent', 'user'];
    if (!user.role || !validRoles.includes(user.role as UserRole)) {
      return createUnauthorizedResponse("User role not defined or invalid");
    }

    // Verificar permisos para la ruta específica
    const requiredPermission = getRequiredPermission(pathname);
    if (requiredPermission) {
      // Verificar si el usuario tiene el permiso requerido usando la configuración
      const permissionConfig = {
        'dashboard.access': ['admin', 'agent'],
        'analytics.view': ['admin'],
        'settings.view': ['admin', 'agent'],
        'properties.view': ['admin', 'agent', 'user'],
        'properties.manage': ['admin', 'agent'],
        'lands.view': ['admin', 'agent', 'user'],
        'lands.manage': ['admin', 'agent'],
        'blog.view': ['admin', 'agent', 'user'],
        'blog.manage': ['admin'],
        'users.view': ['admin'],
        'users.manage': ['admin'],
        'profile.access': ['admin', 'agent', 'user'],
        'profile.manage': ['admin', 'agent', 'user'],
      } as const;

      const allowedRoles = permissionConfig[requiredPermission as keyof typeof permissionConfig];
      if (!allowedRoles || !allowedRoles.includes(user.role as any)) {
        return createUnauthorizedResponse(`Insufficient permissions for role: ${user.role}`);
      }
    }

    // Aggiungi informazioni dell'utente agli header per le route protette
    const response = NextResponse.next();
    response.headers.set("X-User-ID", user.id);
    response.headers.set("X-User-Role", user.role);
    response.headers.set("X-Email-Verified", user.emailVerified ? "true" : "false");

    // Return response with basic security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    return response;

  } catch (error) {
    console.error("Middleware authentication error:", error);

    console.error("Middleware authentication error:", error);

    const response = createUnauthorizedResponse("Authentication verification failed");
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    return response;
  }
}

// Configurazione del matcher per specificare su quali route applicare il middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};