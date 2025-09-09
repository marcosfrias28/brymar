import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/footer";
import { Toaster } from "@/components/ui/sonner";
import { getUser } from "@/lib/actions/user-actions";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Marbry Immobiliaria",
  description:
    "Find your dream property with our exclusive real estate listings",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  return (
    <html>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <Navbar user={user} />
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[hsl(var(--color-5))] grow">
              {children}
            </main>
            <Footer />
            <Toaster richColors={true} position="bottom-center" />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
