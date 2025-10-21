"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateBlogPost, useUpdateBlogPost } from "@/hooks/use-blog-posts";
import {
  CreateBlogPostInput,
  UpdateBlogPostInput,
  BlogPost,
} from "@/lib/types/blog";

const blogFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title cannot exceed 200 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  excerpt: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  coverImage: z
    .object({
      url: z.string().url(),
      alt: z.string().optional(),
      caption: z.string().optional(),
    })
    .optional(),
});

type BlogFormData = z.infer<typeof blogFormSchema>;

interface BlogFormProps {
  initialData?: BlogPost;
  isEditing?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const categoryOptions = [
  { value: "property-news", label: "Noticias de Propiedades" },
  { value: "market-analysis", label: "Análisis de Mercado" },
  { value: "investment-tips", label: "Consejos de Inversión" },
  { value: "legal-advice", label: "Asesoría Legal" },
  { value: "home-improvement", label: "Mejoras del Hogar" },
  { value: "general", label: "General" },
];

export function BlogForm({
  initialData,
  isEditing = false,
  onCancel,
  onSuccess,
}: BlogFormProps) {
  const [tags, setTags] = useState<string[]>(
    Array.isArray(initialData?.tags) ? initialData.tags : []
  );
  const [tagInput, setTagInput] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialData?.coverImage &&
      typeof initialData.coverImage === "object" &&
      "url" in initialData.coverImage
      ? (initialData.coverImage as any).url || ""
      : ""
  );

  const createMutation = useCreateBlogPost();
  const updateMutation = useUpdateBlogPost();

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      category: initialData?.category || "",
      tags: Array.isArray(initialData?.tags) ? initialData.tags : [],
      coverImage:
        initialData?.coverImage && typeof initialData.coverImage === "object"
          ? (initialData.coverImage as any)
          : undefined,
    },
  });

  const onSubmit = form.handleSubmit(async (data: BlogFormData) => {
    try {
      if (isEditing && initialData?.id) {
        const updateData: UpdateBlogPostInput = {
          id: initialData.id,
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          tags,
          coverImage: coverImageUrl ? { url: coverImageUrl } : null,
        };
        await updateMutation.mutateAsync(updateData);
      } else {
        const createData: CreateBlogPostInput = {
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          tags,
          coverImage: coverImageUrl ? { url: coverImageUrl } : undefined,
          authorId: "current-user", // This should come from auth context
        };
        await createMutation.mutateAsync(createData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error submitting blog form:", error);
    }
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Editar Post del Blog" : "Crear Nuevo Post del Blog"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Título del post del blog"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select
              value={form.watch("category") as string}
              onValueChange={(value) => form.setValue("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-red-600">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Resumen</Label>
            <Textarea
              id="excerpt"
              {...form.register("excerpt")}
              placeholder="Breve descripción del contenido del post..."
              rows={3}
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="coverImage">URL de Imagen de Portada</Label>
            <Input
              id="coverImage"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Agregar etiqueta"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button type="button" onClick={addTag} variant="outline">
                Agregar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido *</Label>
            <Textarea
              id="content"
              {...form.register("content")}
              placeholder="Escribe el contenido completo del post aquí..."
              rows={10}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-600">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Guardando..."
                : isEditing
                ? "Actualizar Post"
                : "Crear Post"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
