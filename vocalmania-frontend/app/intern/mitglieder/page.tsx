import { Pool } from "pg";
import MembersClient from "./MembersClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function MembersPage() {
  let members = [];
  let registers = [];

  try {
    const membersResult = await pool.query(
      `SELECT m.id, m.vorname, m.nachname, m.gmail, m.register_id, 
              m.mobil_number, m.street_name_and_house_number, m.town, 
              m.plz, m.birthday, m.part_of_since_year, 
              r.description_short as register_name
       FROM members m
       LEFT JOIN backend_registers r ON m.register_id = r.id
       ORDER BY r.id, m.nachname, m.vorname`
    );
    members = membersResult.rows;

    const registersResult = await pool.query(
      `SELECT id, description_short, description_long FROM backend_registers ORDER BY id`
    );
    registers = registersResult.rows;
  } catch (error) {
    console.error("Fehler beim Laden der Mitglieder:", error);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* SEITEN-HEADER */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Chormitglieder-Verwaltung</h1>
          <p className="text-xs text-indigo-200/70 mt-0.5">Übersicht aller aktiven Sängerinnen und Sänger nach Registern.</p>
        </div>
      </div>

      <MembersClient initialMembers={members} registers={registers} />

    </div>
  );
}