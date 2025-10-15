"use client";

import { useState } from "react";
import { Heart, Trash2, ExternalLink, Search, Filter } from "lucide-react";
import { toast } from "sonner";

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
import { Badge } from "@/components/ui/badge";
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
import { useProfileFavorites } from "@/hooks/use-profile";
// Profile actions need to be implemented in DDD structure
// import { removeFavoriteAction } from "@/presentation/server-actions/profile-actions";
import { useUser } from "@/presentation/hooks/use-user";

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
    if (!user?.getId()) return;

    setRemovingId(favoriteId);

    try {
      const formData = new FormData();
      formData.append("userId", user.getId().value);
      formData.append("favoriteId", favoriteId);
      // Remove favorite functionality needs to be implemented in DDD structure
      toast.error(
        "Remove favorite functionality needs to be implemented in DDD structure"
      );
      return;
    } catch (error) {
      toast.error("Errore durante la rimozione del preferito");
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
        return "Proprietà";
      case "search":
        return "Ricerca";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse space-y-4 w-full">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con ricerca e filtri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5" />
            <span>I Miei Preferiti</span>
            <Badge variant="secondary">{favorites.length}</Badge>
          </CardTitle>
          <CardDescription>Gestisci i tuoi elementi preferiti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca nei preferiti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filterType}
              onValueChange={(value: FilterType) => setFilterType(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtra per tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                <SelectItem value="property">Proprietà</SelectItem>
                <SelectItem value="search">Ricerche</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista dei preferiti */}
      {filteredFavorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || filterType !== "all"
                ? "Nessun risultato trovato"
                : "Nessun preferito ancora"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchTerm || filterType !== "all"
                ? "Prova a modificare i filtri di ricerca per trovare quello che stai cercando."
                : "Inizia ad aggiungere elementi ai tuoi preferiti per vederli qui."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFavorites.map((favorite) => (
            <Card
              key={favorite.id}
              className="hover:shadow-md transition-shadow"
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
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <ExternalLink className="h-4 w-4" />
                        <a
                          href={favorite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary underline"
                        >
                          Visualizza elemento
                        </a>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Aggiunto il{" "}
                      {new Date().toLocaleDateString("it-IT", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {favorite.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={favorite.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={removingId === favorite.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Rimuovi dai preferiti
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler rimuovere &quot;{favorite.title}
                            &quot; dai tuoi preferiti? Questa azione non può
                            essere annullata.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveFavorite(favorite.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Rimuovi
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

      {/* Statistiche */}
      {favorites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistiche Preferiti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {favorites.length}
                </div>
                <div className="text-sm text-muted-foreground">Totale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {favorites.filter((f) => f.type === "property").length}
                </div>
                <div className="text-sm text-muted-foreground">Proprietà</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {favorites.filter((f) => f.type === "search").length}
                </div>
                <div className="text-sm text-muted-foreground">Ricerche</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {
                    favorites.filter(
                      (f) => f.type !== "property" && f.type !== "search"
                    ).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">Altri</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
