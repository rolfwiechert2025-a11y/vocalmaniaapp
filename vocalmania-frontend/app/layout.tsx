'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll-Listener, um den Pfeil ab 300px Scroll-Höhe einzublenden
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <html lang="de">
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col relative">
        
        {/* MOBILER HEADER (Weiß, Burger links, SVG-Logo exakt in der Mitte) */}
        <header className="md:hidden bg-white text-slate-900 border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          {/* Burger Button (3 Striche) links */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none transition-colors"
            aria-label="Menü öffnen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                // X-Icon wenn offen
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                // 3 Striche wenn zu
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Perfekt zentriertes SVG-Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="block">
              <Image 
                src="/logo_white_background.svg" 
                alt="Vocalmania Logo" 
                width={120} 
                height={35} 
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Unsichtbarer Platzhalter rechts für Symmetrie */}
          <div className="w-10"></div>
        </header>

        {/* Backdrop-Overlay, wenn Menü offen ist */}
        {isMobileMenuOpen && (
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity"
          />
        )}

        <div className="flex-1 flex flex-col md:flex-row relative overflow-x-hidden">
          
          {/* DUNKLES SEITENMENÜ */}
          <aside className={`
            fixed md:static inset-y-0 left-0 z-40 w-72 bg-slate-950 text-slate-200 border-r border-slate-800 p-6 
            flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            top-[61px] md:top-0
          `}>
            {/* OBERER BEREICH: Logo (Desktop) & Navigation */}
            <div className="space-y-8">
              {/* Chor Logo (Nur Desktop) */}
              <div className="hidden md:block">
                <Link href="/" className="block">
                  <Image 
                    src="/logo_white_background.svg" 
                    alt="Vocalmania Logo" 
                    width={140} 
                    height={40} 
                    className="h-10 w-auto object-contain"
                    priority
                  />
                </Link>
              </div>

              {/* Bereich 1: Link-Navigation */}
              <nav className="space-y-1.5" onClick={() => setIsMobileMenuOpen(false)}>
                <p className="px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">Menü</p>
                <Link 
                  href="/" 
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                >
                  Startseite
                </Link>
                <Link 
                  href="/konzerte" 
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                >
                  Konzerte & Termine
                </Link>
              </nav>
            </div>

            {/* UNTERER BEREICH: Bereich 2 (Optisch abgesetzter Kontakt-Bereich) */}
            <div className="mt-8 pt-5 border-t border-slate-800/80 bg-slate-900/50 -mx-6 -mb-6 p-6 space-y-4 text-xs text-slate-300 rounded-b-none">
              <div>
                <p className="font-bold text-slate-100 uppercase tracking-wider mb-1">Kontakt</p>
                <p className="text-slate-400">Heideweg 2</p>
                <p className="text-slate-400">72160 Horb-Isenburg</p>
              </div>

              <div className="space-y-1">
                <p className="font-medium text-slate-300">Rufen Sie uns an:</p>
                <a href="tel:+4915752429035" className="block text-indigo-400 hover:underline font-semibold">
                  +49 1575 2429035
                </a>
              </div>

              <div className="space-y-1">
                <p className="font-medium text-slate-300">Schreiben Sie uns:</p>
                <a href="mailto:info@vocalmania-isenburg.com" className="block text-indigo-400 hover:underline break-all font-semibold">
                  info@vocalmania-isenburg.com
                </a>
              </div>
            </div>
          </aside>

          {/* HAUPTBEREICH RECHTS */}
          <main className={`
            flex-1 p-6 md:p-10 max-w-4xl transition-all duration-300
            ${isMobileMenuOpen ? 'md:ml-0' : ''}
          `}>
            {children}
          </main>

        </div>

        {/* SCROLL-TO-TOP PFEIL (Unten rechts, erscheint ab 300px Scroll-Höhe) */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center focus:outline-none"
            aria-label="Nach oben scrollen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}

      </body>
    </html>
  );
}