import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function InternDashboardPage() {
  const session = await getServerSession(authOptions);

  // Wenn nicht eingeloggt, abfangen und zur Login-Seite schicken
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* SEITEN-HEADER */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Internes Dashboard</h1>
          <p className="text-xs text-indigo-200/70 mt-0.5">Willkommen, {session.user?.name || "Chormitglied"}!</p>
        </div>
        
        <span className="text-xs font-semibold bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/10">
          {session.user?.email || "Mitglied"}
        </span>
      </div>

      {/* HAUPT-MENÜ (Alle Menüpunkte als Liste in einer gemeinsamen Glas-Karte) */}
      <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden divide-y divide-white/10">
        
        <Link href="/intern/bilder" className="flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-3.5">
            <span className="text-lg">🖼️</span>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Interne Fotoalben</h2>
              <p className="text-[11px] text-indigo-200/70">Geschützte Bildergalerien von Konzerten & Feiern</p>
            </div>
          </div>
          <span className="text-indigo-300 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>

        <Link href="/intern/mediathek" className="flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-3.5">
            <span className="text-lg">🎵</span>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Interne Mediathek</h2>
              <p className="text-[11px] text-indigo-200/70">Stimmproben und Choraufnahmen zum Üben</p>
            </div>
          </div>
          <span className="text-indigo-300 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>

        <Link href="/intern/termine" className="flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-3.5">
            <span className="text-lg">📅</span>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Interne Termine</h2>
              <p className="text-[11px] text-indigo-200/70">Probenpläne und Chorwochenenden im Kalender</p>
            </div>
          </div>
          <span className="text-indigo-300 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>

        <Link href="/intern/mitglieder" className="flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-3.5">
            <span className="text-lg">👥</span>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Interne Mitglieder</h2>
              <p className="text-[11px] text-indigo-200/70">Verwaltung (Chorleitung & Registerleiter)</p>
            </div>
          </div>
          <span className="text-indigo-300 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>

        <Link href="/intern/registers" className="flex items-center justify-between p-4 sm:p-5 hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-3.5">
            <span className="text-lg">🎼</span>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Interne Register</h2>
              <p className="text-[11px] text-indigo-200/70">Register-Zuordnungen verwalten</p>
            </div>
          </div>
          <span className="text-indigo-300 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
        </Link>

      </div>

      {/* SEPARATER ABMELDEN-BLOCK (Unten separat wie auf dem Referenzbild) */}
      <div className="pt-2">
        <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 pl-2">
            <span className="text-lg">🚪</span>
            <span className="text-xs font-semibold text-slate-200">Sitzung beenden</span>
          </div>
          <LogoutButton />
        </div>
      </div>

    </div>
  );
}