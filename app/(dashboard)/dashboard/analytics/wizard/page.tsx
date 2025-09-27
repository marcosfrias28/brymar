import { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { WizardAnalyticsDashboard } from "@/components/dashboard/wizard-analytics-dashboard";
import { SystemHealthMonitor } from "@/components/dashboard/system-health-monitor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Wizard Analytics | Brymar Inmobiliaria",
  description: "Property wizard analytics and performance monitoring",
};

export default async function WizardAnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Only admins can access analytics
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Wizard Analytics</h1>
          <p className="text-muted-foreground">
            Monitor property wizard performance, user behavior, and system
            health
          </p>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <WizardAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <SystemHealthMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
