import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8 py-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 border border-slate-800 text-white p-8 md:p-12 rounded-3xl shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <span className="inline-block bg-rose-500/20 text-rose-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest border border-rose-500/30">
          A-cappella-Ensemble
        </span>
        
        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
          Moderne Chormusik <br className="hidden md:block"/>mit Leidenschaft
        </h1>
        
        <p className="text-slate-300 max-w-xl text-sm md:text-base leading-relaxed">
          Erlebt Vocalmania live mit Popsongs, Rockhymnen und modernen Chorsätzen. Hier findet ihr alle Infos zu unseren kommenden Auftritten und Terminen.
        </p>
        
        <div className="pt-2 flex flex-wrap gap-4">
          <Link 
            href="/konzerte" 
            className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition text-sm shadow-lg shadow-rose-500/20"
          >
            Zu den Konzerte
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold text-lg">
            🎤
          </div>
          <h2 className="text-xl font-bold text-slate-100">Nächster Auftritt</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Schaut in unseren Terminkalender, um kein Konzert in eurer Nähe zu verpassen.
          </p>
          <Link href="/konzerte" className="text-rose-400 font-semibold text-sm inline-block pt-2 hover:underline">
            Alle Termine ansehen →
          </Link>
        </div>

        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-lg">
            🔒
          </div>
          <h2 className="text-xl font-bold text-slate-100">Interner Chor-Bereich</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Proben-Rückmeldungen, Stimmproben und Noten aus dem Google Drive für angemeldete Mitglieder.
          </p>
          <span className="text-slate-500 font-semibold text-sm inline-block pt-2">
            Login folgt demnächst...
          </span>
        </div>
      </div>
    </div>
  );
}