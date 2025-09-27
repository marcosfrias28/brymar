"use client";

import { ProfileFavorites } from "@/components/profile/profile-favorites";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, Home, User } from "lucide-react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";

export default function ProfileFavoritesPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Profilo", href: "/profile", icon: User },
    { label: "I Miei Preferiti", icon: Heart },
  ];

  return (
    <DashboardPageLayout
      title="I Miei Preferiti"
      description="Visualizza e gestisci tutti i tuoi elementi preferiti"
      breadcrumbs={breadcrumbs}
    >
      <Card>
        <CardHeader>
          <CardTitle>Elementi Preferiti</CardTitle>
          <CardDescription>
            Tutti gli elementi che hai aggiunto ai tuoi preferiti, organizzati
            per categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileFavorites />
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}
