import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FigmaNavbar } from "@/components/figma-navbar";
import { Toaster } from "@/components/ui/sonner";
import { getUser } from "@/lib/actions/auth-actions";


import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Marbry Immobiliaria",
  description:
    "Find your dream property with our exclusive real estate listings",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getUser();

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SidebarProvider>
            <FigmaNavbar user={user} />
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-figma-dark-green">
              {children}
            </main>
            <Toaster richColors={true} position="bottom-center" />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
