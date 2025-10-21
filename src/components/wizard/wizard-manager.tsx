"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Home, MapPin, PenTool, Wand2 } from "lucide-react";
import { PropertyWizard } from "./property-wizard";
import { LandWizard } from "./land-wizard";
import { BlogWizard } from "./blog-wizard";
import { DraftList } from "./draft-list";
import { useWizardDraft, useGenerateAIContent } from "@/hooks/use-wizard";
import { WizardType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";

interface WizardManagerProps {
  defaultType?: WizardType;
  onComplete?: () => void;
}

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
    if (!selectedDraft) return;

    generateAI.mutate({
      wizardType: selectedDraft.type,
      contentType,
      baseData: selectedDraft.data,
      language: "es",
    });
  };

  if (showWizard) {
    const wizardProps = {
      draftId: selectedDraftId || undefined,
      initialData: selectedDraft?.data,
      onComplete: handleWizardComplete,
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowWizard(false)}>
            ← Volver a la lista
          </Button>

          {selectedDraft && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateAI("title")}
                disabled={generateAI.isPending}
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Generar Título
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateAI("description")}
                disabled={generateAI.isPending}
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Generar Descripción
              </Button>
            </div>
          )}
        </div>

        {activeTab === "property" && <PropertyWizard {...wizardProps} />}
        {activeTab === "land" && <LandWizard {...wizardProps} />}
        {activeTab === "blog" && <BlogWizard {...wizardProps} />}
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
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as WizardType)}
          >
            <TabsList className="grid w-full grid-cols-3">
              {wizardTypes.map((type) => (
                <TabsTrigger
                  key={type.id}
                  value={type.id}
                  className="flex items-center gap-2"
                >
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {wizardTypes.map((type) => (
              <TabsContent key={type.id} value={type.id} className="space-y-4">
                <div className="text-center py-6">
                  <type.icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{type.label}</h3>
                  <p className="text-muted-foreground mb-4">
                    {type.description}
                  </p>
                  <Button
                    onClick={handleStartNew}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Crear Nuevo {type.label.slice(0, -1)}
                  </Button>
                </div>

                <DraftList
                  type={type.id}
                  onSelectDraft={handleSelectDraft}
                  maxItems={5}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
