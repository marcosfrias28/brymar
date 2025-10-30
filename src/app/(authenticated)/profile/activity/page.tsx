"use client";

import { Activity, ArrowLeft, Home, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { ProfileActivity } from "@/components/profile/profile-activity";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function ProfileActivityPage() {
	const _router = useRouter();

	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard", icon: Home },
		{ label: "Perfil", href: "/profile", icon: User },
		{ label: "Historial de Actividad", icon: Activity },
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
			description="Visualiza el historial completo de tus actividades y acciones"
			title="Historial de Actividad"
		>
			<Card>
				<CardHeader>
					<CardTitle>Actividad de Usuario</CardTitle>
					<CardDescription>
						Historial detallado de todas las acciones realizadas en el sistema
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ProfileActivity />
				</CardContent>
			</Card>
		</DashboardPageLayout>
	);
}
