"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Navbar} from '@/components/navbar'
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isTransparent = pathname === '/' || pathname === '/recherche';

  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col max-h-screen">
          <div className={`w-full ${isTransparent ? 'absolute ' : 'relative bg-zinc-900'} z-50`}>
            <Navbar />
          </div>
          <div className="max-h-24">
            {children}
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
