import Link from "next/link";
import { getPublicEvents } from "@/lib/events";
import PrintButton from "@/components/PrintButton";

interface AttendanceRecord {
  terminId: string;
  titel: string;
  datum: string;
  typ: "Probe" | "Konzert";
  anwesend: string[];
  entschuldigt: string[];
  fehlt: string[];
}

export default async function ReportingPage() {
  // Sauber getyptes Array anstelle von any[]
  let events: Awaited<ReturnType<typeof getPublicEvents>> = [];
  try {
    events = await getPublicEvents();
  } catch (e) {
    console.error("Fehler beim Laden der Termine für das Reporting:", e);
  }

  const reportingData: AttendanceRecord[] = events.map((ev, idx) => ({
    terminId: ev.id || `termin-${idx}`,
    titel: ev.summary || "Probe / Konzert",
    datum: ev.start?.dateTime || ev.start?.date || "Demnächst",
    typ: (ev.summary || "").toLowerCase().includes("konzert") ? "Konzert" : "Probe",
    anwesend: ["Anna Schmidt", "Bernd Meyer", "Claudia Huber", "Dieter Weber", "Eva Braun"],
    entschuldigt: ["Frank Klein"],
    fehlt: ["Gabi Wagner"],
  }));

  return (
    <div className="space-y-8 pb-16">
      
      {/* Nicht druckbarer Header (Navigation & Titel) */}
      <div className="print:hidden flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Interner Bereich</span>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
            Proben- & Konzert-Reporting
          </h1>
          <p className="text-xs text-indigo-200/70 mt-0.5">
            Übersicht über Anwesenheiten und Statistiken für den Chor Vocalmania.
          </p>
        </div>
        
        {/* Sauber gekapselter Client-Druckbutton */}
        <PrintButton />
      </div>

      {/* Druck-Überschrift (nur sichtbar auf dem PDF / beim Druck) */}
      <div className="hidden print:block text-black mb-6">
        <h1 className="text-2xl font-bold">Vocalmania – Anwesenheits-Reporting</h1>
        <p className="text-sm text-gray-600">Erstellt am: {new Date().toLocaleDateString("de-DE")}</p>
      </div>

      {/* Liste der Termine mit Anwesenheitsberichten */}
      <div className="space-y-6">
        {reportingData.map((item) => {
          const formattedDate = !isNaN(new Date(item.datum).getTime())
            ? new Date(item.datum).toLocaleDateString("de-DE", { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
            : item.datum;

          const totalCount = item.anwesend.length + item.entschuldigt.length + item.fehlt.length;
          const quote = totalCount > 0 ? Math.round((item.anwesend.length / totalCount) * 100) : 0;

          return (
            <div 
              key={item.terminId} 
              className="bg-black/30 print:bg-white border border-white/10 print:border-gray-300 rounded-3xl p-6 shadow-xl space-y-4 break-inside-avoid"
            >
              {/* Termin-Kopfzeile */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 print:border-gray-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                      item.typ === "Konzert" ? "bg-amber-500/80 text-black print:bg-amber-200 print:text-black" : "bg-indigo-600/80 text-white print:bg-indigo-200 print:text-black"
                    }`}>
                      {item.typ}
                    </span>
                    <span className="text-xs text-indigo-200 print:text-gray-600 font-medium">{formattedDate}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white print:text-black mt-1">
                    {item.titel}
                  </h2>
                </div>

                {/* Anwesenheits-Quote */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 print:text-gray-500 block">Anwesenheitsquote</span>
                    <span className="text-base font-bold text-indigo-300 print:text-black">{quote}%</span>
                  </div>
                </div>
              </div>

              {/* Detail-Listen: Anwesend / Entschuldigt / Fehlt */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Anwesend */}
                <div className="bg-emerald-950/30 print:bg-emerald-50 border border-emerald-500/20 print:border-emerald-300 rounded-2xl p-4 space-y-2">
                  <span className="font-bold text-emerald-400 print:text-emerald-800 flex items-center gap-1.5">
                    <span>✅</span> Anwesend ({item.anwesend.length})
                  </span>
                  <ul className="space-y-1 text-slate-300 print:text-gray-700">
                    {item.anwesend.map((name, i) => (
                      <li key={i}>• {name}</li>
                    ))}
                  </ul>
                </div>

                {/* Entschuldigt */}
                <div className="bg-amber-950/30 print:bg-amber-50 border border-amber-500/20 print:border-amber-300 rounded-2xl p-4 space-y-2">
                  <span className="font-bold text-amber-400 print:text-amber-800 flex items-center gap-1.5">
                    <span>⚠️</span> Entschuldigt ({item.entschuldigt.length})
                  </span>
                  <ul className="space-y-1 text-slate-300 print:text-gray-700">
                    {item.entschuldigt.map((name, i) => (
                      <li key={i}>• {name}</li>
                    ))}
                  </ul>
                </div>

                {/* Fehlt */}
                <div className="bg-rose-950/30 print:bg-rose-50 border border-rose-500/20 print:border-rose-300 rounded-2xl p-4 space-y-2">
                  <span className="font-bold text-rose-400 print:text-rose-800 flex items-center gap-1.5">
                    <span>❌</span> Unentschuldigt / Fehlt ({item.fehlt.length})
                  </span>
                  <ul className="space-y-1 text-slate-300 print:text-gray-700">
                    {item.fehlt.map((name, i) => (
                      <li key={i}>• {name}</li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}