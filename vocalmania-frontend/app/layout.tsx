import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vocalmania | A-cappella-Ensemble",
  description: "Öffentliche Konzerte und interne Chor-App für Vocalmania",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vocalmania",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 pb-20 md:pb-0`}>
        
        {/* Header (Mobil & Desktop) */}
        <header className="flex justify-between items-center px-4 md:px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/logo_white_background.svg" 
              alt="Vocalmania Logo" 
              className="w-9 h-9 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" 
            />
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">
              Vocalmania
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 font-medium text-sm text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition">Startseite</Link>
            <Link href="/konzerte" className="hover:text-indigo-600 transition">Konzerte</Link>
            <Link href="#" className="hover:text-indigo-600 transition">Mediathek</Link>
            <Link href="#" className="hover:text-indigo-600 transition">Interner Bereich</Link>
          </nav>
        </header>

        {/* Hauptinhalt */}
        <main className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation (Handy-Ansicht) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-3 z-50 text-xs font-medium text-slate-600 shadow-lg">
          <Link href="/" className="flex flex-col items-center hover:text-indigo-600">
            <span className="text-lg">🏠</span>
            Start
          </Link>
          <Link href="/konzerte" className="flex flex-col items-center hover:text-indigo-600">
            <span className="text-lg">🎤</span>
            Konzerte
          </Link>
          <Link href="#" className="flex flex-col items-center hover:text-indigo-600">
            <span className="text-lg">📁</span>
            Mediathek
          </Link>
          <Link href="#" className="flex flex-col items-center hover:text-indigo-600">
            <span className="text-lg">🔒</span>
            Login
          </Link>
        </nav>

      </body>
    </html>
  );
}