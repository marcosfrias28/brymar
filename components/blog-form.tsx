"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";

export function BlogForm() {
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;
      const author = formData.get("author") as string;
      
      // TODO: Implement blog post creation logic
      console.log('Blog post data:', { title, content, author, image });
      toast.success("Post creado exitosamente");
      
      // Reset form
      e.currentTarget.reset();
      setImage(null);
      
    } catch (error) {
      console.error("Error creating blog post:", error);
      toast.error("Errore durante la creazione del post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título del Post</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="content">Contenido</Label>
        <Textarea id="content" name="content" required />
      </div>
      <div>
        <Label htmlFor="author">Autor</Label>
        <Input id="author" name="author" required />
      </div>
      <div>
        <Label htmlFor="image">Imagen de Portada</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Publicando..." : "Publicar"}
      </Button>
    </form>
  );
}
