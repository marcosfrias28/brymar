"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon } from "lucide-react";

interface LandMediaData {
  images?: File[];
}

interface LandMediaStepProps {
  data: LandMediaData;
  onChange: (data: LandMediaData) => void;
  errors?: Record<string, string>;
}

export function LandMediaStep({ data, onChange, errors }: LandMediaStepProps) {
  const handleChange = (field: keyof LandMediaData, value: File[]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Imágenes del Terreno
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="images">Imágenes</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                handleChange("images", files);
              }}
            />
            <p className="text-sm text-muted-foreground">
              Selecciona múltiples imágenes del terreno
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
