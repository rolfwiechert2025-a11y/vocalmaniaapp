export default function KontaktPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* SEITEN-HEADER */}
      <div className="border-b border-white/10 pb-4 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
            Kontakt
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white">Wir sind für Sie da</h1>
        <p className="text-xs text-indigo-200/70">
          Haben Sie Fragen zu unseren Konzerten, möchten Sie uns buchen oder selbst im Chor mitsingen? Nehmen Sie Kontakt mit uns auf.
        </p>
      </div>

      {/* KONTAKT-KACHELN RASTER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* NEU: Allgemeine Kontaktdaten & Adresse */}
        <div className="bg-black/30 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-4 hover:border-indigo-400/50 transition-all md:col-span-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-xl shadow-inner">
            📍
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Vocalmania singing and more</h2>
            <p className="text-xs text-indigo-200/70">Offizielle Kontaktdaten & Probenort</p>
          </div>
          <div className="pt-3 text-sm text-indigo-100/90 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10">
            <div className="space-y-1.5 text-xs text-indigo-200/80">
              <p className="font-semibold text-white text-sm">Kirchengemeinde Nordstetten</p>
              <p>Hohlgasse 2/1</p>
              <p>72160 Horb-Nordstetten</p>
            </div>
            <div className="space-y-2 flex flex-col justify-start">
              <div>
                <span className="text-[10px] text-indigo-300 uppercase tracking-wider block font-semibold">Mobil</span>
                <a href="tel:+4915752429035" className="text-xs font-bold text-white hover:text-indigo-300 transition-colors">
                  +49 1575 2429035
                </a>
              </div>
              <div>
                <span className="text-[10px] text-indigo-300 uppercase tracking-wider block font-semibold">E-Mail</span>
                <a href="mailto:info@vocalmaniasingingandmore.de" className="text-xs font-bold text-indigo-300 hover:text-white transition-colors underline break-all">
                  info@vocalmaniasingingandmore.de
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Chorleitung / Dirigat */}
        <div className="bg-black/30 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-4 hover:border-indigo-400/50 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-xl shadow-inner">
            🎼
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Chorleitung & Dirigat</h2>
            <p className="text-xs text-indigo-200/70">Musikalische Leitung & Arrangements</p>
          </div>
          <div className="pt-2 text-sm text-indigo-100/90 space-y-2 border-t border-white/10">
            <p className="font-semibold text-white">Vocalmania A-cappella-Ensemble</p>
            <p className="text-xs text-indigo-200/80 leading-relaxed">
              Für musikalische Anfragen, Probenarbeit und Repertoire-Fragen.
            </p>
            <div className="pt-2">
              <a 
                href="mailto:info@vocalmaniasingingandmore.de" 
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-600/40 hover:bg-indigo-600 px-4 py-2 rounded-full border border-indigo-400/30 transition-all shadow-md"
              >
                ✉️ E-Mail an die Chorleitung senden
              </a>
            </div>
          </div>
        </div>

        {/* Vorstand / Organisation */}
        <div className="bg-black/30 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-4 hover:border-indigo-400/50 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/30 border border-violet-400/30 flex items-center justify-center text-xl shadow-inner">
            🏛️
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Vorstand & Organisation</h2>
            <p className="text-xs text-indigo-200/70">Veranstaltungen, Presse & Booking</p>
          </div>
          <div className="pt-2 text-sm text-indigo-100/90 space-y-2 border-t border-white/10">
            <p className="font-semibold text-white">Vocalmania e.V.</p>
            <p className="text-xs text-indigo-200/80 leading-relaxed">
              Für Konzertanfragen, Veranstalter und organisatorische Anliegen.
            </p>
            <div className="pt-2">
              <a 
                href="mailto:info@vocalmaniasingingandmore.de" 
                className="inline-flex items-center gap-2 text-xs font-bold text-white bg-violet-600/40 hover:bg-violet-600 px-4 py-2 rounded-full border border-violet-400/30 transition-all shadow-md"
              >
                ✉️ E-Mail an den Vorstand senden
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* MITMACHEN / PROBEN-HINWEIS */}
      <div className="bg-gradient-to-br from-indigo-950/60 via-black/50 to-black/70 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎤</span>
          <div>
            <h3 className="text-lg font-bold text-white">Interesse am Mitsingen?</h3>
            <p className="text-xs text-indigo-200/70">Wir freuen uns immer über stimmgewaltige Unterstützung.</p>
          </div>
        </div>
        <p className="text-xs text-indigo-100/80 leading-relaxed">
          Du singst gerne im Chor, liebst A-cappella-Musik und bringst idealerweise Chorerfahrung mit? Komm gerne zu einer unverbindlichen Schnupperprobe vorbei. Schreib uns einfach kurz vorab!
        </p>
      </div>

    </div>
  );
}