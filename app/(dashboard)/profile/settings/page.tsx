import { ProfileSettings } from "@/components/profile/profile-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function ProfileSettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Impostazioni Profilo
          </h1>
          <p className="text-muted-foreground">
            Configura le tue preferenze, privacy e sicurezza dell'account
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurazione Account</CardTitle>
          <CardDescription>
            Gestisci le impostazioni di notifica, privacy e sicurezza del tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSettings />
        </CardContent>
      </Card>
    </div>
  );
}