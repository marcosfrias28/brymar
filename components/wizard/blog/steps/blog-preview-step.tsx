"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Calendar,
  Clock,
  User,
  Tag,
  Star,
  ExternalLink,
  ChevronLeft,
  Check,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { categoryLabels } from "@/types/blog-wizard";
import type { BlogWizardData } from "@/types/blog-wizard";
import type { WizardStepProps } from "@/types/wizard-core";
import {
  WizardStepLayout,
  WizardFormSection,
} from "@/components/wizard/shared/consistent-navigation";

export function BlogPreviewStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
  errors,
  isLoading,
  isMobile,
}: WizardStepProps<BlogWizardData>) {
  const title = data.title || "";
  const content = data.content || "";
  const author = data.author || "";
  const category = data.category || "property-news";
  const excerpt = data.excerpt || "";
  const coverImage = data.coverImage || "";
  const images = data.images || [];
  const videos = data.videos || [];
  const seoTitle = data.seoTitle || "";
  const seoDescription = data.seoDescription || "";
  const tags = data.tags || [];
  const slug = data.slug || "";
  const publishDate = data.publishDate;
  const featured = data.featured || false;
  const readTime =
    data.readTime ||
    Math.ceil(content.split(" ").length / 200);

  const formatContent = (text: string) => {
    return text.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  return (
    <WizardStepLayout
      title="Vista Previa del Artículo"
      description="Revisa cómo se verá tu artículo antes de publicarlo"
    >
      <WizardFormSection
        title="Información del Artículo"
        description="Detalles principales del artículo"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa del Artículo
              {featured && (
                <Badge variant="default" className="bg-yellow-500">
                  <Star className="h-3 w-3 mr-1" />
                  Destacado
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{author || "Sin autor"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{readTime} min de lectura</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {publishDate
                    ? format(publishDate, "PPP", { locale: es })
                    : "Publicación inmediata"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </WizardFormSection>

      <WizardFormSection
        title="Contenido del Artículo"
        description="Vista previa del contenido completo"
      >
        <Card>
          <CardContent className="p-0">
            {/* Cover Image */}
            {coverImage && (
              <div className="relative w-full h-64 md:h-80">
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Category and Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </Badge>
                {tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{tags.length - 3} más
                  </Badge>
                )}
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                  {title || "Título del artículo"}
                </h1>

                {/* Excerpt */}
                {excerpt && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {excerpt}
                  </p>
                )}
              </div>

              <Separator />

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                {content ? (
                  formatContent(content)
                ) : (
                  <p className="text-muted-foreground italic">
                    El contenido del artículo aparecerá aquí...
                  </p>
                )}
              </div>

              {/* Additional Images */}
              {images.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-semibold">Galería de Imágenes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="space-y-2">
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                          <Image
                            src={image.url}
                            alt={image.alt || image.filename}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {image.caption && (
                          <p className="text-sm text-muted-foreground text-center">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {videos.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="text-lg font-semibold">Videos</h3>
                  <div className="space-y-3">
                    {videos.map((video) => (
                      <Card key={video.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{video.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {video.url}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(video.url, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </WizardFormSection>

      <WizardFormSection
        title="Vista Previa en Buscadores"
        description="Cómo se verá tu artículo en Google y otros motores de búsqueda"
      >
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="space-y-1">
            <div className="text-sm text-green-600">
              brymar-inmobiliaria.com › blog › {slug || "articulo"}
            </div>
            <h3 className="text-lg text-blue-600 hover:underline cursor-pointer">
              {seoTitle || title || "Título del artículo"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {seoDescription ||
                excerpt ||
                "Descripción del artículo que aparecerá en los resultados de búsqueda..."}
            </p>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            Así se verá tu artículo en Google y otros motores de búsqueda.
          </p>
        </div>
      </WizardFormSection>

      <WizardFormSection
        title="Resumen del Artículo"
        description="Estadísticas y detalles del contenido"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="font-medium">Título:</span>
              <p className="text-sm text-muted-foreground">
                {title || "Sin título"}
              </p>
            </div>
            <div>
              <span className="font-medium">Autor:</span>
              <p className="text-sm text-muted-foreground">
                {author || "Sin autor"}
              </p>
            </div>
            <div>
              <span className="font-medium">Categoría:</span>
              <p className="text-sm text-muted-foreground">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </p>
            </div>
            <div>
              <span className="font-medium">Palabras:</span>
              <p className="text-sm text-muted-foreground">
                {content.split(" ").filter((word) => word.length > 0).length}{" "}
                palabras
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="font-medium">Imágenes:</span>
              <p className="text-sm text-muted-foreground">
                {images.length} imagen{images.length !== 1 ? "es" : ""}
                {coverImage && " (+ portada)"}
              </p>
            </div>
            <div>
              <span className="font-medium">Videos:</span>
              <p className="text-sm text-muted-foreground">
                {videos.length} video{videos.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <span className="font-medium">Etiquetas:</span>
              <p className="text-sm text-muted-foreground">
                {tags.length > 0 ? tags.join(", ") : "Sin etiquetas"}
              </p>
            </div>
            <div>
              <span className="font-medium">URL:</span>
              <p className="text-sm text-muted-foreground">
                /blog/{slug || "articulo"}
              </p>
            </div>
          </div>
        </div>
      </WizardFormSection>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        
        <Button
          onClick={onNext}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Check className="h-4 w-4" />
          Finalizar
        </Button>
      </div>
    </WizardStepLayout>
  );
}
