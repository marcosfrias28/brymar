"use client";

import {
	Loader2,
	Mail,
	Save,
	Settings,
	Shield,
	User,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { getUserPreferences } from "@/lib/utils/user-helpers";
import { getUserProfile, updateProfileAction } from "@/lib/actions/profile-actions";
import { AvatarUpload } from "./avatar-upload";
import Link from "next/link";

// TODO: Move UserPreferences type to lib/types
// import { UserPreferences } from "@/lib/types/user";

const initialState = {
	success: false,
	message: "",
	error: undefined,
};

interface ProfileSectionProps {
	title: string;
	description: string;
	icon: React.ReactNode;
	children: React.ReactNode;
}

function ProfileSection({
	title,
	description,
	icon,
	children,
}: ProfileSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{icon}
					{title}
				</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}


export function ProfileForm() {
	const { user } = useUser();
	const queryClient = useQueryClient();
	const [userProfile, setUserProfile] = useState<any>(null);

	// Use useActionState for form handling
	const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

	// Get user preferences using helper function
	const preferences = user ? getUserPreferences(user) : null;

	// Load user profile data
	useEffect(() => {
		if (user?.id) {
			getUserProfile(user.id).then(setUserProfile);
		}
	}, [user?.id]);

	// Refetch user data after successful profile update
	useEffect(() => {
		if (state.success === true) {
			// Remove auth queries to force refetch according to auth provider rules
			queryClient.removeQueries({ queryKey: ["auth"] });
			// Also remove currentUser specifically
			queryClient.removeQueries({ queryKey: ["auth", "currentUser"] });
			// Force refetch immediately
			queryClient.refetchQueries({ queryKey: ["auth", "currentUser"] });
		}
	}, [state, queryClient]);

	const formatDate = (date: string | Date | null | undefined) => {
		if (!date) return "No especificado";
		const dateObj = date instanceof Date ? date : new Date(date);
		return dateObj.toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getRoleColor = (role: string | null | undefined) => {
		switch (role) {
			case "admin":
				return "bg-red-100 text-red-800";
			case "editor":
				return "bg-blue-100 text-blue-800";
			case "user":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (!user) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="h-8 w-8 animate-spin" />
				<span className="ml-2">Cargando perfil...</span>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Avatar className="h-20 w-20">
								<AvatarImage src={user.avatar || ""} alt={user.name || ""} />
								<AvatarFallback className="text-lg">
									{user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
								</AvatarFallback>
							</Avatar>
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									{user.name}
								</h1>
								<p className="text-gray-600">{user.email}</p>
								<div className="flex items-center gap-2 mt-2">
									<Badge className={getRoleColor(user.role)}>
										{user.role || "user"}
									</Badge>
									{user.emailVerified ? (
										<Badge
											className="text-green-600 border-green-600 bg-green-50"
										>
											✓ Verificado
										</Badge>
									) : (
										<Link href={`/verify-email?email=${user.email}`}>
											<Badge className="text-red-600 border-red-600 bg-red-50">
												✗ No verificado
											</Badge>
										</Link>
									)}
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{state.error && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="pt-6">
						<p className="text-red-600">{state.error}</p>
					</CardContent>
				</Card>
			)}

			{state.success && state.message && (
				<Card className="border-green-200 bg-green-50">
					<CardContent className="pt-6">
						<p className="text-green-600">{state.message}</p>
					</CardContent>
				</Card>
			)}

			<form id="profile-form" action={formAction} className="space-y-6">
				<ProfileSection
					title="Información Personal"
					description="Datos básicos de tu perfil"
					icon={<User className="h-5 w-5" />}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<Label htmlFor="name">Nombre Completo</Label>
							<Input
								id="name"
								name="name"
								type="text"
								defaultValue={user?.name || ""}
								placeholder="Tu nombre completo"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Correo Electrónico</Label>
							<Input
								id="email"
								name="email"
								type="email"
								defaultValue={user?.email || ""}
								placeholder="tu@email.com"
								required
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<AvatarUpload
								label="Avatar"
								name="avatar"
								defaultValue={user?.avatar || ""}
								error={state.error}
							/>
						</div>
					</div>
				</ProfileSection>

				<ProfileSection
					title="Información de Cuenta"
					description="Detalles de tu cuenta y configuración"
					icon={<Shield className="h-5 w-5" />}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<Label htmlFor="userId">ID de Usuario</Label>
							<Input
								id="userId"
								name="userId"
								type="text"
								value={user.id}
								disabled
								className="bg-muted"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role">Rol</Label>
							<Input
								id="role"
								name="role"
								type="text"
								value={user.role || "user"}
								disabled
								className="bg-muted"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="emailStatus">Estado de Email</Label>
							<Input
								id="emailStatus"
								name="emailStatus"
								type="text"
								value={user.emailVerified ? "Verificado" : "No verificado"}
								disabled
								className="bg-muted"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="createdAt">Fecha de Creación</Label>
							<Input
								id="createdAt"
								name="createdAt"
								type="text"
								value={formatDate(user.createdAt)}
								disabled
								className="bg-muted"
							/>
						</div>
						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="updatedAt">Última Actualización</Label>
							<Input
								id="updatedAt"
								name="updatedAt"
								type="text"
								value={formatDate(user.updatedAt)}
								disabled
								className="bg-muted"
							/>
						</div>
					</div>
				</ProfileSection>

				<ProfileSection
					title="Información Adicional"
					description="Datos complementarios de tu perfil"
					icon={<Mail className="h-5 w-5" />}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<Label htmlFor="firstName">Primer Nombre</Label>
							<Input
								id="firstName"
								name="firstName"
								type="text"
								defaultValue={userProfile?.firstName || user?.firstName || ""}
								placeholder="Tu primer nombre"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="lastName">Apellido</Label>
							<Input
								id="lastName"
								name="lastName"
								type="text"
								defaultValue={userProfile?.lastName || user?.lastName || ""}
								placeholder="Tu apellido"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone">Teléfono</Label>
							<Input
								id="phone"
								name="phone"
								type="tel"
								defaultValue={userProfile?.phone || user?.phone || ""}
								placeholder="Tu número de teléfono"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="location">Ubicación</Label>
							<Input
								id="location"
								name="location"
								type="text"
								defaultValue={userProfile?.location || user?.location || ""}
								placeholder="Tu ubicación"
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="website">Sitio Web</Label>
							<Input
								id="website"
								name="website"
								type="url"
								defaultValue={userProfile?.website || ""}
								placeholder="https://tu-sitio-web.com"
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="bio">Biografía</Label>
							<Textarea
								id="bio"
								name="bio"
								defaultValue={userProfile?.bio || user?.bio || ""}
								placeholder="Cuéntanos sobre ti"
								rows={4}
							/>
						</div>
					</div>
				</ProfileSection>

				<ProfileSection
					title="Preferencias"
					description="Configuración de notificaciones y privacidad"
					icon={<Settings className="h-5 w-5" />}
				>
					<div className="space-y-6">
						<div>
							<h4 className="text-sm font-medium text-gray-900 mb-3">
								Notificaciones
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="emailNotifications">Email</Label>
									<div className="flex items-center space-x-2">
										<Switch
											id="emailNotifications"
											name="emailNotifications"
											defaultChecked={preferences?.notifications?.email || false}
										/>
										<span className="text-sm text-muted-foreground">
											{preferences?.notifications?.email ? "Activado" : "Desactivado"}
										</span>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="pushNotifications">Push</Label>
									<div className="flex items-center space-x-2">
										<Switch
											id="pushNotifications"
											name="pushNotifications"
											defaultChecked={preferences?.notifications?.push || false}
										/>
										<span className="text-sm text-muted-foreground">
											{preferences?.notifications?.push ? "Activado" : "Desactivado"}
										</span>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="marketingNotifications">Marketing</Label>
									<div className="flex items-center space-x-2">
										<Switch
											id="marketingNotifications"
											name="marketingNotifications"
											defaultChecked={preferences?.notifications?.marketing || false}
										/>
										<span className="text-sm text-muted-foreground">
											{preferences?.notifications?.marketing ? "Activado" : "Desactivado"}
										</span>
									</div>
								</div>
							</div>
						</div>

						<div>
							<h4 className="text-sm font-medium text-gray-900 mb-3">
								Privacidad
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="profileVisible">Perfil Visible</Label>
									<Select
										name="profileVisible"
										defaultValue={preferences?.privacy?.profileVisible ? "public" : "private"}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="public">Público</SelectItem>
											<SelectItem value="private">Privado</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="showEmail">Mostrar Email</Label>
									<Select
										name="showEmail"
										defaultValue={preferences?.privacy?.showEmail ? "visible" : "hidden"}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="visible">Visible</SelectItem>
											<SelectItem value="hidden">Oculto</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="showPhone">Mostrar Teléfono</Label>
									<Select
										name="showPhone"
										defaultValue={preferences?.privacy?.showPhone ? "visible" : "hidden"}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="visible">Visible</SelectItem>
											<SelectItem value="hidden">Oculto</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						<div>
							<h4 className="text-sm font-medium text-gray-900 mb-3">
								Configuración de Pantalla
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="theme">Tema</Label>
									<Select
										name="theme"
										defaultValue={preferences?.display?.theme || "system"}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="light">Claro</SelectItem>
											<SelectItem value="dark">Oscuro</SelectItem>
											<SelectItem value="system">Sistema</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="language">Idioma</Label>
									<Select
										name="language"
										defaultValue={preferences?.display?.language || "es"}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="es">Español</SelectItem>
											<SelectItem value="en">English</SelectItem>
											<SelectItem value="fr">Français</SelectItem>
											<SelectItem value="de">Deutsch</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="currency">Moneda</Label>
									<Select
										name="currency"
										defaultValue={preferences?.display?.currency || "USD"}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="USD">USD ($)</SelectItem>
											<SelectItem value="EUR">EUR (€)</SelectItem>
											<SelectItem value="GBP">GBP (£)</SelectItem>
											<SelectItem value="MXN">MXN ($)</SelectItem>
											<SelectItem value="COP">COP ($)</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					</div>
				</ProfileSection>

				<div className="flex justify-end pt-6">
					<Button
						type="submit"
						disabled={isPending}
						className="flex items-center gap-2"
					>
						{isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Save className="h-4 w-4" />
						)}
						{isPending ? "Guardando..." : "Guardar Cambios"}
					</Button>
				</div>
			</form>
		</div>
	);
}
