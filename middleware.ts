import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import {
  isPublicRoute,
  hasPermissionForRoute,
  isValidRole,
  type UserRole
} from "@/lib/auth/permissions";

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
      headers: await headers(),
    });

    // Se non c'è una sessione valida, reindirizza al login
    if (!session || !session.user) {
      return createUnauthorizedResponse("No valid session found");
    }

    const { user } = session;

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