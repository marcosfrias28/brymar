"use client";

import { Activity, Home, User } from "lucide-react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { ProfileActivity } from "@/components/profile/profile-activity";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function ProfileActivityPage() {
	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard", icon: Home },
		{ label: "Profilo", href: "/profile", icon: User },
		{ label: "Cronologia Attività", icon: Activity },
	];

	return (
		<DashboardPageLayout
			title="Cronologia Attività"
			description="Visualizza la cronologia completa delle tue attività e azioni"
			breadcrumbs={breadcrumbs}
		>
			<Card>
				<CardHeader>
					<CardTitle>Attività Utente</CardTitle>
					<CardDescription>
						Cronologia dettagliata di tutte le azioni eseguite nel sistema
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ProfileActivity />
				</CardContent>
			</Card>
		</DashboardPageLayout>
	);
}
