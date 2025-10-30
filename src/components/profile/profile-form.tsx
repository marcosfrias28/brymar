"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Save, Settings, Shield, User } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
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
import { useFormChanges } from "@/hooks/use-form-changes";
import { useUser } from "@/hooks/use-user";
import {
	getUserProfile,
	updateProfileAction,
} from "@/lib/actions/profile-actions";
import { getUserPreferences } from "@/lib/utils/user-helpers";
import { AvatarUpload } from "./avatar-upload";

// TODO: Move UserPreferences type to lib/types
// import { UserPreferences } from "@/lib/types/user";

const initialState = {
	success: false,
	message: "",
	error: undefined,
};

type ProfileSectionProps = {
	title: string;
	description: string;
	icon: React.ReactNode;
	children: React.ReactNode;
};

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
	const [state, formAction, isPending] = useActionState(
		updateProfileAction,
		initialState
	);

	// Use form changes detection hook
	const { formRef, hasChanges, resetChanges, notifyChange } = useFormChanges({
		debounceMs: 150,
		autoReset: true,
	});

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
			// Reset changes state after successful save
			resetChanges();
		}
	}, [state, queryClient, resetChanges]);

	const formatDate = (date: string | Date | null | undefined) => {
		if (!date) {
			return "No especificado";
		}
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
		<div className="relative space-y-6">
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="relative">
								<Avatar className="h-20 w-20">
									<AvatarImage alt={user.name || ""} src={user.avatar || ""} />
									<AvatarFallback className="text-lg">
										{user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
									</AvatarFallback>
								</Avatar>
								<div className="-bottom-2 -right-2 absolute">
									<AvatarUpload
										compact={true}
										defaultValue={user?.avatar || ""}
										error={state.error}
										label=""
										name="avatar"
										onFileChange={() => notifyChange()}
									/>
								</div>
							</div>
							<div>
								<h1 className="font-bold text-2xl text-foreground">
									{user.name}
								</h1>
								<p className="text-gray-600">{user.email}</p>
								<div className="mt-2 flex items-center gap-2">
									<Badge className={getRoleColor(user.role)}>
										{user.role || "user"}
									</Badge>
									{user.emailVerified ? (
										<Badge className="border-green-600 bg-green-50 text-green-600">
											✓ Verificado
										</Badge>
									) : (
										<Link href={`/verify-email?email=${user.email}`}>
											<Badge className="border-red-600 bg-red-50 text-red-600">
												✗ No verificado
											</Badge>
										</Link>
									)}
								</div>
							</div>
						</div>
						<div className="flex justify-end pt-6">
							<Button
								className="flex items-center gap-2"
								disabled={isPending || !hasChanges}
								type="submit"
							>
								{isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Save className="h-4 w-4" />
								)}
								{isPending
									? "Guardando..."
									: hasChanges
										? "Guardar Cambios"
										: "Sin Cambios"}
							</Button>
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

			<form
				action={formAction}
				className="space-y-6"
				id="profile-form"
				ref={formRef}
			>
				<ProfileSection
					description="Datos básicos de tu perfil"
					icon={<User className="h-5 w-5" />}
					title="Información Personal"
				>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="name">Nombre Completo</Label>
							<Input
								defaultValue={user?.name || ""}
								id="name"
								name="name"
								placeholder="Tu nombre completo"
								required
								type="text"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Correo Electrónico</Label>
							<Input
								defaultValue={user?.email || ""}
								id="email"
								name="email"
								placeholder="tu@email.com"
								required
								type="email"
							/>
						</div>
					</div>
				</ProfileSection>

				<ProfileSection
					description="Detalles de tu cuenta y configuración"
					icon={<Shield className="h-5 w-5" />}
					title="Información de Cuenta"
				>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="userId">ID de Usuario</Label>
							<Input
								className="bg-muted"
								disabled
								id="userId"
								name="userId"
								type="text"
								value={user.id}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="role">Rol</Label>
							<Input
								className="bg-muted"
								disabled
								id="role"
								name="role"
								type="text"
								value={user.role || "user"}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="emailStatus">Estado de Email</Label>
							<Input
								className="bg-muted"
								disabled
								id="emailStatus"
								name="emailStatus"
								type="text"
								value={user.emailVerified ? "Verificado" : "No verificado"}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="createdAt">Fecha de Creación</Label>
							<Input
								className="bg-muted"
								disabled
								id="createdAt"
								name="createdAt"
								type="text"
								value={formatDate(user.createdAt)}
							/>
						</div>
						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="updatedAt">Última Actualización</Label>
							<Input
								className="bg-muted"
								disabled
								id="updatedAt"
								name="updatedAt"
								type="text"
								value={formatDate(user.updatedAt)}
							/>
						</div>
					</div>
				</ProfileSection>

				<ProfileSection
					description="Datos complementarios de tu perfil"
					icon={<Mail className="h-5 w-5" />}
					title="Información Adicional"
				>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="firstName">Primer Nombre</Label>
							<Input
								defaultValue={userProfile?.firstName || user?.firstName || ""}
								id="firstName"
								name="firstName"
								placeholder="Tu primer nombre"
								type="text"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="lastName">Apellido</Label>
							<Input
								defaultValue={userProfile?.lastName || user?.lastName || ""}
								id="lastName"
								name="lastName"
								placeholder="Tu apellido"
								type="text"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="phone">Teléfono</Label>
							<Input
								defaultValue={userProfile?.phone || user?.phone || ""}
								id="phone"
								name="phone"
								placeholder="Tu número de teléfono"
								type="tel"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="location">Ubicación</Label>
							<Input
								defaultValue={userProfile?.location || user?.location || ""}
								id="location"
								name="location"
								placeholder="Tu ubicación"
								type="text"
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="website">Sitio Web</Label>
							<Input
								defaultValue={userProfile?.website || ""}
								id="website"
								name="website"
								placeholder="https://tu-sitio-web.com"
								type="url"
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="bio">Biografía</Label>
							<Textarea
								defaultValue={userProfile?.bio || user?.bio || ""}
								id="bio"
								name="bio"
								placeholder="Cuéntanos sobre ti"
								rows={4}
							/>
						</div>
					</div>
				</ProfileSection>

				<ProfileSection
					description="Configuración de notificaciones y privacidad"
					icon={<Settings className="h-5 w-5" />}
					title="Preferencias"
				>
					<div className="space-y-6">
						<div>
							<h4 className="mb-3 font-medium text-gray-900 text-sm">
								Notificaciones
							</h4>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div className="space-y-2">
									<Label htmlFor="emailNotifications">Email</Label>
									<div className="flex items-center space-x-2">
										<Switch
											defaultChecked={preferences?.notifications?.email}
											id="emailNotifications"
											name="emailNotifications"
										/>
										<span className="text-muted-foreground text-sm">
											{preferences?.notifications?.email
												? "Activado"
												: "Desactivado"}
										</span>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="pushNotifications">Push</Label>
									<div className="flex items-center space-x-2">
										<Switch
											defaultChecked={preferences?.notifications?.push}
											id="pushNotifications"
											name="pushNotifications"
										/>
										<span className="text-muted-foreground text-sm">
											{preferences?.notifications?.push
												? "Activado"
												: "Desactivado"}
										</span>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="marketingNotifications">Marketing</Label>
									<div className="flex items-center space-x-2">
										<Switch
											defaultChecked={preferences?.notifications?.marketing}
											id="marketingNotifications"
											name="marketingNotifications"
										/>
										<span className="text-muted-foreground text-sm">
											{preferences?.notifications?.marketing
												? "Activado"
												: "Desactivado"}
										</span>
									</div>
								</div>
							</div>
						</div>

						<div>
							<h4 className="mb-3 font-medium text-gray-900 text-sm">
								Privacidad
							</h4>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div className="space-y-2">
									<Label htmlFor="profileVisible">Perfil Visible</Label>
									<Select
										defaultValue={
											preferences?.privacy?.profileVisible
												? "public"
												: "private"
										}
										name="profileVisible"
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
										defaultValue={
											preferences?.privacy?.showEmail ? "visible" : "hidden"
										}
										name="showEmail"
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
										defaultValue={
											preferences?.privacy?.showPhone ? "visible" : "hidden"
										}
										name="showPhone"
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
							<h4 className="mb-3 font-medium text-gray-900 text-sm">
								Configuración de Pantalla
							</h4>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div className="space-y-2">
									<Label htmlFor="theme">Tema</Label>
									<Select
										defaultValue={preferences?.display?.theme || "system"}
										name="theme"
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
										defaultValue={preferences?.display?.language || "es"}
										name="language"
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
										defaultValue={preferences?.display?.currency || "USD"}
										name="currency"
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
						className="flex items-center gap-2"
						disabled={isPending || !hasChanges}
						type="submit"
					>
						{isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Save className="h-4 w-4" />
						)}
						{isPending
							? "Guardando..."
							: hasChanges
								? "Guardar Cambios"
								: "Sin Cambios"}
					</Button>
				</div>
			</form>
		</div>
	);
}
