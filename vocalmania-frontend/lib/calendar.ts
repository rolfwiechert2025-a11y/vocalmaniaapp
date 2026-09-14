import { google } from 'googleapis';
import { getGoogleAuth } from '@/lib/googleauth';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface AttendeeDetail {
  memberId: string;
  vorname: string;
  nachname: string;
  registerShort: string;
  status: 'yes' | 'maybe' | 'no';
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendanceCounts: {
    yes: number;
    maybe: number;
    no: number;
  };
  attendeesList: AttendeeDetail[];
  userStatus?: 'yes' | 'maybe' | 'no' | null;
}

export async function fetchInternalCalendarEvents(userEmail?: string): Promise<CalendarEvent[]> {
  const calendarId = process.env.INTERNAL_CALENDAR_ID;
  if (!calendarId) return [];

  try {
    const auth = getGoogleAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    const now = new Date().toISOString();
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: now,
      maxResults: 30,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const items = response.data.items || [];
    const eventIds = items.map(item => item.id).filter(Boolean);

    if (eventIds.length === 0) return [];

    // Hier wurde von 'register' auf 'backend_registers' angepasst
    const dbResult = await pool.query(
      `SELECT ea.event_id, ea.status, m.id as member_id, m.vorname, m.nachname, m.gmail, r.description_short as register_short
       FROM event_attendance ea
       JOIN members m ON ea.member_id = m.id
       LEFT JOIN backend_registers r ON m.register_id = r.id
       WHERE ea.event_id = ANY($1)`,
      [eventIds]
    );

    const rows = dbResult.rows;

    return items.map(item => {
      const eventId = item.id || '';
      const eventRows = rows.filter(r => r.event_id === eventId);

      const yes = eventRows.filter(r => r.status === 'yes').length;
      const maybe = eventRows.filter(r => r.status === 'maybe').length;
      const no = eventRows.filter(r => r.status === 'no').length;

      const attendeesList: AttendeeDetail[] = eventRows.map(r => ({
        memberId: r.member_id,
        vorname: r.vorname,
        nachname: r.nachname,
        registerShort: r.register_short || 'Unbekannt',
        status: r.status,
      }));

      let userStatus: 'yes' | 'maybe' | 'no' | null = null;
      if (userEmail) {
        const userRow = eventRows.find(r => r.gmail === userEmail);
        if (userRow) {
          userStatus = userRow.status as 'yes' | 'maybe' | 'no';
        }
      }

      return {
        id: eventId,
        summary: item.summary || 'Interner Termin',
        description: item.description || '',
        start: item.start?.dateTime || item.start?.date || '',
        end: item.end?.dateTime || item.end?.date || '',
        location: item.location || '',
        attendanceCounts: { yes, maybe, no },
        attendeesList,
        userStatus,
      };
    });
  } catch (error) {
    console.error("Fehler beim Laden des internen Kalenders:", error);
    return [];
  }
}