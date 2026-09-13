import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function InternDashboardPage() {
  const session = await getServerSession(authOptions);

  // Wenn nicht eingeloggt, abfangen und zur Login-Seite schicken
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-0">
      
      {/* 1. HERO-BEREICH */}
      <div className="relative w-full h-72 md:h-96 bg-slate-900 -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-8 overflow-hidden">
        <Image 
          src="/DSC_9566-2-fertig.jpg" 
          alt="Vocalmania Chor" 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-6 left-6 md:left-10 z-10 text-white space-y-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
            Internes Dashboard
          </h1>
          <p className="text-xs md:text-sm font-bold text-indigo-400 tracking-[0.25em]">
            Willkommen, {session.user?.name || "Chormitglied"}
          </p>
        </div>
      </div>

      {/* 2. DURCHGEHENDER WEISSER INHALTSBEREICH */}
      <div className="bg-white -mx-6 md:-mx-10 px-6 md:px-10 py-8 space-y-8 border-b border-slate-200">
        
        <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Mitglieder-Bereich</h2>
            <p className="text-sm text-slate-500 mt-0.5">Hier findest du alle internen Inhalte, Proben-Videos und Dokumente.</p>
          </div>
          
          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 self-start">
            Angemeldet als: {session.user?.email}
          </div>
        </div>

        {/* Schnellzugriff-Kacheln für den internen Bereich dd*/}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Link href="/intern/bilder" className="group block p-6 bg-slate-50 border border-slate-200 hover:border-indigo-600 transition-all space-y-2">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Interne Fotoalben &rarr;
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Geschützte Bildergalerien von vergangenen Konzerten, Chorwochenenden und Feiern.
            </p>
          </Link>

          <Link href="/intern/mediathek" className="group block p-6 bg-slate-50 border border-slate-200 hover:border-indigo-600 transition-all space-y-2">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Interne Mediathek &rarr;
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Stimmproben, Choraufnahmen und Video-Tutorials zum Üben der einzelnen Stimmen.
            </p>
          </Link>

        </div>

      </div>

    </div>
  );
}