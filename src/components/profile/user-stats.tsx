"use client";

import { Building2, Eye, Heart, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

// Mock data for user statistics - replace with actual user data
const userStats = [
	{
		title: "Propiedades Favoritas",
		value: "12",
		change: "+3 este mes",
		icon: Heart,
		color: "bg-red-100 text-red-800",
		description: "Propiedades guardadas",
	},
	{
		title: "Propiedades Vistas",
		value: "47",
		change: "+15 este mes",
		icon: Eye,
		color: "bg-blue-100 text-blue-800",
		description: "Visualizaciones totales",
	},
	{
		title: "Búsquedas Realizadas",
		value: "23",
		change: "+8 este mes",
		icon: Search,
		color: "bg-green-100 text-green-800",
		description: "Búsquedas este mes",
	},
	{
		title: "Propiedades Contactadas",
		value: "5",
		change: "+2 este mes",
		icon: Building2,
		color: "bg-purple-100 text-purple-800",
		description: "Consultas enviadas",
	},
];

export function UserStats() {
	return (
		<div className="grid grid-cols-1 smartphone:grid-cols-2 laptop:grid-cols-4 gap-4">
			{userStats.map((stat, index) => (
				<Card
					key={index}
					className="border-border shadow-lg hover:shadow-xl transition-shadow"
				>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							{stat.title}
						</CardTitle>
						<div
							className={`p-2 rounded-lg ${stat.color.split(" ")[0]} ${stat.color.split(" ")[0]}/10`}
						>
							<stat.icon className={`h-4 w-4 ${stat.color.split(" ")[1]}`} />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-foreground mb-1">
							{stat.value}
						</div>
						<CardDescription className="text-xs">
							{stat.description}
						</CardDescription>
						<Badge variant="outline" className="mt-2 text-xs">
							{stat.change}
						</Badge>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
