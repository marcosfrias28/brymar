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
import { PageTransition } from "@/components/ui/page-transition";
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

export interface SidebarConfig {
	userRole: "admin" | "editor" | "agent" | "user";
	permissions: {
		canManageUsers?: boolean;
		canAccessDashboard?: boolean;
		canViewAnalytics?: boolean;
		canManageBlog?: boolean;
	};
}

const getNavigationData = (config: SidebarConfig) => {
	const { userRole, permissions } = config;
	const isAdmin =
		userRole === "admin" || userRole === "editor" || userRole === "agent";

	// Main navigation
	const navMain: NavItem[] = [];

	if (isAdmin) {
		navMain.push({
			title: "Dashboard",
			url: "/dashboard",
			icon: LayoutDashboardIcon,
		});

		navMain.push({
			title: "Propiedades",
			url: "/dashboard/properties",
			icon: BuildingIcon,
			items: [
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
		});

		navMain.push({
			title: "Terrenos",
			url: "/dashboard/lands",
			icon: MapPinIcon,
			items: [
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
		});

		if (permissions.canManageBlog) {
			navMain.push({
				title: "Blog",
				url: "/dashboard/blog",
				icon: FileTextIcon,
				items: [
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

		if (permissions.canAccessDashboard) {
			navMain.push({
				title: "Secciones",
				url: "/dashboard/sections",
				icon: LayersIcon,
			});
		}
	} else {
		// User navigation
		navMain.push({
			title: "Mi Perfil",
			url: "/profile",
			icon: UserIcon,
		});

		navMain.push({
			title: "Propiedades",
			url: "/search?type=properties",
			icon: BuildingIcon,
		});

		navMain.push({
			title: "Terrenos",
			url: "/search?type=lands",
			icon: MapPinIcon,
		});

		navMain.push({
			title: "Blog",
			url: "/blog",
			icon: FileTextIcon,
		});
	}

	// Documents section
	const documents = [];

	if (isAdmin) {
		if (permissions.canManageUsers) {
			documents.push({
				name: "Gestión de Usuarios",
				url: "/dashboard/users",
				icon: UsersIcon,
			});
		}

		if (permissions.canViewAnalytics) {
			documents.push({
				name: "Análisis y Reportes",
				url: "/dashboard/analytics",
				icon: TrendingUpIcon,
			});
		}

		if (permissions.canAccessDashboard) {
			documents.push({
				name: "Base de Datos",
				url: "/dashboard/database",
				icon: DatabaseIcon,
			});
		}

		if (userRole === "admin") {
			documents.push({
				name: "Administración",
				url: "/dashboard/admin",
				icon: ShieldIcon,
			});
		}
	} else {
		// User documents
		documents.push(
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
		);
	}

	// Secondary navigation
	const navSecondary = [
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

	return {
		navMain,
		documents,
		navSecondary,
	};
};

interface UnifiedSidebarProps
	extends Omit<React.ComponentProps<typeof Sidebar>, "variant"> {
	variant?: "auto" | "admin" | "user";
}

export const UnifiedSidebar = memo(function UnifiedSidebar({
	variant = "auto",
	...props
}: UnifiedSidebarProps) {
	const pathname = usePathname();
	const { user } = useUser();
	const {
		canManageUsers,
		canAccessDashboard,
		canViewAnalytics,
		canManageBlog,
	} = useAdmin();

	// Determine user role and permissions
	const config = useMemo(() => {
		let userRole: SidebarConfig["userRole"] = "user";

		if (variant === "admin") {
			userRole = "admin";
		} else if (variant === "user") {
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
			permissions: {
				canManageUsers,
				canAccessDashboard,
				canViewAnalytics,
				canManageBlog,
			},
		};
	}, [
		variant,
		pathname,
		user?.role,
		canManageUsers,
		canAccessDashboard,
		canViewAnalytics,
		canManageBlog,
	]);

	// Memoize navigation data
	const navigationData = useMemo(() => getNavigationData(config), [config]);

	// Memoize user data
	const userData = useMemo(
		() => ({
			name: user?.name || "Usuario",
			email: user?.email || "usuario@brymar.com",
			avatar: user?.avatar || "/avatars/default.jpg",
		}),
		[user?.name, user?.email, user?.avatar],
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
									"transition-all duration-200",
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
					<nav aria-label="Documentos y gestión">
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
