import { ProfileNotifications } from "@/components/profile/profile-notifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function ProfileNotificationsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Le Mie Notifiche
          </h1>
          <p className="text-muted-foreground">
            Gestisci e visualizza tutte le tue notifiche
          </p>
        </div>
      </div>

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
    </div>
  );
}