"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { LandForm } from "@/components/forms/land-form";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { cn } from "@/lib/utils";

export default function NewLandPage() {
	const breadcrumbs = useBreadcrumbs();
	const _router = useRouter();

	const actions = (
		<Button
			className={cn(
				"text-arsenic",
				"hover:text-arsenic/80",
				"focus-visible:outline-none",
				"focus-visible:ring-2",
				"focus-visible:ring-arsenic/50"
			)}
			size="sm"
			variant="link"
		>
			<ArrowLeft className="h-4 w-4" />
			Volver a Terrenos
		</Button>
	);

	return (
		<RouteGuard requiredPermission="lands.manage">
			<DashboardPageLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Agrega un nuevo terreno al sistema"
				title="Crear Nuevo Terreno"
			>
				<LandForm />
			</DashboardPageLayout>
		</RouteGuard>
	);
}
