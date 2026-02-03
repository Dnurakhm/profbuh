import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { UserModeProvider } from "@/context/user-mode-context";
import { NotificationProvider } from "@/providers/notification-provider";
import { Toaster } from "sonner";
import { createClient } from "@/utils/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuhApp - Маркетплейс бухгалтеров",
  description: "Найдите профессионального бухгалтера для вашего бизнеса",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="ru" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${geistSans.className} antialiased bg-slate-50 min-h-screen flex flex-col overflow-x-hidden`}
      >
        <UserModeProvider>
          <NotificationProvider userId={user?.id}>
            <Toaster position="top-center" richColors />
            {/* Навигация */}
            <Navbar />

            {/* Основной контейнер приложения */}
            <main className="flex-1 w-full overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
              <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </NotificationProvider>

          {/* Здесь в будущем можно добавить Footer */}
        </UserModeProvider>
      </body>
    </html>
  );
}