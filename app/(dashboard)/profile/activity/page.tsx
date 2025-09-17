import { ProfileActivity } from "@/components/profile/profile-activity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function ProfileActivityPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Cronologia Attività
          </h1>
          <p className="text-muted-foreground">
            Visualizza la cronologia completa delle tue attività e azioni
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attività Utente</CardTitle>
          <CardDescription>
            Cronologia dettagliata di tutte le azioni eseguite nel sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileActivity />
        </CardContent>
      </Card>
    </div>
  );
}