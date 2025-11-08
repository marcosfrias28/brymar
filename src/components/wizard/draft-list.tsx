"use client";

import {
	Calendar,
	CheckCircle2,
	Clock,
	Edit3,
	FileText,
	MoreHorizontal,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteWizardDraft, useWizardDrafts } from "@/hooks/use-wizard";
import type { WizardDraft, WizardType } from "@/lib/types/index";
import { cn } from "@/lib/utils/index";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

type DraftListProps = {
	type?: WizardType;
	onSelectDraft?: (draftId: string) => void;
	showActions?: boolean;
	maxItems?: number;
};

export function DraftList({
	type,
	onSelectDraft,
	showActions = true,
	maxItems,
}: DraftListProps) {
	const draftsQuery = useWizardDrafts(type);
	const drafts = (draftsQuery.data ?? []) as WizardDraft[];
	const isLoading = draftsQuery.isLoading;
	const deleteDraft = useDeleteWizardDraft();

	const handleDeleteDraft = async (draftId: string) => {
		if (!confirm("¿Estás seguro de que quieres eliminar este borrador?")) {
			return;
		}

		try {
			deleteDraft.mutate(draftId);
		} catch (_error) {}
	};

	const handleSelectDraft = (draftId: string) => {
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

	const _getCompletionColor = (percentage: number) => {
		if (percentage >= 75) {
			return "text-green-600";
		}
		if (percentage >= 50) {
			return "text-yellow-600";
		}
		if (percentage >= 25) {
			return "text-orange-600";
		}
		return "text-red-600";
	};

	if (isLoading) {
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
							<div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-primary border-b-2" />
							<p className="text-muted-foreground text-sm">
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
						<Badge className={secondaryColorClasses.badge} variant="secondary">
							{drafts.length}
						</Badge>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{displayDrafts.length === 0 ? (
					<div className="py-8 text-center">
						<FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">No hay borradores</h3>
						<p className="text-muted-foreground text-sm">
							Los borradores que guardes aparecerán aquí
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{displayDrafts.map((draft: any) => (
							<div
								className={cn(
									"rounded-lg border p-4 transition-all duration-200",
									secondaryColorClasses.cardHover,
									"hover:shadow-sm"
								)}
								key={draft.id}
							>
								<div className="flex items-start justify-between">
									<div className="min-w-0 flex-1">
										<div className="mb-2 flex items-center gap-2">
											<h4 className="truncate font-medium text-foreground">
												{draft.title || "Borrador sin título"}
											</h4>
											{draft.type && (
												<Badge className="text-xs" variant="outline">
													{draft.type}
												</Badge>
											)}
										</div>

										<div className="mb-2 flex items-center gap-4 text-muted-foreground text-sm">
											<div className="flex items-center gap-1">
												<CheckCircle2 className="h-3 w-3" />
												<span>{getStepName(draft.currentStep || 0)}</span>
											</div>
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												<span className="text-muted-foreground">
													{draft.status}
												</span>
											</div>
										</div>

										<div className="flex items-center gap-4 text-muted-foreground text-xs">
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
													className="h-8 w-8 p-0"
													size="sm"
													variant="ghost"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													className="cursor-pointer"
													onClick={() => handleSelectDraft(draft.id)}
												>
													<Edit3 className="mr-2 h-4 w-4" />
													Continuar editando
												</DropdownMenuItem>
												<DropdownMenuItem
													className="cursor-pointer text-destructive focus:text-destructive"
													disabled={deleteDraft.isPending}
													onClick={() => handleDeleteDraft(draft.id)}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													{deleteDraft.isPending ? "Eliminando..." : "Eliminar"}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									)}
								</div>

								{/* Status indicator */}
								<div className="mt-3">
									<div className="h-1.5 w-full rounded-full bg-muted">
										<div
											className={cn(
												"h-1.5 rounded-full transition-all duration-300",
												draft.status === "published"
													? "bg-green-500"
													: draft.status === "completed"
														? "bg-blue-500"
														: "bg-yellow-500"
											)}
											style={{
												width: draft.status === "draft" ? "50%" : "100%",
											}}
										/>
									</div>
								</div>
							</div>
						))}

						{maxItems && drafts.length > maxItems && (
							<div className="pt-2 text-center">
								<Button asChild size="sm" variant="outline">
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
