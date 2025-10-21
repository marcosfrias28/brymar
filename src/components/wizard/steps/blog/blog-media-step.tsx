"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon } from "lucide-react";

interface BlogMediaData {
  coverImage?: File;
  imageUrl?: string;
}

interface BlogMediaStepProps {
  data: BlogMediaData;
  onChange: (data: BlogMediaData) => void;
  errors?: Record<string, string>;
}

export function BlogMediaStep({ data, onChange, errors }: BlogMediaStepProps) {
  const handleChange = (field: keyof BlogMediaData, value: File | string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Imagen de Portada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverImage">Imagen de Portada</Label>
            <Input
              id="coverImage"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleChange("coverImage", file);
              }}
            />
            <p className="text-sm text-muted-foreground">
              Selecciona una imagen de portada para el artículo
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de Imagen (alternativa)</Label>
            <Input
              id="imageUrl"
              value={data.imageUrl || ""}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <p className="text-sm text-muted-foreground">
              O proporciona una URL de imagen externa
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
