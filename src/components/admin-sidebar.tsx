"use client";

import * as React from "react";
import { memo, useMemo, useCallback } from "react";
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
  PlusIcon,
  EditIcon,
  FolderIcon,
  LayersIcon,
} from "lucide-react";

import { NavDocuments } from '@/components/nav-documents';
import { NavMain, type NavItem } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Logo from "./ui/logo";
import { useAdmin } from '@/hooks/use-admin';
import { useUser } from '@/hooks/use-user';
import { PageTransition } from '@/components/ui/page-transition';
import { hoverAnimations, focusAnimations } from '@/lib/utils/animations';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/use-responsive';
import { ariaLabels, focusRingClasses } from '@/lib/utils/accessibility';

// Navigation data generator function
const getAdminNavigationData = (
  userRole: string | null,
  adminPermissions: any
) => {
  // Menú principal - funcionalidades de gestión con submenus
  const navMain: NavItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Propiedades",
      url: "/dashboard/properties",
      icon: BuildingIcon,
      children: [
        {
          title: "Ver Todas",
          url: "/dashboard/properties",
          icon: FolderIcon,
        },
        {
          title: "Nueva Propiedad",
          url: "/dashboard/properties/new",
          icon: PlusIcon,
        },
        {
          title: "Borradores",
          url: "/dashboard/properties/drafts",
          icon: FileTextIcon,
        },
      ],
    },
    {
      title: "Terrenos",
      url: "/dashboard/lands",
      icon: MapPinIcon,
      children: [
        {
          title: "Ver Todos",
          url: "/dashboard/lands",
          icon: FolderIcon,
        },
        {
          title: "Nuevo Terreno",
          url: "/dashboard/lands/new",
          icon: PlusIcon,
        },
      ],
    },
  ];

  // Solo agregar blog si el usuario tiene permisos para gestionarlo
  if (adminPermissions?.canManageBlog) {
    navMain.push({
      title: "Blog",
      url: "/dashboard/blog",
      icon: FileTextIcon,
      children: [
        {
          title: "Ver Artículos",
          url: "/dashboard/blog",
          icon: FolderIcon,
        },
        {
          title: "Nuevo Artículo",
          url: "/dashboard/blog/new",
          icon: PlusIcon,
        },
      ],
    });
  }

  // Agregar secciones para todos los usuarios con acceso al dashboard
  if (adminPermissions?.canAccessDashboard) {
    navMain.push({
      title: "Secciones",
      url: "/dashboard/sections",
      icon: LayersIcon,
    });
  }

  // Sección de gestión avanzada
  const managementItems = [];

  if (adminPermissions?.canManageUsers) {
    managementItems.push({
      name: "Gestión de Usuarios",
      url: "/dashboard/users",
      icon: UsersIcon,
    });
  }

  if (adminPermissions?.canViewAnalytics) {
    managementItems.push({
      name: "Análisis y Reportes",
      url: "/dashboard/analytics",
      icon: TrendingUpIcon,
    });
  }

  if (adminPermissions?.canAccessDashboard) {
    managementItems.push({
      name: "Base de Datos",
      url: "/dashboard/database",
      icon: DatabaseIcon,
    });
  }

  if (userRole === "admin") {
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

export const AdminSidebar = memo(function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const {
    canManageUsers,
    canAccessDashboard,
    canViewAnalytics,
    canManageBlog,
    isAdmin,
    user: adminUser,
  } = useAdmin();
  const { user } = useUser();
  const { isMobile, isMobileOrTablet } = useResponsive();

  // Memoize permissions object to prevent unnecessary recalculations
  const permissions = useMemo(
    () => ({
      canManageUsers,
      canAccessDashboard,
      canViewAnalytics,
      canManageBlog,
    }),
    [canManageUsers, canAccessDashboard, canViewAnalytics, canManageBlog]
  );

  // Memoize navigation data
  const navigationData = useMemo(
    () => getAdminNavigationData(user?.role || null, permissions),
    [user?.role, permissions]
  );

  // Memoize user data to prevent unnecessary re-renders
  const userData = useMemo(
    () => ({
      name: user?.name || "Usuario",
      email: user?.email || "usuario@brymar.com",
      avatar: user?.image || "/avatars/default.jpg",
    }),
    [user?.name, user?.email, user?.image]
  );

  return (
    <Sidebar
      collapsible="offcanvas"
      aria-label={ariaLabels.sidebarNavigation}
      {...props}
    >
      <SidebarHeader>
        <PageTransition variant="slideDown" delay={1}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                aria-label="Brymar Inmobiliaria - Ir al inicio"
                className={cn(
                  "data-[slot=sidebar-menu-button]:!p-1.5",
                  hoverAnimations.gentle,
                  focusRingClasses.default,
                  "transition-all duration-200"
                )}
              >
                <Logo />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </PageTransition>
      </SidebarHeader>
      <SidebarContent>
        <PageTransition variant="slideUp" delay={2} stagger="children">
          <nav aria-label={ariaLabels.mainNavigation}>
            <NavMain items={navigationData.navMain} />
          </nav>
          <nav aria-label="Gestión avanzada">
            <NavDocuments items={navigationData.documents} />
          </nav>
          <nav aria-label="Navegación secundaria">
            <NavSecondary
              items={navigationData.navSecondary}
              className="mt-auto"
            />
          </nav>
        </PageTransition>
      </SidebarContent>
      <SidebarFooter>
        <PageTransition variant="slideUp" delay={3}>
          <nav aria-label={ariaLabels.userNavigation}>
            <NavUser user={userData} />
          </nav>
        </PageTransition>
      </SidebarFooter>
    </Sidebar>
  );
});
