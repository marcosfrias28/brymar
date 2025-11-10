"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { PropertyWizardData } from "./steps/property/types";
import {
	generatePropertyDescription,
	generatePropertyTitle,
} from "@/lib/actions/ai-actions";

type AIGenerationPanelProps = {
	data: PropertyWizardData;
	onDataUpdate: (newData: Partial<PropertyWizardData>) => void;
	userId?: string;
	isGenerating: boolean;
	onGeneratingChange: (generating: boolean) => void;
};

// Helper function to transform PropertyWizardData to PropertyBasicInfo
function transformToBasicInfo(data: PropertyWizardData) {
	return {
		type: data.propertyType || "apartment",
		location: data.address?.city || "",
		price: data.price || 0,
		surface: data.surface || 0,
		characteristics: data.characteristics || [],
		bedrooms: data.bedrooms,
		bathrooms: data.bathrooms,
	};
}

export function AIGenerationPanel({
	data,
	onDataUpdate,
	userId,
	isGenerating,
	onGeneratingChange,
}: AIGenerationPanelProps) {
	const handleGenerateTitle = async () => {
		if (!userId) {
			return;
		}

		onGeneratingChange(true);
		try {
			const result = await generatePropertyTitle(
				transformToBasicInfo(data),
				{ language: "es" },
				userId
			);

			if (result.success && result.data) {
				onDataUpdate({ title: result.data });
				toast.success("Título generado exitosamente");
			} else {
				toast.error(result.error || "Error al generar título");
			}
		} catch {
			toast.error("Error inesperado al generar título");
		} finally {
			onGeneratingChange(false);
		}
	};

	const handleGenerateDescription = async () => {
		if (!userId) {
			return;
		}

		onGeneratingChange(true);
		try {
			const result = await generatePropertyDescription(
				transformToBasicInfo(data),
				{ language: "es", maxLength: 500 },
				userId
			);

			if (result.success && result.data) {
				onDataUpdate({ description: result.data });
				toast.success("Descripción generada exitosamente");
			} else {
				toast.error(result.error || "Error al generar descripción");
			}
		} catch {
			toast.error("Error inesperado al generar descripción");
		} finally {
			onGeneratingChange(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Sparkles className="h-4 w-4" />
					Asistente IA
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-wrap gap-3">
					<Button
						disabled={isGenerating}
						onClick={handleGenerateTitle}
						size="sm"
						variant="outline"
					>
						<Sparkles className="mr-2 h-3 w-3" />
						{isGenerating ? "Generando..." : "Generar Título"}
					</Button>
					<Button
						disabled={isGenerating}
						onClick={handleGenerateDescription}
						size="sm"
						variant="outline"
					>
						<Sparkles className="mr-2 h-3 w-3" />
						{isGenerating ? "Generando..." : "Generar Descripción"}
					</Button>
				</div>
				<p className="mt-3 text-muted-foreground text-xs">
					Usa IA para crear títulos y descripciones atractivas basadas en los
					datos de tu propiedad.
				</p>
			</CardContent>
		</Card>
	);
}
