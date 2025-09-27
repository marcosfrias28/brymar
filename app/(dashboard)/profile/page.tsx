"use client";

import { ProfileForm } from "@/components/profile/profile-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileActivity } from "@/components/profile/profile-activity";
import { User, Activity, Home } from "lucide-react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";

export default function ProfilePage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Il Mio Profilo", icon: User },
  ];

  return (
    <DashboardPageLayout
      title="Il Mio Profilo"
      description="Gestisci le tue informazioni personali e le impostazioni dell'account"
      breadcrumbs={breadcrumbs}
    >
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Informazioni Personali
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Attività Recente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profilo Utente</CardTitle>
              <CardDescription>
                Aggiorna le tue informazioni personali e l&apos;immagine del
                profilo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attività Recente</CardTitle>
              <CardDescription>
                Visualizza la cronologia delle tue attività e azioni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileActivity />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardPageLayout>
  );
}
