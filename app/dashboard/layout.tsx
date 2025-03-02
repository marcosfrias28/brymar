import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <div className="flex h-screen">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto  p-8">{children}</main>
        </div>
      </SidebarProvider>
      <Toaster richColors={true} position="bottom-center" />
    </>
  );
}
