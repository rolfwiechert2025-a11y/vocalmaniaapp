import { Pool } from "pg";
import MembersClient from "./MembersClient";

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

  return <MembersClient initialMembers={members} registers={registers} />;
}