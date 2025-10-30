"use client";

import { ArrowLeft, Home, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { ProfileMessages } from "@/components/profile/profile-messages";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function ProfileMessagesPage() {
	const _router = useRouter();
	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard", icon: Home },
		{ label: "Perfil", href: "/profile", icon: User },
		{ label: "Mis Mensajes", icon: MessageSquare },
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
			description="Gestiona tu bandeja de entrada y envía nuevos mensajes"
			title="Mis Mensajes"
		>
			<Card>
				<CardHeader>
					<CardTitle>Centro de Mensajes</CardTitle>
					<CardDescription>
						Visualiza, envía y gestiona todos tus mensajes
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ProfileMessages />
				</CardContent>
			</Card>
		</DashboardPageLayout>
	);
}
