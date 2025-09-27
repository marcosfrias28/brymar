"use client";

import { ProfileNotifications } from "@/components/profile/profile-notifications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Home, User } from "lucide-react";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";

export default function ProfileNotificationsPage() {
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Profilo", href: "/profile", icon: User },
    { label: "Le Mie Notifiche", icon: Bell },
  ];

  return (
    <DashboardPageLayout
      title="Le Mie Notifiche"
      description="Gestisci e visualizza tutte le tue notifiche"
      breadcrumbs={breadcrumbs}
    >
      <Card>
        <CardHeader>
          <CardTitle>Centro Notifiche</CardTitle>
          <CardDescription>
            Visualizza, gestisci e configura le tue notifiche di sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileNotifications />
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}
