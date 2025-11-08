"use client";

import { FileText, Home, MapPin, PenTool, Plus, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import { useGenerateAIContent, useWizardDraft } from "@/hooks/use-wizard";
import type { WizardType } from "@/lib/types/index";
import { cn } from "@/lib/utils/index";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import type { PropertyWizardData } from "@/types/property-wizard";
import { BlogWizard } from "./blog-wizard";
import { DraftList } from "./draft-list";
import { LandWizard } from "./land-wizard";
import { PropertyWizard } from "./property-wizard";

type WizardManagerProps = {
	defaultType?: WizardType;
	onComplete?: () => void;
};

export function WizardManager({
	defaultType = "property",
	onComplete,
}: WizardManagerProps) {
	const [activeTab, setActiveTab] = useState<WizardType>(defaultType);
	const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
	const [showWizard, setShowWizard] = useState(false);

	const { data: selectedDraft } = useWizardDraft(selectedDraftId);
	const generateAI = useGenerateAIContent();

	const wizardTypes = [
		{
			id: "property" as WizardType,
			label: "Propiedades",
			icon: Home,
			description: "Crear nuevas propiedades",
		},
		{
			id: "land" as WizardType,
			label: "Terrenos",
			icon: MapPin,
			description: "Agregar terrenos",
		},
		{
			id: "blog" as WizardType,
			label: "Blog",
			icon: PenTool,
			description: "Escribir artículos",
		},
	];

	const handleStartNew = () => {
		setSelectedDraftId(null);
		setShowWizard(true);
	};

	const handleSelectDraft = (draftId: string) => {
		setSelectedDraftId(draftId);
		setShowWizard(true);
	};

	const handleWizardComplete = () => {
		setShowWizard(false);
		setSelectedDraftId(null);
		onComplete?.();
	};

	const handleGenerateAI = async (
		contentType: "title" | "description" | "tags" | "market_insights"
	) => {
		if (!selectedDraft) {
			return;
		}

		generateAI.mutate({
			wizardType: selectedDraft.type,
			contentType,
			baseData: selectedDraft.data,
			language: "es",
		});
	};

	if (showWizard) {
		const baseWizardProps = {
			draftId: selectedDraftId || undefined,
			onComplete: handleWizardComplete,
		};

		const propertyWizardProps = {
			...baseWizardProps,
			initialData: selectedDraft?.data as PropertyWizardData | undefined,
		};

		const landWizardProps = {
			...baseWizardProps,
			initialData: selectedDraft?.data,
		};

		const blogWizardProps = {
			...baseWizardProps,
			initialData: selectedDraft?.data,
		};

		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button onClick={() => setShowWizard(false)} variant="outline">
						← Volver a la lista
					</Button>

					{selectedDraft && (
						<div className="flex items-center gap-2">
							<Button
								className="flex items-center gap-2"
								disabled={generateAI.isPending}
								onClick={() => handleGenerateAI("title")}
								size="sm"
								variant="outline"
							>
								<Wand2 className="h-4 w-4" />
								Generar Título
							</Button>
							<Button
								className="flex items-center gap-2"
								disabled={generateAI.isPending}
								onClick={() => handleGenerateAI("description")}
								size="sm"
								variant="outline"
							>
								<Wand2 className="h-4 w-4" />
								Generar Descripción
							</Button>
						</div>
					)}
				</div>

				{activeTab === "property" && (
					<PropertyWizard {...propertyWizardProps} />
				)}
				{activeTab === "land" && <LandWizard {...landWizardProps} />}
				{activeTab === "blog" && <BlogWizard {...blogWizardProps} />}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card className={cn("border-border", secondaryColorClasses.cardHover)}>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5 text-secondary" />
						Asistente de Creación
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs
						onValueChange={(value) => setActiveTab(value as WizardType)}
						value={activeTab}
					>
						<TabsList className="grid w-full grid-cols-3">
							{wizardTypes.map((type) => (
								<TabsTrigger
									className="flex items-center gap-2"
									key={type.id}
									value={type.id}
								>
									<type.icon className="h-4 w-4" />
									{type.label}
								</TabsTrigger>
							))}
						</TabsList>

						{wizardTypes.map((type) => (
							<TabsContent className="space-y-4" key={type.id} value={type.id}>
								<div className="py-6 text-center">
									<type.icon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
									<h3 className="mb-2 font-semibold text-lg">{type.label}</h3>
									<p className="mb-4 text-muted-foreground">{type.description}</p>
									<Button
										className="flex items-center gap-2"
										onClick={handleStartNew}
									>
										<Plus className="h-4 w-4" />
										Crear Nuevo {type.label.slice(0, -1)}
									</Button>
								</div>

								<DraftList
									maxItems={5}
									onSelectDraft={handleSelectDraft}
									type={type.id}
								/>
							</TabsContent>
						))}
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
