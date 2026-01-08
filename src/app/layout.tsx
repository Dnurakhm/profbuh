import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar"; 

// Настраиваем основной шрифт с поддержкой кириллицы
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${geistSans.className} antialiased bg-slate-50 min-h-screen`}
      >
        {/* Навигация будет видна на всех страницах */}
        <Navbar /> 
        
        {/* Основной контент страниц */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}