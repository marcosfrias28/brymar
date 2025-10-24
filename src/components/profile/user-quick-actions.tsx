"use client";

import {
	Bell,
	Heart,
	MessageCircle,
	Search,
	Settings,
	User,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const userQuickActions = [
	{
		title: "Buscar Propiedades",
		href: "/search",
		icon: Search,
		color: "bg-blue-500 hover:bg-blue-600",
		description: "Encuentra tu propiedad ideal",
	},
	{
		title: "Mis Favoritos",
		href: "/favorites",
		icon: Heart,
		color: "bg-red-500 hover:bg-red-600",
		description: "Ver propiedades guardadas",
	},
	{
		title: "Notificaciones",
		href: "/notifications",
		icon: Bell,
		color: "bg-yellow-500 hover:bg-yellow-600",
		description: "Alertas y actualizaciones",
	},
	{
		title: "Contactar Agente",
		href: "/contact",
		icon: MessageCircle,
		color: "bg-green-500 hover:bg-green-600",
		description: "Habla con un experto",
	},
	{
		title: "Editar Perfil",
		href: "/profile/edit",
		icon: User,
		color: "bg-purple-500 hover:bg-purple-600",
		description: "Actualizar información",
	},
	{
		title: "Configuración",
		href: "/profile/settings",
		icon: Settings,
		color: "bg-gray-500 hover:bg-gray-600",
		description: "Preferencias de cuenta",
	},
];

export function UserQuickActions() {
	return (
		<Card className="border-blackCoral shadow-lg">
			<CardHeader>
				<CardTitle className="text-arsenic flex items-center gap-2">
					<Settings className="h-5 w-5" />
					Acciones Rápidas
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{userQuickActions.map((action, index) => (
						<Button
							key={index}
							asChild
							className={`${action.color} text-white h-auto p-4 flex flex-col items-start gap-2 hover:scale-105 transition-all duration-200`}
							variant="default"
						>
							<Link href={action.href}>
								<div className="flex items-center gap-2 w-full">
									<action.icon className="h-5 w-5 flex-shrink-0" />
									<span className="font-medium text-sm">{action.title}</span>
								</div>
								<span className="text-xs opacity-90 text-left w-full">
									{action.description}
								</span>
							</Link>
						</Button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
