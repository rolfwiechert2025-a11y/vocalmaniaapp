import Link from "next/link";
import { getKonzertById, getPublicEvents } from "@/lib/calendar";

interface KonzertDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function KonzertDetailPage({ params }: KonzertDetailPageProps) {
  const resolvedParams = await params;
  const id = decodeURIComponent(resolvedParams.id);

  // --- DEBUGGING START ---
  const allEvents = await getPublicEvents();
  console.log("Gesuchte ID aus URL:", id);
  console.log("Verfügbare Event-IDs im Kalender:", allEvents.map(e => e.id));
  // --- DEBUGGING ENDE ---

  const item = await getKonzertById(id);

  if (!item) {
    return (
      <div className="min-h-screen text-white pb-16 max-w-2xl mx-auto space-y-6 pt-10">
        <div>
          <Link href="/konzerte" className="text-xs font-bold text-indigo-300 hover:text-white transition-colors">
            &larr; Zurück zur Übersicht
          </Link>
        </div>
        <div className="bg-black/30 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center space-y-3">
          <h1 className="text-xl font-bold mb-2">Konzert nicht gefunden</h1>
          <p className="text-xs text-indigo-200/70">Der angeforderte Termin mit der ID <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300">{id}</code> wurde nicht gefunden.</p>
          <div className="text-[10px] text-left bg-black/50 p-3 rounded-xl overflow-x-auto text-indigo-200/60">
            <p className="font-bold mb-1">Verfügbare IDs im System:</p>
            {allEvents.map(e => <div key={e.id}>• {e.id} ({e.titel})</div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-16">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Zurück-Textlink */}
        <div>
          <Link 
            href="/konzerte" 
            className="inline-flex items-center text-xs font-bold text-indigo-300 hover:text-white transition-colors"
          >
            &larr; Zurück zur Übersicht
          </Link>
        </div>

        {/* Header-Bereich */}
        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">{item.titel}</h1>
            <p className="text-xs text-indigo-200/70 mt-0.5 flex items-center gap-1.5 pt-1">
              <span>📍</span> {item.ort}
            </p>
          </div>
          <span className="text-xs font-semibold bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10">
            {item.datum}
          </span>
        </div>

        {/* Hauptkarte im Glas-Stil */}
        <div className="bg-black/30 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl border border-white/10">
          
          {/* Vorschaubild */}
          <div className="relative h-64 sm:h-80 w-full bg-black/40 overflow-hidden">
            {item.vorschaubild ? (
              <img 
                src={item.vorschaubild} 
                alt={item.titel} 
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-indigo-950 via-slate-900 to-violet-950 flex items-center justify-center text-4xl">
                🎶
              </div>
            )}
          </div>

          {/* Inhaltsbereich */}
          <div className="p-6 sm:p-8 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200/60">
              Beschreibung & Details
            </h3>
            <p className="text-sm text-indigo-100/90 leading-relaxed whitespace-pre-line">
              {item.beschreibung}
            </p>

            {item.ticketUrl && (
              <div className="pt-4">
                <a 
                  href={item.ticketUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-md transition-colors"
                >
                  🎟️ Tickets sichern
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}