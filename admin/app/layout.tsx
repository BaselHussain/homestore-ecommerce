import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import AdminShell from '@/components/AdminShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Homestore Admin',
  description: 'Admin dashboard for Homestore e-commerce',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AdminAuthProvider>
            <AdminShell>{children}</AdminShell>
          </AdminAuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
