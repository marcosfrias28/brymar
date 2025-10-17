"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/presentation/hooks/use-user";
import { LazyWizardWrapper } from "@/components/wizard/lazy-wizard-wrapper";
import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { WizardErrorBoundary } from "@/components/wizard/core/wizard-error-boundary";
import { ComprehensiveErrorRecovery } from "@/components/wizard/comprehensive-error-recovery";
import { NetworkAwareWizard } from "@/components/wizard/network-aware-wizard";
import { WizardFallbackUI } from "@/components/wizard/fallback-ui-states";
import {
  generateWizardBreadcrumbs,
  ConsistentLoadingState,
  ConsistentErrorState,
} from "@/components/wizard/shared/consistent-navigation";
import { toast } from "sonner";
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
      if (!draftId || !user?.getId()) return;

      setLoading(true);
      try {
        // Import the loadBlogDraft action dynamically to avoid server/client issues
        const { loadBlogDraft } = await import(
          "@/lib/actions/blog-wizard-actions"
        );

        const result = await loadBlogDraft({
          draftId,
          userId: user.getId().value,
        });

        if (result.success && result.data?.formData) {
          setInitialData(result.data.formData);
          toast.success("Borrador cargado exitosamente");
        } else {
          toast.error(result.message || "Error al cargar el borrador");
          // Redirect to new blog without draft
          router.replace("/dashboard/blog/new");
        }
      } catch (error) {
        console.error("Error loading draft:", error);
        toast.error("Error inesperado al cargar el borrador");
        router.replace("/dashboard/blog/new");
      } finally {
        setLoading(false);
      }
    };

    loadDraftData();
  }, [draftId, user?.getId(), router]);

  const handleComplete = async (data: BlogWizardData) => {
    try {
      toast.success("¡Artículo creado exitosamente!");
      router.push("/dashboard/blog");
    } catch (error) {
      console.error("Error completing blog wizard:", error);
      toast.error("Error inesperado al completar el artículo");
    }
  };

  const handleUpdate = async (data: Partial<BlogWizardData>) => {
    // Handle draft updates if needed
    console.log("Blog data updated:", data);
  };

  const handleCancel = () => {
    // Consistent navigation pattern - go back to the list page
    router.push("/dashboard/blog");
  };

  const breadcrumbs = generateWizardBreadcrumbs("blog", !!draftId);

  if (loading) {
    return (
      <RouteGuard requiredPermission="blog.manage">
        <DashboardPageLayout
          title="Cargando..."
          description="Cargando borrador"
          breadcrumbs={breadcrumbs}
        >
          <ConsistentLoadingState
            title="Cargando borrador..."
            description="Preparando el asistente con tus datos guardados"
            breadcrumbs={breadcrumbs}
          />
        </DashboardPageLayout>
      </RouteGuard>
    );
  }

  if (!user?.getId()) {
    return (
      <RouteGuard requiredPermission="blog.manage">
        <DashboardPageLayout
          title="Error"
          description="Usuario no autenticado"
          breadcrumbs={breadcrumbs}
        >
          <ConsistentErrorState
            title="Error de autenticación"
            description="No se pudo verificar tu identidad"
            actionLabel="Volver al Blog"
            onAction={() => router.push("/dashboard/blog")}
          />
        </DashboardPageLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requiredPermission="blog.manage">
      <DashboardPageLayout
        title={draftId ? "Continuar Borrador" : "Nuevo Artículo"}
        description={
          draftId
            ? "Continúa editando tu borrador guardado"
            : "Crea un nuevo artículo usando el asistente inteligente"
        }
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-6xl mx-auto">
          <ComprehensiveErrorRecovery
            enableAutoRetry={true}
            enableOfflineMode={true}
            maxRetries={3}
            fallbackComponent={({ error, onRetry }) => (
              <WizardFallbackUI
                error={error}
                onRetry={onRetry}
                onGoBack={handleCancel}
                onGoHome={() => router.push("/dashboard")}
                showDetails={process.env.NODE_ENV === "development"}
              />
            )}
            onError={(error) => {
              console.error("Blog wizard error:", error);
              // Could integrate with error reporting service here
            }}
            onRecovery={(error) => {
              console.log("Blog wizard recovered from error:", error);
              toast.success("Error recuperado exitosamente");
            }}
          >
            <NetworkAwareWizard
              enableOfflineMode={true}
              onNetworkError={(error) => {
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
                type="blog"
                wizardId={`blog-${user.getId().value}-${draftId || "new"}`}
                initialData={initialData}
                draftId={draftId || undefined}
                userId={user.getId().value}
                onComplete={handleComplete}
                onUpdate={handleUpdate}
                onCancel={handleCancel}
                enablePerformanceOptimizations={true}
              />
            </NetworkAwareWizard>
          </ComprehensiveErrorRecovery>
        </div>
      </DashboardPageLayout>
    </RouteGuard>
  );
}
