"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  BarChartIcon,
  BuildingIcon,
  FileTextIcon,
  HelpCircleIcon,
  HomeIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  HeartIcon,
  UserIcon,
  BookOpenIcon,
  TrendingUpIcon,
} from "lucide-react"
import {
  Sidebar,
} from "@/components/ui/sidebar"
import { useUser } from "@/hooks/use-user"
import { AdminSidebar } from "@/components/admin-sidebar"
import { UserSidebar } from "@/components/user-sidebar"

// Configuración base del menú para todos los usuarios
const getNavigationData = (userRole: string | null, permissions: any) => {
  // Menú principal - mismo para todos los usuarios
  const navMain = [
    {
      title: userRole === "user" ? "Mi Perfil" : "Dashboard",
      url: userRole === "user" ? "/profile" : "/dashboard",
      icon: userRole === "user" ? UserIcon : LayoutDashboardIcon,
    },
    {
      title: "Propiedades",
      url: userRole === "user" ? "/search?type=properties" : "/dashboard/properties",
      icon: BuildingIcon,
    },
    {
      title: "Terrenos",
      url: userRole === "user" ? "/search?type=lands" : "/dashboard/lands",
      icon: MapPinIcon,
    },
    {
      title: "Blog",
      url: userRole === "user" ? "/blog" : "/dashboard/blog",
      icon: FileTextIcon,
    },
  ];

  // Sección de gestión - solo para admin/agent
  const managementItems = [];
  if (permissions?.canManageUsers) {
    managementItems.push({
      name: "Gestión de Usuarios",
      url: "/dashboard/users",
      icon: UsersIcon,
    });
  }
  if (permissions?.canAccessDashboard) {
    managementItems.push({
      name: "Análisis",
      url: "/dashboard/analytics",
      icon: TrendingUpIcon,
    });
  }

  // Sección de usuario - solo para users
  const userItems = [];
  if (userRole === "user") {
    userItems.push(
      {
        name: "Mis Favoritos",
        url: "/profile/favorites",
        icon: HeartIcon,
      },
      {
        name: "Mi Actividad",
        url: "/profile/activity",
        icon: BarChartIcon,
      },
      {
        name: "Guías",
        url: "/guides",
        icon: BookOpenIcon,
      }
    );
  }

  // Menú secundario - mismo para todos
  const navSecondary = [
    {
      title: "Buscar",
      url: "/search",
      icon: SearchIcon,
    },
    {
      title: "Configuración",
      url: userRole === "user" ? "/profile/settings" : "/dashboard/settings",
      icon: SettingsIcon,
    },
    {
      title: "Ayuda",
      url: "/help",
      icon: HelpCircleIcon,
    },
  ];

  return {
    navMain,
    documents: [...managementItems, ...userItems],
    navSecondary,
  };
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useUser()
  
  // Determinar qué sidebar mostrar basado en la ruta actual
  const isAdminRoute = pathname?.startsWith('/dashboard') || false
  const isUserRoute = pathname?.startsWith('/profile') || false
  
  // Si es una ruta de admin/agent, usar AdminSidebar
  if (isAdminRoute) {
    return <AdminSidebar {...props} />
  }
  
  // Si es una ruta de usuario, usar UserSidebar
  if (isUserRoute) {
    return <UserSidebar {...props} />
  }
  
  // Fallback: determinar por rol del usuario
  if (user?.role === 'admin' || user?.role === 'agent') {
    return <AdminSidebar {...props} />
  }
  
  // Por defecto, usar UserSidebar
  return <UserSidebar {...props} />
}
