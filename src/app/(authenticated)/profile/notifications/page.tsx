"use client";

import { ArrowLeft, Bell, Home, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { ProfileNotifications } from "@/components/profile/profile-notifications";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function ProfileNotificationsPage() {
	const _router = useRouter();
	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard", icon: Home },
		{ label: "Perfil", href: "/profile", icon: User },
		{ label: "Mis Notificaciones", icon: Bell },
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
			description="Gestiona y visualiza todas tus notificaciones"
			title="Mis Notificaciones"
		>
			<Card>
				<CardHeader>
					<CardTitle>Centro de Notificaciones</CardTitle>
					<CardDescription>
						Visualiza, gestiona y configura tus notificaciones del sistema
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ProfileNotifications />
				</CardContent>
			</Card>
		</DashboardPageLayout>
	);
}
