"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto pt-8 pb-12">
      
      {/* GLAS-CONTAINER FÜR DEN LOGIN */}
      <div className="bg-black/30 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center">
        
        {/* SEITEN-TITEL */}
        <div className="space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-xl shadow-inner mb-4">
            🔐
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Mitglieder-Login
          </h1>
          <p className="text-xs text-indigo-200/70 leading-relaxed max-w-sm mx-auto">
            Bitte melde dich mit deinem Google-Konto an, um Zugriff auf den internen Bereich zu erhalten.
          </p>
        </div>

        {/* LOGIN-BUTTON */}
        <div className="pt-2">
          <button
            onClick={() => signIn("google", { callbackUrl: "/intern" })}
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-wider uppercase rounded-2xl transition-all shadow-lg border border-indigo-400/30 cursor-pointer flex items-center justify-center gap-3 group"
          >
            <span className="text-base group-hover:scale-110 transition-transform">🔐</span>
            <span>Mit Google anmelden</span>
          </button>
        </div>

      </div>

    </div>
  );
}