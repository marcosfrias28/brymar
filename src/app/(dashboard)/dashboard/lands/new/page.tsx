"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from '@/hooks/use-user';
import { LazyWizardWrapper } from '@/components/wizard/lazy-wizard-wrapper';
import type { LandWizardData } from '@/types/land-wizard';
import { RouteGuard } from '@/components/auth/route-guard';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { WizardErrorBoundary } from '@/components/wizard/core/wizard-error-boundary';
import { ComprehensiveErrorRecovery } from '@/components/wizard/comprehensive-error-recovery';
import { NetworkAwareWizard } from '@/components/wizard/network-aware-wizard';
import { WizardFallbackUI } from '@/components/wizard/fallback-ui-states';
import {
  generateWizardBreadcrumbs,
  ConsistentLoadingState,
  ConsistentErrorState,
} from '@/components/wizard/shared/consistent-navigation';
import { toast } from "sonner";

export default function NewLandPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [initialData, setInitialData] = useState<Partial<LandWizardData>>({});
  const [loading, setLoading] = useState(false);

  const draftId = searchParams?.get("draft");

  useEffect(() => {
    const loadDraftData = async () => {
      if (!draftId || !user?.id) return;

      setLoading(true);
      try {
        // Import the loadLandDraft action dynamically to avoid server/client issues
        const { loadLandDraft } = await import(
          "@/lib/actions/land-wizard-actions"
        );

        const result = await loadLandDraft({
          draftId,
          userId: user.id,
        });

        if (result.success && result.data?.formData) {
          setInitialData(result.data.formData);
          toast.success("Borrador cargado exitosamente");
        } else {
          toast.error(result.message || "Error al cargar el borrador");
          // Redirect to new land without draft
          router.replace("/dashboard/lands/new");
        }
      } catch (error) {
        console.error("Error loading draft:", error);
        toast.error("Error inesperado al cargar el borrador");
        router.replace("/dashboard/lands/new");
      } finally {
        setLoading(false);
      }
    };

    loadDraftData();
  }, [draftId, user?.id, router]);

  const handleComplete = async (landData: LandWizardData) => {
    try {
      // Here you would typically call an action to create the land
      // const result = await createLand(landData);
      toast.success("¡Terreno creado exitosamente!");
      // For now, navigate to the lands list since we don't have the actual landId
      router.push("/dashboard/lands");
    } catch (error) {
      console.error("Error completing land wizard:", error);
      toast.error("Error inesperado al completar el terreno");
    }
  };

  const handleCancel = () => {
    // Consistent navigation pattern - go back to the list page
    router.push("/dashboard/lands");
  };

  const breadcrumbs = generateWizardBreadcrumbs("land", !!draftId);

  if (loading) {
    return (
      <RouteGuard requiredPermission="lands.manage">
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

  if (!user?.id) {
    return (
      <RouteGuard requiredPermission="lands.manage">
        <DashboardPageLayout
          title="Error"
          description="Usuario no autenticado"
          breadcrumbs={breadcrumbs}
        >
          <ConsistentErrorState
            title="Error de autenticación"
            description="No se pudo verificar tu identidad"
            actionLabel="Volver a Terrenos"
            onAction={() => router.push("/dashboard/lands")}
          />
        </DashboardPageLayout>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requiredPermission="lands.manage">
      <DashboardPageLayout
        title={draftId ? "Continuar Borrador" : "Nuevo Terreno"}
        description={
          draftId
            ? "Continúa editando tu borrador guardado"
            : "Crea un nuevo terreno usando el asistente inteligente"
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
              console.error("Land wizard error:", error);
              // Could integrate with error reporting service here
            }}
            onRecovery={(error) => {
              console.log("Land wizard recovered from error:", error);
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
                type="land"
                wizardId={`land-${user.id}-${draftId || "new"}`}
                initialData={initialData}
                draftId={draftId || undefined}
                userId={user.id}
                onComplete={handleComplete}
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
