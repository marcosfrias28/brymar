"use client";

import {
	ArrowLeft,
	Bell,
	Database,
	Globe,
	Home,
	Key,
	Palette,
	Settings,
	Shield,
	User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";
import { updateUserProfileAction } from "@/lib/actions/auth";
import { getStatsAdapter } from "@/lib/adapters/stats-adapters";
import { cn } from "@/lib/utils";

const rolePermissions = {
	admin: {
		label: "Administrador",
		description: "Acceso completo a todas las funciones",
		color: "bg-red-500",
		permissions: ["all"],
	},
	agent: {
		label: "Agente",
		description: "Puede gestionar propiedades y terrenos",
		color: "bg-blue-500",
		permissions: ["properties", "lands", "blog_read"],
	},
	viewer: {
		label: "Visualizador",
		description: "Solo puede ver información",
		color: "bg-gray-500",
		permissions: ["read_only"],
	},
};

export default function SettingsPage() {
	const [language, setLanguage] = useState("es");
	const formId = useId();
	const nameId = useId();
	const emailId = useId();

	const { user, loading: userLoading } = useUser();
	const [updateState, updateUserFormAction] = useActionState(
		updateUserProfileAction,
		{
			success: false,
			error: undefined,
		}
	);
	const [formData, setFormData] = useState<{
		name: string;
		email: string;
		role: string;
	}>({
		name: user?.name || "",
		email: user?.email || "",
		role: user?.role || "user",
	});
	const [notifications, setNotifications] = useState({
		email: true,
		push: false,
		marketing: true,
		security: true,
	});
	const [theme, setTheme] = useState("light");

	// Mock settings stats data for the adapter
	const settingsStatsData = {
		profileCompleteness: 85,
		securityScore: 92,
		notificationsEnabled: Object.values(notifications).filter(Boolean).length,
		totalSettings: 12,
		lastUpdated: "2024-01-15",
		activePermissions: user
			? rolePermissions[user.role as keyof typeof rolePermissions]?.permissions
					.length || 0
			: 0,
	};

	// Generate stats cards using the profile adapter (settings is profile-related)
	const statsAdapter = getStatsAdapter("profile");
	const statsCards = statsAdapter
		? statsAdapter.generateStats(settingsStatsData)
		: [];

	// Define filter tabs for settings sections
	const _filterTabs = [
		{ label: "Perfil", value: "profile" },
		{ label: "Permisos", value: "permissions" },
		{ label: "Notificaciones", value: "notifications" },
		{ label: "Sistema", value: "system" },
	];

	const actions = (
		<Link href="/dashboard">
			<Button
				className={cn(
					"text-arsenic",
					"hover:text-arsenic/80",
					"focus-visible:outline-none",
					"focus-visible:ring-2",
					"focus-visible:ring-arsenic/50"
				)}
				size="sm"
				variant="link"
			>
				<ArrowLeft className="h-4 w-4" />
				Volver al Dashboard
			</Button>
		</Link>
	);

	// Update form data when user loads
	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name || "",
				email: user.email || "",
				role: user.role || "user",
			});
		}
	}, [user]);

	// Handle update action state
	useEffect(() => {
		if (updateState.success) {
			toast.success("Usuario actualizado exitosamente");
		} else if (updateState.error) {
			toast.error(updateState.error);
		}
	}, [updateState]);

	if (userLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse">
					<div className="mb-2 h-8 w-1/4 rounded bg-gray-200" />
					<div className="h-4 w-1/2 rounded bg-gray-200" />
				</div>
			</div>
		);
	}

	if (!(user || userLoading)) {
		return (
			<div className="space-y-6">
				<div className="text-red-600">Error: No se pudo cargar el usuario</div>
			</div>
		);
	}

	const currentRole = user
		? rolePermissions[user.role as keyof typeof rolePermissions]
		: null;

	const breadcrumbs = [
		{ label: "Dashboard", href: "/dashboard", icon: Home },
		{ label: "Configuración", icon: Settings },
	];

	// Handle save settings
	const _handleSaveSettings = () => {
		toast.success("Configuración guardada correctamente");
	};

	return (
		<RouteGuard requiredPermission="settings.view">
			<DashboardPageLayout
				actions={actions}
				breadcrumbs={breadcrumbs}
				description="Gestiona tu perfil y preferencias del sistema"
				stats={statsCards}
				statsLoading={false}
				title="Configuración"
			>
				<div className="space-y-6">
					<Tabs className="space-y-6" defaultValue="profile">
						<TabsList className="grid w-full grid-cols-2 tablet:grid-cols-4">
							<TabsTrigger className="flex items-center gap-2" value="profile">
								<UserIcon className="h-4 w-4" />
								Perfil
							</TabsTrigger>
							<TabsTrigger
								className="flex items-center gap-2"
								value="permissions"
							>
								<Shield className="h-4 w-4" />
								Permisos
							</TabsTrigger>
							<TabsTrigger
								className="flex items-center gap-2"
								value="notifications"
							>
								<Bell className="h-4 w-4" />
								Notificaciones
							</TabsTrigger>
							<TabsTrigger className="flex items-center gap-2" value="system">
								<Globe className="h-4 w-4" />
								Sistema
							</TabsTrigger>
						</TabsList>

						{/* Profile Tab */}
						<TabsContent className="space-y-6" value="profile">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<UserIcon className="h-5 w-5" />
										Información Personal
									</CardTitle>
									<CardDescription>
										Actualiza tu información de perfil y datos de contacto
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Profile Picture */}
									<div className="flex items-center gap-4">
										<Avatar className="h-20 w-20">
											<AvatarImage
												alt={user?.name || "Usuario"}
												src={user?.avatar || "/placeholder.svg"}
											/>
											<AvatarFallback className="text-lg">
												{(user?.name || "Usuario")
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div>
											<Button size="sm" variant="outline">
												Cambiar Foto
											</Button>
											<p className="mt-1 text-blackCoral/70 text-sm">
												JPG, PNG o GIF. Máximo 2MB.
											</p>
										</div>
									</div>

									<Separator />

									{/* Form Fields */}
									<form action={updateUserFormAction} id={formId}>
										<div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor={nameId}>Nombre Completo</Label>
												<Input
													id={nameId}
													name="name"
													onChange={(e) =>
														setFormData({ ...formData, name: e.target.value })
													}
													value={formData.name || ""}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor={emailId}>Correo Electrónico</Label>
												<Input
													id={emailId}
													name="email"
													onChange={(e) =>
														setFormData({ ...formData, email: e.target.value })
													}
													type="email"
													value={formData.email}
												/>
											</div>
										</div>
									</form>

									<div className="flex justify-end">
										<Button
											className="bg-arsenic hover:bg-blackCoral"
											disabled={
												updateState.success === undefined
													? false
													: !(updateState.success || updateState.error)
											}
											form="profile-form"
											type="submit"
										>
											Guardar Cambios
										</Button>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Permissions Tab */}
						<TabsContent className="space-y-6" value="permissions">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Shield className="h-5 w-5" />
										Rol y Permisos
									</CardTitle>
									<CardDescription>
										Tu rol determina qué acciones puedes realizar en el sistema
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Current Role */}
									<div className="flex items-center justify-between rounded-lg border p-4">
										<div className="flex items-center gap-3">
											<div
												className={`h-3 w-3 rounded-full ${
													currentRole?.color || "bg-gray-400"
												}`}
											/>
											<div>
												<h3 className="font-semibold">
													{currentRole?.label || "Rol desconocido"}
												</h3>
												<p className="text-blackCoral/70 text-sm">
													{currentRole?.description || "Sin descripción"}
												</p>
											</div>
										</div>
										<Badge variant="secondary">Rol Actual</Badge>
									</div>

									<Separator />

									{/* Permissions List - Commented out as permissions are not available in current User model */}
									{/* 
              <div className="space-y-4">
                <h4 className="font-semibold">Permisos Actuales</h4>
                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                  {user && Object.entries(user.permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
                      <Badge variant={value ? "default" : "secondary"}>{value ? "Permitido" : "Denegado"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              */}

									{/* Role Comparison */}
									<div className="space-y-4">
										<h4 className="font-semibold">Comparación de Roles</h4>
										<div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
											{Object.entries(rolePermissions).map(
												([roleKey, role]) => (
													<Card
														className={
															user?.role === roleKey
																? "ring-2 ring-arsenic"
																: ""
														}
														key={roleKey}
													>
														<CardContent className="p-4">
															<div className="mb-2 flex items-center gap-2">
																<div
																	className={`h-3 w-3 rounded-full ${role.color}`}
																/>
																<h5 className="font-semibold">{role.label}</h5>
															</div>
															<p className="mb-3 text-blackCoral/70 text-sm">
																{role.description}
															</p>
															<div className="space-y-1">
																{role.permissions.map((permission) => (
																	<Badge
																		className="text-xs"
																		key={permission}
																		variant="outline"
																	>
																		{permission}
																	</Badge>
																))}
															</div>
														</CardContent>
													</Card>
												)
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Notifications Tab */}
						<TabsContent className="space-y-6" value="notifications">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Bell className="h-5 w-5" />
										Preferencias de Notificación
									</CardTitle>
									<CardDescription>
										Configura cómo y cuándo quieres recibir notificaciones
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									{Object.entries(notifications).map(([key, value]) => (
										<div
											className="flex items-center justify-between"
											key={key}
										>
											<div>
												<Label className="text-base capitalize" htmlFor={key}>
													{key === "email" && "Notificaciones por Email"}
													{key === "push" && "Notificaciones Push"}
													{key === "marketing" && "Emails de Marketing"}
													{key === "security" && "Alertas de Seguridad"}
												</Label>
												<p className="text-blackCoral/70 text-sm">
													{key === "email" &&
														"Recibe actualizaciones importantes por correo"}
													{key === "push" &&
														"Notificaciones en tiempo real en el navegador"}
													{key === "marketing" &&
														"Ofertas especiales y novedades"}
													{key === "security" &&
														"Alertas sobre actividad sospechosa"}
												</p>
											</div>
											<Switch
												checked={value}
												id={key}
												onCheckedChange={(checked) =>
													setNotifications({ ...notifications, [key]: checked })
												}
											/>
										</div>
									))}
								</CardContent>
							</Card>
						</TabsContent>

						{/* System Tab */}
						<TabsContent className="space-y-6" value="system">
							<div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
								{/* Language Settings */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Globe className="h-5 w-5" />
											Idioma
										</CardTitle>
									</CardHeader>
									<CardContent>
										<Select onValueChange={setLanguage} value={language}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="es">Español</SelectItem>
												<SelectItem value="en">English</SelectItem>
											</SelectContent>
										</Select>
									</CardContent>
								</Card>

								{/* Theme Settings */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Palette className="h-5 w-5" />
											Tema
										</CardTitle>
									</CardHeader>
									<CardContent>
										<Select onValueChange={setTheme} value={theme}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="light">Claro</SelectItem>
												<SelectItem value="dark">Oscuro</SelectItem>
												<SelectItem value="system">Sistema</SelectItem>
											</SelectContent>
										</Select>
									</CardContent>
								</Card>
							</div>

							{/* Security Section */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Key className="h-5 w-5" />
										Seguridad
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<Button
										className="w-full justify-start bg-transparent"
										variant="outline"
									>
										Cambiar Contraseña
									</Button>
									<Button
										className="w-full justify-start bg-transparent"
										variant="outline"
									>
										Configurar Autenticación de Dos Factores
									</Button>
									<Button
										className="w-full justify-start bg-transparent"
										variant="outline"
									>
										Ver Sesiones Activas
									</Button>
								</CardContent>
							</Card>

							{/* Data Management */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Database className="h-5 w-5" />
										Gestión de Datos
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<Button
										className="w-full justify-start bg-transparent"
										variant="outline"
									>
										Exportar Mis Datos
									</Button>
									<Button
										className="w-full justify-start bg-transparent"
										variant="outline"
									>
										Descargar Historial de Actividad
									</Button>
									<Separator />
									<Button className="w-full" variant="destructive">
										Eliminar Cuenta
									</Button>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</DashboardPageLayout>
		</RouteGuard>
	);
}
