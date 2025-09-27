"use client";

import { useState } from "react";
import { PropertyFormData } from "@/types/template";
import { PropertyType } from "@/types/wizard";
import { PropertyWizard } from "./property-wizard";
import { TemplateSelector } from "./template-selector";
import { BulkImport } from "./bulk-import";
import { PropertyComparison } from "./property-comparison";
import { SocialMediaPreview } from "./social-media-preview";
import { SEOOptimizer } from "./seo-optimizer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wand2,
  Upload,
  BarChart3,
  Share2,
  Search,
  Plus,
  FileText,
  Sparkles,
} from "lucide-react";

interface EnhancedPropertyWizardProps {
  onComplete: (data: PropertyFormData) => Promise<void>;
  onSaveDraft: (data: Partial<PropertyFormData>) => Promise<string>;
  initialData?: Partial<PropertyFormData>;
  draftId?: string;
}

type WizardMode =
  | "select"
  | "template"
  | "bulk"
  | "wizard"
  | "comparison"
  | "social"
  | "seo";

export function EnhancedPropertyWizard({
  onComplete,
  onSaveDraft,
  initialData,
  draftId,
}: EnhancedPropertyWizardProps) {
  const [mode, setMode] = useState<WizardMode>("select");
  const [currentProperty, setCurrentProperty] =
    useState<PropertyFormData | null>(null);
  const [wizardData, setWizardData] = useState<Partial<PropertyFormData>>(
    initialData || {}
  );

  const handleModeSelect = (selectedMode: WizardMode) => {
    setMode(selectedMode);
  };

  const handleTemplateSelect = (data: PropertyFormData) => {
    setWizardData(data);
    setMode("wizard");
  };

  const handleBulkImportComplete = (properties: PropertyFormData[]) => {
    // In a real implementation, this would handle multiple properties
    // For now, we'll just take the first one and continue with the wizard
    if (properties.length > 0) {
      setWizardData(properties[0]);
      setMode("wizard");
    }
  };

  const handleWizardUpdate = (data: Partial<PropertyFormData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));
    if (data.title && data.description && data.price && data.surface) {
      setCurrentProperty(data as PropertyFormData);
    }
  };

  const handleShowComparison = () => {
    if (currentProperty) {
      setMode("comparison");
    }
  };

  const handleShowSocial = () => {
    if (currentProperty) {
      setMode("social");
    }
  };

  const handleShowSEO = () => {
    if (currentProperty) {
      setMode("seo");
    }
  };

  const handleSEOApply = (updates: Partial<PropertyFormData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
    setCurrentProperty((prev) => (prev ? { ...prev, ...updates } : null));
  };

  if (mode === "template") {
    return (
      <TemplateSelector
        onSelectTemplate={handleTemplateSelect}
        onSkip={() => setMode("wizard")}
      />
    );
  }

  if (mode === "bulk") {
    return (
      <BulkImport
        onImportComplete={handleBulkImportComplete}
        onCancel={() => setMode("select")}
      />
    );
  }

  if (mode === "wizard") {
    return (
      <div className="relative">
        <PropertyWizard
          initialData={
            wizardData
              ? {
                  title: wizardData.title,
                  description: wizardData.description,
                  price: wizardData.price,
                  surface: wizardData.surface,
                  propertyType: wizardData.propertyType as PropertyType,
                  bedrooms: wizardData.bedrooms,
                  bathrooms: wizardData.bathrooms,
                  characteristics: wizardData.characteristics?.map((char) => ({
                    id: char,
                    name: char,
                    category: "amenity" as const,
                    selected: true,
                  })),
                  coordinates: wizardData.coordinates,
                  address: wizardData.address
                    ? {
                        ...wizardData.address,
                        formattedAddress: `${wizardData.address.street}, ${wizardData.address.city}, ${wizardData.address.province}`,
                      }
                    : undefined,
                }
              : undefined
          }
          draftId={draftId}
          onComplete={async (data) => {
            const templateData: PropertyFormData = {
              title: data.title || "",
              description: data.description || "",
              price: data.price || 0,
              surface: data.surface || 0,
              propertyType: data.propertyType as string,
              bedrooms: data.bedrooms,
              bathrooms: data.bathrooms,
              characteristics:
                data.characteristics?.map((char) => char.name) || [],
              coordinates: data.coordinates,
              address: data.address
                ? {
                    street: data.address.street,
                    city: data.address.city,
                    province: data.address.province,
                    country: data.address.country,
                  }
                : undefined,
              images: data.images || [],
              status: "published" as const,
              language: "es" as const,
            };
            await onComplete(templateData);
          }}
          onSaveDraft={async (data) => {
            const templateData: PropertyFormData = {
              title: data.title || "",
              description: data.description || "",
              price: data.price || 0,
              surface: data.surface || 0,
              propertyType: data.propertyType as string,
              bedrooms: data.bedrooms,
              bathrooms: data.bathrooms,
              characteristics:
                data.characteristics?.map((char) => char.name) || [],
              coordinates: data.coordinates,
              address: data.address
                ? {
                    street: data.address.street,
                    city: data.address.city,
                    province: data.address.province,
                    country: data.address.country,
                  }
                : undefined,
              images: data.images || [],
              status: "draft" as const,
              language: "es" as const,
            };
            return await onSaveDraft(templateData);
          }}
          onUpdate={(data) => {
            const templateData: Partial<PropertyFormData> = {
              ...data,
              propertyType: data.propertyType as string,
              characteristics:
                data.characteristics?.map((char) => char.name) || [],
            };
            handleWizardUpdate(templateData);
          }}
        />

        {/* Enhanced Features Toolbar */}
        {currentProperty && (
          <div className="fixed bottom-6 right-6 z-40">
            <Card className="shadow-lg">
              <CardContent className="p-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShowComparison}
                    className="flex items-center gap-1"
                  >
                    <BarChart3 className="h-3 w-3" />
                    Comparar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShowSocial}
                    className="flex items-center gap-1"
                  >
                    <Share2 className="h-3 w-3" />
                    Social
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShowSEO}
                    className="flex items-center gap-1"
                  >
                    <Search className="h-3 w-3" />
                    SEO
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  if (mode === "comparison" && currentProperty) {
    return (
      <PropertyComparison
        currentProperty={currentProperty}
        onClose={() => setMode("wizard")}
      />
    );
  }

  if (mode === "social" && currentProperty) {
    return (
      <SocialMediaPreview
        property={currentProperty}
        onClose={() => setMode("wizard")}
      />
    );
  }

  if (mode === "seo" && currentProperty) {
    return (
      <SEOOptimizer
        property={currentProperty}
        onApplySuggestions={handleSEOApply}
        onClose={() => setMode("wizard")}
      />
    );
  }

  // Mode selection screen
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Crear Nueva Propiedad</h1>
        <p className="text-muted-foreground text-lg">
          Elige cómo quieres crear tu listado de propiedad
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Template-based Creation */}
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Wand2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Usar Plantilla</CardTitle>
            <CardDescription>
              Acelera la creación usando plantillas predefinidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1 justify-center">
                <Badge variant="secondary">Rápido</Badge>
                <Badge variant="secondary">Optimizado</Badge>
                <Badge variant="secondary">Profesional</Badge>
              </div>
              <Button
                onClick={() => handleModeSelect("template")}
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Elegir Plantilla
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Creation */}
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-500/10 rounded-full w-fit">
              <Plus className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Crear desde Cero</CardTitle>
            <CardDescription>
              Control total sobre cada detalle de tu propiedad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1 justify-center">
                <Badge variant="secondary">Personalizado</Badge>
                <Badge variant="secondary">Flexible</Badge>
                <Badge variant="secondary">Detallado</Badge>
              </div>
              <Button
                onClick={() => handleModeSelect("wizard")}
                className="w-full"
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                Empezar Wizard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Import */}
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-500/10 rounded-full w-fit">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Importación Masiva</CardTitle>
            <CardDescription>
              Importa múltiples propiedades desde CSV o Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1 justify-center">
                <Badge variant="secondary">Masivo</Badge>
                <Badge variant="secondary">Eficiente</Badge>
                <Badge variant="secondary">CSV/Excel</Badge>
              </div>
              <Button
                onClick={() => handleModeSelect("bulk")}
                className="w-full"
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Archivo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Preview */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">
          Características Avanzadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Análisis Comparativo</h3>
              <p className="text-sm text-muted-foreground">
                Compara tu propiedad con el mercado local
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <Share2 className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Vista Previa Social</h3>
              <p className="text-sm text-muted-foreground">
                Genera contenido para redes sociales
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <Search className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Optimización SEO</h3>
              <p className="text-sm text-muted-foreground">
                Mejora la visibilidad en buscadores
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
