// src/app/layout.tsx

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as CustomToaster } from "@/components/ui/toaster";
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar";
import { MainNav } from "@/components/main-nav";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { GlobalErrorDisplay } from "@/components/ui/global-error-display";
import { Header } from "@/components/header";

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "ApoliceFacil",
  description: "Your trusted partner in insurance management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          'flex flex-col min-h-screen bg-background',
          montserrat.className
        )}
        suppressHydrationWarning
      >
        <SidebarProvider>
          <div className="grid min-h-screen w-full md:grid-cols-[var(--sidebar-width)_1fr] lg:grid-cols-[var(--sidebar-width)_1fr] data-[sidebar-state=collapsed]:md:grid-cols-[var(--sidebar-width-icon)_1fr] data-[sidebar-state=collapsed]:lg:grid-cols-[var(--sidebar-width-icon)_1fr]">
            <Sidebar>
              <SidebarContent>
                <MainNav />
              </SidebarContent>
            </Sidebar>

            <Providers>
              <div className="flex flex-col">
                <Header />
                <main
                  className="flex-1 overflow-auto p-4 sm:px-6 
                                    sm:py-0 space-y-4">
                  <GlobalErrorDisplay />
                  {children}
                </main>
              </div>
            </Providers>
          </div>
        </SidebarProvider>
        <Toaster richColors />
        <CustomToaster />
      </body>
    </html>
  );
}