"use client";

import * as React from "react";
import {
  BarChartIcon,
  BuildingIcon,
  FileTextIcon,
  HelpCircleIcon,
  MapPinIcon,
  SearchIcon,
  SettingsIcon,
  HeartIcon,
  UserIcon,
  BookOpenIcon,
  BellIcon,
  MessageCircleIcon,
} from "lucide-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Logo from "./ui/logo";
import { useUser } from "@/presentation/hooks/use-user";
import { useAdmin } from "@/hooks/use-admin";

// Configuración del menú para usuarios
const getUserNavigationData = () => {
  // Menú principal - funcionalidades de usuario
  const navMain = [
    {
      title: "Mi Perfil",
      url: "/profile",
      icon: UserIcon,
    },
    {
      title: "Propiedades",
      url: "/search?type=properties",
      icon: BuildingIcon,
    },
    {
      title: "Terrenos",
      url: "/search?type=lands",
      icon: MapPinIcon,
    },
    {
      title: "Blog",
      url: "/blog",
      icon: FileTextIcon,
    },
  ];

  // Sección de usuario - funcionalidades personales
  const userItems = [
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
      name: "Notificaciones",
      url: "/profile/notifications",
      icon: BellIcon,
    },
    {
      name: "Mensajes",
      url: "/profile/messages",
      icon: MessageCircleIcon,
    },
    {
      name: "Guías",
      url: "/guides",
      icon: BookOpenIcon,
    },
  ];

  // Menú secundario - herramientas básicas
  const navSecondary = [
    {
      title: "Buscar",
      url: "/search",
      icon: SearchIcon,
    },
    {
      title: "Configuración",
      url: "/profile/settings",
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
    documents: userItems,
    navSecondary,
  };
};

export function UserSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();
  const { canAccessDashboard } = useAdmin();

  const navigationData = getUserNavigationData();

  // Map user data to expected format
  const userData = {
    name: user?.getProfile().getFullName() || "Usuario",
    email: user?.getEmail().value || "usuario@ejemplo.com",
    avatar: user?.getProfile().getAvatar() || "/avatars/user.jpg",
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
  );
}
