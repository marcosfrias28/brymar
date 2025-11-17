"use client";

import { Activity, ArrowLeft, Home, User } from "lucide-react";
import Link from "next/link";
import { UnifiedFilterChips, UnifiedStatsCards } from "@/components/dashboard";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { ProfileActivity } from "@/components/profile/profile-activity";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStatsAdapter } from "@/lib/adapters/stats-adapters";

export default function ProfilePage() {
	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard", icon: Home },
		{ label: "Mi Perfil", icon: User },
	];

	// Generate profile stats using the adapter system
	const profileAdapter = getStatsAdapter("profile");
	const statsCards =
		profileAdapter?.generateStats({
			favoriteProperties: 12,
			totalViews: 245,
			searchesMade: 38,
			propertiesContacted: 8,
		}) || [];

	const filterTabs = [
		{
			id: "profile",
			label: "Información Personal",
			value: "profile",
			count: 1,
			active: true,
			onClick: () => {},
		},
		{
			id: "activity",
			label: "Actividad Reciente",
			value: "activity",
			count: 15,
			active: false,
			onClick: () => {},
		},
	];

	const actions = (
		<Button asChild variant="outline">
			<Link href="/dashboard">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Volver al Dashboard
			</Link>
		</Button>
	);

	return (
		<DashboardPageLayout
			actions={actions}
			breadcrumbs={breadcrumbs}
			description="Gestiona tu información personal y configuración de la cuenta"
			headerExtras={
				<div className="space-y-4">
					<UnifiedStatsCards className="mb-4" loading={false} stats={statsCards} />
					<UnifiedFilterChips className="mb-4" chips={filterTabs} />
				</div>
			}
			title="Mi Perfil"
		>
			<Tabs className="space-y-6" defaultValue="profile">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger className="flex items-center gap-2" value="profile">
						<User className="h-4 w-4" />
						Información Personal
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="activity">
						<Activity className="h-4 w-4" />
						Actividad Reciente
					</TabsTrigger>
				</TabsList>

				<TabsContent className="space-y-6" value="profile">
					<Card>
						<CardHeader>
							<CardTitle>Perfil del Usuario</CardTitle>
							<CardDescription>
								Actualiza tu información personal y la imagen de perfil
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ProfileForm />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent className="space-y-6" value="activity">
					<Card>
						<CardHeader>
							<CardTitle>Actividad Reciente</CardTitle>
							<CardDescription>
								Visualiza el historial de tus actividades y acciones
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ProfileActivity />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</DashboardPageLayout>
	);
}
