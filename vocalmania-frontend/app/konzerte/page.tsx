import { getPublicEvents } from "@/lib/calendar";
import Link from 'next/link';

export default async function KonzertePage() {
  const calendarEvents = await getPublicEvents();

  return (
    <div className="space-y-6">
      
      {/* SEITEN-HEADER (Im cleanen AppShell-Design ohne Hero-Bild) */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Anstehende Konzerte</h1>
          <p className="text-xs text-indigo-200/70 mt-0.5">Erlebe Vocalmania live und sichere dir Tickets</p>
        </div>
        <span className="text-xs font-semibold bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10">
          {calendarEvents.length} {calendarEvents.length === 1 ? "Termin" : "Termine"}
        </span>
      </div>

      {/* KONZERTE-LISTE */}
      {calendarEvents.length === 0 ? (
        <div className="bg-black/30 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center text-indigo-200/70 text-sm">
          Aktuell sind keine öffentlichen Termine im Kalender hinterlegt.
        </div>
      ) : (
        <div className="grid gap-5">
          {calendarEvents.map((event) => {
            const mapsUrl = event.ort 
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.ort)}` 
              : null;

            return (
              <div key={event.id} className="bg-black/30 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
                <div>
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">{event.datum}</span>
                  
                  {/* Titel als klickbarer Link zur Detailseite */}
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    <Link href={`/konzerte/${event.id}`} className="hover:text-indigo-300 transition-colors">
                      {event.titel}
                    </Link>
                  </h2>
                  
                  {event.ort && (
                    <p className="text-xs text-indigo-200/70 mt-1 flex items-center gap-1.5 font-medium">
                      <span>📍</span> 
                      {mapsUrl ? (
                        <a 
                          href={mapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-indigo-300 hover:underline hover:text-white transition-colors"
                        >
                          {event.ort}
                        </a>
                      ) : (
                        event.ort
                      )}
                    </p>
                  )}
                </div>

                {/* Kurzbeschreibung */}
                {event.beschreibung && (
                  <p className="text-xs text-indigo-100/90 leading-relaxed whitespace-pre-line line-clamp-3">
                    {event.beschreibung}
                  </p>
                )}

                {/* Bild */}
                {event.vorschaubild && (
                  <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                    <img 
                      src={event.vorschaubild} 
                      alt={event.titel} 
                      className="w-full h-full object-cover opacity-90"
                    />
                  </div>
                )}

                {/* Buttons (Details ansehen & Tickets) */}
                <div className="flex flex-wrap gap-3 pt-1">
                  <Link 
                    href={`/konzerte/${event.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10 shadow-md transition-colors"
                  >
                    🔍 Details anzeigen
                  </Link>

                  {event.ticketUrl && (
                    <a 
                      href={event.ticketUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-md transition-colors"
                    >
                      🎟️ Tickets sichern
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}