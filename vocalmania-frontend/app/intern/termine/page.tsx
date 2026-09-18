import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchInternalCalendarEvents, CalendarEvent } from "@/lib/calendar";
import TermineClient from "./TermineClient";

export default async function InternTerminePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/login");

  // Events sauber typisiert laden
  const events: CalendarEvent[] = await fetchInternalCalendarEvents(session.user.email);

  return (
    <div className="space-y-6">
      
      {/* SEITEN-HEADER (Im cleanen AppShell-Design ohne Hero-Bild) */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Interne Termine</h1>
          <p className="text-xs text-indigo-200/70 mt-0.5">Übersicht aller anstehenden Chorproben inklusive deiner Rückmeldung.</p>
        </div>
        <span className="text-xs font-semibold bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/10">
          {events.length} {events.length === 1 ? "Termin" : "Termine"}
        </span>
      </div>

      {/* CLIENT KOMPONENTE FÜR FILTER & INTERAKTION */}
      {events.length === 0 ? (
        <div className="p-8 bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 text-sm text-indigo-200/70 text-center font-medium shadow-xl">
          Aktuell sind keine kommenden Termine hinterlegt.
        </div>
      ) : (
        <TermineClient initialEvents={events} />
      )}

    </div>
  );
}