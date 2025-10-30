"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
	Bell,
	BellOff,
	Check,
	CheckCheck,
	Filter,
	Search,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useProfileNotifications } from "@/hooks/use-profile";
// Profile actions need to be implemented in DDD structure
// import {
//   markNotificationAsReadAction,
//   markAllNotificationsAsReadAction,
// } from "@/presentation/server-actions/profile-actions";
import { useUser } from "@/hooks/use-user";

type FilterType = "all" | "unread" | "read";
type NotificationType = "all" | "success" | "error" | "info" | "warning";

export function ProfileNotifications() {
	const { user } = useUser();
	const { notifications, loading, markAsRead, markAllAsRead } =
		useProfileNotifications();
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState<FilterType>("all");
	const [notificationType, setNotificationType] =
		useState<NotificationType>("all");
	const [processingIds, setProcessingIds] = useState<string[]>([]);
	const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
	const [_isDeletingAll, setIsDeletingAll] = useState(false);

	const filteredNotifications = notifications.filter((notification) => {
		const matchesSearch =
			notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			notification.message.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesReadStatus =
			filterType === "all" ||
			(filterType === "read" && notification.read) ||
			(filterType === "unread" && !notification.read);

		const matchesType =
			notificationType === "all" || notification.type === notificationType;

		return matchesSearch && matchesReadStatus && matchesType;
	});

	const unreadCount = notifications.filter((n) => !n.read).length;

	const handleMarkAsRead = async (notificationId: string) => {
		if (!user?.id) {
			return;
		}

		setProcessingIds((prev) => [...prev, notificationId]);

		try {
			const formData = new FormData();
			formData.append("userId", user.id);
			formData.append("notificationId", notificationId);
			// Mark notification as read functionality needs to be implemented in DDD structure
			toast.error(
				"La funcionalidad de marcar notificación como leída debe implementarse en la estructura DDD"
			);
			return;
		} catch (_error) {
			toast.error("Error al actualizar la notificación");
		} finally {
			setProcessingIds((prev) => prev.filter((id) => id !== notificationId));
		}
	};

	const handleMarkAllAsRead = async () => {
		if (!user?.id) {
			return;
		}

		setIsMarkingAllRead(true);

		try {
			const formData = new FormData();
			formData.append("userId", user.id);
			// Mark all notifications as read functionality needs to be implemented in DDD structure
			toast.error(
				"La funcionalidad de marcar todas como leídas debe implementarse en la estructura DDD"
			);
			return;
		} catch (_error) {
			toast.error("Error al actualizar las notificaciones");
		} finally {
			setIsMarkingAllRead(false);
		}
	};

	const handleDeleteNotification = async (notificationId: string) => {
		setProcessingIds((prev) => [...prev, notificationId]);

		try {
			// Simulazione eliminazione notifica
			await new Promise((resolve) => setTimeout(resolve, 1000));
			toast.success("Notificación eliminada con éxito");
		} catch (_error) {
			toast.error("Error al eliminar la notificación");
		} finally {
			setProcessingIds((prev) => prev.filter((id) => id !== notificationId));
		}
	};

	const handleDeleteAll = async () => {
		setIsDeletingAll(true);

		try {
			// Simulazione eliminazione tutte le notifiche
			await new Promise((resolve) => setTimeout(resolve, 1500));
			toast.success("Todas las notificaciones han sido eliminadas");
		} catch (_error) {
			toast.error("Error al eliminar las notificaciones");
		} finally {
			setIsDeletingAll(false);
		}
	};

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "success":
				return "✅";
			case "error":
				return "❌";
			case "info":
				return "ℹ️";
			case "warning":
				return "⚠️";
			default:
				return "📝";
		}
	};

	const getNotificationColor = (type: string) => {
		switch (type) {
			case "success":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			case "error":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
			case "info":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			case "warning":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	const getNotificationLabel = (type: string) => {
		switch (type) {
			case "success":
				return "Éxito";
			case "error":
				return "Error";
			case "info":
				return "Información";
			case "warning":
				return "Aviso";
			default:
				return type;
		}
	};

	if (loading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<div className="w-full animate-pulse space-y-4">
						{[...new Array(4)].map((_, i) => (
							<div className="h-20 rounded-lg bg-muted" key={i} />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Encabezado con acciones y filtros */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<Bell className="h-5 w-5" />
							<CardTitle>Notificaciones</CardTitle>
							<Badge variant="secondary">{notifications.length}</Badge>
							{unreadCount > 0 && (
								<Badge variant="destructive">{unreadCount} no leídas</Badge>
							)}
						</div>

						<div className="flex items-center space-x-2">
							{unreadCount > 0 && (
								<Button
									disabled={isMarkingAllRead}
									onClick={handleMarkAllAsRead}
									size="sm"
									variant="outline"
								>
									<CheckCheck className="mr-2 h-4 w-4" />
									Marcar todas como leídas
								</Button>
							)}

							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										disabled={notifications.length === 0}
										size="sm"
										variant="outline"
									>
										<Trash2 className="mr-2 h-4 w-4" />
										Eliminar todas
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Eliminar todas las notificaciones
										</AlertDialogTitle>
										<AlertDialogDescription>
											¿Estás seguro de eliminar todas las notificaciones? Esta
											acción no se puede deshacer.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancelar</AlertDialogCancel>
										<AlertDialogAction
											className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
											onClick={handleDeleteAll}
										>
											Eliminar todas
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					</div>

					<CardDescription>
						Gestiona tus notificaciones y preferencias
					</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="flex flex-col gap-4 lg:flex-row">
						<div className="relative flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input
								className="pl-10"
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Buscar en notificaciones..."
								value={searchTerm}
							/>
						</div>

						<Select
							onValueChange={(value: FilterType) => setFilterType(value)}
							value={filterType}
						>
							<SelectTrigger className="w-full lg:w-[150px]">
								<Filter className="mr-2 h-4 w-4" />
								<SelectValue placeholder="Estado" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todas</SelectItem>
								<SelectItem value="unread">No leídas</SelectItem>
								<SelectItem value="read">Leídas</SelectItem>
							</SelectContent>
						</Select>

						<Select
							onValueChange={(value: NotificationType) =>
								setNotificationType(value)
							}
							value={notificationType}
						>
							<SelectTrigger className="w-full lg:w-[150px]">
								<Bell className="mr-2 h-4 w-4" />
								<SelectValue placeholder="Tipo" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los tipos</SelectItem>
								<SelectItem value="success">Éxito</SelectItem>
								<SelectItem value="error">Error</SelectItem>
								<SelectItem value="info">Información</SelectItem>
								<SelectItem value="warning">Aviso</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Lista de notificaciones */}
			{filteredNotifications.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<BellOff className="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">
							{searchTerm || filterType !== "all" || notificationType !== "all"
								? "No se encontraron notificaciones"
								: "Sin notificaciones"}
						</h3>
						<p className="max-w-md text-center text-muted-foreground">
							{searchTerm || filterType !== "all" || notificationType !== "all"
								? "Prueba a ajustar los filtros para encontrar las notificaciones que buscas."
								: "Tus notificaciones aparecerán aquí cuando las recibas."}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{filteredNotifications.map((notification, index) => (
						<Card
							className={`transition-all hover:shadow-md ${
								notification.read
									? ""
									: "border-l-4 border-l-primary bg-muted/30"
							}`}
							key={notification.id}
						>
							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div className="flex flex-1 items-start space-x-4">
										<div className="flex-shrink-0">
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
												{getNotificationIcon(notification.type)}
											</div>
										</div>

										<div className="min-w-0 flex-1">
											<div className="mb-1 flex items-center space-x-2">
												<h3
													className={`font-semibold ${
														notification.read
															? "text-muted-foreground"
															: "text-foreground"
													}`}
												>
													{notification.title}
												</h3>
												<Badge
													className={getNotificationColor(notification.type)}
												>
													{getNotificationLabel(notification.type)}
												</Badge>
												{!notification.read && (
													<Badge className="text-xs" variant="destructive">
														Nuevo
													</Badge>
												)}
											</div>

											<p
												className={`mb-2 text-sm ${
													notification.read
														? "text-muted-foreground"
														: "text-foreground"
												}`}
											>
												{notification.message}
											</p>

											<p className="text-muted-foreground text-xs">
												{formatDistanceToNow(new Date(notification.createdAt), {
													addSuffix: true,
													locale: es,
												})}
											</p>
										</div>
									</div>

									<div className="ml-4 flex items-center space-x-2">
										{!notification.read && (
											<Button
												disabled={processingIds.includes(notification.id)}
												onClick={() => handleMarkAsRead(notification.id)}
												size="sm"
												variant="outline"
											>
												<Check className="h-4 w-4" />
											</Button>
										)}

										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													disabled={processingIds.includes(notification.id)}
													size="sm"
													variant="outline"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														Eliminar notificación
													</AlertDialogTitle>
													<AlertDialogDescription>
														¿Estás seguro de eliminar esta notificación? Esta
														acción no se puede deshacer.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancelar</AlertDialogCancel>
													<AlertDialogAction
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														onClick={() =>
															handleDeleteNotification(notification.id)
														}
													>
														Eliminar
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							</CardContent>

							{index < filteredNotifications.length - 1 && <Separator />}
						</Card>
					))}
				</div>
			)}

			{/* Estadísticas */}
			{notifications.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">
							Estadísticas de Notificaciones
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-5">
							<div className="text-center">
								<div className="font-bold text-2xl text-primary">
									{notifications.length}
								</div>
								<div className="text-muted-foreground text-sm">Total</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-2xl text-red-600">
									{unreadCount}
								</div>
								<div className="text-muted-foreground text-sm">No leídas</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-2xl text-green-600">
									{notifications.filter((n) => n.type === "success").length}
								</div>
								<div className="text-muted-foreground text-sm">Éxito</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-2xl text-red-600">
									{notifications.filter((n) => n.type === "error").length}
								</div>
								<div className="text-muted-foreground text-sm">Error</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-2xl text-blue-600">
									{notifications.filter((n) => n.type === "info").length}
								</div>
								<div className="text-muted-foreground text-sm">Info</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
