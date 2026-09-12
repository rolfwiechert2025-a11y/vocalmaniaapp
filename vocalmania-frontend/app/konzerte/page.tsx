import { google } from 'googleapis';

interface CalendarEvent {
  id?: string | null;
  summary?: string | null;
  description?: string | null;
  start?: {
    dateTime?: string | null;
    date?: string | null;
  };
  location?: string | null;
}

interface ParsedEventData {
  shortDesc: string;
  longDesc: string;
  imageUrl: string | null;
  ticketUrl: string | null;
  customLocation: string | null;
}

// 1. Google Auth initialisieren
function getGoogleAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
    ],
  });
}

// 2. Google Doc Inhalt laden und Sektoren parsen
async function fetchGoogleDocContent(fileId: string): Promise<ParsedEventData> {
  const defaultData: ParsedEventData = {
    shortDesc: '',
    longDesc: '',
    imageUrl: null,
    ticketUrl: null,
    customLocation: null,
  };

  try {
    const auth = getGoogleAuth();
    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.export({
      fileId: fileId,
      mimeType: 'text/plain',
    });

    let rawText = typeof response.data === 'string' ? response.data : '';
    rawText = rawText.replace(/<[^>]*>?/gm, '');

    function extractSection(tag: string): string {
      const regex = new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\s*\\[[a-zA-ZäöüÄÖÜß]+\\]|$)`, 'i');
      const match = rawText.match(regex);
      return match ? match[1].trim() : '';
    }

    const shortDesc = extractSection('Kurzbeschreibung');
    const longDesc = extractSection('Beschreibung');
    const rawImage = extractSection('Bild');
    const ticketUrl = extractSection('Ticketlink') || null;
    const customLocation = extractSection('Ort') || null;

    let imageUrl: string | null = null;
    const fileIdMatch = rawImage.match(/(?:\/file\/d\/|\/open\?id=|\/document\/d\/|\/d\/|d\/)([a-zA-Z0-9_-]{25,})/);
    if (fileIdMatch && fileIdMatch[1]) {
      imageUrl = `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }

    return {
      shortDesc,
      longDesc,
      imageUrl,
      ticketUrl,
      customLocation,
    };
  } catch (error) {
    console.error(`Fehler beim Laden des Google Docs (${fileId}):`, error);
    return defaultData;
  }
}

async function getPublicEvents() {
  try {
    const auth = getGoogleAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId: process.env.PUBLIC_CALENDAR_ID,
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    const processedEvents = await Promise.all(
      events.map(async (event) => {
        const rawDescription = event.description || "";
        
        let docData: ParsedEventData = {
          shortDesc: '',
          longDesc: '',
          imageUrl: null,
          ticketUrl: null,
          customLocation: null,
        };

        const docMatch = rawDescription.match(/(?:docs\.google\.com\/document\/d\/|\/document\/d\/)([a-zA-Z0-9_-]+)/);
        if (docMatch && docMatch[1]) {
          docData = await fetchGoogleDocContent(docMatch[1]);
        } else {
          docData.shortDesc = rawDescription.replace(/<[^>]*>?/gm, '').trim();
        }

        const finalLocation = docData.customLocation || event.location || null;

        return {
          ...event,
          resolvedShortDesc: docData.shortDesc,
          resolvedLongDesc: docData.longDesc,
          imageUrl: docData.imageUrl,
          ticketUrl: docData.ticketUrl,
          resolvedLocation: finalLocation,
        };
      })
    );

    return processedEvents;
  } catch (error) {
    console.error('Fehler beim Laden des Kalenders:', error);
    return [];
  }
}

export default async function KonzertePage() {
  const calendarEvents = await getPublicEvents();

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Anstehende Konzerte</h1>
        <p className="text-slate-600 mt-1">Erlebe Vocalmania live bei unseren nächsten Auftritten.</p>
      </div>

      {calendarEvents.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-500">
          Aktuell sind keine öffentlichen Termine im Kalender hinterlegt.
        </div>
      ) : (
        <div className="grid gap-4">
          {calendarEvents.map((event, index) => {
            const startDate = new Date(event.start?.dateTime || event.start?.date || "");
            const formattedDate = !isNaN(startDate.getTime()) 
              ? startDate.toLocaleDateString("de-DE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : "Datum auf Anfrage";

            // Google Maps Link URL generieren
            const mapsUrl = event.resolvedLocation 
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.resolvedLocation)}` 
              : null;

            return (
              <div key={event.id || index} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{formattedDate}</span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">{event.summary || "Kein Titel"}</h2>
                  
                  {event.resolvedLocation && (
                    <p className="text-sm text-slate-600 mt-1 flex items-center gap-1.5">
                      <span>📍</span> 
                      {mapsUrl ? (
                        <a 
                          href={mapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-indigo-600 hover:underline hover:text-indigo-800 transition-colors"
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
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{event.resolvedShortDesc}</p>
                )}

                {/* Google Drive Bild */}
                {event.imageUrl && (
                  <div className="relative w-full h-56 md:h-72 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
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
                      className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
                    >
                      🎟️ Tickets sichern
                    </a>
                  </div>
                )}

                {/* Langbeschreibung als Aufklapp-Menü */}
{/* Langbeschreibung als Aufklapp-Menü */}
                {event.resolvedLongDesc && (
                  <details className="group border-t border-slate-100 pt-2.5">
                    <summary className="text-xs font-semibold text-indigo-600 cursor-pointer list-none flex items-center justify-between">
                      <span>Mehr Details & Infos anzeigen</span>
                      <span className="group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-2.5 text-sm text-slate-600 space-y-1 whitespace-pre-line">
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