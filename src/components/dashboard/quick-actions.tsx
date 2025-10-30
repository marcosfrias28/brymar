"use client";

import { Building2, FileText, MapPin, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DraftList } from "@/components/wizard/draft-list";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

const quickActions = [
	{
		title: "Agregar Propiedad",
		href: "/dashboard/properties/new",
		icon: Building2,
		description: "Crear con asistente IA",
	},
	{
		title: "Agregar Terreno",
		href: "/dashboard/lands/new",
		icon: MapPin,
		description: "Registrar nuevo terreno",
	},
	{
		title: "Agregar Post",
		href: "/dashboard/blog/new",
		icon: FileText,
		description: "Escribir artículo del blog",
	},
];

export function QuickActions() {
	return (
		<div className="space-y-4">
			<Card className="transition-all duration-200 hover:border-secondary/20 hover:shadow-md">
				<CardHeader className="border-secondary/10 border-b">
					<CardTitle className="flex items-center gap-2">
						<Zap className="h-5 w-5 text-secondary" />
						Acciones Rápidas
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 pt-6">
					{quickActions.map((action, index) => (
						<Button
							asChild
							className={cn(
								"h-auto w-full justify-start p-4 text-left",
								secondaryColorClasses.accentHover,
								"focus-visible:ring-secondary/50"
							)}
							key={index}
							variant="outline"
						>
							<Link className="flex items-center gap-3" href={action.href}>
								<div
									className={cn("rounded-lg p-2", secondaryColorClasses.accent)}
								>
									<action.icon className="h-4 w-4 text-secondary-foreground" />
								</div>
								<div className="flex-1">
									<div className="font-medium">{action.title}</div>
									<div className="text-muted-foreground text-sm">
										{action.description}
									</div>
								</div>
							</Link>
						</Button>
					))}
				</CardContent>
			</Card>

			{/* Recent Drafts */}
			<DraftList
				maxItems={3}
				onSelectDraft={(draftId) => {
					window.location.href = `/dashboard/properties/new?draft=${draftId}`;
				}}
				showActions={false}
			/>
		</div>
	);
}
