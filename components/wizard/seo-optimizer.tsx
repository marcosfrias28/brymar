"use client";

import { useState, useEffect } from "react";
import { PropertyFormData, SEOSuggestions } from "@/types/template";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Target,
  BarChart3,
  Globe,
  Zap,
} from "lucide-react";

interface SEOOptimizerProps {
  property: PropertyFormData;
  onApplySuggestions: (updates: Partial<PropertyFormData>) => void;
  onClose: () => void;
}

export function SEOOptimizer({
  property,
  onApplySuggestions,
  onClose,
}: SEOOptimizerProps) {
  const [seoAnalysis, setSeoAnalysis] = useState<SEOSuggestions | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [optimizedContent, setOptimizedContent] = useState({
    title: property.title,
    description: property.description,
  });

  useEffect(() => {
    const analyzeSEO = async () => {
      setIsAnalyzing(true);

      // Simulate SEO analysis
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const analysis: SEOSuggestions = {
        title: {
          current: property.title,
          suggested: generateOptimizedTitle(property),
          score: calculateTitleScore(property.title),
          improvements: [
            "Incluir ubicación específica",
            "Añadir palabras clave relevantes",
            "Mantener entre 50-60 caracteres",
            "Incluir tipo de propiedad",
          ],
        },
        description: {
          current: property.description || "",
          suggested: generateOptimizedDescription(property),
          score: calculateDescriptionScore(property.description || ""),
          improvements: [
            "Incluir características únicas",
            "Mencionar ubicación y zona",
            "Añadir llamada a la acción",
            "Optimizar longitud (150-160 caracteres para meta description)",
          ],
        },
        keywords: {
          primary: generatePrimaryKeywords(property),
          secondary: generateSecondaryKeywords(property),
          missing: [
            "inversión inmobiliaria",
            "financiamiento disponible",
            "tour virtual",
            "documentos en regla",
          ],
        },
        structuredData: {
          implemented: false,
          suggestions: [
            "Implementar Schema.org para propiedades",
            "Añadir datos estructurados de ubicación",
            "Incluir información de precios",
            "Agregar datos de contacto",
          ],
        },
        performance: {
          score: 75,
          issues: [
            "Imágenes sin optimizar",
            "Falta texto alternativo",
            "URLs no optimizadas",
          ],
          recommendations: [
            "Comprimir imágenes",
            "Añadir alt text descriptivo",
            "Usar URLs amigables",
            "Implementar lazy loading",
          ],
        },
      };

      setSeoAnalysis(analysis);
      setOptimizedContent({
        title: analysis.title.suggested,
        description: analysis.description.suggested,
      });
      setIsAnalyzing(false);
    };

    analyzeSEO();
  }, [property]);

  const generateOptimizedTitle = (prop: PropertyFormData): string => {
    const location = prop.address?.city || "Ubicación Premium";
    const type =
      prop.propertyType === "house"
        ? "Casa"
        : prop.propertyType === "apartment"
        ? "Apartamento"
        : prop.propertyType === "villa"
        ? "Villa"
        : "Propiedad";
    const price = prop.price ? `$${(prop.price / 1000).toFixed(0)}K` : "";

    return `${type} en ${location} ${price} - ${prop.surface}m² | Venta Inmediata`;
  };

  const generateOptimizedDescription = (prop: PropertyFormData): string => {
    const location = prop.address?.city || "excelente ubicación";
    const features = prop.characteristics.slice(0, 3).join(", ");

    return `${prop.propertyType === "house" ? "Casa" : "Propiedad"} de ${
      prop.surface
    }m² en ${location}. Incluye ${features}. Precio: $${prop.price?.toLocaleString()}. ¡Agenda tu visita hoy!`;
  };

  const generatePrimaryKeywords = (prop: PropertyFormData): string[] => {
    const base = [
      `${prop.propertyType} en venta`,
      `propiedad ${prop.address?.city || "premium"}`,
      `${prop.propertyType} ${prop.surface}m2`,
    ];

    if (prop.price && prop.price > 200000) {
      base.push("propiedad de lujo");
    }

    return base;
  };

  const generateSecondaryKeywords = (prop: PropertyFormData): string[] => {
    return [
      "bienes raíces",
      "inversión inmobiliaria",
      "comprar casa",
      "propiedad nueva",
      "financiamiento disponible",
      `${prop.address?.province || "República Dominicana"} real estate`,
    ];
  };

  const calculateTitleScore = (title: string): number => {
    let score = 0;
    if (title.length >= 30 && title.length <= 60) score += 25;
    if (
      title.includes("casa") ||
      title.includes("apartamento") ||
      title.includes("villa")
    )
      score += 25;
    if (title.includes("venta") || title.includes("$")) score += 25;
    if (/\d+m²?|\d+\s*metros/.test(title)) score += 25;
    return score;
  };

  const calculateDescriptionScore = (description: string): number => {
    let score = 0;
    if (description.length >= 120 && description.length <= 160) score += 30;
    if (description.includes("ubicación") || description.includes("zona"))
      score += 20;
    if (description.includes("$") || description.includes("precio"))
      score += 20;
    if (description.includes("visita") || description.includes("contacta"))
      score += 15;
    if (description.split(" ").length >= 15) score += 15;
    return Math.min(score, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const handleApplyOptimizations = () => {
    onApplySuggestions({
      title: optimizedContent.title,
      description: optimizedContent.description,
    });
    onClose();
  };

  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="font-semibold mb-2">Analizando SEO</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Evaluando optimización y generando sugerencias...
            </p>
            <Progress value={60} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!seoAnalysis) return null;

  const overallScore = Math.round(
    (seoAnalysis.title.score +
      seoAnalysis.description.score +
      seoAnalysis.performance.score) /
      3
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Optimización SEO
              </CardTitle>
              <CardDescription>
                Mejora la visibilidad de tu propiedad en motores de búsqueda
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Overall Score */}
            <Card className={getScoreBg(overallScore)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Puntuación SEO General</h3>
                    <p className="text-sm text-muted-foreground">
                      Basado en título, descripción y rendimiento
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-3xl font-bold ${getScoreColor(
                        overallScore
                      )}`}
                    >
                      {overallScore}
                    </div>
                    <div className="text-sm text-muted-foreground">/ 100</div>
                  </div>
                </div>
                <Progress value={overallScore} className="mt-3" />
              </CardContent>
            </Card>

            <Tabs defaultValue="optimization" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="optimization">Optimización</TabsTrigger>
                <TabsTrigger value="keywords">Palabras Clave</TabsTrigger>
                <TabsTrigger value="technical">Técnico</TabsTrigger>
                <TabsTrigger value="performance">Rendimiento</TabsTrigger>
              </TabsList>

              <TabsContent value="optimization" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Title Optimization */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Título
                        </span>
                        <Badge
                          variant={
                            seoAnalysis.title.score >= 80
                              ? "default"
                              : "destructive"
                          }
                        >
                          {seoAnalysis.title.score}/100
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Título Actual
                        </Label>
                        <div className="p-2 bg-muted rounded text-sm mt-1">
                          {seoAnalysis.title.current}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Título Optimizado
                        </Label>
                        <Input
                          value={optimizedContent.title}
                          onChange={(e) =>
                            setOptimizedContent((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Mejoras Sugeridas
                        </Label>
                        <ul className="mt-2 space-y-1">
                          {seoAnalysis.title.improvements.map(
                            (improvement, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2 text-sm"
                              >
                                <Lightbulb className="h-3 w-3 text-yellow-500" />
                                {improvement}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description Optimization */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Descripción
                        </span>
                        <Badge
                          variant={
                            seoAnalysis.description.score >= 80
                              ? "default"
                              : "destructive"
                          }
                        >
                          {seoAnalysis.description.score}/100
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Descripción Actual
                        </Label>
                        <div className="p-2 bg-muted rounded text-sm mt-1 max-h-20 overflow-y-auto">
                          {seoAnalysis.description.current}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Descripción Optimizada
                        </Label>
                        <Textarea
                          value={optimizedContent.description}
                          onChange={(e) =>
                            setOptimizedContent((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          rows={3}
                          className="mt-1"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {optimizedContent.description.length} caracteres
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Mejoras Sugeridas
                        </Label>
                        <ul className="mt-2 space-y-1">
                          {seoAnalysis.description.improvements.map(
                            (improvement, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2 text-sm"
                              >
                                <Lightbulb className="h-3 w-3 text-yellow-500" />
                                {improvement}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button onClick={handleApplyOptimizations}>
                    <Zap className="h-4 w-4 mr-2" />
                    Aplicar Optimizaciones
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="keywords" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Palabras Clave Principales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {seoAnalysis.keywords.primary.map((keyword, index) => (
                          <Badge key={index} variant="default">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Palabras Clave Secundarias
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {seoAnalysis.keywords.secondary.map(
                          (keyword, index) => (
                            <Badge key={index} variant="secondary">
                              {keyword}
                            </Badge>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Oportunidades de Palabras Clave
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {seoAnalysis.keywords.missing.map((keyword, index) => (
                          <Badge key={index} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        Considera incluir estas palabras clave en tu descripción
                        para mejorar la visibilidad.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Datos Estructurados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      {seoAnalysis.structuredData.implemented ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span
                        className={
                          seoAnalysis.structuredData.implemented
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {seoAnalysis.structuredData.implemented
                          ? "Implementado"
                          : "No Implementado"}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">
                        Sugerencias de Implementación:
                      </h4>
                      <ul className="space-y-1">
                        {seoAnalysis.structuredData.suggestions.map(
                          (suggestion, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                              {suggestion}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Rendimiento General
                      </span>
                      <Badge
                        variant={
                          seoAnalysis.performance.score >= 80
                            ? "default"
                            : "destructive"
                        }
                      >
                        {seoAnalysis.performance.score}/100
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={seoAnalysis.performance.score} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          Problemas Detectados
                        </h4>
                        <ul className="space-y-1">
                          {seoAnalysis.performance.issues.map(
                            (issue, index) => (
                              <li key={index} className="text-sm text-red-600">
                                • {issue}
                              </li>
                            )
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Recomendaciones
                        </h4>
                        <ul className="space-y-1">
                          {seoAnalysis.performance.recommendations.map(
                            (rec, index) => (
                              <li
                                key={index}
                                className="text-sm text-green-600"
                              >
                                • {rec}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  );
}
