"use client";

import { useState } from "react";
import { payloadApi } from "@/lib/payload/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { translations } from "@/lib/translations";
import { useLangStore } from "@/utils/store/lang-store";
import { toast } from "sonner";

export function LandForm() {
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const language = useLangStore((prev) => prev.language);
  const t = translations[language].landForm;

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
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const area = parseFloat(formData.get("area") as string);
      const price = parseFloat(formData.get("price") as string);
      const address = formData.get("address") as string || "";
      const city = formData.get("city") as string || "";
      const province = formData.get("province") as string || "";
      
      // Upload images first
      const uploadedImages = [];
      for (const image of images) {
        const imageFormData = new FormData();
        imageFormData.append("file", image);
        const uploadedImage = await payloadApi.media.create(imageFormData);
        uploadedImages.push({
          image: uploadedImage.id,
          alt: `${name} - Immagine`,
          description: `Immagine del terreno ${name}`
        });
      }
      
      // Create land
      const landData = {
        name,
        description,
        area,
        price,
        landType: "residential", // Default value
        topography: "flat", // Default value
        utilities: {
          electricity: false,
          water: false,
          sewage: false,
          internet: false,
          gas: false
        },
        access: {
          roadType: "paved",
          roadWidth: 0,
          publicTransport: false
        },
        location: {
          address,
          city,
          province,
          country: "Dominican Republic"
        },
        images: uploadedImages,
        status: "available",
        featured: false
      };
      
      await payloadApi.lands.create(landData);
      toast.success(t.success);
      
      // Reset form
      e.currentTarget.reset();
      setImages([]);
      
    } catch (error) {
      console.error("Error creating land:", error);
      toast.error("Errore durante la creazione del terreno");
    } finally {
      setIsSubmitting(false);
    }
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
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creazione..." : t.submit}
      </Button>
    </form>
  );
}
