import { ProfileMessages } from "@/components/profile/profile-messages";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ProfileMessagesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            I Miei Messaggi
          </h1>
          <p className="text-muted-foreground">
            Gestisci la tua casella di posta e invia nuovi messaggi
          </p>
        </div>
      </div>

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
    </div>
  );
}