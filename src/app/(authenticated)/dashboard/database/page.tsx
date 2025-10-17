"use client";

import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DatabaseIcon, 
  ServerIcon, 
  HardDriveIcon,
  ActivityIcon,
  RefreshCwIcon,
  DownloadIcon,
  UploadIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from "lucide-react";

export default function DatabasePage() {
  // Mock data for demonstration
  const databaseStats = {
    totalSize: "2.4 GB",
    usedSpace: 68,
    totalTables: 15,
    totalRecords: 45672,
    lastBackup: "2024-01-15 14:30",
    status: "healthy"
  };

  const tables = [
    { name: "properties", records: 1234, size: "456 MB", status: "healthy" },
    { name: "users", records: 567, size: "89 MB", status: "healthy" },
    { name: "lands", records: 890, size: "234 MB", status: "healthy" },
    { name: "blog_posts", records: 123, size: "67 MB", status: "healthy" },
    { name: "categories", records: 45, size: "12 MB", status: "healthy" },
    { name: "property_images", records: 5678, size: "1.2 GB", status: "warning" },
    { name: "user_favorites", records: 2345, size: "34 MB", status: "healthy" },
    { name: "wizard_analytics", records: 12345, size: "156 MB", status: "healthy" }
  ];

  const recentBackups = [
    { date: "2024-01-15 14:30", type: "Automático", size: "2.4 GB", status: "success" },
    { date: "2024-01-14 14:30", type: "Automático", size: "2.3 GB", status: "success" },
    { date: "2024-01-13 14:30", type: "Manual", size: "2.3 GB", status: "success" },
    { date: "2024-01-12 14:30", type: "Automático", size: "2.2 GB", status: "success" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge variant="default" className="bg-green-100 text-green-800">Saludable</Badge>;
      case "warning":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Advertencia</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  return (
    <DashboardPageLayout
      title="Gestión de Base de Datos"
      description="Monitorea el estado, rendimiento y respaldos de la base de datos"
    >
      <div className="space-y-6">
        {/* Database Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamaño Total</CardTitle>
              <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{databaseStats.totalSize}</div>
              <div className="mt-2">
                <Progress value={databaseStats.usedSpace} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {databaseStats.usedSpace}% utilizado
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tablas</CardTitle>
              <ServerIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{databaseStats.totalTables}</div>
              <p className="text-xs text-muted-foreground">
                Tablas activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registros</CardTitle>
              <HardDriveIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{databaseStats.totalRecords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total de registros
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getStatusIcon(databaseStats.status)}
                <span className="text-sm font-medium">Saludable</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Último respaldo: {databaseStats.lastBackup}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tables Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Estado de las Tablas</CardTitle>
                <CardDescription>
                  Información detallada sobre cada tabla de la base de datos
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tables.map((table) => (
                <div key={table.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <DatabaseIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{table.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {table.records.toLocaleString()} registros • {table.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(table.status)}
                    <Button variant="ghost" size="sm">
                      Ver detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Backup Management */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Respaldos</CardTitle>
              <CardDescription>
                Crear y gestionar respaldos de la base de datos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button className="flex-1">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Crear Respaldo
                </Button>
                <Button variant="outline" className="flex-1">
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Restaurar
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Configuración Automática</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Respaldo diario a las 14:30</p>
                  <p>• Retención: 30 días</p>
                  <p>• Ubicación: AWS S3</p>
                  <p>• Compresión: Habilitada</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Respaldos Recientes</CardTitle>
              <CardDescription>
                Historial de respaldos realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentBackups.map((backup, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{backup.date}</p>
                      <p className="text-xs text-muted-foreground">
                        {backup.type} • {backup.size}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(backup.status)}
                      <Button variant="ghost" size="sm">
                        Descargar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Rendimiento</CardTitle>
            <CardDescription>
              Estadísticas de rendimiento de la base de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="text-2xl font-bold text-green-600">98.5%</h3>
                <p className="text-sm text-muted-foreground">Tiempo de actividad</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="text-2xl font-bold text-blue-600">45ms</h3>
                <p className="text-sm text-muted-foreground">Tiempo de respuesta promedio</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="text-2xl font-bold text-purple-600">1,234</h3>
                <p className="text-sm text-muted-foreground">Consultas por minuto</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardPageLayout>
  );
}