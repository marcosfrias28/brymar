"use client";

import {
	AlertTriangleIcon,
	CheckCircleIcon,
	ClockIcon,
	DatabaseIcon,
	DownloadIcon,
	RefreshCwIcon,
	UploadIcon,
} from "lucide-react";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getStatsAdapter } from "@/lib/adapters/stats-adapters";

export default function DatabasePage() {
	// Mock data for demonstration
	const databaseStats = {
		totalSize: "2.4 GB",
		usedSpace: 68,
		totalTables: 15,
		totalRecords: 45_672,
		lastBackup: "2024-01-15 14:30",
		status: "healthy",
	};

	// Handle action button click
	const handleUpdateData = () => {
		// You could show a toast notification, trigger a data refresh, etc.
	};

	// Stats generated via adapter for database management
	const dbAdapter = getStatsAdapter("database");
	const statsCards = dbAdapter
		? dbAdapter.generateStats({
				totalSize: databaseStats.totalSize,
				usedSpace: databaseStats.usedSpace,
				totalTables: databaseStats.totalTables,
				connections: 42,
			})
		: [];

	// Define filter tabs for database sections
	const filterTabs = [
		{ label: "Resumen", value: "overview" },
		{ label: "Tablas", value: "tables" },
		{ label: "Respaldos", value: "backups" },
		{ label: "Rendimiento", value: "performance" },
	];

	const tables = [
		{ name: "properties", records: 1234, size: "456 MB", status: "healthy" },
		{ name: "users", records: 567, size: "89 MB", status: "healthy" },
		{ name: "lands", records: 890, size: "234 MB", status: "healthy" },
		{ name: "blog_posts", records: 123, size: "67 MB", status: "healthy" },
		{ name: "categories", records: 45, size: "12 MB", status: "healthy" },
		{
			name: "property_images",
			records: 5678,
			size: "1.2 GB",
			status: "warning",
		},
		{ name: "user_favorites", records: 2345, size: "34 MB", status: "healthy" },
		{
			name: "wizard_analytics",
			records: 12_345,
			size: "156 MB",
			status: "healthy",
		},
	];

	const recentBackups = [
		{
			date: "2024-01-15 14:30",
			type: "Automático",
			size: "2.4 GB",
			status: "success",
		},
		{
			date: "2024-01-14 14:30",
			type: "Automático",
			size: "2.3 GB",
			status: "success",
		},
		{
			date: "2024-01-13 14:30",
			type: "Manual",
			size: "2.3 GB",
			status: "success",
		},
		{
			date: "2024-01-12 14:30",
			type: "Automático",
			size: "2.2 GB",
			status: "success",
		},
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
				return (
					<Badge className="bg-green-100 text-green-800" variant="default">
						Saludable
					</Badge>
				);
			case "warning":
				return (
					<Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
						Advertencia
					</Badge>
				);
			case "error":
				return <Badge variant="destructive">Error</Badge>;
			default:
				return <Badge variant="outline">Desconocido</Badge>;
		}
	};

	return (
		<DashboardPageLayout
			actions={
				<Button onClick={handleUpdateData} variant="outline">
					<RefreshCwIcon className="mr-2 h-4 w-4" />
					Actualizar Datos
				</Button>
			}
			description="Monitorea el estado, rendimiento y respaldos de la base de datos"
			headerExtras={<FilterTabs className="mb-4" tabs={filterTabs} />}
			stats={statsCards}
			statsLoading={false}
			title="Gestión de Base de Datos"
		>
			<div className="space-y-6">
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
							<Button size="sm" variant="outline">
								<RefreshCwIcon className="mr-2 h-4 w-4" />
								Actualizar
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{tables.map((table) => (
								<div
									className="flex items-center justify-between rounded-lg border p-4"
									key={table.name}
								>
									<div className="flex items-center gap-4">
										<DatabaseIcon className="h-5 w-5 text-muted-foreground" />
										<div>
											<h3 className="font-medium">{table.name}</h3>
											<p className="text-muted-foreground text-sm">
												{table.records.toLocaleString()} registros •{" "}
												{table.size}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										{getStatusBadge(table.status)}
										<Button size="sm" variant="ghost">
											Ver detalles
										</Button>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Backup Management */}
				<div className="grid gap-6 xl:grid-cols-2">
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
									<DownloadIcon className="mr-2 h-4 w-4" />
									Crear Respaldo
								</Button>
								<Button className="flex-1" variant="outline">
									<UploadIcon className="mr-2 h-4 w-4" />
									Restaurar
								</Button>
							</div>

							<div className="space-y-2">
								<h4 className="font-medium text-sm">
									Configuración Automática
								</h4>
								<div className="space-y-1 text-muted-foreground text-sm">
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
								{recentBackups.map((backup) => (
									<div
										className="flex items-center justify-between rounded-lg border p-3"
										key={`${backup.date}-${backup.type}`}
									>
										<div>
											<p className="font-medium text-sm">{backup.date}</p>
											<p className="text-muted-foreground text-xs">
												{backup.type} • {backup.size}
											</p>
										</div>
										<div className="flex items-center gap-2">
											{getStatusIcon(backup.status)}
											<Button size="sm" variant="ghost">
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
						<div className="grid gap-4 xl:grid-cols-3">
							<div className="rounded-lg border p-4 text-center">
								<h3 className="font-bold text-2xl text-green-600">98.5%</h3>
								<p className="text-muted-foreground text-sm">
									Tiempo de actividad
								</p>
							</div>
							<div className="rounded-lg border p-4 text-center">
								<h3 className="font-bold text-2xl text-blue-600">45ms</h3>
								<p className="text-muted-foreground text-sm">
									Tiempo de respuesta promedio
								</p>
							</div>
							<div className="rounded-lg border p-4 text-center">
								<h3 className="font-bold text-2xl text-purple-600">1,234</h3>
								<p className="text-muted-foreground text-sm">
									Consultas por minuto
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardPageLayout>
	);
}
