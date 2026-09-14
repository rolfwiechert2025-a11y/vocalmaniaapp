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
  status: 'yes' | 'maybe' | 'no' | null;
  updatedAt?: string | null;
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

    // 1. Alle Mitglieder und Register einmalig laden
    const membersResult = await pool.query(
      `SELECT m.id as member_id, m.vorname, m.nachname, m.gmail, r.description_short as register_short
       FROM members m
       LEFT JOIN backend_registers r ON m.register_id = r.id
       ORDER BY m.nachname, m.vorname`
    );
    const allMembers = membersResult.rows;

    // 2. Alle Attendance-Einträge für diese Events laden
    const attendanceResult = await pool.query(
      `SELECT event_id, member_id, status, updated_at
       FROM event_attendance
       WHERE event_id = ANY($1)`,
      [eventIds]
    );
    const allAttendance = attendanceResult.rows;

    return items.map(item => {
      const eventId = item.id || '';
      const eventAttendance = allAttendance.filter(a => a.event_id === eventId);

      // Für jedes Mitglied den Status für DIESES Event ermitteln (falls vorhanden)
      const attendeesList: AttendeeDetail[] = allMembers.map(member => {
        const att = eventAttendance.find(a => a.member_id === member.member_id);
        return {
          memberId: member.member_id,
          vorname: member.vorname,
          nachname: member.nachname,
          registerShort: member.register_short || 'Unbekannt',
          status: att ? (att.status as 'yes' | 'maybe' | 'no') : null,
          updatedAt: att ? att.updated_at : null,
        };
      });

      const respondedRows = attendeesList.filter(a => a.status !== null);
      const yes = respondedRows.filter(r => r.status === 'yes').length;
      const maybe = respondedRows.filter(r => r.status === 'maybe').length;
      const no = respondedRows.filter(r => r.status === 'no').length;

      let userStatus: 'yes' | 'maybe' | 'no' | null = null;
      if (userEmail) {
        const userMember = allMembers.find(m => m.gmail === userEmail);
        if (userMember) {
          const userAtt = attendeesList.find(a => a.memberId === userMember.member_id);
          if (userAtt) {
            userStatus = userAtt.status;
          }
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