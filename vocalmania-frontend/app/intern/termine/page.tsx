import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchInternalCalendarEvents, CalendarEvent } from "@/lib/calendar";
import TermineClient from "./TermineClient";
import Image from "next/image";

export default async function InternTerminePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/intern/login");

  // Events sauber typisiert laden
  const events: CalendarEvent[] = await fetchInternalCalendarEvents(session.user.email);

  return (
    <div className="space-y-0">
      {/* HERO-BEREICH */}
      <div className="relative w-full h-72 md:h-96 bg-slate-900 -mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-8 overflow-hidden">
        <Image 
          src="/DSC_9566-2-fertig.jpg" 
          alt="Vocalmania Chor" 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute bottom-6 left-6 md:left-10 z-10 text-white space-y-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
            Interne Termine
          </h1>
          <p className="text-xs md:text-sm font-bold text-indigo-400 tracking-[0.25em]">
            Proben & Chortermine
          </p>
        </div>
      </div>

      {/* INHALTSBEREICH */}
      <div className="bg-white -mx-6 md:-mx-10 px-6 md:px-10 py-8 space-y-8 border-b border-slate-200">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide">Kommende Termine & Proben</h2>
          <p className="text-sm text-slate-500 mt-0.5">Übersicht aller anstehenden Chorproben inklusive deiner Rückmeldung.</p>
        </div>

        {events.length === 0 ? (
          <div className="p-8 bg-slate-50 border border-slate-200 text-sm text-slate-500 text-center font-medium">
            Aktuell sind keine kommenden Termine hinterlegt.
          </div>
        ) : (
          <TermineClient initialEvents={events} />
        )}
      </div>
    </div>
  );
}