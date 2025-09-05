"use client";

import { payloadApi } from "@/lib/payload/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { translations } from "@/lib/translations";
import { useState } from "react";
import { useLangStore } from "@/utils/store/lang-store";
import { toast } from "sonner";

export function PropertyForm() {
  const [type, setType] = useState("rent");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const language = useLangStore((prev) => prev.language);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setImages((prev) => [...prev, ...fileList].slice(0, 10));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const price = parseFloat(formData.get("price") as string);
      const bedrooms = parseInt(formData.get("bedrooms") as string) || 0;
      const bathrooms = parseInt(formData.get("bathrooms") as string) || 0;
      const area = parseFloat(formData.get("area") as string) || 0;
      const address = formData.get("address") as string || "";
      const city = formData.get("city") as string || "";
      const province = formData.get("province") as string || "";
      
      // Upload images first
      const uploadedImages = [];
      for (const image of images) {
        const imageFormData = new FormData();
        imageFormData.append("file", image);
        const uploadedImage = await payloadApi.media.create(imageFormData);
        uploadedImages.push(uploadedImage.id);
      }
      
      // Create property
      const propertyData = {
        title,
        description,
        price,
        type,
        propertyType: "villa", // Default value
        bedrooms,
        bathrooms,
        area,
        address,
        city,
        province,
        country: "Dominican Republic",
        images: uploadedImages,
        status: "available",
        featured: false
      };
      
      await payloadApi.properties.create(propertyData);
      toast.success(success);
      
      // Reset form
      e.currentTarget.reset();
      setImages([]);
      setType("rent");
      
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error("Errore durante la creazione della proprietà");
    } finally {
      setIsSubmitting(false);
    }
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
          {selectedImages}: {images.length}
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
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creazione..." : submit}
      </Button>
    </form>
  );
}
