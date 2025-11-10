"use client";

import { ExternalLink, Filter, Heart, Search, Trash2 } from "lucide-react";
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
import { useProfileFavorites } from "@/hooks/use-profile";
// Profile actions need to be implemented in DDD structure
// import { removeFavoriteAction } from "@/presentation/server-actions/profile-actions";
import { useUser } from "@/hooks/use-user";

type FilterType = "all" | "property" | "search";

export function ProfileFavorites() {
	const { user } = useUser();
	const { favorites, loading, removeFavorite } = useProfileFavorites();
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState<FilterType>("all");
	const [removingId, setRemovingId] = useState<string | null>(null);

	const filteredFavorites = favorites.filter((favorite) => {
		const matchesSearch =
			favorite.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(favorite.description || "")
				.toLowerCase()
				.includes(searchTerm.toLowerCase());

		const matchesFilter = filterType === "all" || favorite.type === filterType;

		return matchesSearch && matchesFilter;
	});

	const handleRemoveFavorite = async (favoriteId: string) => {
		if (!user?.id) {
			return;
		}

		setRemovingId(favoriteId);

		try {
			const formData = new FormData();
			formData.append("userId", user.id);
			formData.append("favoriteId", favoriteId);
			// Remove favorite functionality needs to be implemented in DDD structure
			toast.error(
				"La funcionalidad de eliminar favoritos debe implementarse en la estructura DDD"
			);
			return;
		} catch (_error) {
			toast.error("Error al eliminar el favorito");
		} finally {
			setRemovingId(null);
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case "property":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			case "search":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "property":
				return "Propiedad";
			case "search":
				return "Búsqueda";
			default:
				return type;
		}
	};

	if (loading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<div className="w-full animate-pulse space-y-4">
						{[...new Array(3)].map((_, i) => (
							<div className="h-24 rounded-lg bg-muted" key={i} />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Encabezado con búsqueda y filtros */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Heart className="h-5 w-5" />
						<span>Mis Favoritos</span>
						<Badge variant="secondary">{favorites.length}</Badge>
					</CardTitle>
					<CardDescription>Gestiona tus elementos favoritos</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4 sm:flex-row">
						<div className="relative flex-1">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
							<Input
								className="pl-10"
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Buscar en favoritos..."
								value={searchTerm}
							/>
						</div>
						<Select
							onValueChange={(value: FilterType) => setFilterType(value)}
							value={filterType}
						>
							<SelectTrigger className="w-full sm:w-[180px]">
								<Filter className="mr-2 h-4 w-4" />
								<SelectValue placeholder="Filtrar por tipo" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los tipos</SelectItem>
								<SelectItem value="property">Propiedades</SelectItem>
								<SelectItem value="search">Búsquedas</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Lista de favoritos */}
			{filteredFavorites.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Heart className="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">
							{searchTerm || filterType !== "all"
								? "No se encontraron resultados"
								: "Aún no tienes favoritos"}
						</h3>
						<p className="max-w-md text-center text-muted-foreground">
							{searchTerm || filterType !== "all"
								? "Prueba a ajustar los filtros de búsqueda para encontrar lo que buscas."
								: "Empieza a añadir elementos a tus favoritos para verlos aquí."}
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{filteredFavorites.map((favorite) => (
						<Card
							className="transition-shadow hover:shadow-md"
							key={favorite.id}
						>
							<CardContent className="p-6">
								<div className="flex items-start justify-between">
									<div className="flex-1 space-y-2">
										<div className="flex items-center space-x-2">
											<h3 className="font-semibold text-lg">
												{favorite.title}
											</h3>
											<Badge className={getTypeColor(favorite.type)}>
												{getTypeLabel(favorite.type)}
											</Badge>
										</div>

										<p className="text-muted-foreground">
											{favorite.description}
										</p>

										{favorite.url && (
											<div className="flex items-center space-x-2 text-muted-foreground text-sm">
												<ExternalLink className="h-4 w-4" />
												<a
													className="underline hover:text-primary"
													href={favorite.url}
													rel="noopener noreferrer"
													target="_blank"
												>
													Ver elemento
												</a>
											</div>
										)}

										<div className="text-muted-foreground text-xs">
											Añadido el{" "}
											{new Date().toLocaleDateString("es-ES", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</div>
									</div>

									<div className="ml-4 flex items-center space-x-2">
										{favorite.url && (
											<Button asChild size="sm" variant="outline">
												<a
													href={favorite.url}
													rel="noopener noreferrer"
													target="_blank"
												>
													<ExternalLink className="h-4 w-4" />
												</a>
											</Button>
										)}

										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													disabled={removingId === favorite.id}
													size="sm"
													variant="outline"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														Eliminar de favoritos
													</AlertDialogTitle>
													<AlertDialogDescription>
														¿Estás seguro de eliminar &quot;{favorite.title}
														&quot; de tus favoritos? Esta acción no se puede
														deshacer.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancelar</AlertDialogCancel>
													<AlertDialogAction
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														onClick={() => handleRemoveFavorite(favorite.id)}
													>
														Eliminar
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Estadísticas */}
			{favorites.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Estadísticas de Favoritos</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
							<div className="text-center">
								<div className="font-bold text-2xl text-primary">
									{favorites.length}
								</div>
								<div className="text-muted-foreground text-sm">Total</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-2xl text-blue-600">
									{favorites.filter((f) => f.type === "property").length}
								</div>
								<div className="text-muted-foreground text-sm">Propiedades</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-2xl text-green-600">
									{favorites.filter((f) => f.type === "search").length}
								</div>
								<div className="text-muted-foreground text-sm">Búsquedas</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-2xl text-purple-600">
									{
										favorites.filter(
											(f) => f.type !== "property" && f.type !== "search"
										).length
									}
								</div>
								<div className="text-muted-foreground text-sm">Otros</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
