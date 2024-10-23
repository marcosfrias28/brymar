import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { Sidebar } from '@/components/sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Luxury Real Estate Agency',
  description: 'Find your dream property with our exclusive real estate listings',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 ml-16">{children}</main>
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}