"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";

interface AppShellProps {
  children: React.ReactNode;
  onSearchChange?: (query: string) => void;
}

export default function AppShell({ children, onSearchChange }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Next.js Transition-Hook erkennt im Hintergrund laufende Seitenwechsel & Fetches
  const [isPending, startTransition] = useTransition();

  // Scroll-Position erkennen für den dynamischen Footer
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearchChange) onSearchChange(e.target.value);
  };

  // Klick auf den Account-Button mit Übergangs-Animation
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(() => {
      if (session) {
        router.push("/intern");
      } else {
        router.push("/login");
      }
    });
  };

  // Sanfte Navigation für Footer-Links mit Warte-Indikator
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) return; // Schon auf der Seite
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  // Hilfsfunktion, um dynamische Initialen zu berechnen (z.B. "Rolf Wiechert" -> "RW")
  const getInitials = () => {
    if (session?.user?.name) {
      const parts = session.user.name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return session.user.name.substring(0, 2).toUpperCase();
    }
    if (session?.user?.email) {
      return session.user.email.substring(0, 2).toUpperCase();
    }
    return null;
  };

  const userInitials = getInitials();

  return (
    /* Globaler Vocalmania-Farbverlauf: Oben heller/wärmer, unten tiefes Dunkelblau/Schwarz */
    <div className="min-h-screen bg-gradient-to-b from-[#2e1065] via-[#1e1b4b] to-[#020617] text-white relative selection:bg-indigo-500 selection:text-white">
      
      {/* GLOBALER LADE-INDIKATOR (Wird eingeblendet, sobald eine Seite lädt oder ein Fetch läuft) */}
      {isPending && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 transition-opacity duration-200 pointer-events-none">
          <div className="bg-black/70 border border-white/20 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold tracking-wide text-indigo-200">Lade Inhalte...</span>
          </div>
        </div>
      )}

      {/* 1. SCHWEBENDER HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#2e1065] via-[#2e1065]/70 via-[#2e1065]/30 to-transparent backdrop-blur-[2px]"></div>

        <div className="pointer-events-auto relative max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          
          <button 
            onClick={handleProfileClick}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md shrink-0 hover:scale-105 transition-transform border border-white/20 cursor-pointer ${
              session 
                ? "bg-gradient-to-tr from-indigo-500 to-violet-400 text-white" 
                : "bg-black/30 backdrop-blur-md text-slate-300 hover:text-white"
            }`}
            title={session ? `Angemeldet als ${session.user?.email}. Zum internen Bereich` : "Zum Login"}
          >
            {userInitials ? (
              userInitials
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            )}
          </button>

          <div className="relative flex-1 max-w-md">
            <input 
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              placeholder="Suchen..."
              className="w-full bg-black/30 backdrop-blur-md border border-white/15 rounded-full py-2 pl-11 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-inner"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-300 z-10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <Link 
            href="/kontakte" 
            onClick={(e) => handleNavClick(e, "/kontakte")}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/15 flex items-center justify-center hover:bg-black/50 transition-all shrink-0 shadow-sm text-slate-300 hover:text-white"
            title="Kontakt"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </Link>

        </div>
      </header>

      {/* 2. DURCHLAUFENDER CONTENT */}
      <main className="pt-28 pb-36 px-4 max-w-4xl mx-auto relative z-0">
        {children}
      </main>

      {/* 3. SCHWEBENDE FOOTER-NAVIGATION (Icons & Texte zentriert untereinander) */}
      <nav className="fixed bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-40 flex justify-center pointer-events-none">
        <div className={`pointer-events-auto bg-black/50 backdrop-blur-2xl border border-white/15 shadow-2xl rounded-2xl sm:rounded-full transition-all duration-300 flex items-center justify-around w-full max-w-md ${
          isScrolled ? "p-1.5 scale-95 opacity-90 shadow-lg" : "p-2 sm:px-4 sm:py-2.5 scale-100 opacity-100"
        }`}>
          
          <Link 
            href="/" 
            onClick={(e) => handleNavClick(e, "/")}
            className={`flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer flex-1 py-1.5 ${
              isScrolled ? "text-[10px]" : "text-[11px] sm:text-xs"
            } ${pathname === "/" ? "bg-indigo-600 text-white shadow-md font-bold" : "text-slate-300 hover:text-white hover:bg-white/10 font-medium"}`}
          >
            <span className="text-base sm:text-lg leading-none mb-0.5">🏠</span>
            <span className="leading-tight">Home</span>
          </Link>

          <Link 
            href="/bilder" 
            onClick={(e) => handleNavClick(e, "/bilder")}
            className={`flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer flex-1 py-1.5 ${
              isScrolled ? "text-[10px]" : "text-[11px] sm:text-xs"
            } ${pathname.startsWith("/bilder") ? "bg-indigo-600 text-white shadow-md font-bold" : "text-slate-300 hover:text-white hover:bg-white/10 font-medium"}`}
          >
            <span className="text-base sm:text-lg leading-none mb-0.5">🖼️</span>
            <span className="leading-tight">Bilder</span>
          </Link>

          <Link 
            href="/media" 
            onClick={(e) => handleNavClick(e, "/media")}
            className={`flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer flex-1 py-1.5 ${
              isScrolled ? "text-[10px]" : "text-[11px] sm:text-xs"
            } ${pathname.startsWith("/media") ? "bg-indigo-600 text-white shadow-md font-bold" : "text-slate-300 hover:text-white hover:bg-white/10 font-medium"}`}
          >
            <span className="text-base sm:text-lg leading-none mb-0.5">🎵</span>
            <span className="leading-tight">Media</span>
          </Link>

          <Link 
            href="/konzerte" 
            onClick={(e) => handleNavClick(e, "/konzerte")}
            className={`flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer flex-1 py-1.5 ${
              isScrolled ? "text-[10px]" : "text-[11px] sm:text-xs"
            } ${pathname.startsWith("/konzerte") ? "bg-indigo-600 text-white shadow-md font-bold" : "text-slate-300 hover:text-white hover:bg-white/10 font-medium"}`}
          >
            <span className="text-base sm:text-lg leading-none mb-0.5">📅</span>
            <span className="leading-tight">Konzerte</span>
          </Link>

        </div>
      </nav>

    </div>
  );
}