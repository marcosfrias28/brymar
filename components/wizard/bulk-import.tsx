"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  PropertyFormData,
  BulkImportData,
  PropertyTemplate,
} from "@/types/template";
import { TemplateService } from "@/lib/services/template-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
} from "lucide-react";
import Papa from "papaparse";

interface BulkImportProps {
  onImportComplete: (properties: PropertyFormData[]) => void;
  onCancel: () => void;
}

export function BulkImport({ onImportComplete, onCancel }: BulkImportProps) {
  const [importData, setImportData] = useState<BulkImportData | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<PropertyTemplate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "validate" | "review"
  >("upload");

  const templates = TemplateService.getTemplates();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      const text = await file.text();
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // Map common Spanish headers to English
          const headerMap: Record<string, string> = {
            título: "title",
            titulo: "title",
            descripción: "description",
            descripcion: "description",
            precio: "price",
            superficie: "surface",
            tipo: "propertyType",
            habitaciones: "bedrooms",
            baños: "bathrooms",
            características: "characteristics",
            caracteristicas: "characteristics",
          };
          return headerMap[header.toLowerCase()] || header;
        },
      });

      const properties = result.data.map((row: any) => ({
        title: row.title || "",
        description: row.description || "",
        price: parseFloat(row.price) || 0,
        surface: parseFloat(row.surface) || 0,
        propertyType: row.propertyType || "house",
        bedrooms: row.bedrooms ? parseInt(row.bedrooms) : undefined,
        bathrooms: row.bathrooms ? parseInt(row.bathrooms) : undefined,
        characteristics: row.characteristics
          ? row.characteristics.split(",").map((c: string) => c.trim())
          : [],
        images: [],
        status: "draft" as const,
        language: "es" as const,
      }));

      const validationResults =
        TemplateService.validateBulkImportData(properties);

      setImportData({
        properties,
        validationResults,
      });

      setCurrentStep("validate");
    } catch (error) {
      console.error("Error parsing CSV:", error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxFiles: 1,
  });

  const handleApplyTemplate = () => {
    if (!importData || !selectedTemplate) return;

    const enhancedProperties = importData.properties.map((property) => {
      const templateData = TemplateService.applyTemplate(
        selectedTemplate,
        property
      );
      return {
        ...templateData,
        ...property, // Override with imported data
        characteristics: [
          ...new Set([
            ...templateData.characteristics,
            ...(property.characteristics || []),
          ]),
        ],
      };
    });

    setImportData({
      ...importData,
      properties: enhancedProperties,
      template: selectedTemplate,
    });

    setCurrentStep("review");
  };

  const handleImport = () => {
    if (!importData) return;

    const validProperties = importData.properties.filter((_, index) => {
      const hasErrors = importData.validationResults.errors.some(
        (error) => error.row === index + 1
      );
      return !hasErrors;
    });

    onImportComplete(validProperties as PropertyFormData[]);
  };

  const downloadTemplate = () => {
    const csvContent = `título,descripción,precio,superficie,tipo,habitaciones,baños,características
Casa Ejemplo,Hermosa casa con jardín,150000,120,house,3,2,"parking,garden,security"
Apartamento Ejemplo,Moderno apartamento céntrico,80000,85,apartment,2,1,"elevator,balcony"`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-propiedades.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Importación Masiva</h2>
        <p className="text-muted-foreground">
          Importa múltiples propiedades desde un archivo CSV o Excel
        </p>
      </div>

      <Tabs value={currentStep} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">1. Cargar Archivo</TabsTrigger>
          <TabsTrigger value="validate" disabled={!importData}>
            2. Validar
          </TabsTrigger>
          <TabsTrigger value="review" disabled={currentStep !== "review"}>
            3. Revisar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subir Archivo</CardTitle>
              <CardDescription>
                Arrastra tu archivo CSV o Excel aquí, o haz clic para
                seleccionar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p>Suelta el archivo aquí...</p>
                ) : (
                  <div>
                    <p className="text-lg mb-2">Arrastra tu archivo aquí</p>
                    <p className="text-sm text-muted-foreground">
                      Formatos soportados: CSV, XLS, XLSX
                    </p>
                  </div>
                )}
              </div>

              {isProcessing && (
                <div className="mt-4">
                  <Progress value={50} className="w-full" />
                  <p className="text-sm text-center mt-2">
                    Procesando archivo...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>¿No tienes un archivo?</CardTitle>
              <CardDescription>
                Descarga nuestra plantilla para empezar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla CSV
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validate" className="space-y-6">
          {importData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Resultados de Validación</CardTitle>
                  <CardDescription>
                    Revisa los errores encontrados en tu archivo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {importData.validationResults.valid}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Válidas
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {importData.validationResults.invalid}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Con Errores
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {importData.properties.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>

                  {importData.validationResults.errors.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Se encontraron{" "}
                        {importData.validationResults.errors.length} errores.
                        Las propiedades con errores no serán importadas.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aplicar Plantilla (Opcional)</CardTitle>
                  <CardDescription>
                    Mejora tus propiedades aplicando una plantilla predefinida
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Select
                        onValueChange={(value) => {
                          const template = templates.find(
                            (t) => t.id === value
                          );
                          setSelectedTemplate(template || null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una plantilla" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleApplyTemplate}
                      disabled={!selectedTemplate}
                    >
                      Aplicar Plantilla
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button onClick={() => setCurrentStep("review")}>
                  Continuar
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          {importData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Revisión Final</CardTitle>
                  <CardDescription>
                    Revisa las propiedades que serán importadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {importData.properties
                      .filter((_, index) => {
                        const hasErrors =
                          importData.validationResults.errors.some(
                            (error) => error.row === index + 1
                          );
                        return !hasErrors;
                      })
                      .map((property, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">
                                {property.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {property.description?.substring(0, 100)}...
                              </p>
                              <div className="flex gap-4 text-sm">
                                <span>
                                  Precio: ${property.price?.toLocaleString()}
                                </span>
                                <span>Superficie: {property.surface} m²</span>
                                <span className="capitalize">
                                  Tipo: {property.propertyType}
                                </span>
                              </div>
                              {property.characteristics &&
                                property.characteristics.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {property.characteristics?.map(
                                      (char, i) => (
                                        <Badge
                                          key={i}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {char}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("validate")}
                >
                  Volver
                </Button>
                <Button onClick={handleImport}>Importar Propiedades</Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
