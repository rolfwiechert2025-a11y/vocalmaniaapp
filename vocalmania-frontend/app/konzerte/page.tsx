import { google } from 'googleapis';

interface CalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
}

async function getPublicEvents(): Promise<CalendarEvent[]> {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId: process.env.PUBLIC_CALENDAR_ID,
      timeMin: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Fehler beim Laden des Kalenders:', error);
    return [];
  }
}

export default async function KonzertePage() {
  const events = await getPublicEvents();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Anstehende Konzerte</h1>
        <p className="text-slate-600 mt-1">Erlebe Vocalmania live bei unseren nächsten Auftritten.</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-500">
          Aktuell sind keine öffentlichen Termine im Kalender hinterlegt.
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => {
            const startDate = new Date(event.start?.dateTime || event.start?.date || "");
            const formattedDate = !isNaN(startDate.getTime()) 
              ? startDate.toLocaleDateString("de-DE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : "Datum auf Anfrage";

            return (
              <div key={event.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{formattedDate}</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{event.summary || "Kein Titel"}</h2>
                {event.location && (
                  <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                    <span>📍</span> {event.location}
                  </p>
                )}
                {event.description && (
                  <p className="text-sm text-slate-500 mt-2">{event.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}