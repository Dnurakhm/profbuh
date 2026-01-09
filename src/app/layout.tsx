import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar"; 

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
  // Добавляем настройки для корректного отображения на мобильных устройствах
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${geistSans.className} antialiased bg-slate-50 min-h-screen flex flex-col overflow-x-hidden`}
      >
        {/* Навигация */}
        <Navbar />

        {/* Основной контейнер приложения.
            На мобильных занимает весь экран, на больших экранах слегка центрируем,
            добавляем отступ снизу под системные панели. */}
        <main className="flex-1 w-full overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Здесь в будущем можно добавить Footer */}
      </body>
    </html>
  );
}