import { google } from 'googleapis';
import { getGoogleAuth } from '@/lib/googleauth';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface ParsedEventData {
  shortDesc: string;
  longDesc: string;
  imageUrl: string | null;
  ticketUrl: string | null;
  customLocation: string | null;
}

// Einheitliches Interface für öffentliche & interne Events
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start?: {
    dateTime?: string | null;
    date?: string | null;
  };
  location?: string;
  
  // Öffentliche Felder
  titel?: string;
  datum?: string;
  ort?: string;
  vorschaubild?: string | null;
  beschreibung?: string;
  ticketUrl?: string | null;

  // Interne Felder für Proben & Rückmeldungen
  userStatus?: 'yes' | 'maybe' | 'no' | null;          // Vorab-Planung
  userAttendanceStatus?: 'yes' | 'maybe' | 'no' | null; // Finale Nachbereitung (Anwesend/Entschuldigt/Unentschuldigt)
  attendanceCounts?: {
    yes: number;
    maybe: number;
    no: number;
  };
  attendeesList?: Array<{
    memberId: number;
    vorname: string;
    nachname: string;
    registerShort: string;
    status: 'yes' | 'maybe' | 'no' | null;
    attendanceStatus?: 'yes' | 'maybe' | 'no' | null;
    updatedAt?: string;
  }>;
}

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

    return { shortDesc, longDesc, imageUrl, ticketUrl, customLocation };
  } catch (error) {
    console.error(`Fehler beim Laden des Google Docs (${fileId}):`, error);
    return defaultData;
  }
}

// Öffentliche Events laden (für Startseite, Karussell & Detailseite)
export async function getPublicEvents(): Promise<CalendarEvent[]> {
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
      events.map(async (event): Promise<CalendarEvent> => {
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

        const startDate = new Date(event.start?.dateTime || event.start?.date || "");
        const formattedDate = !isNaN(startDate.getTime()) 
          ? startDate.toLocaleDateString("de-DE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : "Datum auf Anfrage";

        const finalLocation = docData.customLocation || event.location || "";

        return {
          id: event.id || Math.random().toString(),
          summary: event.summary || "Kein Titel",
          description: rawDescription,
          start: event.start,
          location: finalLocation,
          titel: event.summary || "Kein Titel",
          datum: formattedDate,
          ort: finalLocation,
          vorschaubild: docData.imageUrl,
          beschreibung: docData.longDesc || docData.shortDesc || "",
          ticketUrl: docData.ticketUrl,
        };
      })
    );

    return processedEvents;
  } catch (error) {
    console.error('Fehler beim Laden des öffentlichen Kalenders:', error);
    return [];
  }
}

// Einzelnes Konzert für die Detailseite finden
export async function getKonzertById(id: string): Promise<CalendarEvent | null> {
  const events = await getPublicEvents();
  return events.find((e) => e.id === id) || null;
}

// Interne Events laden (inkl. vollständiger Mitglieder-, Planungs- und Anwesenheits-Logik pro Event)
export async function fetchInternalCalendarEvents(userEmail: string): Promise<CalendarEvent[]> {
  try {
    const auth = getGoogleAuth();
    const calendar = google.calendar({ version: 'v3', auth });

// Wir setzen den Start auf vor 3 Tagen, damit auch gerade vergangene Termine noch da sind
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const response = await calendar.events.list({
      calendarId: process.env.INTERNAL_CALENDAR_ID || process.env.PUBLIC_CALENDAR_ID,
      timeMin: threeDaysAgo.toISOString(), 
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    // 1. Hole die ID des aktuell angemeldeten Users anhand seiner E-Mail
    const memberResult = await pool.query(
      `SELECT id FROM members WHERE gmail = $1`,
      [userEmail]
    );
    const currentMemberId = memberResult.rows.length > 0 ? memberResult.rows[0].id : null;

    // 2. Hole einmalig alle Mitglieder und deren Register
    const membersResult = await pool.query(
      `SELECT m.id as member_id, m.vorname, m.nachname, r.description_short as register_short
       FROM members m
       LEFT JOIN backend_registers r ON m.register_id = r.id
       ORDER BY m.nachname, m.vorname`
    );
    const allMembers = membersResult.rows;

    // 3. Verarbeite jeden Kalendertermin
    const processedEvents: CalendarEvent[] = await Promise.all(
      events.map(async (event) => {
        const eventId = event.id || Math.random().toString();

        const attendanceResult = await pool.query(
          `SELECT member_id, status, attendance_status, updated_at FROM event_attendance WHERE event_id = $1`,
          [eventId]
        );
        const eventAttendance = attendanceResult.rows;

        // Führe Mitglieder und Attendance zusammen
        const attendeesList = allMembers.map(member => {
          const att = eventAttendance.find(a => a.member_id === member.member_id);
          return {
            memberId: member.member_id,
            vorname: member.vorname,
            nachname: member.nachname,
            registerShort: member.register_short || 'Unbekannt',
            // Wichtig: Nur wenn explizit ein Status in der DB steht, wird er für die Planung übernommen
            status: att && att.status ? att.status : null,
            attendanceStatus: att && att.attendance_status ? att.attendance_status : 'no',
            updatedAt: att ? att.updated_at : null,
          };
        });

        // Ermittle den eigenen Status des angemeldeten Users
        let userStatus: 'yes' | 'maybe' | 'no' | null = null;
        let userAttendanceStatus: 'yes' | 'maybe' | 'no' | null = 'no';

        if (currentMemberId) {
          const ownAtt = eventAttendance.find(a => a.member_id === currentMemberId);
          if (ownAtt) {
            userStatus = ownAtt.status || null;
            userAttendanceStatus = ownAtt.attendance_status || 'no';
          }
        }

        // Exakte Zähler für die Vorab-Planung (nur echte Klicks zählen)
        const yes = attendeesList.filter(r => r.status === 'yes').length;
        const maybe = attendeesList.filter(r => r.status === 'maybe').length;
        const no = attendeesList.filter(r => r.status === 'no').length;

        return {
          id: eventId,
          summary: event.summary || "Kein Titel",
          description: event.description || "",
          start: event.start,
          location: event.location || "",
          userStatus,
          userAttendanceStatus,
          attendanceCounts: { yes, maybe, no },
          attendeesList,
        };
      })
    );

    return processedEvents;
  } catch (error) {
    console.error('Fehler beim Laden des internen Kalenders:', error);
    return [];
  }
}