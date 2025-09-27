"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import {
  getUserDrafts,
  deleteDraft,
  loadDraft,
} from "@/lib/actions/wizard-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  Trash2,
  Edit3,
  MoreHorizontal,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import Link from "next/link";

interface Draft {
  id: string;
  title: string;
  propertyType: string | null;
  stepCompleted: number;
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DraftListProps {
  onSelectDraft?: (draftId: string) => void;
  showActions?: boolean;
  maxItems?: number;
}

export function DraftList({
  onSelectDraft,
  showActions = true,
  maxItems,
}: DraftListProps) {
  const { user } = useUser();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrafts = async () => {
      if (!user?.id) return;

      try {
        const userDrafts = await getUserDrafts(user.id);
        setDrafts(userDrafts as Draft[]);
      } catch (error) {
        console.error("Error fetching drafts:", error);
        toast.error("Error al cargar los borradores");
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [user?.id]);

  const handleDeleteDraft = async (draftId: string) => {
    if (!user?.id) return;

    if (!confirm("¿Estás seguro de que quieres eliminar este borrador?")) {
      return;
    }

    setDeletingId(draftId);

    try {
      const formData = new FormData();
      formData.append("draftId", draftId);
      formData.append("userId", user.id);

      const result = await deleteDraft(formData);

      if (result.success) {
        setDrafts((prev) => prev.filter((draft) => draft.id !== draftId));
        toast.success("Borrador eliminado exitosamente");
      } else {
        toast.error(result.error || "Error al eliminar el borrador");
      }
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error("Error inesperado al eliminar el borrador");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectDraft = async (draftId: string) => {
    if (onSelectDraft) {
      onSelectDraft(draftId);
    }
  };

  const getStepName = (step: number) => {
    switch (step) {
      case 0:
        return "Iniciado";
      case 1:
        return "Información General";
      case 2:
        return "Ubicación";
      case 3:
        return "Imágenes";
      case 4:
        return "Completo";
      default:
        return "Desconocido";
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    if (percentage >= 25) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Borradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                Cargando borradores...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayDrafts = maxItems ? drafts.slice(0, maxItems) : drafts;

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        secondaryColorClasses.cardHover
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-secondary" />
          Borradores Guardados
          {drafts.length > 0 && (
            <Badge variant="secondary" className={secondaryColorClasses.badge}>
              {drafts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayDrafts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay borradores</h3>
            <p className="text-muted-foreground text-sm">
              Los borradores que guardes aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayDrafts.map((draft) => (
              <div
                key={draft.id}
                className={cn(
                  "border rounded-lg p-4 transition-all duration-200",
                  secondaryColorClasses.cardHover,
                  "hover:shadow-sm"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-foreground truncate">
                        {draft.title || "Borrador sin título"}
                      </h4>
                      {draft.propertyType && (
                        <Badge variant="outline" className="text-xs">
                          {draft.propertyType}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{getStepName(draft.stepCompleted)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span
                          className={getCompletionColor(
                            draft.completionPercentage
                          )}
                        >
                          {draft.completionPercentage}% completo
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Actualizado:{" "}
                          {new Date(draft.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {showActions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleSelectDraft(draft.id)}
                          className="cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Continuar editando
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteDraft(draft.id)}
                          disabled={deletingId === draft.id}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingId === draft.id
                            ? "Eliminando..."
                            : "Eliminar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        draft.completionPercentage >= 75
                          ? "bg-green-500"
                          : draft.completionPercentage >= 50
                          ? "bg-yellow-500"
                          : draft.completionPercentage >= 25
                          ? "bg-orange-500"
                          : "bg-red-500"
                      )}
                      style={{ width: `${draft.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {maxItems && drafts.length > maxItems && (
              <div className="text-center pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/properties/drafts">
                    Ver todos los borradores ({drafts.length})
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
