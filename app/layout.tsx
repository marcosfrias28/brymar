import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/sections/footer";
import { Toaster } from "sonner";
import { getUser } from "@/lib/actions/user-actions";
import { ThemeProvider } from "@/components/theme-provider";

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
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar user={user} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[hsl(var(--color-5))]">
            {children}
          </main>
          <Footer />
          <Toaster richColors={true} position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
