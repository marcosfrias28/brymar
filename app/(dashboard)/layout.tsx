"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { UserSidebar } from "@/components/user-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/use-user";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useUser();
  const isAdminOrAgent = user?.role === 'admin' || user?.role === 'agent';
  const SidebarComponent = isAdminOrAgent ? AdminSidebar : UserSidebar;
  return (
    <SidebarProvider>
      <SidebarComponent variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}