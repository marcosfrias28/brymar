"use client";

import { useState } from "react";
import { PropertyTemplate, PropertyFormData } from "@/types/template";
import { TemplateService } from "@/lib/services/template-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Building, MapPin, Crown, Plus } from "lucide-react";

interface TemplateSelectorProps {
  onSelectTemplate: (data: PropertyFormData) => void;
  onSkip: () => void;
}

const categoryIcons = {
  residential: Home,
  commercial: Building,
  land: MapPin,
  luxury: Crown,
};

const categoryLabels = {
  residential: "Residencial",
  commercial: "Comercial",
  land: "Terrenos",
  luxury: "Lujo",
};

export function TemplateSelector({
  onSelectTemplate,
  onSkip,
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<PropertyTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const templates = TemplateService.getTemplates();
  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const handleSelectTemplate = (template: PropertyTemplate) => {
    const formData = TemplateService.applyTemplate(template);
    onSelectTemplate(formData);
  };

  const handlePreviewTemplate = (template: PropertyTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Elige una Plantilla</h2>
        <p className="text-muted-foreground">
          Acelera la creación de tu propiedad usando una plantilla predefinida
        </p>
      </div>

      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <TabsTrigger
                key={category}
                value={category}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {categoryLabels[category]}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {TemplateService.getTemplatesByCategory(category).map(
                (template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {template.name}
                        </CardTitle>
                        <Badge variant="secondary">
                          {categoryLabels[template.category]}
                        </Badge>
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {(template.characteristics || [])
                            .slice(0, 3)
                            .map((char) => (
                              <Badge
                                key={char}
                                variant="outline"
                                className="text-xs"
                              >
                                {char.replace("_", " ")}
                              </Badge>
                            ))}
                          {(template.characteristics || []).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(template.characteristics || []).length - 3} más
                            </Badge>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSelectTemplate(template)}
                            className="flex-1"
                          >
                            Usar Plantilla
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handlePreviewTemplate(template)}
                          >
                            Vista Previa
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onSkip}>
          <Plus className="h-4 w-4 mr-2" />
          Crear desde Cero
        </Button>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vista Previa: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Revisa los datos predefinidos de esta plantilla
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Información Básica</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Título:</span>
                    <p>{selectedTemplate.defaultData.title}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <p className="capitalize">
                      {selectedTemplate.propertyType}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Superficie:</span>
                    <p>{selectedTemplate.defaultData.surface} m²</p>
                  </div>
                  {selectedTemplate.defaultData.bedrooms && (
                    <div>
                      <span className="text-muted-foreground">
                        Habitaciones:
                      </span>
                      <p>{selectedTemplate.defaultData.bedrooms}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Descripción</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.defaultData.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">
                  Características Incluidas
                </h4>
                <div className="flex flex-wrap gap-1">
                  {(selectedTemplate.characteristics || []).map((char) => (
                    <Badge key={char} variant="outline" className="text-xs">
                      {char.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    handleSelectTemplate(selectedTemplate);
                    setShowPreview(false);
                  }}
                >
                  Usar Esta Plantilla
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
