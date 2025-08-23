import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { AppProvider } from "@/contexts/app-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Toaster } from "@/components/ui/sonner";

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
      <body className="antialiased">
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