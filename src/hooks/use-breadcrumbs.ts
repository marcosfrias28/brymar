"use client";

import {
	ActivityIcon,
	BellIcon,
	BuildingIcon,
	FileTextIcon,
	HeartIcon,
	MapPinIcon,
	MessageSquareIcon,
	SettingsIcon,
	UserIcon,
	UsersIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { BreadcrumbItem } from "@/types/layout";

const routeConfig: Record<
	string,
	{ label: string; icon?: React.ComponentType<{ className?: string }> }
> = {
	"/dashboard": { label: "Dashboard" },
	"/dashboard/properties": { label: "Propiedades", icon: BuildingIcon },
    
	"/dashboard/lands": { label: "Terrenos", icon: MapPinIcon },
    
	"/dashboard/blog": { label: "Blog", icon: FileTextIcon },
    
	"/dashboard/users": { label: "Usuarios", icon: UsersIcon },
	"/dashboard/users/new": { label: "Nuevo Usuario", icon: UsersIcon },
	"/dashboard/settings": { label: "Configuración", icon: SettingsIcon },
	"/dashboard/sections": { label: "Secciones" },
	"/profile": { label: "Mi Perfil", icon: UserIcon },
	"/profile/favorites": { label: "Favoritos", icon: HeartIcon },
	"/profile/messages": { label: "Mensajes", icon: MessageSquareIcon },
	"/profile/notifications": { label: "Notificaciones", icon: BellIcon },
	"/profile/activity": { label: "Actividad", icon: ActivityIcon },
};

export function useBreadcrumbs(): BreadcrumbItem[] {
	const pathname = usePathname();

	return useMemo(() => {
		if (!pathname || pathname === "/dashboard") {
			return [];
		}

		const segments = pathname.split("/").filter(Boolean);
		const breadcrumbs: BreadcrumbItem[] = [];

		// Build path segments
		let currentPath = "";

		for (let i = 0; i < segments.length; i++) {
			currentPath += `/${segments[i]}`;

			const config = routeConfig[currentPath];
			if (config) {
				// Don't add href for the last segment (current page)
				const isLast = i === segments.length - 1;

				breadcrumbs.push({
					label: config.label,
					href: isLast ? undefined : currentPath,
					icon: config.icon,
				});
			}
		}

		return breadcrumbs;
	}, [pathname]);
}
