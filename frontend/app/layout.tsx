import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "HomeStore — Quality Home Goods",
    template: "%s | HomeStore",
  },
  description: "Quality household goods, outdoor furniture, gifts & souvenirs. Everything for your home.",
  openGraph: {
    type: "website",
    siteName: "HomeStore",
    title: "HomeStore — Quality Home Goods",
    description: "Quality household goods, outdoor furniture, gifts & souvenirs. Everything for your home.",
    images: [{ url: "/images/og-default.jpg", width: 1200, height: 630, alt: "HomeStore" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeStore — Quality Home Goods",
    description: "Quality household goods, outdoor furniture, gifts & souvenirs. Everything for your home.",
    images: ["/images/og-default.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <Toaster />
              <SonnerToaster position="top-right" richColors />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
