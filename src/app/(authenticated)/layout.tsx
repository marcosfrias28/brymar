"use client";

import { UnifiedSidebar } from "@/components/navigation/unified-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/presentation/hooks/use-user";
import { useAdmin } from "@/hooks/use-admin";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useUser();
  const { canAccessDashboard } = useAdmin();
  const pathname = usePathname();
  // Verificar si es una ruta de perfil (accesible para todos los usuarios autenticados)
  const isProfileRoute = pathname?.startsWith("/profile") || false;

  // Para rutas de perfil, solo verificar que el usuario esté autenticado
  // El middleware ya se encarga de redirigir admin/agent a /dashboard
  if (isProfileRoute) {
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-2">
              Acceso Denegado
            </h1>
            <p className="text-gray-600 mb-4 text-sm">
              Debes iniciar sesión para acceder a tu perfil.
            </p>
            <Link
              href="/sign-in"
              className="inline-block px-4 py-2 underline underline-offset-1 text-sm text-blue-500"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      );
    }
  } else {
    // Para rutas del dashboard, verificar permisos específicos
    // El middleware ya se encarga de redirigir users a /profile
    if (!user || !canAccessDashboard) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-2">
              Acceso Denegado
            </h1>
            <p className="text-gray-600 mb-2 text-sm">
              Debes iniciar sesión para acceder a tu perfil.
            </p>
            <p className="text-sm text-gray-500">
              Rol actual: {user?.getRole().value || "No definido"} | Permisos
              dashboard: {canAccessDashboard ? "Sí" : "No"}
            </p>
            <Link
              href="/profile"
              className="inline-block px-4 py-2 underline underline-offset-1 text-sm text-blue-500"
            >
              Volver al Mi Perfil
            </Link>
          </div>
        </div>
      );
    }
  }

  return (
    <SidebarProvider>
      <UnifiedSidebar variant="auto" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
