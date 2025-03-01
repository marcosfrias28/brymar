import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { getUser } from "@/lib/actions/user-actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto  p-8">{children}</main>
      </div>
    </SidebarProvider>
  );
}
