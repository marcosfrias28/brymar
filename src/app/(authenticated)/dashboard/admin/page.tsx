"use client";

import {
	ActivityIcon,
	AlertTriangleIcon,
	BellIcon,
	CheckCircleIcon,
	DatabaseIcon,
	KeyIcon,
	MailIcon,
	RefreshCwIcon,
	ServerIcon,
	SettingsIcon,
	ShieldIcon,
	UsersIcon,
	XCircleIcon,
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
import { Switch } from "@/components/ui/switch";
import { getStatsAdapter } from "@/lib/adapters/stats-adapters";

export default function AdminPage() {
	// Mock data for demonstration
	const systemStatus = {
		server: "online",
		database: "online",
		email: "online",
		storage: "warning",
		backup: "online",
	};

	// Mock admin stats data
	const adminData = {
		totalUsers: 156,
		activeUsers: 89,
		systemHealth: 95,
		pendingTasks: 12,
		completedBackups: 24,
		securityAlerts: 3,
	};

	// Generate stats cards using the admin adapter
	const statsAdapter = getStatsAdapter("admin");
	const statsCards = statsAdapter ? statsAdapter.generateStats(adminData) : [];

	// Define filter tabs for admin sections
	const filterTabs = [
		{ label: "Sistema", value: "system" },
		{ label: "Usuarios", value: "users" },
		{ label: "Seguridad", value: "security" },
		{ label: "Configuración", value: "settings" },
	];

	const systemSettings = [
		{
			id: "maintenance",
			label: "Modo de Mantenimiento",
			description: "Activar para realizar mantenimiento del sistema",
			enabled: false,
		},
		{
			id: "registration",
			label: "Registro de Usuarios",
			description: "Permitir que nuevos usuarios se registren",
			enabled: true,
		},
		{
			id: "notifications",
			label: "Notificaciones por Email",
			description: "Enviar notificaciones automáticas por correo",
			enabled: true,
		},
		{
			id: "analytics",
			label: "Recopilación de Analíticas",
			description: "Recopilar datos de uso y rendimiento",
			enabled: true,
		},
		{
			id: "cache",
			label: "Sistema de Caché",
			description: "Habilitar caché para mejorar rendimiento",
			enabled: true,
		},
	];

	const recentActivities = [
		{
			action: "Usuario creado",
			user: "admin@brymar.com",
			timestamp: "Hace 2 horas",
			type: "user",
		},
		{
			action: "Configuración actualizada",
			user: "admin@brymar.com",
			timestamp: "Hace 4 horas",
			type: "config",
		},
		{
			action: "Respaldo completado",
			user: "Sistema",
			timestamp: "Hace 6 horas",
			type: "system",
		},
		{
			action: "Propiedad eliminada",
			user: "agent@brymar.com",
			timestamp: "Hace 8 horas",
			type: "property",
		},
	];

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "online":
				return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
			case "warning":
				return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
			case "offline":
				return <XCircleIcon className="h-4 w-4 text-red-500" />;
			default:
				return <ActivityIcon className="h-4 w-4 text-gray-500" />;
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "online":
				return (
					<Badge className="bg-green-100 text-green-800" variant="default">
						En línea
					</Badge>
				);
			case "warning":
				return (
					<Badge className="bg-yellow-100 text-yellow-800" variant="secondary">
						Advertencia
					</Badge>
				);
			case "offline":
				return <Badge variant="destructive">Fuera de línea</Badge>;
			default:
				return <Badge variant="outline">Desconocido</Badge>;
		}
	};

	const getActivityIcon = (type: string) => {
		switch (type) {
			case "user":
				return <UsersIcon className="h-4 w-4 text-blue-500" />;
			case "config":
				return <SettingsIcon className="h-4 w-4 text-purple-500" />;
			case "system":
				return <ServerIcon className="h-4 w-4 text-green-500" />;
			case "property":
				return <DatabaseIcon className="h-4 w-4 text-orange-500" />;
			default:
				return <ActivityIcon className="h-4 w-4 text-gray-500" />;
		}
	};

	// Handle system refresh
	const handleSystemRefresh = () => {
		// Here you would trigger system status refresh
	};

	return (
		<DashboardPageLayout
			actions={
				<Button onClick={handleSystemRefresh} variant="outline">
					<RefreshCwIcon className="mr-2 h-4 w-4" />
					Actualizar Sistema
				</Button>
			}
			description="Configuración avanzada y gestión del sistema"
			headerExtras={<FilterTabs className="mb-4" tabs={filterTabs} />}
			stats={statsCards}
			statsLoading={false}
			title="Administración del Sistema"
		>
			<div className="space-y-6">
				{/* System Status */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Estado del Sistema</CardTitle>
								<CardDescription>
									Monitoreo en tiempo real de los servicios principales
								</CardDescription>
							</div>
							<Button size="sm" variant="outline">
								<RefreshCwIcon className="mr-2 h-4 w-4" />
								Actualizar
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-5">
							<div className="flex items-center justify-between rounded-lg border p-4">
								<div className="flex items-center gap-3">
									<ServerIcon className="h-5 w-5 text-muted-foreground" />
									<div>
										<p className="font-medium">Servidor</p>
										<p className="text-muted-foreground text-sm">Web Server</p>
									</div>
								</div>
								<div className="flex flex-col items-end gap-1">
									{getStatusIcon(systemStatus.server)}
									{getStatusBadge(systemStatus.server)}
								</div>
							</div>

							<div className="flex items-center justify-between rounded-lg border p-4">
								<div className="flex items-center gap-3">
									<DatabaseIcon className="h-5 w-5 text-muted-foreground" />
									<div>
										<p className="font-medium">Base de Datos</p>
										<p className="text-muted-foreground text-sm">PostgreSQL</p>
									</div>
								</div>
								<div className="flex flex-col items-end gap-1">
									{getStatusIcon(systemStatus.database)}
									{getStatusBadge(systemStatus.database)}
								</div>
							</div>

							<div className="flex items-center justify-between rounded-lg border p-4">
								<div className="flex items-center gap-3">
									<MailIcon className="h-5 w-5 text-muted-foreground" />
									<div>
										<p className="font-medium">Email</p>
										<p className="text-muted-foreground text-sm">SMTP</p>
									</div>
								</div>
								<div className="flex flex-col items-end gap-1">
									{getStatusIcon(systemStatus.email)}
									{getStatusBadge(systemStatus.email)}
								</div>
							</div>

							<div className="flex items-center justify-between rounded-lg border p-4">
								<div className="flex items-center gap-3">
									<DatabaseIcon className="h-5 w-5 text-muted-foreground" />
									<div>
										<p className="font-medium">Almacenamiento</p>
										<p className="text-muted-foreground text-sm">AWS S3</p>
									</div>
								</div>
								<div className="flex flex-col items-end gap-1">
									{getStatusIcon(systemStatus.storage)}
									{getStatusBadge(systemStatus.storage)}
								</div>
							</div>

							<div className="flex items-center justify-between rounded-lg border p-4">
								<div className="flex items-center gap-3">
									<ShieldIcon className="h-5 w-5 text-muted-foreground" />
									<div>
										<p className="font-medium">Respaldos</p>
										<p className="text-muted-foreground text-sm">Automático</p>
									</div>
								</div>
								<div className="flex flex-col items-end gap-1">
									{getStatusIcon(systemStatus.backup)}
									{getStatusBadge(systemStatus.backup)}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* System Settings */}
				<Card>
					<CardHeader>
						<CardTitle>Configuración del Sistema</CardTitle>
						<CardDescription>
							Ajustes generales y configuraciones avanzadas
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							{systemSettings.map((setting) => (
								<div
									className="flex items-center justify-between rounded-lg border p-4"
									key={setting.id}
								>
									<div className="space-y-1">
										<h3 className="font-medium">{setting.label}</h3>
										<p className="text-muted-foreground text-sm">
											{setting.description}
										</p>
									</div>
									<Switch
										checked={setting.enabled}
										onCheckedChange={() => {}}
									/>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Quick Actions & Recent Activity */}
				<div className="grid grid-cols-2 gap-6">
					<Card>
						<CardHeader>
							<CardTitle>Acciones Rápidas</CardTitle>
							<CardDescription>
								Herramientas de administración frecuentes
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button className="w-full justify-start" variant="outline">
								<UsersIcon className="mr-2 h-4 w-4" />
								Gestionar Usuarios
							</Button>
							<Button className="w-full justify-start" variant="outline">
								<DatabaseIcon className="mr-2 h-4 w-4" />
								Respaldo Manual
							</Button>
							<Button className="w-full justify-start" variant="outline">
								<BellIcon className="mr-2 h-4 w-4" />
								Enviar Notificación
							</Button>
							<Button className="w-full justify-start" variant="outline">
								<KeyIcon className="mr-2 h-4 w-4" />
								Gestionar API Keys
							</Button>
							<Button className="w-full justify-start" variant="outline">
								<ActivityIcon className="mr-2 h-4 w-4" />
								Ver Logs del Sistema
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Actividad Reciente</CardTitle>
							<CardDescription>
								Últimas acciones administrativas realizadas
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentActivities.map((activity) => (
									<div
										className="flex items-center gap-3 rounded-lg border p-3"
										key={`${activity.action}-${activity.timestamp}`}
									>
										{getActivityIcon(activity.type)}
										<div className="flex-1">
											<p className="font-medium text-sm">{activity.action}</p>
											<p className="text-muted-foreground text-xs">
												Por {activity.user} • {activity.timestamp}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Security & Permissions */}
				<Card>
					<CardHeader>
						<CardTitle>Seguridad y Permisos</CardTitle>
						<CardDescription>
							Configuración de seguridad y gestión de permisos
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-3">
							<div className="rounded-lg border p-4 text-center">
								<ShieldIcon className="mx-auto mb-2 h-8 w-8 text-green-600" />
								<h3 className="font-medium">SSL Activo</h3>
								<p className="text-muted-foreground text-sm">
									Certificado válido hasta 2025
								</p>
							</div>
							<div className="rounded-lg border p-4 text-center">
								<KeyIcon className="mx-auto mb-2 h-8 w-8 text-blue-600" />
								<h3 className="font-medium">API Keys</h3>
								<p className="text-muted-foreground text-sm">
									5 claves activas
								</p>
							</div>
							<div className="rounded-lg border p-4 text-center">
								<UsersIcon className="mx-auto mb-2 h-8 w-8 text-purple-600" />
								<h3 className="font-medium">Roles</h3>
								<p className="text-muted-foreground text-sm">
									3 roles configurados
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardPageLayout>
	);
}
