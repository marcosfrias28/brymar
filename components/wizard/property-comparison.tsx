"use client";

import { useState, useEffect } from "react";
import {
  PropertyFormData,
  PropertyComparison as PropertyComparisonType,
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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Home,
  DollarSign,
  Square,
  Eye,
  BarChart3,
} from "lucide-react";

interface PropertyComparisonProps {
  currentProperty: PropertyFormData;
  onClose: () => void;
}

export function PropertyComparison({
  currentProperty,
  onClose,
}: PropertyComparisonProps) {
  const [comparison, setComparison] = useState<PropertyComparisonType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get similar properties
    const fetchSimilarProperties = async () => {
      setIsLoading(true);

      // Mock data - in real implementation, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockComparison: PropertyComparisonType = {
        id: "comparison-1",
        properties: [
          {
            id: "current",
            title: currentProperty.title,
            price: currentProperty.price,
            surface: currentProperty.surface,
            location: currentProperty.address?.city || "Sin ubicación",
            characteristics: currentProperty.characteristics,
            images: currentProperty.images.map((img) => img.url),
          },
          {
            id: "similar-1",
            title: "Casa Similar en la Zona",
            price: currentProperty.price * 0.9,
            surface: currentProperty.surface * 1.1,
            location: currentProperty.address?.city || "Zona Similar",
            characteristics: ["parking", "garden", "security", "terrace"],
            images: ["/villa/1.jpg"],
          },
          {
            id: "similar-2",
            title: "Propiedad Comparable",
            price: currentProperty.price * 1.15,
            surface: currentProperty.surface * 0.95,
            location: currentProperty.address?.city || "Zona Similar",
            characteristics: ["pool", "parking", "security", "ocean_view"],
            images: ["/villa2/1.jpg"],
          },
          {
            id: "similar-3",
            title: "Alternativa en el Mercado",
            price: currentProperty.price * 1.05,
            surface: currentProperty.surface * 1.05,
            location: currentProperty.address?.city || "Zona Similar",
            characteristics: ["parking", "garden", "gym", "elevator"],
            images: ["/villa3/1.jpg"],
          },
        ],
        similarities: [
          "Ubicación en zona residencial",
          "Características de seguridad",
          "Espacios exteriores",
          "Rango de precio similar",
        ],
        differences: [
          "Variación en superficie",
          "Diferentes amenidades premium",
          "Distintos acabados interiores",
          "Variación en precio por m²",
        ],
        marketPosition:
          currentProperty.price > 200000
            ? "above"
            : currentProperty.price < 100000
            ? "below"
            : "average",
      };

      setComparison(mockComparison);
      setIsLoading(false);
    };

    fetchSimilarProperties();
  }, [currentProperty]);

  const getMarketPositionInfo = (
    position: PropertyComparisonType["marketPosition"]
  ) => {
    switch (position) {
      case "above":
        return {
          icon: TrendingUp,
          label: "Por Encima del Promedio",
          description:
            "Tu propiedad está valorada por encima del mercado local",
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "below":
        return {
          icon: TrendingDown,
          label: "Por Debajo del Promedio",
          description: "Tu propiedad tiene un precio competitivo en el mercado",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      default:
        return {
          icon: Minus,
          label: "Precio Promedio",
          description: "Tu propiedad está alineada con el mercado local",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
        };
    }
  };

  const calculatePricePerSqm = (price: number, surface: number) => {
    return Math.round(price / surface);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="font-semibold mb-2">Analizando el Mercado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Buscando propiedades similares y calculando posición
              competitiva...
            </p>
            <Progress value={75} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!comparison) return null;

  const marketInfo = getMarketPositionInfo(comparison.marketPosition);
  const MarketIcon = marketInfo.icon;
  const currentProp = comparison.properties[0];
  const similarProps = comparison.properties.slice(1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análisis Comparativo de Mercado
              </CardTitle>
              <CardDescription>
                Compara tu propiedad con opciones similares en el mercado
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </CardHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Market Position */}
            <Card className={marketInfo.bgColor}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MarketIcon className={`h-6 w-6 ${marketInfo.color}`} />
                  <div>
                    <h3 className={`font-semibold ${marketInfo.color}`}>
                      {marketInfo.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {marketInfo.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comparison">Comparación</TabsTrigger>
                <TabsTrigger value="analysis">Análisis</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Current Property */}
                  <Card className="border-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="default">Tu Propiedad</Badge>
                        <Eye className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <h3 className="font-semibold">{currentProp.title}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />$
                          {currentProp.price.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Square className="h-3 w-3" />
                          {currentProp.surface} m²
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {currentProp.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Home className="h-3 w-3" />$
                          {calculatePricePerSqm(
                            currentProp.price,
                            currentProp.surface
                          )}
                          /m²
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {currentProp.characteristics
                          .slice(0, 4)
                          .map((char, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {char.replace("_", " ")}
                            </Badge>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Similar Properties */}
                  <div className="space-y-3">
                    {similarProps.map((prop, index) => (
                      <Card key={prop.id} className="border-muted">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">
                              {prop.title}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              Similar #{index + 1}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div>${prop.price.toLocaleString()}</div>
                            <div>{prop.surface} m²</div>
                            <div>{prop.location}</div>
                            <div>
                              ${calculatePricePerSqm(prop.price, prop.surface)}
                              /m²
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {prop.characteristics.slice(0, 3).map((char, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {char.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Similitudes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {comparison.similarities.map((similarity, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            {similarity}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Diferencias</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {comparison.differences.map((difference, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                            {difference}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Price Analysis Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Análisis de Precios
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {comparison.properties.map((prop, index) => {
                        const pricePerSqm = calculatePricePerSqm(
                          prop.price,
                          prop.surface
                        );
                        const maxPrice = Math.max(
                          ...comparison.properties.map((p) =>
                            calculatePricePerSqm(p.price, p.surface)
                          )
                        );
                        const percentage = (pricePerSqm / maxPrice) * 100;

                        return (
                          <div key={prop.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span
                                className={index === 0 ? "font-semibold" : ""}
                              >
                                {index === 0
                                  ? "Tu Propiedad"
                                  : `Similar #${index}`}
                              </span>
                              <span>${pricePerSqm}/m²</span>
                            </div>
                            <Progress
                              value={percentage}
                              className={`h-2 ${
                                index === 0 ? "bg-primary/20" : "bg-muted"
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Fortalezas de tu Propiedad
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          Precio competitivo en el mercado local
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          Características atractivas para compradores
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          Buena relación precio-superficie
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Oportunidades de Mejora
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                          Considera destacar características únicas
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                          Mejora la descripción con detalles específicos
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                          Añade más fotos de alta calidad
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <BarChart3 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recomendación:</strong> Tu propiedad está bien
                    posicionada en el mercado. Considera destacar las
                    características únicas y mejorar la presentación visual para
                    maximizar el interés de los compradores.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  );
}
