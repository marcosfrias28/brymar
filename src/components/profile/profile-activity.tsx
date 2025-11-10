"use client";

import { format, isToday, isYesterday, subDays } from "date-fns";
import { es } from "date-fns/locale";
import {
	Activity,
	Calendar,
	Eye,
	EyeOff,
	Filter,
	RefreshCw,
	Search,
} from "lucide-react";
import { useState } from "react";
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
import { useProfileActivity } from "@/hooks/use-profile";

type FilterType =
	| "all"
	| "view"
	| "favorite"
	| "search"
	| "contact"
	| "message"
	| "login"
	| "profile"
	| "favorites"
	| "settings";
type TimeFilter = "all" | "today" | "week" | "month";

export function ProfileActivity() {
	const { activities, loading, refresh } = useProfileActivity();
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState<FilterType>("all");
	const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
	const [showDetails, setShowDetails] = useState<string[]>([]);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const toggleDetails = (activityId: string) => {
		setShowDetails((prev) =>
			prev.includes(activityId)
				? prev.filter((id) => id !== activityId)
				: [...prev, activityId]
		);
	};

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await refresh();
		} finally {
			setIsRefreshing(false);
		}
	};

	const filteredActivities = activities.filter((activity) => {
		const matchesSearch =
			activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			activity.details?.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesType = filterType === "all" || activity.type === filterType;

		const activityDate = new Date(activity.timestamp);
		let matchesTime = true;

		switch (timeFilter) {
			case "today":
				matchesTime = isToday(activityDate);
				break;
			case "week":
				matchesTime = activityDate >= subDays(new Date(), 7);
				break;
			case "month":
				matchesTime = activityDate >= subDays(new Date(), 30);
				break;
			default:
				matchesTime = true;
		}

		return matchesSearch && matchesType && matchesTime;
	});

	const getActivityIcon = (type: string) => {
		switch (type) {
			case "view":
				return "👁️";
			case "favorite":
			case "favorites":
				return "❤️";
			case "search":
				return "🔍";
			case "contact":
				return "👥";
			case "message":
				return "💬";
			case "login":
				return "🔐";
			case "profile":
				return "👤";
			case "settings":
				return "⚙️";
			default:
				return "📝";
		}
	};

	const getActivityColor = (type: string) => {
		switch (type) {
			case "view":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			case "favorite":
			case "favorites":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
			case "search":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			case "contact":
				return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
			case "message":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
			case "login":
				return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
			case "profile":
				return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300";
			case "settings":
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	const getActivityLabel = (type: string) => {
		switch (type) {
			case "view":
				return "Visualización";
			case "favorite":
			case "favorites":
				return "Favoritos";
			case "search":
				return "Búsqueda";
			case "contact":
				return "Contacto";
			case "message":
				return "Mensaje";
			case "login":
				return "Acceso";
			case "profile":
				return "Perfil";
			case "settings":
				return "Configuración";
			default:
				return type;
		}
	};

	const _formatDate = (date: Date) => {
		if (isToday(date)) {
			return `Hoy a las ${format(date, "HH:mm")}`;
		}
		if (isYesterday(date)) {
			return `Ayer a las ${format(date, "HH:mm")}`;
		}
		return format(date, "dd MMMM yyyy \\a\\ \\l\\a\\s HH:mm", { locale: es });
	};

	const groupActivitiesByDate = (activities: typeof filteredActivities) => {
		const groups: { [key: string]: typeof activities } = {};

		activities.forEach((activity) => {
			const date = new Date(activity.timestamp);
			let key: string;

			if (isToday(date)) {
				key = "Hoy";
			} else if (isYesterday(date)) {
				key = "Ayer";
			} else {
				key = format(date, "dd MMMM yyyy", { locale: es });
			}

			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(activity);
		});

		return groups;
	};

	if (loading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<div className="w-full animate-pulse space-y-4">
						{[...new Array(5)].map((_, i) => (
							<div className="h-16 rounded-lg bg-muted" key={i} />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const groupedActivities = groupActivitiesByDate(filteredActivities);

	return (
		<div className="space-y-6">
			{/* Encabezado con búsqueda y filtros */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center space-x-2">
								<Activity className="h-5 w-5" />
								<span>Actividad Reciente</span>
								<Badge variant="secondary">{activities.length}</Badge>
							</CardTitle>
							<CardDescription>
								Historial de tus actividades en la plataforma
							</CardDescription>
						</div>
						<Button
							className="flex items-center space-x-2"
							disabled={isRefreshing || loading}
							onClick={handleRefresh}
							size="sm"
							variant="outline"
						>
							<RefreshCw
								className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
							/>
							<span>Actualizar</span>
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4 lg:flex-row">
						<div className="relative flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input
								className="pl-10"
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Buscar en actividades..."
								value={searchTerm}
							/>
						</div>
						<Select
							onValueChange={(value: FilterType) => setFilterType(value)}
							value={filterType}
						>
							<SelectTrigger className="w-full lg:w-[180px]">
								<Filter className="mr-2 h-4 w-4" />
								<SelectValue placeholder="Filtrar por tipo" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los tipos</SelectItem>
								<SelectItem value="view">Visualizaciones</SelectItem>
								<SelectItem value="favorite">Favoritos</SelectItem>
								<SelectItem value="search">Búsquedas</SelectItem>
								<SelectItem value="contact">Contactos</SelectItem>
								<SelectItem value="message">Mensajes</SelectItem>
								<SelectItem value="login">Accesos</SelectItem>
								<SelectItem value="profile">Perfil</SelectItem>
								<SelectItem value="favorites">Favoritos</SelectItem>
								<SelectItem value="settings">Configuración</SelectItem>
							</SelectContent>
						</Select>
						<Select
							onValueChange={(value: TimeFilter) => setTimeFilter(value)}
							value={timeFilter}
						>
							<SelectTrigger className="w-full lg:w-[180px]">
								<Calendar className="mr-2 h-4 w-4" />
								<SelectValue placeholder="Periodo" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todo el periodo</SelectItem>
								<SelectItem value="today">Hoy</SelectItem>
								<SelectItem value="week">Última semana</SelectItem>
								<SelectItem value="month">Último mes</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Lista de actividades */}
			{Object.keys(groupedActivities).length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Activity className="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">
							{searchTerm || filterType !== "all" || timeFilter !== "all"
								? "No se encontraron actividades"
								: "Aún no hay actividades"}
						</h3>
						<p className="max-w-md text-center text-muted-foreground">
							{searchTerm || filterType !== "all" || timeFilter !== "all"
								? "Prueba a ajustar los filtros para encontrar las actividades que buscas."
								: "Tus actividades en la plataforma aparecerán aquí."}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-6">
					{Object.entries(groupedActivities).map(([date, activities]) => (
						<Card key={date}>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center space-x-2 text-lg">
									<Calendar className="h-4 w-4" />
									<span>{date}</span>
									<Badge variant="outline">{activities.length}</Badge>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{activities.map((activity, index) => (
										<div key={activity.id}>
											<div className="flex items-start space-x-4">
												<div className="flex-shrink-0">
													<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
														{getActivityIcon(activity.type)}
													</div>
												</div>

												<div className="min-w-0 flex-1">
													<div className="flex items-center justify-between">
														<div className="flex items-center space-x-2">
															<p className="font-medium text-foreground text-sm">
																{activity.title}
															</p>
															<Badge
																className={getActivityColor(activity.type)}
															>
																{getActivityLabel(activity.type)}
															</Badge>
														</div>

														<div className="flex items-center space-x-2">
															<span className="text-muted-foreground text-xs">
																{format(new Date(activity.timestamp), "HH:mm")}
															</span>
															{activity.details && (
																<Button
																	onClick={() => toggleDetails(activity.id)}
																	size="sm"
																	variant="ghost"
																>
																	{showDetails.includes(activity.id) ? (
																		<EyeOff className="h-4 w-4" />
																	) : (
																		<Eye className="h-4 w-4" />
																	)}
																</Button>
															)}
														</div>
													</div>

													{activity.details &&
														showDetails.includes(activity.id) && (
															<div className="mt-2 rounded-lg bg-muted p-3">
																<p className="text-muted-foreground text-sm">
																	{activity.details}
																</p>
															</div>
														)}

													<p className="mt-1 text-muted-foreground text-xs">
														{activity.description}
													</p>
												</div>
											</div>

											{index < activities.length - 1 && (
												<Separator className="mt-4" />
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Estadísticas */}
			{activities.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Estadísticas de Actividad</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
							<div className="text-center">
								<div className="font-bold text-2xl text-primary">
									{activities.length}
								</div>
								<div className="text-muted-foreground text-sm">Total</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-2xl text-green-600">
									{activities.filter((a) => a.type === "login").length}
								</div>
								<div className="text-muted-foreground text-sm">Accesos</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-2xl text-blue-600">
									{activities.filter((a) => a.type === "profile").length}
								</div>
								<div className="text-muted-foreground text-sm">Perfil</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-2xl text-red-600">
									{activities.filter((a) => a.type === "favorites").length}
								</div>
								<div className="text-muted-foreground text-sm">Favoritos</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-2xl text-purple-600">
									{activities.filter((a) => a.type === "settings").length}
								</div>
								<div className="text-muted-foreground text-sm">
									Configuración
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
