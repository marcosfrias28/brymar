"use client";

import { Building2, Clock, Eye, Heart, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for user activity - replace with actual user activity
const userActivities = [
	{
		id: 1,
		type: "favorite",
		title: "Villa Moderna en Punta Cana",
		action: "Agregada a favoritos",
		time: "Hace 2 horas",
		icon: Heart,
		color: "text-red-500",
		href: "/properties/1",
	},
	{
		id: 2,
		type: "view",
		title: "Apartamento Frente al Mar",
		action: "Vista de propiedad",
		time: "Hace 4 horas",
		icon: Eye,
		color: "text-blue-500",
		href: "/properties/2",
	},
	{
		id: 3,
		type: "search",
		title: "Propiedades en Punta Cana",
		action: "Búsqueda realizada",
		time: "Hace 1 día",
		icon: Search,
		color: "text-green-500",
		href: "/search?location=punta-cana",
	},
	{
		id: 4,
		type: "view",
		title: "Casa Colonial en Santo Domingo",
		action: "Vista de propiedad",
		time: "Hace 2 días",
		icon: Eye,
		color: "text-blue-500",
		href: "/properties/3",
	},
	{
		id: 5,
		type: "favorite",
		title: "Terreno en La Romana",
		action: "Agregada a favoritos",
		time: "Hace 3 días",
		icon: Heart,
		color: "text-red-500",
		href: "/properties/4",
	},
];

export function UserActivity() {
	const getActivityIcon = (type: string) => {
		switch (type) {
			case "favorite":
				return Heart;
			case "view":
				return Eye;
			case "search":
				return Search;
			case "property":
				return Building2;
			case "land":
				return MapPin;
			default:
				return Clock;
		}
	};

	const getActivityColor = (type: string) => {
		switch (type) {
			case "favorite":
				return "text-red-500 bg-red-50";
			case "view":
				return "text-blue-500 bg-blue-50";
			case "search":
				return "text-green-500 bg-green-50";
			case "property":
				return "text-purple-500 bg-purple-50";
			case "land":
				return "text-orange-500 bg-orange-50";
			default:
				return "text-gray-500 bg-gray-50";
		}
	};

	const getStatusBadge = (type: string) => {
		switch (type) {
			case "favorite":
				return (
					<Badge className="border-red-200 text-red-600" variant="outline">
						Favorito
					</Badge>
				);
			case "view":
				return (
					<Badge className="border-blue-200 text-blue-600" variant="outline">
						Vista
					</Badge>
				);
			case "search":
				return (
					<Badge className="border-green-200 text-green-600" variant="outline">
						Búsqueda
					</Badge>
				);
			default:
				return <Badge variant="outline">Actividad</Badge>;
		}
	};

	return (
		<Card className="border-blackCoral shadow-lg">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-arsenic">
					<Clock className="h-5 w-5" />
					Actividad Reciente
				</CardTitle>
			</CardHeader>
			<CardContent>
				{userActivities.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<Clock className="mx-auto mb-4 h-12 w-12 text-gray-300" />
						<p>No hay actividad reciente</p>
					</div>
				) : (
					<div className="space-y-4">
						{userActivities.map((activity) => {
							const IconComponent = getActivityIcon(activity.type);
							const colorClass = getActivityColor(activity.type);

							return (
								<div
									className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
									key={activity.id}
								>
									<Avatar className={`h-8 w-8 ${colorClass}`}>
										<AvatarFallback className={colorClass}>
											<IconComponent className="h-4 w-4" />
										</AvatarFallback>
									</Avatar>

									<div className="min-w-0 flex-1">
										<div className="mb-1 flex items-start justify-between">
											<div className="flex-1">
												<Link
													className="line-clamp-1 font-medium text-sm transition-colors hover:text-primary"
													href={activity.href}
												>
													{activity.title}
												</Link>
												<p className="mt-1 text-muted-foreground text-xs">
													{activity.action}
												</p>
											</div>
											{getStatusBadge(activity.type)}
										</div>

										<div className="mt-2 flex items-center justify-between">
											<span className="flex items-center gap-1 text-muted-foreground text-xs">
												<Clock className="h-3 w-3" />
												{activity.time}
											</span>
										</div>
									</div>
								</div>
							);
						})}

						<div className="border-t pt-4 text-center">
							<Link
								className="text-primary text-sm transition-colors hover:text-primary/80"
								href="/search"
							>
								Ver más actividad →
							</Link>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
