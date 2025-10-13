"use client";

import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { searchLandsAction } from '@/app/actions/land-actions';

export default function DebugLandsPage() {
  const [dbLands, setDbLands] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkDatabase = async () => {
    try {
      const response = await fetch("/api/check-lands");
      const data = await response.json();
      setDbLands(data);

      if (data.success) {
        toast.success(`✅ ${data.count} terrenos en la base de datos`);
      } else {
        toast.error(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      toast.error("❌ Error de conexión");
    }
  };

  const testSearch = async () => {
    setIsLoading(true);
    try {
      // Test search with empty filters
      const formData = new FormData();
      const result = await searchLandsAction(formData);

      setSearchResults(result);

      if (result.success) {
        toast.success(
          `✅ Búsqueda exitosa: ${result.data?.total || 0} terrenos`
        );
      } else {
        toast.error(`❌ Error en búsqueda: ${result.error}`);
      }
    } catch (error) {
      toast.error(`❌ Error: ${error}`);
      setSearchResults({ success: false, error: `${error}` });
    }
    setIsLoading(false);
  };

  const insertTestLand = async () => {
    try {
      const response = await fetch("/api/seed-lands", { method: "POST" });
      const data = await response.json();

      if (data.success) {
        toast.success(`✅ ${data.lands.length} terrenos insertados`);
        // Refresh database check
        checkDatabase();
      } else {
        toast.error(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      toast.error("❌ Error de conexión");
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Debug: Búsqueda de Terrenos</CardTitle>
          <p className="text-muted-foreground">
            Página de diagnóstico para verificar por qué no aparecen terrenos
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-4">
            <Button onClick={checkDatabase} variant="outline">
              🔍 Verificar DB
            </Button>
            <Button onClick={testSearch} disabled={isLoading}>
              {isLoading ? "🔄 Buscando..." : "🔎 Probar Búsqueda"}
            </Button>
            <Button onClick={insertTestLand} variant="secondary">
              🌱 Insertar Terrenos
            </Button>
          </div>

          {/* Database Results */}
          {dbLands && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  📊 Datos en Base de Datos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dbLands.success ? (
                  <div className="space-y-2">
                    <Badge variant="default">
                      {dbLands.count} terrenos en la base de datos
                    </Badge>
                    {dbLands.lands.length > 0 && (
                      <div className="space-y-1 text-sm">
                        {dbLands.lands.map((land: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between p-2 border rounded"
                          >
                            <span>{land.name}</span>
                            <span className="text-muted-foreground">
                              {land.type} - {land.area}m² - $
                              {land.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Badge variant="destructive">❌ Error: {dbLands.error}</Badge>
                )}
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {searchResults && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  🔎 Resultados de Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent>
                {searchResults.success ? (
                  <div className="space-y-2">
                    <Badge variant="default">
                      ✅ Búsqueda exitosa: {searchResults.data?.total || 0}{" "}
                      terrenos encontrados
                    </Badge>
                    {searchResults.data?.lands &&
                      searchResults.data.lands.length > 0 && (
                        <div className="space-y-1 text-sm">
                          {searchResults.data.lands.map(
                            (land: any, index: number) => (
                              <div
                                key={index}
                                className="flex justify-between p-2 border rounded"
                              >
                                <span>{land.name}</span>
                                <span className="text-muted-foreground">
                                  {land.type} - {land.area}m²
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Badge variant="destructive">
                      ❌ Error en búsqueda: {searchResults.error}
                    </Badge>
                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(searchResults, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <a href="/search?type=properties" target="_blank">
                🏠 Ver Propiedades
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/search?type=lands" target="_blank">
                🌿 Ver Terrenos
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
