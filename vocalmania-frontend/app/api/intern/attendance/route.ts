import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const { eventId, status, mode = "planning", targetMemberId } = await request.json();
    const userEmail = session.user.email;

    if (!eventId || !["yes", "maybe", "no"].includes(status)) {
      return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }

    const memberResult = await pool.query(
      `SELECT id FROM members WHERE gmail = $1`,
      [userEmail]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Dieses Google-Konto ist keinem Chormitglied zugeordnet." },
        { status: 403 }
      );
    }

    const currentMemberId = memberResult.rows[0].id;
    const memberIdToUpdate = targetMemberId || currentMemberId;

    // STRIKTE TRENNUNG: Entweder nur Anwesenheit ODER nur Vorab-Planung aktualisieren
    if (mode === "attendance") {
      // 1. NUR ANWESENHEIT SPEICHERN (attendance_status) - rührt 'status' (Planung) niemals an!
      const query = `
        INSERT INTO event_attendance (event_id, member_id, attendance_status, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (event_id, member_id)
        DO UPDATE SET attendance_status = EXCLUDED.attendance_status, updated_at = NOW();
      `;
      await pool.query(query, [eventId, memberIdToUpdate, status]);
    } else {
      // 2. NUR VORAB-PLANUNG SPEICHERN (status) - rührt 'attendance_status' nicht an!
      const query = `
        INSERT INTO event_attendance (event_id, member_id, status, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (event_id, member_id)
        DO UPDATE SET status = EXCLUDED.status, updated_at = NOW();
      `;
      await pool.query(query, [eventId, memberIdToUpdate, status]);
    }

    // Alle Mitglieder und die Attendance-Daten für dieses Event abrufen
    const membersResult = await pool.query(
      `SELECT m.id as member_id, m.vorname, m.nachname, r.description_short as register_short
       FROM members m
       LEFT JOIN backend_registers r ON m.register_id = r.id
       ORDER BY m.nachname, m.vorname`
    );
    const allMembers = membersResult.rows;

    const attendanceResult = await pool.query(
      `SELECT member_id, status, attendance_status, updated_at FROM event_attendance WHERE event_id = $1`,
      [eventId]
    );
    const eventAttendance = attendanceResult.rows;

    const attendeesList = allMembers.map(member => {
      const att = eventAttendance.find(a => a.member_id === member.member_id);
      return {
        memberId: member.member_id,
        vorname: member.vorname,
        nachname: member.nachname,
        registerShort: member.register_short || 'Unbekannt',
        status: att && att.status ? att.status : null, // Nur echter Status oder null
        attendanceStatus: att && att.attendance_status ? att.attendance_status : 'no',
        updatedAt: att ? att.updated_at : null,
      };
    });

    // Zähler für die Vorab-Planung (nur echte Klicks zählen)
    const yes = attendeesList.filter(r => r.status === 'yes').length;
    const maybe = attendeesList.filter(r => r.status === 'maybe').length;
    const no = attendeesList.filter(r => r.status === 'no').length;

    return NextResponse.json({ 
      success: true, 
      attendanceCounts: { yes, maybe, no },
      attendeesList 
    });
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }
}