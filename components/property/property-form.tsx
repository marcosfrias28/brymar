"use client";

import { addProperty } from "@/lib/actions/property-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { translations } from "@/lib/translations";
import { useActionState, useState } from "react";
import { useLangStore } from "@/utils/store/lang-store";
import { ActionState } from "@/lib/validations";

export function PropertyForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    addProperty,
    { error: "" }
  );

  const [type, setType] = useState("rent");
  const [images, setImages] = useState<File[]>([]);

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
    const formData = new FormData(e.currentTarget);
    formData.append("type", type);
    images.forEach((img, index) => {
      formData.append(`image${index}`, img);
    });
    formAction(formData);
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
      <Button type="submit">{submit}</Button>
      {state?.success ? (
        <p className="text-sm text-green-500">{success}</p>
      ) : (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
    </form>
  );
}
