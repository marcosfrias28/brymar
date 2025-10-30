import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LoadingErrorProvider } from "@/components/providers/loading-error-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalLiveRegion } from "@/components/ui/accessibility-announcer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
	title: "Marbry Inmobiliaria - Experience the Epitome of Home Comfort",
	description:
		"Our international brand specializes in property appraisal, sales, purchases, and investments. Trust us to deliver exceptional service and help you find your perfect real estate opportunity.",
};

export default function LocaleLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es" suppressHydrationWarning>
			<body className={`${inter.className} flex min-h-screen flex-col`}>
				<QueryProvider>
					<AuthProvider>
						<LoadingErrorProvider>
							<ThemeProvider
								attribute="class"
								defaultTheme="dark"
								disableTransitionOnChange
								enableSystem={false}
							>
								{/* Global accessibility live regions */}
								<GlobalLiveRegion />

								<Navbar />
								<main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
									{children}
								</main>
								<Toaster position="bottom-center" richColors={true} />

								{/* Global accessibility live regions */}
							</ThemeProvider>
						</LoadingErrorProvider>
					</AuthProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
