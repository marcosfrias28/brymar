"use client";

import {
	BarChartIcon,
	BellIcon,
	BookOpenIcon,
	BuildingIcon,
	DatabaseIcon,
	FileTextIcon,
	FolderIcon,
	HeartIcon,
	HelpCircleIcon,
	LayersIcon,
	LayoutDashboardIcon,
	MapPinIcon,
	MessageCircleIcon,
	PlusIcon,
	SearchIcon,
	SettingsIcon,
	ShieldIcon,
	TrendingUpIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import type * as React from "react";
import { memo, useMemo } from "react";

import { NavDocuments } from "@/components/nav-documents";
import { type NavItem, NavMain } from "@/components/nav-main";
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
import { useAdmin } from "@/hooks/use-admin";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { ariaLabels, focusRingClasses } from "@/lib/utils/accessibility";
import { hoverAnimations } from "@/lib/utils/animations";
import Logo from "../ui/logo";

export type SidebarConfig = {
	userRole: "admin" | "editor" | "agent" | "user";
	permissions: {
		canManageUsers?: boolean;
		canAccessDashboard?: boolean;
		canViewAnalytics?: boolean;
		canManageBlog?: boolean;
	};
};

const getAdminDashboardItems = (): NavItem[] => [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Creator",
    url: "/dashboard/creator",
    icon: LayersIcon,
  },
];

const getAdminPropertyItems = (): NavItem[] => [
	{
		title: "Propiedades",
		url: "/dashboard/properties",
		icon: BuildingIcon,
    items: [
        {
            title: "Ver Todas",
            url: "/dashboard/properties",
            icon: FolderIcon,
        },
    ],
	},
	{
		title: "Terrenos",
		url: "/dashboard/lands",
		icon: MapPinIcon,
    items: [
        {
            title: "Ver Todos",
            url: "/dashboard/lands",
            icon: FolderIcon,
        },
    ],
	},
];

const getAdminConditionalItems = (
	permissions: SidebarConfig["permissions"]
): NavItem[] => [
	...(permissions.canManageBlog
		? [
				{
					title: "Blog",
					url: "/dashboard/blog",
					icon: FileTextIcon,
					items: [
						{
							title: "Ver Artículos",
							url: "/dashboard/blog",
							icon: FolderIcon,
						},
                        
					],
				},
			]
		: []),
	...(permissions.canAccessDashboard
		? [
				{
					title: "Secciones",
					url: "/dashboard/sections",
					icon: LayersIcon,
				},
			]
		: []),
];

const getAdminMainNavigation = (
	permissions: SidebarConfig["permissions"]
): NavItem[] => [
	...getAdminDashboardItems(),
	...getAdminPropertyItems(),
	...getAdminConditionalItems(permissions),
];

const getUserMainNavigation = (): NavItem[] => [
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

const getAdminDocuments = (
	userRole: SidebarConfig["userRole"],
	permissions: SidebarConfig["permissions"]
) => [
	...(permissions.canManageUsers
		? [
				{
					name: "Gestión de Usuarios",
					url: "/dashboard/users",
					icon: UsersIcon,
				},
			]
		: []),
	...(permissions.canViewAnalytics
		? [
				{
					name: "Análisis y Reportes",
					url: "/dashboard/analytics",
					icon: TrendingUpIcon,
				},
			]
		: []),
	...(permissions.canAccessDashboard
		? [
				{
					name: "Base de Datos",
					url: "/dashboard/database",
					icon: DatabaseIcon,
				},
			]
		: []),
	...(userRole === "admin"
		? [
				{
					name: "Administración",
					url: "/dashboard/admin",
					icon: ShieldIcon,
				},
			]
		: []),
];

const getUserDocuments = () => [
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

const getSecondaryNavigation = (isAdmin: boolean) => [
	{
		title: "Buscar",
		url: "/search",
		icon: SearchIcon,
	},
	{
		title: "Configuración",
		url: isAdmin ? "/dashboard/settings" : "/profile/settings",
		icon: SettingsIcon,
	},
	{
		title: "Ayuda",
		url: "/help",
		icon: HelpCircleIcon,
	},
];

const getNavigationData = (config: SidebarConfig) => {
	const { userRole, permissions } = config;
	const isAdmin =
		userRole === "admin" || userRole === "editor" || userRole === "agent";

  return {
    navMain: isAdmin
      ? getAdminMainNavigation(permissions)
      : getUserMainNavigation(),
    documents: isAdmin
      ? getAdminDocuments(userRole, permissions)
      : getUserDocuments(),
    navSecondary: getSecondaryNavigation(isAdmin),
  };
};

interface UnifiedSidebarProps
	extends Omit<React.ComponentProps<typeof Sidebar>, "variant"> {
	mode?: "auto" | "admin" | "user";
}

// Custom hook to determine user role and permissions
const useUserRoleConfig = (mode: UnifiedSidebarProps["mode"]) => {
	const pathname = usePathname();
	const { user } = useUser();
	const {
		canManageUsers,
		canAccessDashboard,
		canViewAnalytics,
		canManageBlog,
	} = useAdmin();

	return useMemo(() => {
		let userRole: SidebarConfig["userRole"] = "user";

		if (mode === "admin") {
			userRole = "admin";
		} else if (mode === "user") {
			userRole = "user";
		} else {
			// Auto-detect based on route or user role
			const isAdminRoute = pathname?.startsWith("/dashboard");
			const userRoleValue = user?.role;

			if (
				isAdminRoute ||
				["admin", "editor", "agent"].includes(userRoleValue || "")
			) {
				userRole = (userRoleValue as SidebarConfig["userRole"]) || "admin";
			}
		}

		return {
			userRole,
			email: user?.email || "usuario@brymar.com",
			permissions: {
				canManageUsers,
				canAccessDashboard,
				canViewAnalytics,
				canManageBlog,
			},
		};
	}, [
		mode,
		pathname,
		user?.role,
		user?.email,
		canManageUsers,
		canAccessDashboard,
		canViewAnalytics,
		canManageBlog,
	]);
};

// Custom hook to get navigation and user data
const useSidebarData = (config: ReturnType<typeof useUserRoleConfig>) => {
	const { user } = useUser();

	const navigationData = useMemo(() => getNavigationData(config), [config]);

	const userData = useMemo(
		() => ({
			name: user?.name || "Usuario",
			email: config.email,
			avatar: user?.avatar || "/avatars/default.jpg",
		}),
		[user?.name, user?.avatar, config.email]
	);

	return { navigationData, userData };
};

export const UnifiedSidebar = memo(
	({ mode = "auto", ...props }: UnifiedSidebarProps) => {
		const config = useUserRoleConfig(mode);
		const { navigationData, userData } = useSidebarData(config);

		return (
			<Sidebar
				aria-label={ariaLabels.sidebarNavigation}
				collapsible="offcanvas"
				{...props}
			>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								aria-label="Marbry Inmobiliaria - Ir al inicio"
								asChild
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
				</SidebarHeader>

				<SidebarContent>
					<nav aria-label={ariaLabels.mainNavigation}>
						<NavMain items={navigationData.navMain} />
					</nav>
					<nav aria-label="Documentos y gestión">
						<NavDocuments items={navigationData.documents} />
					</nav>
					<nav aria-label="Navegación secundaria">
						<NavSecondary
							className="mt-auto"
							items={navigationData.navSecondary}
						/>
					</nav>
				</SidebarContent>

				<SidebarFooter>
					<nav aria-label={ariaLabels.userNavigation}>
						<NavUser user={userData} />
					</nav>
				</SidebarFooter>
			</Sidebar>
		);
	}
);
