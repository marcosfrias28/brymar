import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { getUser } from "@/app/actions/auth-actions";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Marbry Inmobiliaria - Experience the Epitome of Home Comfort",
  description:
    "Our international brand specializes in property appraisal, sales, purchases, and investments. Trust us to deliver exceptional service and help you find your perfect real estate opportunity.",
};

export default async function LocaleLayout({
  children,
  params,
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
            <Navbar user={user} />
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
              {children}
            </main>
            <Toaster richColors={true} position="bottom-center" />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
