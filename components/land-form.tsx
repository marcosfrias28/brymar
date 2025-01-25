"use client";

import { useState, useContext } from "react";
import { useFormState } from "react-dom";
import { addLand } from "@/lib/actions/land-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { translations } from "@/lib/translations";
import { useLangStore } from "@/utils/store/lang-store";

export function LandForm() {
  const [state, formAction] = useFormState(addLand, null);
  const [images, setImages] = useState<File[]>([]);
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
    const formData = new FormData(e.currentTarget);
    images.forEach((img, index) => {
      formData.append(`image${index}`, img);
    });
    formAction(formData);
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
      <Button type="submit">{t.submit}</Button>
      {state && <p className="text-green-600">{t.success}</p>}
    </form>
  );
}
