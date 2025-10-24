"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UnifiedSidebar } from "@/components/navigation/unified-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAdmin } from "@/hooks/use-admin";
import { useUser } from "@/hooks/use-user";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const { user, loading } = useUser();
	const pathname = usePathname();

	// Handle auth reload logic at the top level (always called)
	React.useEffect(() => {
		if (!user && !loading) {
			const lastReload = localStorage.getItem('lastAuthReload');
			const now = Date.now();

			// Solo recargar si han pasado más de 5 segundos desde la última recarga
			if (!lastReload || now - parseInt(lastReload) > 5000) {
				const timer = setTimeout(() => {
					localStorage.setItem('lastAuthReload', now.toString());
					// Forzar refresh de la sesión
					window.location.reload();
				}, 2000);

				return () => clearTimeout(timer);
			}
		}
	}, [user, loading]);

	// Mostrar loading mientras se verifica la autenticación
	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="text-sm text-muted-foreground mt-2">Cargando...</p>
				</div>
			</div>
		);
	}

	// Si no hay usuario, mostrar mensaje de acceso denegado
	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-primary mb-2">
						Acceso Denegado
					</h1>
					<p className="text-gray-600 mb-4 text-sm">
						Debes iniciar sesión para acceder a esta página.
					</p>
					<p className="text-xs text-gray-500 mb-4">
						Si acabas de iniciar sesión, la página se recargará automáticamente...
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
