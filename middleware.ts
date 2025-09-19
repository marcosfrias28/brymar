import { auth } from "@/lib/auth/auth";
import {
  isPublicRoute,
  hasPermissionForRoute,
  isValidRole,
} from "@/lib/auth/permissions";
import { NextResponse, NextRequest } from "next/server";

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

  // Permetti l'accesso alle route pubbliche
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  try {
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
      const redirectUrl = user.role === "user" ? "/profile" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
    }

    // Verifica che l'utente abbia un ruolo valido
    if (!user.role || !isValidRole(user.role)) {
      return createUnauthorizedResponse("User role not defined or invalid");
    }
    // Verifica i permessi per la route specifica
    if (!hasPermissionForRoute(pathname, user.role)) {
      return createUnauthorizedResponse(`Insufficient permissions for role: ${user.role}`);
    }

    // Aggiungi informazioni dell'utente agli header per le route protette
    const response = NextResponse.next();
    response.headers.set("X-User-ID", user.id);
    response.headers.set("X-User-Role", user.role);
    response.headers.set("X-Email-Verified", user.emailVerified ? "true" : "false");

    return response;

  } catch (error) {
    console.error("Middleware authentication error:", error);
    return createUnauthorizedResponse("Authentication verification failed");
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