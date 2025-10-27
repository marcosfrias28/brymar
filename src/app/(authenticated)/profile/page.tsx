"use client";

import { Activity, Home, User } from "lucide-react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { ProfileActivity } from "@/components/profile/profile-activity";
import { ProfileForm } from "@/components/profile/profile-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard", icon: Home },
		{ label: "Mi Perfil", icon: User },
	];

	return (
		<DashboardPageLayout
			title="Mi Perfil"
			description="Gestiona tu información personal y configuración de la cuenta"
			breadcrumbs={breadcrumbs}
		>
			<Tabs defaultValue="profile" className="space-y-6">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="profile" className="flex items-center gap-2">
						<User className="h-4 w-4" />
						Información Personal
					</TabsTrigger>
					<TabsTrigger value="activity" className="flex items-center gap-2">
						<Activity className="h-4 w-4" />
						Actividad Reciente
					</TabsTrigger>
				</TabsList>

				<TabsContent value="profile" className="space-y-6">
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

				<TabsContent value="activity" className="space-y-6">
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
