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

export default function AdminPage() {
	// Mock data for demonstration
	const systemStatus = {
		server: "online",
		database: "online",
		email: "online",
		storage: "warning",
		backup: "online",
	};

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
					<Badge variant="default" className="bg-green-100 text-green-800">
						En línea
					</Badge>
				);
			case "warning":
				return (
					<Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
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

	return (
		<DashboardPageLayout
			title="Administración del Sistema"
			description="Configuración avanzada y gestión del sistema"
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
							<Button variant="outline" size="sm">
								<RefreshCwIcon className="h-4 w-4 mr-2" />
								Actualizar
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-5">
							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div className="flex items-center gap-3">
									<ServerIcon className="h-5 w-5 text-muted-foreground" />
									<div>
										<p className="font-medium">Servidor</p>
										<p className="text-sm text-muted-foreground">Web Server</p>
									</div>
								</div>
								<div className="flex flex-col items-end gap-1">
									{getStatusIcon(systemStatus.server)}
									{getStatusBadge(systemStatus.server)}
								</div>
							</div>

							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div className="flex items-center gap-3">
									<DatabaseIcon className="h-5 w-5 text-muted-foreground" />
									<div>
										<p className="font-medium">Base de Datos</p>
										<p className="text-sm text-muted-foreground">PostgreSQL</p>
									</div>
								</div>
								<div className="flex flex-col items-end gap-1">
									{getStatusIcon(systemStatus.database)}
									{getStatusBadge(systemStatus.database)}
								</div>
							</div>

							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div className="flex items-center gap-3">
									<MailIcon className="h-5 w-5 text-muted-foreground" />
									<div>
										<p className="font-medium">Email</p>
										<p className="text-sm text-muted-foreground">SMTP</p>
									</div>
								</div>
								<div className="flex flex-col items-end gap-1">
									{getStatusIcon(systemStatus.email)}
									{getStatusBadge(systemStatus.email)}
								</div>
							</div>

							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div className="flex items-center gap-3">
									<DatabaseIcon className="h-5 w-5 text-muted-foreground" />
									<div>
										<p className="font-medium">Almacenamiento</p>
										<p className="text-sm text-muted-foreground">AWS S3</p>
									</div>
								</div>
								<div className="flex flex-col items-end gap-1">
									{getStatusIcon(systemStatus.storage)}
									{getStatusBadge(systemStatus.storage)}
								</div>
							</div>

							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div className="flex items-center gap-3">
									<ShieldIcon className="h-5 w-5 text-muted-foreground" />
									<div>
										<p className="font-medium">Respaldos</p>
										<p className="text-sm text-muted-foreground">Automático</p>
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
									key={setting.id}
									className="flex items-center justify-between p-4 border rounded-lg"
								>
									<div className="space-y-1">
										<h3 className="font-medium">{setting.label}</h3>
										<p className="text-sm text-muted-foreground">
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
				<div className="grid gap-6 grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Acciones Rápidas</CardTitle>
							<CardDescription>
								Herramientas de administración frecuentes
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button className="w-full justify-start" variant="outline">
								<UsersIcon className="h-4 w-4 mr-2" />
								Gestionar Usuarios
							</Button>
							<Button className="w-full justify-start" variant="outline">
								<DatabaseIcon className="h-4 w-4 mr-2" />
								Respaldo Manual
							</Button>
							<Button className="w-full justify-start" variant="outline">
								<BellIcon className="h-4 w-4 mr-2" />
								Enviar Notificación
							</Button>
							<Button className="w-full justify-start" variant="outline">
								<KeyIcon className="h-4 w-4 mr-2" />
								Gestionar API Keys
							</Button>
							<Button className="w-full justify-start" variant="outline">
								<ActivityIcon className="h-4 w-4 mr-2" />
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
										key={`${activity.action}-${activity.timestamp}`}
										className="flex items-center gap-3 p-3 border rounded-lg"
									>
										{getActivityIcon(activity.type)}
										<div className="flex-1">
											<p className="text-sm font-medium">{activity.action}</p>
											<p className="text-xs text-muted-foreground">
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
							<div className="text-center p-4 border rounded-lg">
								<ShieldIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
								<h3 className="font-medium">SSL Activo</h3>
								<p className="text-sm text-muted-foreground">
									Certificado válido hasta 2025
								</p>
							</div>
							<div className="text-center p-4 border rounded-lg">
								<KeyIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
								<h3 className="font-medium">API Keys</h3>
								<p className="text-sm text-muted-foreground">
									5 claves activas
								</p>
							</div>
							<div className="text-center p-4 border rounded-lg">
								<UsersIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
								<h3 className="font-medium">Roles</h3>
								<p className="text-sm text-muted-foreground">
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
