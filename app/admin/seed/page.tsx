"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [landResults, setLandResults] = useState<any>(null);
  const [checkResults, setCheckResults] = useState<any>(null);

  const handleSeedProperties = async () => {
    setIsSeeding(true);
    setResults(null);

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
        toast.success(
          `🎉 ${data.properties.length} propiedades insertadas exitosamente`
        );
      } else {
        setResults(data);
        toast.error(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResults({
        success: false,
        error: `Error de conexión: ${error}`,
      });
      toast.error("❌ Error de conexión con la API");
    }

    setIsSeeding(false);
  };

  const handleSeedLands = async () => {
    setIsSeeding(true);
    setLandResults(null);

    try {
      const response = await fetch("/api/seed-lands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setLandResults(data);
        toast.success(
          `🎉 ${data.lands.length} terrenos insertados exitosamente`
        );
      } else {
        setLandResults(data);
        toast.error(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setLandResults({
        success: false,
        error: `Error de conexión: ${error}`,
      });
      toast.error("❌ Error de conexión con la API");
    }

    setIsSeeding(false);
  };

  const handleCheckLands = async () => {
    try {
      const response = await fetch("/api/check-lands");
      const data = await response.json();
      setCheckResults(data);

      if (data.success) {
        toast.success(
          `✅ Encontrados ${data.count} terrenos en la base de datos`
        );
      } else {
        toast.error(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      toast.error("❌ Error de conexión");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Properties Seed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">🏠 Seed de Propiedades</CardTitle>
            <p className="text-muted-foreground">
              Inserta 10 propiedades de ejemplo (casas, apartamentos, villas,
              etc.)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSeedProperties}
              disabled={isSeeding}
              className="w-full"
              size="lg"
            >
              {isSeeding ? "🔄 Insertando..." : "🚀 Insertar Propiedades"}
            </Button>

            {results && (
              <div className="space-y-2">
                {results.success ? (
                  <div className="space-y-2">
                    <Badge
                      variant="default"
                      className="w-full justify-center py-2"
                    >
                      ✅ {results.properties.length} propiedades insertadas
                    </Badge>
                    <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                      {results.properties.map(
                        (property: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between text-xs"
                          >
                            <span className="truncate">{property.title}</span>
                            <span>${property.price.toLocaleString()}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : (
                  <Badge
                    variant="destructive"
                    className="w-full justify-center py-2"
                  >
                    ❌ Error: {results.error}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lands Seed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">🌿 Seed de Terrenos</CardTitle>
            <p className="text-muted-foreground">
              Inserta 8 terrenos de ejemplo (residenciales, comerciales,
              agrícolas, etc.)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSeedLands}
              disabled={isSeeding}
              className="w-full"
              size="lg"
            >
              {isSeeding ? "🔄 Insertando..." : "🚀 Insertar Terrenos"}
            </Button>

            {landResults && (
              <div className="space-y-2">
                {landResults.success ? (
                  <div className="space-y-2">
                    <Badge
                      variant="default"
                      className="w-full justify-center py-2"
                    >
                      ✅ {landResults.lands.length} terrenos insertados
                    </Badge>
                    <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                      {landResults.lands.map((land: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between text-xs"
                        >
                          <span className="truncate">{land.name}</span>
                          <span>${land.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Badge
                    variant="destructive"
                    className="w-full justify-center py-2"
                  >
                    ❌ Error: {landResults.error}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📋 Instrucciones</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Haz clic en "Insertar Propiedades" para agregar 10 propiedades de
              ejemplo
            </li>
            <li>
              Haz clic en "Insertar Terrenos" para agregar 8 terrenos de ejemplo
            </li>
            <li>
              Ve a{" "}
              <code className="bg-muted px-1 rounded">
                /search?type=properties
              </code>{" "}
              para ver las propiedades
            </li>
            <li>
              Ve a{" "}
              <code className="bg-muted px-1 rounded">/search?type=lands</code>{" "}
              para ver los terrenos
            </li>
            <li>Prueba los filtros con los nuevos datos</li>
          </ol>
        </CardContent>
      </Card>

      {/* Data Preview */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🏠 Propiedades a insertar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>• Villa Moderna en Cap Cana - $2.5M</div>
              <div>• Penthouse Santo Domingo - $850K</div>
              <div>• Casa Familiar Santiago - $320K</div>
              <div>• Apartamento Bella Vista - $185K</div>
              <div>• Villa Casa de Campo - $4.2M</div>
              <div className="text-muted-foreground">... y 5 más</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🌿 Terrenos a insertar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>• Terreno Residencial Cap Cana - $850K</div>
              <div>• Lote Comercial Santiago - $650K</div>
              <div>• Terreno Agrícola Constanza - $420K</div>
              <div>• Lote Industrial Zona Franca - $750K</div>
              <div>• Terreno Turístico Samaná - $1.2M</div>
              <div className="text-muted-foreground">... y 3 más</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
