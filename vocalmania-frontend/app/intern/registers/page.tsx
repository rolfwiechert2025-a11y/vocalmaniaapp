import { Pool } from "pg";
import RegistersClient from "./RegistersClient";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function RegistersPage() {
  let registers = [];

  try {
    const result = await pool.query(
      `SELECT id, description_short, description_long FROM backend_registers ORDER BY description_short`
    );
    registers = result.rows;
  } catch (error) {
    console.error("Fehler beim Laden der Register:", error);
  }

  return <RegistersClient initialRegisters={registers} />;
}