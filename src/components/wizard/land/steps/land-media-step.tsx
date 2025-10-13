"use client";

import React from "react";
import { WizardStepProps } from '@/types/wizard-core';
import { LandWizardData } from '@/types/land-wizard';
import { ImageUploadStep } from '@/components/wizard/shared/image-upload-step';
import { WizardStepLayout, WizardFormSection } from '@/components/wizard/shared/consistent-navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Plane, FileText } from "lucide-react";
import { Badge } from '@/components/ui/badge';

export function LandMediaStep({
  data,
  onUpdate,
  onNext,
  errors,
  isLoading,
}: WizardStepProps<LandWizardData>) {
  const handleImagesChange = (images: any[]) => {
    onUpdate({ images });
  };

  const handleAerialImagesChange = (aerialImages: any[]) => {
    onUpdate({ aerialImages });
  };

  const handleDocumentImagesChange = (documentImages: any[]) => {
    onUpdate({ documentImages });
  };

  const totalImages = (data.images?.length || 0) + 
                     (data.aerialImages?.length || 0) + 
                     (data.documentImages?.length || 0);

  return (
    <WizardStepLayout
      title="Imágenes del Terreno"
      description="Sube fotos que muestren las características principales del terreno"
    >
      <div className="space-y-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Fotos Generales
              {data.images?.length && (
                <Badge variant="secondary" className="ml-1">
                  {data.images.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="aerial" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Fotos Aéreas
              {data.aerialImages?.length && (
                <Badge variant="secondary" className="ml-1">
                  {data.aerialImages.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos
              {data.documentImages?.length && (
                <Badge variant="secondary" className="ml-1">
                  {data.documentImages.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-0">
            <WizardFormSection
              title="Fotos Generales del Terreno"
              description="Sube fotos que muestren el terreno desde diferentes ángulos"
              icon={<Camera className="h-5 w-5" />}
            >
              <ImageUploadStep
                images={data.images || []}
                onImagesChange={handleImagesChange}
                maxImages={15}
                title=""
                description=""
                showCaptions={true}
                showAltText={false}
                errors={errors}
              />
            </WizardFormSection>
          </TabsContent>

          <TabsContent value="aerial" className="mt-0">
            <WizardFormSection
              title="Fotos Aéreas"
              description="Fotos tomadas desde drones o aviones que muestren la vista aérea del terreno"
              icon={<Plane className="h-5 w-5" />}
              optional
            >
              <ImageUploadStep
                images={data.aerialImages || []}
                onImagesChange={handleAerialImagesChange}
                maxImages={10}
                title=""
                description="Las fotos aéreas ayudan a mostrar la ubicación y el contexto del terreno"
                showCaptions={true}
                showAltText={false}
              />
            </WizardFormSection>
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <WizardFormSection
              title="Documentos"
              description="Fotos de documentos relevantes como planos, títulos de propiedad, permisos, etc."
              icon={<FileText className="h-5 w-5" />}
              optional
            >
              <ImageUploadStep
                images={data.documentImages || []}
                onImagesChange={handleDocumentImagesChange}
                maxImages={5}
                title=""
                description="Sube fotos de documentos importantes relacionados con el terreno"
                showCaptions={true}
                showAltText={false}
              />
            </WizardFormSection>
          </TabsContent>
        </Tabs>

        {/* Summary */}
        {totalImages > 0 && (
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Resumen de Imágenes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Camera className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{data.images?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Fotos Generales</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Plane className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{data.aerialImages?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Fotos Aéreas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{data.documentImages?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Documentos</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WizardStepLayout>
  );
}
