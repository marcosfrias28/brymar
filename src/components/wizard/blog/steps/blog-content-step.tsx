"use client";

import React, { useState, useCallback } from "react";
import { WizardStepProps } from '@/types/wizard-core';
import { BlogWizardData, categoryLabels } from '@/types/blog-wizard';
import { WizardStepLayout, WizardFormSection } from '@/components/wizard/shared/consistent-navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Eye, EyeOff, FileText } from "lucide-react";
import { toast } from "sonner";
import { generateBlogContent } from '@/lib/actions/blog-wizard-actions';

export function BlogContentStep({
  data,
  onUpdate,
  onNext,
  errors,
  isLoading,
}: WizardStepProps<BlogWizardData>) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);

  const title = data.title || "";
  const content = data.content || "";
  const author = data.author || "";
  const category = data.category || "property-news";
  const excerpt = data.excerpt || "";
  const description = data.description || "";

  // Calculate word count and reading time
  React.useEffect(() => {
    const words = content.split(/\s+/).filter((word) => word.length > 0).length;
    setWordCount(words);
    setReadTime(Math.ceil(words / 200)); // 200 words per minute
  }, [content]);

  const handleFieldChange = useCallback(
    (field: keyof BlogWizardData, value: any) => {
      onUpdate({ [field]: value });
    },
    [onUpdate]
  );

  const generateContent = async (
    contentType: "title" | "content" | "excerpt"
  ) => {
    if (!title && contentType !== "title") {
      toast.error("Primero ingresa un título para generar contenido");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateBlogContent({
        title: title || "Artículo de Blog",
        category,
        contentType,
      });

      if (result.success && result.data) {
        const generatedContent = result.data.content;

        switch (contentType) {
          case "title":
            handleFieldChange("title", generatedContent);
            break;
          case "content":
            handleFieldChange("content", generatedContent);
            break;
          case "excerpt":
            handleFieldChange("excerpt", generatedContent);
            break;
        }

        toast.success("Contenido generado exitosamente");
      } else {
        toast.error(result.message || "Error al generar contenido");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Error al generar contenido");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderPreview = () => {
    if (!content)
      return (
        <p className="text-muted-foreground">
          No hay contenido para previsualizar
        </p>
      );

    return (
      <div className="prose prose-sm max-w-none">
        <div
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br>") }}
        />
      </div>
    );
  };

  return (
    <WizardStepLayout
      title="Contenido del Artículo"
      description="Crea el contenido principal de tu artículo de blog"
    >
      <WizardFormSection
        title="Información Básica"
      >
        <div className="flex gap-2 mb-4">
          <Badge variant="outline">{wordCount} palabras</Badge>
          <Badge variant="outline">{readTime} min lectura</Badge>
        </div>
        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title">Título *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => generateContent("title")}
              disabled={isGenerating}
              className="h-8"
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Generar
            </Button>
          </div>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            placeholder="Ingresa el título del artículo..."
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción Breve *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="Breve descripción del artículo..."
            rows={2}
            className={errors.description ? "border-destructive" : ""}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description}</p>
          )}
        </div>

        {/* Author */}
        <div className="space-y-2">
          <Label htmlFor="author">Autor *</Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => handleFieldChange("author", e.target.value)}
            placeholder="Nombre del autor..."
            className={errors.author ? "border-destructive" : ""}
          />
          {errors.author && (
            <p className="text-sm text-destructive">{errors.author}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select
            value={category}
            onValueChange={(value) => handleFieldChange("category", value)}
          >
            <SelectTrigger
              className={errors.category ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category}</p>
          )}
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="excerpt">Extracto</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => generateContent("excerpt")}
              disabled={isGenerating || !title}
              className="h-8"
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              Generar
            </Button>
          </div>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => handleFieldChange("excerpt", e.target.value)}
            placeholder="Breve extracto del artículo..."
            rows={3}
            className={errors.excerpt ? "border-destructive" : ""}
          />
          {errors.excerpt && (
            <p className="text-sm text-destructive">{errors.excerpt}</p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Contenido *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="h-8"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Editar
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Vista Previa
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateContent("content")}
                disabled={isGenerating || !title}
                className="h-8"
              >
                {isGenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Generar
              </Button>
            </div>
          </div>

          {showPreview ? (
            <Card className="p-4 min-h-[300px]">{renderPreview()}</Card>
          ) : (
            <Textarea
              id="content"
              value={content}
              onChange={(e) => handleFieldChange("content", e.target.value)}
              placeholder="Escribe el contenido del artículo..."
              rows={15}
              className={errors.content ? "border-destructive" : ""}
            />
          )}
          {errors.content && (
            <p className="text-sm text-destructive">{errors.content}</p>
          )}
        </div>
      </WizardFormSection>
    </WizardStepLayout>
  );
}
