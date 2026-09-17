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

// POST: Neues Mitglied anlegen
export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      vorname, 
      nachname, 
      gmail, 
      register_id, 
      mobil_number, 
      street_name_and_house_number, 
      town, 
      plz, 
      birthday, 
      part_of_since_year 
    } = body;

    if (!vorname || !vorname.trim() || !nachname || !nachname.trim()) {
      return NextResponse.json({ error: "Vorname und Nachname sind Pflichtfelder." }, { status: 400 });
    }

    if (!register_id) {
      return NextResponse.json({ error: "Bitte ein Stimmregister auswählen." }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO members (
        vorname, nachname, gmail, register_id, mobil_number, 
        street_name_and_house_number, town, plz, birthday, part_of_since_year
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        vorname.trim(), 
        nachname.trim(), 
        gmail?.trim() || null, 
        register_id, 
        mobil_number?.trim() || null, 
        street_name_and_house_number?.trim() || null, 
        town?.trim() || null, 
        plz?.trim() || null, 
        birthday || null, 
        part_of_since_year ? Number(part_of_since_year) : null
      ]
    );

    return NextResponse.json({ success: true, member: result.rows[0] });
  } catch (error: unknown) {
    console.error("Fehler beim Anlegen:", error);
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === '23505') {
      return NextResponse.json({ error: "Diese E-Mail-Adresse ist bereits vergeben." }, { status: 400 });
    }
    return NextResponse.json({ error: "Datenbankfehler beim Anlegen" }, { status: 500 });
  }
}

// PUT: Mitglied bearbeiten
export async function PUT(request: Request) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { 
      id, 
      vorname, 
      nachname, 
      gmail, 
      register_id, 
      mobil_number, 
      street_name_and_house_number, 
      town, 
      plz, 
      birthday, 
      part_of_since_year 
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Ungültige Mitglieder-ID." }, { status: 400 });
    }

    if (!vorname || !vorname.trim() || !nachname || !nachname.trim()) {
      return NextResponse.json({ error: "Vorname und Nachname sind Pflichtfelder." }, { status: 400 });
    }

    if (!register_id) {
      return NextResponse.json({ error: "Bitte ein Stimmregister auswählen." }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE members 
       SET vorname = $1, 
           nachname = $2, 
           gmail = $3, 
           register_id = $4, 
           mobil_number = $5, 
           street_name_and_house_number = $6, 
           town = $7, 
           plz = $8, 
           birthday = $9, 
           part_of_since_year = $10
       WHERE id = $11 RETURNING *`,
      [
        vorname.trim(), 
        nachname.trim(), 
        gmail?.trim() || null, 
        register_id, 
        mobil_number?.trim() || null, 
        street_name_and_house_number?.trim() || null, 
        town?.trim() || null, 
        plz?.trim() || null, 
        birthday || null, 
        part_of_since_year ? Number(part_of_since_year) : null,
        id
      ]
    );

    return NextResponse.json({ success: true, member: result.rows[0] });
  } catch (error: unknown) {
    console.error("Fehler beim Aktualisieren:", error);
    return NextResponse.json({ error: "Datenbankfehler beim Aktualisieren" }, { status: 500 });
  }
}

// DELETE: Mitglied löschen
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

    await pool.query(`DELETE FROM members WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Fehler beim Löschen:", error);
    return NextResponse.json({ error: "Datenbankfehler beim Löschen" }, { status: 500 });
  }
}