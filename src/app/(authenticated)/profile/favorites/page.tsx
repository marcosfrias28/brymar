"use client";

import { ArrowLeft, Heart, Home, User } from "lucide-react";
import Link from "next/link";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { ProfileFavorites } from "@/components/profile/profile-favorites";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function ProfileFavoritesPage() {
	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard", icon: Home },
		{ label: "Perfil", href: "/profile", icon: User },
		{ label: "Mis Favoritos", icon: Heart },
	];

	return (
		<DashboardPageLayout
			actions={
				<Button asChild variant="outline">
					<Link href="/profile">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Volver al Perfil
					</Link>
				</Button>
			}
			breadcrumbs={breadcrumbs}
			description="Visualiza y gestiona todos tus elementos favoritos"
			title="Mis Favoritos"
		>
			<Card>
				<CardHeader>
					<CardTitle>Elementos Favoritos</CardTitle>
					<CardDescription>
						Todos los elementos que has añadido a tus favoritos, organizados por
						categoría
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ProfileFavorites />
				</CardContent>
			</Card>
		</DashboardPageLayout>
	);
}
