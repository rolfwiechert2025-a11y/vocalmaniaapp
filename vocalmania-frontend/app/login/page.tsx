"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="space-y-0">
      
      {/* 1. HERO-BEREICH */}
      <div className="relative w-full h-72 md:h-96 bg-slate-900 -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-8 overflow-hidden">
        v<Image 
          src="/DSC_9566-2-fertig.jpg" 
          alt="Vocalmania Chor" 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-6 left-6 md:left-10 z-10 text-white space-y-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
            Interner Bereich
          </h1>
          <p className="text-xs md:text-sm font-bold text-indigo-400 tracking-[0.25em]">
            Mitglieder-Login
          </p>
        </div>
      </div>

      {/* 2. DURCHGEHENDER WEISSER INHALTSBEREICH   */}
      <div className="bg-white -mx-6 md:-mx-10 px-6 md:px-10 py-12 border-b border-slate-200 max-w-xl mx-auto text-center space-y-6">
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Anmeldung für Chormitglieder</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Bitte melde dich mit deinem Google-Konto an, um Zugriff auf den internen Bereich (interne Alben, Probenmaterial und Dokumente) zu erhalten.
          </p>
        </div>

        <div>
          <button
            onClick={() => signIn("google", { callbackUrl: "/intern" })}
            className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            <span>🔐 Mit Google anmelden</span>
          </button>
        </div>

      </div>

    </div>
  );
}