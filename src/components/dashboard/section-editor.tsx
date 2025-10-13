"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Save, Loader2 } from "lucide-react";
import {
  createPageSection,
  updatePageSection,
} from '@/lib/actions/sections-actions';
import { useSectionMutations } from '@/hooks/mutations/use-sections-mutations';
import type { PageSection } from '@/lib/db/schema';
import { toast } from "sonner";

interface SectionEditorProps {
  section: PageSection | null;
  page: string;
  onClose: () => void;
}

const sectionTypes = {
  home: [
    { value: "hero", label: "Hero Section" },
    { value: "categories", label: "Categorías" },
    { value: "featured-properties", label: "Propiedades Destacadas" },
    { value: "team", label: "Equipo" },
    { value: "faq", label: "FAQ" },
  ],
  contact: [
    { value: "contact-form", label: "Formulario de Contacto" },
    { value: "contact-info", label: "Información de Contacto" },
  ],
};

export function SectionEditor({ section, page, onClose }: SectionEditorProps) {
  const [formData, setFormData] = useState({
    page: page,
    section: section?.section || "",
    title: section?.title || "",
    subtitle: section?.subtitle || "",
    description: section?.description || "",
    content: section?.content ? JSON.stringify(section.content) : "",
    images: section?.images ? (section.images as string[]).join(", ") : "",
    settings: section?.settings ? JSON.stringify(section.settings) : "",
    isActive: section?.isActive ?? true,
    order: section?.order || 0,
  });

  const { createSection, updateSection, isLoading } = useSectionMutations();
  const isEditing = !!section;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const mutationData = {
        page,
        section: formData.section,
        title: formData.title || undefined,
        subtitle: formData.subtitle || undefined,
        description: formData.description || undefined,
        content:
          formData.content && formData.content.trim()
            ? (() => {
                try {
                  return JSON.parse(formData.content);
                } catch (e) {
                  console.error("Error parsing content JSON:", e);
                  return {};
                }
              })()
            : {},
        images:
          formData.images && formData.images.trim()
            ? formData.images
                .split(",")
                .map((img) => img.trim())
                .filter((img) => img)
            : [],
        settings:
          formData.settings && formData.settings.trim()
            ? (() => {
                try {
                  return JSON.parse(formData.settings);
                } catch (e) {
                  console.error("Error parsing settings JSON:", e);
                  return {};
                }
              })()
            : {},
        isActive: formData.isActive,
        order: formData.order,
      };

      console.log("Mutation data:", mutationData);

      if (isEditing) {
        await updateSection.mutateAsync({
          id: section.id,
          ...mutationData,
        });
      } else {
        await createSection.mutateAsync(mutationData);
      }

      onClose();
    } catch (error) {
      // Error handling is done by the mutation hooks
      console.error("Error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isEditing ? "Editar Sección" : "Nueva Sección"}
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? `Editando la sección "${section.section}" de la página ${page}`
                  : `Creando nueva sección para la página ${page}`}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="section">Tipo de Sección</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) =>
                    setFormData({ ...formData, section: value })
                  }
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionTypes[page as keyof typeof sectionTypes]?.map(
                      (type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Título de la sección"
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="Subtítulo de la sección"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descripción de la sección"
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Sección Activa</Label>
                  <p className="text-sm text-muted-foreground">
                    Controla si esta sección se muestra en el sitio web
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>

              <div>
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Orden de la sección (0 = primero)"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isEditing ? "Actualizar" : "Crear"} Sección
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
