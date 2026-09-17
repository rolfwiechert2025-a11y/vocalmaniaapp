import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkAuth() {
  const session = await getServerSession(authOptions);
  return session && session.user?.email;
}

// POST: Neues Register anlegen
export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { description_short, description_long } = body;

    if (!description_short || !description_short.trim()) {
      return NextResponse.json({ error: "Kurzbeschreibung ist ein Pflichtfeld." }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO backend_registers (description_short, description_long) 
       VALUES ($1, $2) RETURNING *`,
      [description_short.trim(), description_long?.trim() || null]
    );

    return NextResponse.json({ success: true, register: result.rows[0] });
  } catch (error: unknown) {
    console.error("Fehler beim Anlegen des Registers:", error);
    return NextResponse.json({ error: "Datenbankfehler beim Anlegen" }, { status: 500 });
  }
}

// PUT: Register bearbeiten
export async function PUT(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, description_short, description_long } = body;

    if (!id) {
      return NextResponse.json({ error: "Ungültige Register-ID." }, { status: 400 });
    }

    if (!description_short || !description_short.trim()) {
      return NextResponse.json({ error: "Kurzbeschreibung ist ein Pflichtfeld." }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE backend_registers 
       SET description_short = $1, description_long = $2
       WHERE id = $3 RETURNING *`,
      [description_short.trim(), description_long?.trim() || null, id]
    );

    return NextResponse.json({ success: true, register: result.rows[0] });
  } catch (error: unknown) {
    console.error("Fehler beim Aktualisieren des Registers:", error);
    return NextResponse.json({ error: "Datenbankfehler beim Aktualisieren" }, { status: 500 });
  }
}

// DELETE: Register löschen
export async function DELETE(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID fehlt." }, { status: 400 });
    }

    // Optional prüfen, ob noch Mitglieder in diesem Register sind, um Fremdschlüsselkonflikte abzufangen
    const checkMembers = await pool.query(`SELECT COUNT(*) FROM members WHERE register_id = $1`, [id]);
    if (parseInt(checkMembers.rows[0].count) > 0) {
      return NextResponse.json({ error: "Dieses Register kann nicht gelöscht werden, da ihm noch Chormitglieder zugeordnet sind." }, { status: 400 });
    }

    await pool.query(`DELETE FROM backend_registers WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Fehler beim Löschen des Registers:", error);
    return NextResponse.json({ error: "Datenbankfehler beim Löschen" }, { status: 500 });
  }
}