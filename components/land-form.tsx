"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { translations } from "@/lib/translations";
import { useLangStore } from "@/utils/store/lang-store";
import { useLands } from "@/hooks/use-lands";

export function LandForm() {
  const language = useLangStore((prev) => prev.language);
  const t = translations[language].landForm;
  const { createLand, createState, isCreating } = useLands();
  const [images, setImages] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };

  useEffect(() => {
    if (createState.success) {
      // Reset form or redirect as needed
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.reset();
    }
  }, [createState]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createLand(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">{t.landName}</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="description">{t.description}</Label>
        <Textarea id="description" name="description" required />
      </div>
      <div>
        <Label htmlFor="area">{t.area}</Label>
        <Input id="area" name="area" type="number" required />
      </div>
      <div>
        <Label htmlFor="price">{t.price}</Label>
        <Input id="price" name="price" type="number" required />
      </div>
      <div>
        <Label htmlFor="images">{t.images}</Label>
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        <p className="text-sm text-gray-500 mt-1">
          {t.selectedImages}: {images.length}
        </p>
      </div>
      <div>
        <Label htmlFor="address">Indirizzo</Label>
        <Input id="address" name="address" />
      </div>
      <div>
        <Label htmlFor="city">Città</Label>
        <Input id="city" name="city" />
      </div>
      <div>
        <Label htmlFor="province">Provincia</Label>
        <Input id="province" name="province" />
      </div>
      <Button type="submit" disabled={isCreating}>
        {isCreating ? "Creando..." : t.submit}
      </Button>
    </form>
  );
}
