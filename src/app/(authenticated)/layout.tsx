"use client";

import Link from "next/link";
import type React from "react";
import { UnifiedSidebar } from "@/components/navigation/unified-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";

type DashboardLayoutProps = {
	children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const { user, loading } = useUser();

	if (loading && !user) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
					<p className="mt-2 text-muted-foreground text-sm">Cargando...</p>
				</div>
			</div>
		);
	}

	// Si no hay usuario, mostrar mensaje de acceso denegado
	if (!user) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="mb-2 font-bold text-2xl text-primary">
						Acceso Denegado
					</h1>
					<p className="mb-4 text-gray-600 text-sm">
						Debes iniciar sesión para acceder a esta página.
					</p>
					<p className="mb-4 text-gray-500 text-xs">
						Si acabas de iniciar sesión, la página se recargará
						automáticamente...
					</p>
					<Link
						className="inline-block px-4 py-2 text-blue-500 text-sm underline underline-offset-1"
						href="/sign-in"
					>
						Iniciar Sesión
					</Link>
				</div>
			</div>
		);
	}

	return (
		<SidebarProvider>
			<UnifiedSidebar mode="auto" />
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
