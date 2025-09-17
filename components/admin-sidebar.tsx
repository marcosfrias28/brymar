"use client"

import * as React from "react"
import {
  BarChartIcon,
  BuildingIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  TrendingUpIcon,
  ShieldIcon,
  DatabaseIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Logo from "./ui/logo"
import { usePermissions } from "@/hooks/use-permissions"
import { useUser } from "@/hooks/use-user"

// Configuración del menú para admin/agent
const getAdminNavigationData = (userRole: string | null, permissions: any) => {
  // Menú principal - funcionalidades de gestión
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Propiedades",
      url: "/dashboard/properties",
      icon: BuildingIcon,
    },
    {
      title: "Terrenos",
      url: "/dashboard/lands",
      icon: MapPinIcon,
    },
    {
      title: "Blog",
      url: "/dashboard/blog",
      icon: FileTextIcon,
    },
  ];

  // Sección de gestión avanzada
  const managementItems = [];
  
  if (permissions?.canManageUsers) {
    managementItems.push({
      name: "Gestión de Usuarios",
      url: "/dashboard/users",
      icon: UsersIcon,
    });
  }
  
  if (permissions?.canAccessDashboard) {
    managementItems.push(
      {
        name: "Análisis y Reportes",
        url: "/dashboard/analytics",
        icon: TrendingUpIcon,
      },
      {
        name: "Base de Datos",
        url: "/dashboard/database",
        icon: DatabaseIcon,
      }
    );
  }
  
  if (userRole === 'admin') {
    managementItems.push({
      name: "Administración",
      url: "/dashboard/admin",
      icon: ShieldIcon,
    });
  }

  // Menú secundario - herramientas y configuración
  const navSecondary = [
    {
      title: "Buscar",
      url: "/search",
      icon: SearchIcon,
    },
    {
      title: "Configuración",
      url: "/dashboard/settings",
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
    documents: managementItems,
    navSecondary,
  };
};

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { permissions, userRole } = usePermissions();
  const { user } = useUser();
  
  const navigationData = getAdminNavigationData(userRole, permissions);
  
  // Map user data to expected format
  const userData = {
    name: user?.name || "Administrador",
    email: user?.email || "admin@brymar.com",
    avatar: user?.image || "/avatars/admin.jpg"
  };
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationData.navMain} />
        <NavDocuments items={navigationData.documents} />
        <NavSecondary items={navigationData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}