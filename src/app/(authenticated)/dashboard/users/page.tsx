"use client";

import {
	FilterIcon,
	MailIcon,
	MoreVerticalIcon,
	PlusIcon,
	SearchIcon,
	ShieldIcon,
	UserCheckIcon,
	UserIcon,
} from "lucide-react";
import { FilterTabs } from "@/components/dashboard/filter-tabs";
import { StatsCards } from "@/components/dashboard/stats-cards";
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
import { getStatsAdapter } from "@/lib/adapters/stats-adapters";

export default function UsersPage() {
	// Mock data for demonstration
	const users = [
		{
			id: "1",
			name: "Juan Pérez",
			email: "juan.perez@example.com",
			role: "admin",
			status: "active",
			avatar: null,
			lastLogin: "2024-01-15",
			properties: 12,
		},
		{
			id: "2",
			name: "María García",
			email: "maria.garcia@example.com",
			role: "agent",
			status: "active",
			avatar: null,
			lastLogin: "2024-01-14",
			properties: 8,
		},
		{
			id: "3",
			name: "Carlos López",
			email: "carlos.lopez@example.com",
			role: "user",
			status: "inactive",
			avatar: null,
			lastLogin: "2024-01-10",
			properties: 3,
		},
		{
			id: "4",
			name: "Ana Martínez",
			email: "ana.martinez@example.com",
			role: "agent",
			status: "active",
			avatar: null,
			lastLogin: "2024-01-15",
			properties: 15,
		},
	];

	// Mock users stats data for the adapter
	const usersStatsData = {
		totalUsers: users.length,
		activeUsers: users.filter((u) => u.status === "active").length,
		adminUsers: users.filter((u) => u.role === "admin").length,
		agentUsers: users.filter((u) => u.role === "agent").length,
		newUsersThisMonth: 2,
		totalProperties: users.reduce((sum, user) => sum + user.properties, 0),
	};

	// Generate stats cards using the users adapter
	const statsAdapter = getStatsAdapter("users");
	const statsCards = statsAdapter
		? statsAdapter.generateStats(usersStatsData)
		: [];

	// Define filter tabs for users sections
	const filterTabs = [
		{ label: "Todos", value: "all" },
		{ label: "Administradores", value: "admin" },
		{ label: "Agentes", value: "agent" },
		{ label: "Usuarios", value: "user" },
		{ label: "Activos", value: "active" },
		{ label: "Inactivos", value: "inactive" },
	];

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case "admin":
				return "destructive";
			case "agent":
				return "default";
			case "user":
				return "secondary";
			default:
				return "outline";
		}
	};

	const getStatusBadgeVariant = (status: string) =>
		status === "active" ? "default" : "secondary";

	const getRoleIcon = (role: string) => {
		switch (role) {
			case "admin":
				return ShieldIcon;
			case "agent":
				return UserCheckIcon;
			default:
				return UserIcon;
		}
	};

	// Handle new user creation
	const handleNewUser = () => {
		// Here you would navigate to user creation page or open modal
	};

	const actions = (
		<Button onClick={handleNewUser} size="sm">
			<PlusIcon className="mr-2 h-4 w-4" />
			Nuevo Usuario
		</Button>
	);

	return (
		<DashboardPageLayout
			actions={actions}
			description="Administra usuarios, roles y permisos de la plataforma"
			headerExtras={
				<div className="space-y-4">
					<StatsCards className="mb-4" isLoading={false} stats={statsCards} />
					<FilterTabs className="mb-4" tabs={filterTabs} />
				</div>
			}
			title="Gestión de Usuarios"
		>
			<div className="space-y-6">
				{/* Header Actions */}
				<div className="flex flex-col justify-between gap-4 sm:flex-row">
					<div className="flex gap-2">
						<div className="relative flex-1 sm:max-w-sm">
							<SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input className="pl-10" placeholder="Buscar usuarios..." />
						</div>
						<Button size="icon" variant="outline">
							<FilterIcon className="h-4 w-4" />
						</Button>
					</div>
					<Button>
						<PlusIcon className="mr-2 h-4 w-4" />
						Invitar Usuario
					</Button>
				</div>

				{/* Users Table */}
				<Card>
					<CardHeader>
						<CardTitle>Lista de Usuarios</CardTitle>
						<CardDescription>
							Gestiona los usuarios registrados en la plataforma
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{users.map((user) => {
								const RoleIcon = getRoleIcon(user.role);
								return (
									<div
										className="flex items-center justify-between rounded-lg border p-4"
										key={user.id}
									>
										<div className="flex items-center gap-4">
											<Avatar className="h-10 w-10">
												<AvatarImage src={user.avatar || undefined} />
												<AvatarFallback>
													{user.name
														.split(" ")
														.map((n) => n[0])
														.join("")
														.toUpperCase()}
												</AvatarFallback>
											</Avatar>

											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<h3 className="font-medium">{user.name}</h3>
													<Badge
														className="text-xs"
														variant={getRoleBadgeVariant(user.role)}
													>
														<RoleIcon className="mr-1 h-3 w-3" />
														{user.role}
													</Badge>
													<Badge
														className="text-xs"
														variant={getStatusBadgeVariant(user.status)}
													>
														{user.status === "active" ? "Activo" : "Inactivo"}
													</Badge>
												</div>
												<div className="flex items-center gap-4 text-muted-foreground text-sm">
													<div className="flex items-center gap-1">
														<MailIcon className="h-3 w-3" />
														{user.email}
													</div>
													<span>•</span>
													<span>{user.properties} propiedades</span>
													<span>•</span>
													<span>Último acceso: {user.lastLogin}</span>
												</div>
											</div>
										</div>

										<div className="flex items-center gap-2">
											<Button size="sm" variant="outline">
												Editar
											</Button>
											<Button size="icon" variant="ghost">
												<MoreVerticalIcon className="h-4 w-4" />
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>

				{/* Role Management */}
				<Card>
					<CardHeader>
						<CardTitle>Gestión de Roles</CardTitle>
						<CardDescription>
							Configura los permisos y accesos por rol
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-3">
							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<ShieldIcon className="h-5 w-5 text-red-500" />
									<h3 className="font-medium">Administrador</h3>
								</div>
								<p className="mb-3 text-muted-foreground text-sm">
									Acceso completo a todas las funciones
								</p>
								<ul className="space-y-1 text-muted-foreground text-xs">
									<li>• Gestión de usuarios</li>
									<li>• Analytics completos</li>
									<li>• Configuración del sistema</li>
									<li>• Gestión de propiedades</li>
								</ul>
							</div>

							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<UserCheckIcon className="h-5 w-5 text-blue-500" />
									<h3 className="font-medium">Agente</h3>
								</div>
								<p className="mb-3 text-muted-foreground text-sm">
									Gestión de propiedades y terrenos
								</p>
								<ul className="space-y-1 text-muted-foreground text-xs">
									<li>• Crear propiedades</li>
									<li>• Gestionar terrenos</li>
									<li>• Ver analytics básicos</li>
									<li>• Acceso al dashboard</li>
								</ul>
							</div>

							<div className="rounded-lg border p-4">
								<div className="mb-2 flex items-center gap-2">
									<UserIcon className="h-5 w-5 text-gray-500" />
									<h3 className="font-medium">Usuario</h3>
								</div>
								<p className="mb-3 text-muted-foreground text-sm">
									Acceso básico a funciones públicas
								</p>
								<ul className="space-y-1 text-muted-foreground text-xs">
									<li>• Ver propiedades</li>
									<li>• Gestionar perfil</li>
									<li>• Favoritos</li>
									<li>• Búsquedas</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</DashboardPageLayout>
	);
}
