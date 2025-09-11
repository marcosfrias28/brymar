"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { translations } from "@/lib/translations";
import { useState, useEffect } from "react";
import { useLangStore } from "@/utils/store/lang-store";
import { useProperties } from "@/hooks/use-properties";

export function PropertyForm() {
  const [type, setType] = useState("rent");
  const language = useLangStore((prev) => prev.language);
  const { createProperty, createState, isCreating } = useProperties();
  const {
    propertyTitle,
    description,
    price,
    forRent,
    forSale,
    images: imagesText,
    selectedImages,
    submit,
    success,
  } = translations[language].propertyForm;

  useEffect(() => {
    if (createState.success) {
      // Reset form when property is created successfully
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.reset();
      setType('rent');
    }
  }, [createState]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle image selection if needed
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('type', type);
    createProperty(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">{propertyTitle}</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="description">{description}</Label>
        <Textarea id="description" name="description" required />
      </div>
      <div>
        <Label htmlFor="price">{price}</Label>
        <Input id="price" name="price" type="number" required />
      </div>
      <div>
        <Label>{type}</Label>
        <RadioGroup value={type} onValueChange={setType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rent" id="rent" />
            <Label htmlFor="rent">{forRent}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sale" id="sale" />
            <Label htmlFor="sale">{forSale}</Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="images">{imagesText}</Label>
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        <p className="text-sm text-gray-500 mt-1">
          {selectedImages}: 0
        </p>
      </div>
      <div>
        <Label htmlFor="bedrooms">Camere da letto</Label>
        <Input id="bedrooms" name="bedrooms" type="number" min="0" />
      </div>
      <div>
        <Label htmlFor="bathrooms">Bagni</Label>
        <Input id="bathrooms" name="bathrooms" type="number" min="0" />
      </div>
      <div>
        <Label htmlFor="area">Area (m²)</Label>
        <Input id="area" name="area" type="number" min="0" />
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
        {isCreating ? "Creando..." : submit}
      </Button>
    </form>
  );
}
