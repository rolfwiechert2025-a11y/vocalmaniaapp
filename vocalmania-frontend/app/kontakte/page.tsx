import Image from 'next/image';
import { getPublicEvents } from '@/lib/events';

export default async function KonzertePage() {
  const calendarEvents = await getPublicEvents();

  return (
    <div className="space-y-6">
      
      {/* 1. HERO-BEREICH */}
      <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/10 mb-8">
        <Image 
          src="/DSC_9566-2-fertig.jpg" 
          alt="Vocalmania Chor" 
          fill 
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        
        <div className="absolute bottom-6 left-0 right-0 z-10 px-6 md:px-8">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Anstehende Konzerte
            </h1>
            <p className="text-xs md:text-sm font-semibold text-indigo-300 tracking-[0.2em] uppercase">
              Erlebe Vocalmania live
            </p>
          </div>
        </div>
      </div>

      {/* 2. KONZERTE-LISTE IM NEUEN GLAS-DESIGN */}
      {calendarEvents.length === 0 ? (
        <div className="bg-black/30 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center text-indigo-200/70 text-sm">
          Aktuell sind keine öffentlichen Termine im Kalender hinterlegt.
        </div>
      ) : (
        <div className="grid gap-6">
          {calendarEvents.map((event, index) => {
            const startDate = new Date(event.start?.dateTime || event.start?.date || "");
            const formattedDate = !isNaN(startDate.getTime()) 
              ? startDate.toLocaleDateString("de-DE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : "Datum auf Anfrage";

            const mapsUrl = event.resolvedLocation 
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.resolvedLocation)}` 
              : null;

            return (
              <div key={event.id || index} className="bg-gradient-to-br from-black/30 via-black/40 to-black/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-4">
                <div>
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">{formattedDate}</span>
                  <h2 className="text-xl font-bold text-white mt-1">{event.summary || "Kein Titel"}</h2>
                  
                  {event.resolvedLocation && (
                    <p className="text-xs text-indigo-200/80 mt-1.5 flex items-center gap-1.5">
                      <span>📍</span> 
                      {mapsUrl ? (
                        <a 
                          href={mapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-indigo-300 hover:underline hover:text-white transition-colors"
                        >
                          {event.resolvedLocation}
                        </a>
                      ) : (
                        event.resolvedLocation
                      )}
                    </p>
                  )}
                </div>

                {/* Kurzbeschreibung */}
                {event.resolvedShortDesc && (
                  <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed whitespace-pre-line">{event.resolvedShortDesc}</p>
                )}

                {/* Google Drive Bild */}
                {event.imageUrl && (
                  <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                    <img 
                      src={event.imageUrl} 
                      alt={event.summary || "Konzert Plakat"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Ticket-Link Button */}
                {event.ticketUrl && (
                  <div>
                    <a 
                      href={event.ticketUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-full shadow-md transition-colors"
                    >
                      🎟️ Tickets sichern
                    </a>
                  </div>
                )}

                {/* Langbeschreibung als Aufklapp-Menü */}
                {event.resolvedLongDesc && (
                  <details className="group border-t border-white/10 pt-3">
                    <summary className="text-xs font-semibold text-indigo-300 cursor-pointer list-none flex items-center justify-between">
                      <span>Mehr Details & Infos anzeigen</span>
                      <span className="group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-2 text-xs text-indigo-200/70 space-y-1 whitespace-pre-line">
                      {String(event.resolvedLongDesc)}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}