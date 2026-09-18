import { Pool } from "pg";
import RegistersClient from "./RegistersClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* SEITEN-HEADER */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Stimmregister-Verwaltung</h1>
          <p className="text-xs text-indigo-200/70 mt-0.5">Übersicht aller Chorregister (Sopran, Alt, Tenor, Bass etc.).</p>
        </div>
      </div>

      <RegistersClient initialRegisters={registers} />

    </div>
  );
}