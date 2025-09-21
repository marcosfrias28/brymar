"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { UserSidebar } from "@/components/user-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";
import { useAdmin } from "@/hooks/use-admin";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useUser();
  const { canAccessDashboard } = useAdmin();
  const pathname = usePathname();
  
  // Mostrar loading mientras se cargan los datos del usuario
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Verificar si es una ruta de perfil (accesible para todos los usuarios autenticados)
  const isProfileRoute = pathname?.startsWith('/profile') || false;
  
  // Para rutas de perfil, solo verificar que el usuario esté autenticado
  // El middleware ya se encarga de redirigir admin/agent a /dashboard
  if (isProfileRoute) {
    if (!user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-4">Debes iniciar sesión para acceder a tu perfil.</p>
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
            <h1 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-4">No tienes permisos para acceder al dashboard.</p>
            <p className="text-sm text-gray-500">
              Rol actual: {user?.role || 'No definido'} | 
              Permisos dashboard: {canAccessDashboard ? 'Sí' : 'No'}
            </p>
          </div>
        </div>
      );
    }
  }

  // Determinar qué sidebar mostrar basado en la ruta y el rol del usuario
  const isAdminOrAgent = user?.role === 'admin' || user?.role === 'agent';
  const SidebarComponent = (isProfileRoute || !isAdminOrAgent) ? UserSidebar : AdminSidebar;
  
  return (
    <SidebarProvider>
      <SidebarComponent variant="inset" />
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