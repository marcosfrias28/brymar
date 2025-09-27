"use client";

import { ProfileMessages } from "@/components/profile/profile-messages";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Home, User } from "lucide-react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";

export default function ProfileMessagesPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Profilo", href: "/profile", icon: User },
    { label: "I Miei Messaggi", icon: MessageSquare },
  ];

  return (
    <DashboardPageLayout
      title="I Miei Messaggi"
      description="Gestisci la tua casella di posta e invia nuovi messaggi"
      breadcrumbs={breadcrumbs}
    >
      <Card>
        <CardHeader>
          <CardTitle>Centro Messaggi</CardTitle>
          <CardDescription>
            Visualizza, invia e gestisci tutti i tuoi messaggi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileMessages />
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}
