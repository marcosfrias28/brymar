"use client";

import React, { useState } from "react";
import { WizardStepProps } from "@/types/wizard-core";
import { BlogWizardData } from "@/types/blog-wizard";
import { ImageUploadStep } from "@/components/wizard/shared/image-upload-step";
import {
  WizardStepLayout,
  WizardFormSection,
} from "@/components/wizard/shared/consistent-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image as ImageIcon,
  Video,
  Eye,
  X,
  ExternalLink,
  Camera,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function BlogMediaStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
  errors,
  isLoading,
}: WizardStepProps<BlogWizardData>) {
  const [videoUrl, setVideoUrl] = useState("");

  // Extract data with defaults
  const coverImage = data.coverImage || "";
  const images = data.images || [];
  const videos = data.videos || [];

  const handleAddVideo = () => {
    if (!videoUrl.trim()) {
      toast.error("Por favor ingresa una URL de video válida");
      return;
    }

    const newVideo = {
      id: Date.now().toString(),
      url: videoUrl.trim(),
      title: `Video ${videos.length + 1}`,
    };

    onUpdate({
      videos: [...videos, newVideo],
    });

    setVideoUrl("");
    toast.success("Video agregado exitosamente");
  };

  const handleRemoveVideo = (videoId: string) => {
    onUpdate({
      videos: videos.filter((video) => video.id !== videoId),
    });
    toast.success("Video eliminado");
  };

  const handleCoverImageChange = (imageUrl: string) => {
    onUpdate({ coverImage: imageUrl });
  };

  const handleImagesChange = (newImages: any[]) => {
    onUpdate({ images: newImages });
  };

  return (
    <WizardStepLayout
      title="Multimedia del Artículo"
      description="Agrega imágenes y videos para enriquecer tu contenido"
    >
      <div className="space-y-6">
        <Tabs defaultValue="cover" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cover" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Portada
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Imágenes
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cover" className="mt-6">
            <WizardFormSection
              title="Imagen de Portada"
              description="Selecciona la imagen principal que aparecerá en la vista previa del artículo"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coverImage">URL de la Imagen de Portada</Label>
                  <Input
                    id="coverImage"
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={coverImage}
                    onChange={(e) => handleCoverImageChange(e.target.value)}
                  />
                  {errors?.coverImage && (
                    <p className="text-sm text-destructive">{errors.coverImage}</p>
                  )}
                </div>

                {coverImage && (
                  <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                    <Image
                      src={coverImage}
                      alt="Vista previa de portada"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {images.length > 0 && (
                  <div className="space-y-2">
                    <Label>O selecciona de las imágenes subidas:</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {images.map((image) => (
                        <div
                          key={image.id}
                          className={`relative aspect-square border-2 rounded-lg overflow-hidden cursor-pointer transition-colors ${
                            coverImage === image.url
                              ? "border-primary"
                              : "border-muted hover:border-muted-foreground"
                          }`}
                          onClick={() => handleCoverImageChange(image.url)}
                        >
                          <Image
                            src={image.url}
                            alt={image.alt || image.filename}
                            fill
                            className="object-cover"
                          />
                          {coverImage === image.url && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Badge variant="secondary">Portada</Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </WizardFormSection>
          </TabsContent>

          <TabsContent value="images" className="mt-6">
            <ImageUploadStep
              images={images}
              onImagesChange={(newImages) => onUpdate({ images: newImages })}
              maxImages={20}
              title="Galería de Imágenes"
              description="Sube imágenes que complementen tu artículo"
              showCaptions={true}
              showAltText={true}
              errors={errors}
            />
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <WizardFormSection
              title="Videos del Artículo"
              description="Agrega videos de YouTube, Vimeo u otras plataformas"
            >
              <div className="space-y-4">
                {/* Add Video Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">URL del Video *</Label>
                    <Input
                      id="videoUrl"
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddVideo}
                      disabled={!videoUrl.trim() || isLoading}
                      className="w-full"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Agregar Video
                    </Button>
                  </div>
                </div>

                {/* Videos List */}
                {videos.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Videos agregados</h4>
                      <Badge variant="outline">{videos.length} videos</Badge>
                    </div>
                    <div className="space-y-2">
                      {videos.map((video) => (
                        <Card key={video.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Video className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{video.title}</p>
                                  <p className="text-sm text-muted-foreground truncate max-w-md">
                                    {video.url}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(video.url, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveVideo(video.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </WizardFormSection>
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <Button
            type="button"
            onClick={onNext}
            disabled={isLoading}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </WizardStepLayout>
  );
}
