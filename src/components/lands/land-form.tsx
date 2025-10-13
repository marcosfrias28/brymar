"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/properties/image-upload';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import {
  secondaryColorClasses,
  interactiveClasses,
} from '@/lib/utils/secondary-colors';

interface LandFormData {
  name: string;
  type: string;
  price: string;
  surface: string;
  location: string;
  description: string;
  images: File[];
}

interface LandFormProps {
  initialData?: Partial<LandFormData>;
  isEditing?: boolean;
}

export function LandForm({ initialData, isEditing = false }: LandFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<LandFormData>({
    name: initialData?.name || "",
    type: initialData?.type || "",
    price: initialData?.price || "",
    surface: initialData?.surface || "",
    location: initialData?.location || "",
    description: initialData?.description || "",
    images: initialData?.images || [],
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof LandFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagesChange = (images: File[]) => {
    setFormData((prev) => ({ ...prev, images }));
  };

  const calculatePricePerM2 = () => {
    if (formData.price && formData.surface) {
      const price = Number.parseFloat(formData.price);
      const surface = Number.parseFloat(formData.surface);
      if (price > 0 && surface > 0) {
        return Math.round(price / surface);
      }
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validación básica
      if (
        !formData.name ||
        !formData.type ||
        !formData.price ||
        !formData.surface
      ) {
        toast.error("Por favor completa todos los campos obligatorios");
        return;
      }

      // Simular guardado (en una app real sería una llamada a API)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        isEditing
          ? "Terreno actualizado exitosamente"
          : "Terreno creado exitosamente"
      );
      router.push("/dashboard/lands");
    } catch (error) {
      toast.error("Error al guardar el terreno");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            className={cn(
              "border-blackCoral/20 shadow-lg transition-all duration-200",
              secondaryColorClasses.cardHover
            )}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-arsenic text-lg">
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label
                    htmlFor="name"
                    className="text-arsenic text-sm font-medium"
                  >
                    Nombre del Terreno *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ej: Terreno Comercial Bávaro"
                    className={cn("mt-1", interactiveClasses.input)}
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="type"
                    className="text-arsenic text-sm font-medium"
                  >
                    Tipo de Terreno *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger
                      className={cn("mt-1", interactiveClasses.select)}
                    >
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commercial">Comercial</SelectItem>
                      <SelectItem value="residential">Residencial</SelectItem>
                      <SelectItem value="agricultural">Agrícola</SelectItem>
                      <SelectItem value="beachfront">Frente al Mar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="location"
                    className="text-arsenic text-sm font-medium"
                  >
                    Ubicación
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Bávaro, Punta Cana"
                    className={cn("mt-1", interactiveClasses.input)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <Label
                    htmlFor="price"
                    className="text-arsenic text-sm font-medium"
                  >
                    Precio (USD) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="180000"
                    className={cn("mt-1", interactiveClasses.input)}
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="surface"
                    className="text-arsenic text-sm font-medium"
                  >
                    Superficie (m²) *
                  </Label>
                  <Input
                    id="surface"
                    type="number"
                    value={formData.surface}
                    onChange={(e) =>
                      handleInputChange("surface", e.target.value)
                    }
                    placeholder="2500"
                    className={cn("mt-1", interactiveClasses.input)}
                    required
                  />
                </div>

                <div>
                  <Label className="text-arsenic text-sm font-medium">
                    Precio por m²
                  </Label>
                  <div
                    className={cn(
                      "h-10 px-3 py-2 mt-1 border rounded-md bg-muted flex items-center text-blackCoral text-sm",
                      secondaryColorClasses.accent
                    )}
                  >
                    ${calculatePricePerM2().toLocaleString()}
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "grid grid-cols-2 gap-3 pt-2 border-t",
                  secondaryColorClasses.accent
                )}
              >
                <div>
                  <Label className="text-arsenic text-xs font-medium">
                    Hectáreas
                  </Label>
                  <div className="text-sm text-blackCoral">
                    {formData.surface
                      ? (Number.parseFloat(formData.surface) / 10000).toFixed(4)
                      : "0"}{" "}
                    ha
                  </div>
                </div>
                <div>
                  <Label className="text-arsenic text-xs font-medium">
                    Tareas
                  </Label>
                  <div className="text-sm text-blackCoral">
                    {formData.surface
                      ? (Number.parseFloat(formData.surface) / 629).toFixed(2)
                      : "0"}{" "}
                    tareas
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border-blackCoral/20 shadow-lg transition-all duration-200",
              secondaryColorClasses.cardHover
            )}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-arsenic text-lg">
                Descripción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={formData.description}
                onChange={(content) =>
                  handleInputChange("description", content)
                }
                placeholder="Describe las características principales del terreno..."
                className={cn("min-h-[200px]", interactiveClasses.textarea)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Images & Actions */}
        <div className="space-y-6">
          <Card
            className={cn(
              "border-blackCoral/20 shadow-lg transition-all duration-200",
              secondaryColorClasses.cardHover
            )}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-arsenic text-lg">Imágenes</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                images={formData.images}
                onImagesChange={handleImagesChange}
                maxImages={10}
              />
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border-blackCoral/20 shadow-lg transition-all duration-200",
              secondaryColorClasses.cardHover
            )}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-arsenic text-lg">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full bg-arsenic hover:bg-blackCoral text-white",
                  secondaryColorClasses.focusRing
                )}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className={cn(
                  "w-full border-blackCoral text-blackCoral hover:bg-blackCoral hover:text-white",
                  secondaryColorClasses.focusRing
                )}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
