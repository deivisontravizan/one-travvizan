import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { AppProvider } from "@/contexts/app-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Tattoo Studio Manager",
  description: "Sistema completo para gestão de estúdios de tatuagem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ProtectedRoute>
            <AppProvider>
              {children}
              <Toaster />
            </AppProvider>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}