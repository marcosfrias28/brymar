"use client";

import { ArrowLeft, FileText, Plus } from "lucide-react";
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
		<div className="flex gap-2">
			<Button asChild>
				<Link href="/dashboard/properties/new">
					<Plus className="mr-2 h-4 w-4" />
					Nueva Propiedad
				</Link>
			</Button>
			<Button asChild variant="outline">
				<Link href="/dashboard/properties">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Volver a Propiedades
				</Link>
			</Button>
		</div>
	);

	return (
		<RouteGuard requiredPermission="properties.manage">
			<DashboardPageLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Gestiona y continúa editando tus borradores guardados"
				title="Borradores de Propiedades"
			>
				<div className="mx-auto max-w-4xl">
					<div className="mb-6">
						<div className="mb-2 flex items-center gap-3">
							<FileText className="h-6 w-6 text-secondary" />
							<h2 className="font-bold text-2xl">Todos los Borradores</h2>
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
