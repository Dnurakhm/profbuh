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
        
        {/* Добавляем flex-1, чтобы main занимал всё пространство, 
            и предотвращаем горизонтальный скролл через overflow-x-hidden 
        */}
        <main className="flex-1 w-full overflow-x-hidden">
          {children}
        </main>

        {/* Здесь в будущем можно добавить Footer */}
      </body>
    </html>
  );
}