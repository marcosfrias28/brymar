"use client";

import React, { useState, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Sparkles,
  Loader2,
  X,
  Plus,
  Calendar as CalendarIcon,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { generateSEOSuggestions } from "@/lib/actions/blog-wizard-actions";
import type { BlogWizardData } from "@/types/blog-wizard";
import type { WizardStepProps } from "@/types/wizard-core";

export function BlogSEOStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
  errors,
  isLoading,
  isMobile,
}: WizardStepProps<BlogWizardData>) {
  const {
    register,
    formState: { errors: formErrors },
    setValue,
    watch,
  } = useFormContext<BlogWizardData>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [seoScore, setSeoScore] = useState(0);
  const [seoSuggestions, setSeoSuggestions] = useState<string[]>([]);

  const seoTitle = watch("seoTitle") || data.seoTitle || "";
  const seoDescription = watch("seoDescription") || data.seoDescription || "";
  const tags = watch("tags") || data.tags || [];
  const slug = watch("slug") || data.slug || "";
  const publishDate = watch("publishDate") || data.publishDate;
  const featured = watch("featured") || data.featured || false;

  const title = watch("title") || data.title || "";
  const content = watch("content") || data.content || "";
  const category = watch("category") || data.category || "";

  const handleFieldChange = useCallback(
    (field: keyof BlogWizardData, value: any) => {
      setValue(field, value);
      onUpdate({ [field]: value });
    },
    [setValue, onUpdate]
  );

  // Calculate SEO score
  React.useEffect(() => {
    let score = 0;

    if (seoTitle && seoTitle.length >= 30 && seoTitle.length <= 60) score += 20;
    if (
      seoDescription &&
      seoDescription.length >= 120 &&
      seoDescription.length <= 160
    )
      score += 20;
    if (tags.length >= 3 && tags.length <= 8) score += 20;
    if (slug && slug.length >= 3) score += 15;
    if (title && seoTitle && seoTitle.includes(title.split(" ")[0]))
      score += 15;
    if (content && content.length >= 300) score += 10;

    setSeoScore(score);
  }, [seoTitle, seoDescription, tags, slug, title, content]);

  const generateSEO = async () => {
    if (!title || !content) {
      toast.error("Necesitas título y contenido para generar SEO");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateSEOSuggestions({
        title,
        content,
        category,
      });

      if (result.success && result.data) {
        handleFieldChange("seoTitle", result.data.seoTitle);
        handleFieldChange("seoDescription", result.data.seoDescription);
        handleFieldChange("tags", result.data.tags);
        setSeoSuggestions(result.data.suggestions);

        toast.success("SEO generado exitosamente");
      } else {
        toast.error(result.message || "Error al generar SEO");
      }
    } catch (error) {
      console.error("Error generating SEO:", error);
      toast.error("Error al generar SEO");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSlug = () => {
    if (!title) {
      toast.error("Necesitas un título para generar el slug");
      return;
    }

    const generatedSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    handleFieldChange("slug", generatedSlug);
  };

  const addTag = () => {
    if (!newTag.trim()) return;

    if (tags.includes(newTag.trim())) {
      toast.error("Esta etiqueta ya existe");
      return;
    }

    if (tags.length >= 10) {
      toast.error("Máximo 10 etiquetas permitidas");
      return;
    }

    const updatedTags = [...tags, newTag.trim()];
    handleFieldChange("tags", updatedTags);
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    handleFieldChange("tags", updatedTags);
  };

  const getSEOScoreColor = () => {
    if (seoScore >= 80) return "text-green-600";
    if (seoScore >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSEOScoreIcon = () => {
    if (seoScore >= 80)
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (seoScore >= 60)
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Puntuación SEO
            <Badge variant="outline" className={getSEOScoreColor()}>
              {getSEOScoreIcon()}
              {seoScore}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    seoScore >= 80
                      ? "bg-green-600"
                      : seoScore >= 60
                      ? "bg-yellow-600"
                      : "bg-red-600"
                  }`}
                  style={{ width: `${seoScore}%` }}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={generateSEO}
              disabled={isGenerating || !title || !content}
              className="ml-4"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generar SEO
            </Button>
          </div>

          {seoSuggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Sugerencias:</h4>
              <ul className="space-y-1">
                {seoSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Optimización SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SEO Title */}
          <div className="space-y-2">
            <Label htmlFor="seoTitle">
              Título SEO
              <span className="text-sm text-muted-foreground ml-2">
                ({seoTitle.length}/60)
              </span>
            </Label>
            <Input
              id="seoTitle"
              value={seoTitle}
              onChange={(e) => handleFieldChange("seoTitle", e.target.value)}
              placeholder="Título optimizado para motores de búsqueda..."
              maxLength={60}
              className={formErrors.seoTitle ? "border-red-500" : ""}
            />
            {formErrors.seoTitle && (
              <p className="text-sm text-red-500">
                {formErrors.seoTitle.message}
              </p>
            )}
            {seoTitle.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {seoTitle.length < 30 && "⚠️ Muy corto (mín. 30 caracteres)"}
                {seoTitle.length >= 30 &&
                  seoTitle.length <= 60 &&
                  "✅ Longitud óptima"}
                {seoTitle.length > 60 && "⚠️ Muy largo (máx. 60 caracteres)"}
              </div>
            )}
          </div>

          {/* SEO Description */}
          <div className="space-y-2">
            <Label htmlFor="seoDescription">
              Descripción SEO
              <span className="text-sm text-muted-foreground ml-2">
                ({seoDescription.length}/160)
              </span>
            </Label>
            <Textarea
              id="seoDescription"
              value={seoDescription}
              onChange={(e) =>
                handleFieldChange("seoDescription", e.target.value)
              }
              placeholder="Descripción que aparecerá en los resultados de búsqueda..."
              maxLength={160}
              rows={3}
              className={formErrors.seoDescription ? "border-red-500" : ""}
            />
            {formErrors.seoDescription && (
              <p className="text-sm text-red-500">
                {formErrors.seoDescription.message}
              </p>
            )}
            {seoDescription.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {seoDescription.length < 120 &&
                  "⚠️ Muy corta (mín. 120 caracteres)"}
                {seoDescription.length >= 120 &&
                  seoDescription.length <= 160 &&
                  "✅ Longitud óptima"}
                {seoDescription.length > 160 &&
                  "⚠️ Muy larga (máx. 160 caracteres)"}
              </div>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">URL Slug</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateSlug}
                disabled={!title}
                className="h-8"
              >
                Generar
              </Button>
            </div>
            <Input
              id="slug"
              value={slug}
              onChange={(e) =>
                handleFieldChange(
                  "slug",
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                )
              }
              placeholder="url-del-articulo"
              className={formErrors.slug ? "border-red-500" : ""}
            />
            {formErrors.slug && (
              <p className="text-sm text-red-500">{formErrors.slug.message}</p>
            )}
            {slug && (
              <p className="text-xs text-muted-foreground">URL: /blog/{slug}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>
              Etiquetas
              <span className="text-sm text-muted-foreground ml-2">
                ({tags.length}/10)
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nueva etiqueta..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!newTag.trim() || tags.length >= 10}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {formErrors.tags && (
              <p className="text-sm text-red-500">{formErrors.tags.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Publishing Options */}
      <Card>
        <CardHeader>
          <CardTitle>Opciones de Publicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Featured */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Artículo Destacado
              </Label>
              <p className="text-sm text-muted-foreground">
                Mostrar este artículo en la sección destacada
              </p>
            </div>
            <Switch
              checked={featured}
              onCheckedChange={(checked) =>
                handleFieldChange("featured", checked)
              }
            />
          </div>

          {/* Publish Date */}
          <div className="space-y-2">
            <Label>Fecha de Publicación</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {publishDate ? (
                    format(publishDate, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={publishDate}
                  onSelect={(date) => handleFieldChange("publishDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Si no seleccionas una fecha, se publicará inmediatamente
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
