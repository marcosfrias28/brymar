"use client";

import { useState } from "react";
import {
  PropertyFormData,
  SocialMediaPreview as SocialMediaPreviewType,
} from "@/types/template";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  Copy,
  Download,
  Share2,
  Eye,
  Edit3,
} from "lucide-react";

interface SocialMediaPreviewProps {
  property: PropertyFormData;
  onClose: () => void;
}

export function SocialMediaPreview({
  property,
  onClose,
}: SocialMediaPreviewProps) {
  const [selectedPlatform, setSelectedPlatform] =
    useState<SocialMediaPreviewType["platform"]>("facebook");
  const [customContent, setCustomContent] = useState<
    Record<string, { title: string; description: string; hashtags: string[] }>
  >({});

  const generateSocialContent = (
    platform: SocialMediaPreviewType["platform"]
  ): SocialMediaPreviewType => {
    const baseUrl = `${window.location.origin}/properties/${property.title
      ?.toLowerCase()
      .replace(/\s+/g, "-")}`;
    const mainImage = property.images[0]?.url || "/villa/1.jpg";

    const platformConfigs = {
      facebook: {
        title: `🏠 ${property.title}`,
        description: `${property.description?.substring(
          0,
          200
        )}...\n\n💰 Precio: $${property.price?.toLocaleString()}\n📐 Superficie: ${
          property.surface
        } m²\n📍 ${
          property.address?.city || "Ubicación privilegiada"
        }\n\n¡Contáctanos para más información!`,
        hashtags: [
          "#RealEstate",
          "#PropiedadEnVenta",
          "#InversionInmobiliaria",
          "#CasaEnVenta",
        ],
      },
      instagram: {
        title: `✨ ${property.title}`,
        description: `${property.description?.substring(
          0,
          150
        )}...\n\n💎 $${property.price?.toLocaleString()}\n🏡 ${
          property.surface
        } m²\n📍 ${
          property.address?.city || "Ubicación premium"
        }\n\nDM para más info 📩`,
        hashtags: [
          "#RealEstate",
          "#LuxuryHomes",
          "#PropertyForSale",
          "#DreamHome",
          "#Investment",
          "#RealEstateLife",
        ],
      },
      twitter: {
        title: `🏠 ${property.title}`,
        description: `${property.description?.substring(
          0,
          120
        )}...\n\n💰 $${property.price?.toLocaleString()} | 📐 ${
          property.surface
        }m²\n📍 ${property.address?.city || "Prime location"}\n\nMore info ⬇️`,
        hashtags: ["#RealEstate", "#PropertySale", "#Investment"],
      },
      whatsapp: {
        title: `🏠 *${property.title}*`,
        description: `Hola! Te comparto esta increíble propiedad:\n\n🏡 *${
          property.title
        }*\n💰 *Precio:* $${property.price?.toLocaleString()}\n📐 *Superficie:* ${
          property.surface
        } m²\n📍 *Ubicación:* ${
          property.address?.city || "Excelente ubicación"
        }\n\n${property.description?.substring(
          0,
          200
        )}...\n\n¿Te interesa conocer más detalles?`,
        hashtags: [],
      },
    };

    const config = platformConfigs[platform];
    const custom = customContent[platform];

    return {
      platform,
      title: custom?.title || config.title,
      description: custom?.description || config.description,
      image: mainImage,
      url: baseUrl,
      hashtags: custom?.hashtags || config.hashtags,
    };
  };

  const handleCustomContentChange = (
    platform: string,
    field: string,
    value: string | string[]
  ) => {
    setCustomContent((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }));
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  const downloadImage = (preview: SocialMediaPreviewType) => {
    // In a real implementation, this would generate a social media image
    console.log("Downloading social media image for", preview.platform);
  };

  const platforms = [
    {
      id: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "text-blue-600",
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "text-pink-600",
    },
    { id: "twitter", name: "Twitter", icon: Twitter, color: "text-sky-500" },
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: MessageCircle,
      color: "text-green-600",
    },
  ];

  const currentPreview = generateSocialContent(selectedPlatform);
  const fullContent = `${currentPreview.title}\n\n${
    currentPreview.description
  }\n\n${currentPreview.hashtags.join(" ")}\n\n${currentPreview.url}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Vista Previa para Redes Sociales
              </CardTitle>
              <CardDescription>
                Genera contenido optimizado para diferentes plataformas sociales
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            <Tabs
              value={selectedPlatform}
              onValueChange={(value) => setSelectedPlatform(value as any)}
            >
              <TabsList className="grid w-full grid-cols-4 mb-6">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <TabsTrigger
                      key={platform.id}
                      value={platform.id}
                      className="flex items-center gap-2"
                    >
                      <Icon className={`h-4 w-4 ${platform.color}`} />
                      {platform.name}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {platforms.map((platform) => {
                const preview = generateSocialContent(platform.id as any);
                const Icon = platform.icon;

                return (
                  <TabsContent
                    key={platform.id}
                    value={platform.id}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Preview */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Vista Previa - {platform.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="border rounded-lg p-4 bg-muted/30">
                            {/* Platform-specific preview styling */}
                            {platform.id === "facebook" && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Icon className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-sm">
                                      Tu Inmobiliaria
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      hace 2 horas
                                    </div>
                                  </div>
                                </div>
                                <div className="text-sm whitespace-pre-line">
                                  {preview.description}
                                </div>
                                <div className="bg-white border rounded-lg overflow-hidden">
                                  <img
                                    src={preview.image}
                                    alt="Property"
                                    className="w-full h-32 object-cover"
                                  />
                                  <div className="p-3">
                                    <div className="font-semibold text-sm">
                                      {preview.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {preview.url}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {preview.hashtags.map((tag, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {platform.id === "instagram" && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <Icon className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="font-semibold text-sm">
                                    tu_inmobiliaria
                                  </div>
                                </div>
                                <img
                                  src={preview.image}
                                  alt="Property"
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                                <div className="text-sm whitespace-pre-line">
                                  {preview.description}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {preview.hashtags.map((tag, i) => (
                                    <span
                                      key={i}
                                      className="text-blue-600 text-sm"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {platform.id === "twitter" && (
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                                    <Icon className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-sm">
                                        Tu Inmobiliaria
                                      </span>
                                      <span className="text-muted-foreground text-sm">
                                        @tu_inmobiliaria · 2h
                                      </span>
                                    </div>
                                    <div className="text-sm mt-1 whitespace-pre-line">
                                      {preview.description}
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {preview.hashtags.map((tag, i) => (
                                        <span
                                          key={i}
                                          className="text-sky-600 text-sm"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                    <div className="border rounded-lg mt-3 overflow-hidden">
                                      <img
                                        src={preview.image}
                                        alt="Property"
                                        className="w-full h-32 object-cover"
                                      />
                                      <div className="p-2">
                                        <div className="font-semibold text-xs">
                                          {preview.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {preview.url}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {platform.id === "whatsapp" && (
                              <div className="space-y-3">
                                <div className="bg-green-500 text-white p-3 rounded-lg rounded-bl-none max-w-xs">
                                  <div className="text-sm whitespace-pre-line">
                                    {preview.description}
                                  </div>
                                  <div className="text-xs opacity-75 mt-2">
                                    12:34 PM ✓✓
                                  </div>
                                </div>
                                <div className="bg-white border rounded-lg p-2 max-w-xs">
                                  <img
                                    src={preview.image}
                                    alt="Property"
                                    className="w-full h-24 object-cover rounded"
                                  />
                                  <div className="mt-2">
                                    <div className="font-semibold text-xs">
                                      {preview.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {preview.url}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Editor */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Edit3 className="h-4 w-4" />
                            Personalizar Contenido
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="title">Título</Label>
                            <Input
                              id="title"
                              value={
                                customContent[platform.id]?.title ||
                                preview.title
                              }
                              onChange={(e) =>
                                handleCustomContentChange(
                                  platform.id,
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder="Título del post"
                            />
                          </div>

                          <div>
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                              id="description"
                              value={
                                customContent[platform.id]?.description ||
                                preview.description
                              }
                              onChange={(e) =>
                                handleCustomContentChange(
                                  platform.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Descripción del post"
                              rows={6}
                            />
                          </div>

                          <div>
                            <Label htmlFor="hashtags">Hashtags</Label>
                            <Input
                              id="hashtags"
                              value={(
                                customContent[platform.id]?.hashtags ||
                                preview.hashtags
                              ).join(" ")}
                              onChange={(e) =>
                                handleCustomContentChange(
                                  platform.id,
                                  "hashtags",
                                  e.target.value.split(" ")
                                )
                              }
                              placeholder="#hashtag1 #hashtag2"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => copyToClipboard(fullContent)}
                              className="flex-1"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar Contenido
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => downloadImage(preview)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Descargar Imagen
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  );
}
