"use client";

import React from "react";
import { WizardStepProps } from "@/types/wizard-core";
import { LandWizardData } from "@/types/land-wizard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Ruler, Tag, TreePine } from "lucide-react";
import {
  WizardStepLayout,
  WizardFormSection,
  WizardFormField,
  WizardSelectionGrid,
} from "@/components/wizard/shared";

const LAND_TYPES = [
  { value: "residential", label: "Residencial" },
  { value: "commercial", label: "Comercial" },
  { value: "agricultural", label: "Agrícola" },
  { value: "beachfront", label: "Frente al Mar" },
];

const LAND_CHARACTERISTICS = [
  { id: "water", label: "Acceso a agua", name: "Acceso a agua", category: "utilities" },
  { id: "electricity", label: "Electricidad", name: "Electricidad", category: "utilities" },
  { id: "road-access", label: "Acceso por carretera", name: "Acceso por carretera", category: "access" },
  { id: "flat-terrain", label: "Terreno plano", name: "Terreno plano", category: "features" },
  { id: "mountain-view", label: "Vista a montañas", name: "Vista a montañas", category: "features" },
  { id: "ocean-view", label: "Vista al mar", name: "Vista al mar", category: "features" },
  { id: "river-access", label: "Acceso a río", name: "Acceso a río", category: "features" },
  { id: "forest", label: "Área boscosa", name: "Área boscosa", category: "features" },
];

export function LandGeneralStep({
  data,
  onUpdate,
  onNext,
  errors,
  isLoading,
}: WizardStepProps<LandWizardData>) {
  const handleInputChange = (field: keyof LandWizardData, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleCharacteristicsChange = (selectedIds: string[]) => {
    const selectedCharacteristics = selectedIds.map(id => {
      const characteristic = LAND_CHARACTERISTICS.find(c => c.id === id);
      return {
        id,
        name: characteristic?.name || "",
        category: characteristic?.category as "utilities" | "access" | "features",
        selected: true,
      };
    });
    onUpdate({ characteristics: selectedCharacteristics });
  };

  const selectedCharacteristicIds = data.characteristics?.map(c => c.id) || [];

  return (
    <WizardStepLayout
      title="Información General"
      description="Proporciona los detalles básicos del terreno"
      icon={<TreePine className="h-5 w-5" />}
    >
      <WizardFormSection title="Información Básica" variant="default">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WizardFormField
            label="Nombre del Terreno"
            required
            error={errors.name}
          >
            <Input
              value={data.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ej: Terreno en Punta Cana"
            />
          </WizardFormField>

          <WizardFormField
            label="Tipo de Terreno"
            required
            error={errors.landType}
          >
            <Select
              value={data.landType || ""}
              onValueChange={(value) => handleInputChange("landType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {LAND_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </WizardFormField>
        </div>

        <WizardFormField
          label="Descripción"
          description="Describe las características principales del terreno"
          required
          error={errors.description}
        >
          <Textarea
            value={data.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe las características principales del terreno..."
            rows={4}
          />
        </WizardFormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WizardFormField
            label="Precio (USD)"
            required
            error={errors.price}
          >
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                value={data.price || ""}
                onChange={(e) =>
                  handleInputChange("price", parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                min="0"
                className="pl-10"
              />
            </div>
          </WizardFormField>

          <WizardFormField
            label="Superficie (m²)"
            required
            error={errors.surface}
          >
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                value={data.surface || ""}
                onChange={(e) =>
                  handleInputChange("surface", parseFloat(e.target.value) || 0)
                }
                placeholder="0"
                min="0"
                className="pl-10"
              />
            </div>
          </WizardFormField>
        </div>
      </WizardFormSection>

      <WizardFormSection 
        title="Características del Terreno"
        description="Selecciona las características que aplican a este terreno"
        variant="compact"
      >
        <WizardSelectionGrid
          options={LAND_CHARACTERISTICS}
          selectedValues={selectedCharacteristicIds}
          onSelectionChange={handleCharacteristicsChange}
          multiSelect
          columns={3}
          showCategories
          variant="compact"
        />
        {errors.characteristics && (
          <p className="text-sm text-destructive">{errors.characteristics}</p>
        )}
      </WizardFormSection>

      {data.characteristics && data.characteristics.length > 0 && (
        <WizardFormSection title="Características Seleccionadas" variant="compact">
          <div className="flex flex-wrap gap-2">
            {data.characteristics.map((characteristic) => (
              <Badge
                key={characteristic.id}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={() => {
                  const newIds = selectedCharacteristicIds.filter(id => id !== characteristic.id);
                  handleCharacteristicsChange(newIds);
                }}
              >
                {characteristic.name}
                <span className="ml-1">×</span>
              </Badge>
            ))}
          </div>
        </WizardFormSection>
      )}
    </WizardStepLayout>
  );
}
