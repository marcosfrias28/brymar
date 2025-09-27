"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { BreadcrumbItem } from "@/types/layout";
import {
    BuildingIcon,
    MapPinIcon,
    FileTextIcon,
    UsersIcon,
    SettingsIcon,
    UserIcon,
    HeartIcon,
    MessageSquareIcon,
    BellIcon,
    ActivityIcon
} from "lucide-react";

const routeConfig: Record<string, { label: string; icon?: React.ComponentType<{ className?: string }> }> = {
    '/dashboard': { label: 'Dashboard' },
    '/dashboard/properties': { label: 'Propiedades', icon: BuildingIcon },
    '/dashboard/properties/new': { label: 'Nueva Propiedad', icon: BuildingIcon },
    '/dashboard/lands': { label: 'Terrenos', icon: MapPinIcon },
    '/dashboard/lands/new': { label: 'Nuevo Terreno', icon: MapPinIcon },
    '/dashboard/blog': { label: 'Blog', icon: FileTextIcon },
    '/dashboard/blog/new': { label: 'Nueva Entrada', icon: FileTextIcon },
    '/dashboard/users': { label: 'Usuarios', icon: UsersIcon },
    '/dashboard/users/new': { label: 'Nuevo Usuario', icon: UsersIcon },
    '/dashboard/settings': { label: 'Configuración', icon: SettingsIcon },
    '/dashboard/sections': { label: 'Secciones' },
    '/profile': { label: 'Mi Perfil', icon: UserIcon },
    '/profile/favorites': { label: 'Favoritos', icon: HeartIcon },
    '/profile/messages': { label: 'Mensajes', icon: MessageSquareIcon },
    '/profile/notifications': { label: 'Notificaciones', icon: BellIcon },
    '/profile/activity': { label: 'Actividad', icon: ActivityIcon },
};

export function useBreadcrumbs(): BreadcrumbItem[] {
    const pathname = usePathname();

    return useMemo(() => {
        if (!pathname || pathname === '/dashboard') {
            return [];
        }

        const segments = pathname.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [];

        // Build path segments
        let currentPath = '';

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