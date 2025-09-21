import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileActivity } from "@/components/profile/profile-activity";
import { User, Activity } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header Section */}
      <div className="flex items-center justify-between space-y-2 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Il Mio Profilo</h1>
          <p className="text-muted-foreground">
            Gestisci le tue informazioni personali e le impostazioni dell&apos;account
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 lg:px-6">
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
                  Aggiorna le tue informazioni personali e l&apos;immagine del profilo
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
      </div>
    </div>
  );
}