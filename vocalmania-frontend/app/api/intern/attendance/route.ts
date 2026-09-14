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
    const { eventId, status } = await request.json();
    const userEmail = session.user.email;

    if (!eventId || !["yes", "maybe", "no"].includes(status)) {
      return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }

    // Mitglied über gmail finden
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

    const memberId = memberResult.rows[0].id;

    // Rückmeldung speichern oder aktualisieren
    const query = `
      INSERT INTO event_attendance (event_id, member_id, status, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (event_id, member_id)
      DO UPDATE SET status = EXCLUDED.status, updated_at = NOW();
    `;

    await pool.query(query, [eventId, memberId, status]);

    // Nach dem Speichern alle aktuellen Rückmeldungen für DIESES Event auslesen,
    // damit das Frontend die Namensliste und Zähler direkt in Echtzeit aktualisieren kann.
const updatedDbResult = await pool.query(
      `SELECT ea.event_id, ea.status, m.id as member_id, m.vorname, m.nachname, m.gmail, r.description_short as register_short
       FROM event_attendance ea
       JOIN members m ON ea.member_id = m.id
       LEFT JOIN backend_registers r ON m.register_id = r.id
       WHERE ea.event_id = $1`,
      [eventId]
    );

    const eventRows = updatedDbResult.rows;
    const yes = eventRows.filter(r => r.status === 'yes').length;
    const maybe = eventRows.filter(r => r.status === 'maybe').length;
    const no = eventRows.filter(r => r.status === 'no').length;

    const attendeesList = eventRows.map(r => ({
      memberId: r.member_id,
      vorname: r.vorname,
      nachname: r.nachname,
      registerShort: r.register_short || 'Unbekannt',
      status: r.status,
    }));

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