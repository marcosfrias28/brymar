"use client";

import { format, isToday, isYesterday, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { Activity, Calendar, Eye, EyeOff, Filter, RefreshCw, Search } from "lucide-react";
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
				: [...prev, activityId],
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
				return "Visualizzazione";
			case "favorite":
			case "favorites":
				return "Preferiti";
			case "search":
				return "Ricerca";
			case "contact":
				return "Contatto";
			case "message":
				return "Messaggio";
			case "login":
				return "Accesso";
			case "profile":
				return "Profilo";
			case "settings":
				return "Impostazioni";
			default:
				return type;
		}
	};

	const _formatDate = (date: Date) => {
		if (isToday(date)) {
			return `Oggi alle ${format(date, "HH:mm")}`;
		}
		if (isYesterday(date)) {
			return `Ieri alle ${format(date, "HH:mm")}`;
		}
		return format(date, "dd MMMM yyyy \\a\\l\\l\\e HH:mm", { locale: it });
	};

	const groupActivitiesByDate = (activities: typeof filteredActivities) => {
		const groups: { [key: string]: typeof activities } = {};

		activities.forEach((activity) => {
			const date = new Date(activity.timestamp);
			let key: string;

			if (isToday(date)) {
				key = "Oggi";
			} else if (isYesterday(date)) {
				key = "Ieri";
			} else {
				key = format(date, "dd MMMM yyyy", { locale: it });
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
					<div className="animate-pulse space-y-4 w-full">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="h-16 bg-muted rounded-lg" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const groupedActivities = groupActivitiesByDate(filteredActivities);

	return (
		<div className="space-y-6">
			{/* Header con ricerca e filtri */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center space-x-2">
								<Activity className="h-5 w-5" />
								<span>Attività Recente</span>
								<Badge variant="secondary">{activities.length}</Badge>
							</CardTitle>
							<CardDescription>
								Cronologia delle tue attività sulla piattaforma
							</CardDescription>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={handleRefresh}
							disabled={isRefreshing || loading}
							className="flex items-center space-x-2"
						>
							<RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
							<span>Aggiorna</span>
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col lg:flex-row gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Cerca nelle attività..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select
							value={filterType}
							onValueChange={(value: FilterType) => setFilterType(value)}
						>
							<SelectTrigger className="w-full lg:w-[180px]">
								<Filter className="h-4 w-4 mr-2" />
								<SelectValue placeholder="Filtra per tipo" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutti i tipi</SelectItem>
								<SelectItem value="view">Visualizzazioni</SelectItem>
								<SelectItem value="favorite">Preferiti</SelectItem>
								<SelectItem value="search">Ricerche</SelectItem>
								<SelectItem value="contact">Contatti</SelectItem>
								<SelectItem value="message">Messaggi</SelectItem>
								<SelectItem value="login">Accessi</SelectItem>
								<SelectItem value="profile">Profilo</SelectItem>
								<SelectItem value="favorites">Preferiti</SelectItem>
								<SelectItem value="settings">Impostazioni</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={timeFilter}
							onValueChange={(value: TimeFilter) => setTimeFilter(value)}
						>
							<SelectTrigger className="w-full lg:w-[180px]">
								<Calendar className="h-4 w-4 mr-2" />
								<SelectValue placeholder="Periodo" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutto il periodo</SelectItem>
								<SelectItem value="today">Oggi</SelectItem>
								<SelectItem value="week">Ultima settimana</SelectItem>
								<SelectItem value="month">Ultimo mese</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Lista delle attività */}
			{Object.keys(groupedActivities).length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Activity className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							{searchTerm || filterType !== "all" || timeFilter !== "all"
								? "Nessuna attività trovata"
								: "Nessuna attività ancora"}
						</h3>
						<p className="text-muted-foreground text-center max-w-md">
							{searchTerm || filterType !== "all" || timeFilter !== "all"
								? "Prova a modificare i filtri per trovare le attività che stai cercando."
								: "Le tue attività sulla piattaforma appariranno qui."}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-6">
					{Object.entries(groupedActivities).map(([date, activities]) => (
						<Card key={date}>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg flex items-center space-x-2">
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
													<div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
														{getActivityIcon(activity.type)}
													</div>
												</div>

												<div className="flex-1 min-w-0">
													<div className="flex items-center justify-between">
														<div className="flex items-center space-x-2">
															<p className="text-sm font-medium text-foreground">
																{activity.title}
															</p>
															<Badge
																className={getActivityColor(activity.type)}
															>
																{getActivityLabel(activity.type)}
															</Badge>
														</div>

														<div className="flex items-center space-x-2">
															<span className="text-xs text-muted-foreground">
																{format(new Date(activity.timestamp), "HH:mm")}
															</span>
															{activity.details && (
																<Button
																	variant="ghost"
																	size="sm"
																	onClick={() => toggleDetails(activity.id)}
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
															<div className="mt-2 p-3 bg-muted rounded-lg">
																<p className="text-sm text-muted-foreground">
																	{activity.details}
																</p>
															</div>
														)}

													<p className="text-xs text-muted-foreground mt-1">
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

			{/* Statistiche */}
			{activities.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Statistiche Attività</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-primary">
									{activities.length}
								</div>
								<div className="text-sm text-muted-foreground">Totale</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-green-600">
									{activities.filter((a) => a.type === "login").length}
								</div>
								<div className="text-sm text-muted-foreground">Accessi</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-blue-600">
									{activities.filter((a) => a.type === "profile").length}
								</div>
								<div className="text-sm text-muted-foreground">Profilo</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-red-600">
									{activities.filter((a) => a.type === "favorites").length}
								</div>
								<div className="text-sm text-muted-foreground">Preferiti</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-purple-600">
									{activities.filter((a) => a.type === "settings").length}
								</div>
								<div className="text-sm text-muted-foreground">
									Impostazioni
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
