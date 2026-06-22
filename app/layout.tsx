import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import ToastProvider from '@/components/providers/ToastProvider';

const fontSans = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const metadata: Metadata = {
  title: 'ShopPro - La meilleure boutique en ligne',
  description: 'Découvrez nos produits de qualité à des prix imbattables',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased transition-colors"
        style={{ fontFamily: fontSans }}
      >
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <div className="min-h-screen flex flex-col">
                <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
                  <Navbar />
                </header>
                <main className="flex-1 w-full">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    {children}
                  </div>
                </main>
                <Footer />
              </div>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}