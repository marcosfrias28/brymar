import { ProfileFavorites } from "@/components/profile/profile-favorites";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default function ProfileFavoritesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="h-8 w-8" />
            I Miei Preferiti
          </h1>
          <p className="text-muted-foreground">
            Visualizza e gestisci tutti i tuoi elementi preferiti
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elementi Preferiti</CardTitle>
          <CardDescription>
            Tutti gli elementi che hai aggiunto ai tuoi preferiti, organizzati per categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileFavorites />
        </CardContent>
      </Card>
    </div>
  );
}