"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { ComprehensiveErrorRecovery } from "@/components/wizard/comprehensive-error-recovery";
import { WizardFallbackUI } from "@/components/wizard/fallback-ui-states";
import { LazyWizardWrapper } from "@/components/wizard/lazy-wizard-wrapper";
import { NetworkAwareWizard } from "@/components/wizard/network-aware-wizard";
import {
	ConsistentErrorState,
	ConsistentLoadingState,
	generateWizardBreadcrumbs,
} from "@/components/wizard/shared/consistent-navigation";
import { useUser } from "@/hooks/use-user";
import type { BlogWizardData } from "@/lib/schemas/blog-wizard-schemas";

export default function NewBlogPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user } = useUser();
	const [initialData, setInitialData] = useState<Partial<BlogWizardData>>({});
	const [loading, setLoading] = useState(false);

	const draftId = searchParams?.get("draft");

	useEffect(() => {
		const loadDraftData = async () => {
			if (!(draftId && user?.id)) {
				return;
			}

			setLoading(true);
			try {
				// Import the loadBlogDraft action dynamically to avoid server/client issues
				const { loadBlogDraft } = await import(
					"@/lib/actions/blog-wizard-actions"
				);

				const result = await loadBlogDraft({
					draftId,
					userId: user.id,
				});

				if (result.success && result.data?.formData) {
					setInitialData(result.data.formData);
					toast.success("Borrador cargado exitosamente");
				} else {
					toast.error(result.message || "Error al cargar el borrador");
					// Redirect to new blog without draft
					router.replace("/dashboard/blog/new");
				}
			} catch (_error) {
				toast.error("Error inesperado al cargar el borrador");
				router.replace("/dashboard/blog/new");
			} finally {
				setLoading(false);
			}
		};

		loadDraftData();
	}, [draftId, user?.id, router]);

	const handleComplete = async (_data: BlogWizardData) => {
		try {
			toast.success("¡Artículo creado exitosamente!");
			router.push("/dashboard/blog");
		} catch (_error) {
			toast.error("Error inesperado al completar el artículo");
		}
	};

	const handleUpdate = async (_data: Partial<BlogWizardData>) => {};

	const handleCancel = () => {
		// Consistent navigation pattern - go back to the list page
		router.push("/dashboard/blog");
	};

	const breadcrumbs = generateWizardBreadcrumbs("blog", !!draftId);

	if (loading) {
		return (
			<RouteGuard requiredPermission="blog.manage">
				<DashboardPageLayout
					actions={
						<Button asChild variant="outline">
							<Link href="/dashboard/blog">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Volver al Blog
							</Link>
						</Button>
					}
					breadcrumbs={breadcrumbs}
					description="Cargando borrador"
					title="Cargando..."
				>
					<ConsistentLoadingState
						breadcrumbs={breadcrumbs}
						description="Preparando el asistente con tus datos guardados"
						title="Cargando borrador..."
					/>
				</DashboardPageLayout>
			</RouteGuard>
		);
	}

	if (!user?.id) {
		return (
			<RouteGuard requiredPermission="blog.manage">
				<DashboardPageLayout
					actions={
						<Button asChild variant="outline">
							<Link href="/dashboard/blog">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Volver al Blog
							</Link>
						</Button>
					}
					breadcrumbs={breadcrumbs}
					description="Usuario no autenticado"
					title="Error"
				>
					<ConsistentErrorState
						actionLabel="Volver al Blog"
						description="No se pudo verificar tu identidad"
						onAction={() => router.push("/dashboard/blog")}
						title="Error de autenticación"
					/>
				</DashboardPageLayout>
			</RouteGuard>
		);
	}

	return (
		<RouteGuard requiredPermission="blog.manage">
			<DashboardPageLayout
				actions={
					<Button asChild variant="outline">
						<Link href="/dashboard/blog">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver al Blog
						</Link>
					</Button>
				}
				breadcrumbs={breadcrumbs}
				description={
					draftId
						? "Continúa editando tu borrador guardado"
						: "Crea un nuevo artículo usando el asistente inteligente"
				}
				title={draftId ? "Continuar Borrador" : "Nuevo Artículo"}
			>
				<div className="mx-auto max-w-6xl">
					<ComprehensiveErrorRecovery
						enableAutoRetry={true}
						enableOfflineMode={true}
						fallbackComponent={({ error, onRetry }) => (
							<WizardFallbackUI
								error={error}
								onGoBack={handleCancel}
								onGoHome={() => router.push("/dashboard")}
								onRetry={onRetry}
								showDetails={process.env.NODE_ENV === "development"}
							/>
						)}
						maxRetries={3}
						onError={(_error) => {
							// Could integrate with error reporting service here
						}}
						onRecovery={(_error) => {
							toast.success("Error recuperado exitosamente");
						}}
					>
						<NetworkAwareWizard
							enableOfflineMode={true}
							onNetworkError={(_error) => {
								toast.warning("Conexión perdida", {
									description: "Los cambios se guardarán localmente",
								});
							}}
							onNetworkRecovery={() => {
								toast.success("Conexión restaurada", {
									description: "Sincronizando cambios...",
								});
							}}
						>
							<LazyWizardWrapper
								draftId={draftId || undefined}
								enablePerformanceOptimizations={true}
								initialData={initialData}
								onCancel={handleCancel}
								onComplete={handleComplete}
								onUpdate={handleUpdate}
								type="blog"
								userId={user.id}
								wizardId={`blog-${user.id}-${draftId || "new"}`}
							/>
						</NetworkAwareWizard>
					</ComprehensiveErrorRecovery>
				</div>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
