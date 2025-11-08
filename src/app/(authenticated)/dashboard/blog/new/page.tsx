"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardPageLayout } from "@/components/layout/index";
import { ComprehensiveErrorRecovery } from "@/components/wizard/comprehensive-error-recovery";
import { WizardFallbackUI } from "@/components/wizard/fallback-ui-states";
import { LazyWizardWrapper } from "@/components/wizard/lazy-wizard-wrapper";
import { NetworkAwareWizard } from "@/components/wizard/network-aware-wizard";
import {
	generateWizardBreadcrumbs,
	ConsistentLoadingState,
	ConsistentErrorState,
} from "@/components/wizard/shared/index";
import { useUser } from "@/hooks/use-user";
import { loadBlogDraft } from "@/lib/actions/index";
import type { BlogWizardData } from "@/types/index";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import process from "node:process";

// Custom hook for draft loading
function useBlogDraft(draftId: string | null, userId: string | undefined) {
	const [initialData, setInitialData] = useState<Partial<BlogWizardData>>({});
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const loadDraftData = async () => {
			if (!(draftId && userId)) {
				return;
			}

			setLoading(true);
			try {
				const result = await loadBlogDraft(draftId, userId);

				if (result.success && result.data) {
					setInitialData(result.data);
					toast.success("Borrador cargado exitosamente");
				} else {
					toast.error(result.error || "Error al cargar el borrador");
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
	}, [draftId, userId, router]);

	return { initialData, loading };
}

// Event handlers
function useBlogHandlers() {
	const router = useRouter();

	const handleComplete = (_data: BlogWizardData): Promise<void> => {
		try {
			toast.success("¡Artículo creado exitosamente!");
			router.push("/dashboard/blog");
			return Promise.resolve();
		} catch (_error) {
			toast.error("Error inesperado al completar el artículo");
			return Promise.resolve();
		}
	};

	const handleUpdate = (_data: Partial<BlogWizardData>) => {
		// No update logic needed for now
	};

	const handleCancel = () => {
		router.push("/dashboard/blog");
	};

	return { handleComplete, handleUpdate, handleCancel };
}

// Loading state component
function LoadingState({
	breadcrumbs,
}: {
	breadcrumbs: Array<{ label: string; href?: string }>;
}) {
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

// Error state component
function ErrorState({
	breadcrumbs,
}: {
	breadcrumbs: Array<{ label: string; href?: string }>;
}) {
	const router = useRouter();

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

// Main content component
function MainContent({
	breadcrumbs,
	draftId,
	initialData,
	handleCancel,
	handleComplete,
	handleUpdate,
	userId,
	router,
}: {
	breadcrumbs: Array<{ label: string; href?: string }>;
	draftId: string | null;
	initialData: Partial<BlogWizardData>;
	handleCancel: () => void;
	handleComplete: (data: BlogWizardData) => Promise<void>;
	handleUpdate: (data: Partial<BlogWizardData>) => void;
	userId: string;
	router: ReturnType<typeof useRouter>;
}) {
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
								userId={userId}
								wizardId={`blog-${userId}-${draftId || "new"}`}
							/>
						</NetworkAwareWizard>
					</ComprehensiveErrorRecovery>
				</div>
			</DashboardPageLayout>
		</RouteGuard>
	);
}

export default function NewBlogPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { user } = useUser();
	const draftId = searchParams?.get("draft");

	const { initialData, loading } = useBlogDraft(draftId, user?.id);
	const { handleComplete, handleUpdate, handleCancel } = useBlogHandlers();
	const breadcrumbs = generateWizardBreadcrumbs("blog", draftId !== null);

	if (loading) {
		return <LoadingState breadcrumbs={breadcrumbs} />;
	}

	if (!user?.id) {
		return <ErrorState breadcrumbs={breadcrumbs} />;
	}

	return (
		<MainContent
			breadcrumbs={breadcrumbs}
			draftId={draftId}
			handleCancel={handleCancel}
			handleComplete={handleComplete}
			handleUpdate={handleUpdate}
			initialData={initialData}
			router={router}
			userId={user.id}
		/>
	);
}
