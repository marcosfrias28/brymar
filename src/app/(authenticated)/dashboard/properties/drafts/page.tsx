"use client";

import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { DraftList } from "@/components/wizard/draft-list";

export default function DraftsPage() {
	const router = useRouter();

	const handleSelectDraft = (draftId: string) => {
		// Navigate to wizard with draft ID
		router.push(`/dashboard/properties/new?draft=${draftId}`);
	};

	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Propiedades", href: "/dashboard/properties" },
		{ label: "Borradores" },
	];

	const actions = (
		<Button asChild>
			<Link href="/dashboard/properties/new">
				<Plus className="h-4 w-4 mr-2" />
				Nueva Propiedad
			</Link>
		</Button>
	);

	return (
		<RouteGuard requiredPermission="properties.manage">
			<DashboardPageLayout
				title="Borradores de Propiedades"
				description="Gestiona y continúa editando tus borradores guardados"
				breadcrumbs={breadcrumbs}
				actions={actions}
			>
				<div className="max-w-4xl mx-auto">
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<FileText className="h-6 w-6 text-secondary" />
							<h2 className="text-2xl font-bold">Todos los Borradores</h2>
						</div>
						<p className="text-muted-foreground">
							Aquí puedes ver todos tus borradores guardados y continuar
							editándolos donde los dejaste.
						</p>
					</div>

					<DraftList onSelectDraft={handleSelectDraft} showActions={true} />
				</div>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
