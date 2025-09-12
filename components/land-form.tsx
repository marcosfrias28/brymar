"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { addLand } from "@/lib/actions/land-actions";

export function LandForm() {
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Add required fields for the schema
      formData.append('location', `${address}, ${city}, ${province}`);
      formData.append('type', 'residential');
      
      await addLand({}, formData);
      toast.success("Terreno creado exitosamente");
      // Reset form
      e.currentTarget.reset();
      setImages([]);
    } catch (error) {
      console.error("Error creating land:", error);
      toast.error("Error al crear el terreno");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Nombre del Terreno</Label>
        <Input id="name" name="name" required />
      </div>
      
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" required />
      </div>
      
      <div>
        <Label htmlFor="area">Área (m²)</Label>
        <Input id="area" name="area" type="number" step="0.01" required />
      </div>
      
      <div>
        <Label htmlFor="price">Precio (USD)</Label>
        <Input id="price" name="price" type="number" step="0.01" required />
      </div>
      
      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" name="address" />
      </div>
      
      <div>
        <Label htmlFor="city">Ciudad</Label>
        <Input id="city" name="city" />
      </div>
      
      <div>
        <Label htmlFor="province">Provincia</Label>
        <Input id="province" name="province" />
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creando..." : "Crear Terreno"}
      </Button>
    </form>
  );
}
