"use client";

import { useState } from "react";
import { CalendarEvent } from "@/lib/calendar";

interface TermineClientProps {
  initialEvents: CalendarEvent[];
}

export default function TermineClient({ initialEvents }: TermineClientProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  const toggleDetails = (eventId: string) => {
    setExpandedMap(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const handleAttendance = async (eventId: string, status: 'yes' | 'maybe' | 'no') => {
    setLoadingEventId(eventId);
    try {
      const res = await fetch("/api/intern/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, status }),
      });

      if (res.ok) {
        const data = await res.json();

        setEvents(prevEvents =>
          prevEvents.map(event => {
            if (event.id !== eventId) return event;

            return {
              ...event,
              userStatus: status,
              attendanceCounts: data.attendanceCounts,
              attendeesList: data.attendeesList,
            };
          })
        );
      } else {
        const errorData = await res.json();
        alert("Fehler beim Speichern: " + (errorData.error || "Unbekannter Fehler"));
      }
    } catch (err) {
      console.error("Netzwerkfehler beim Speichern", err);
    } finally {
      setLoadingEventId(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: dateString.includes("T") ? "2-digit" : undefined,
      minute: dateString.includes("T") ? "2-digit" : undefined,
    });
  };

  const getEventStyleByTitle = (summary: string) => {
    const text = (summary || "").toLowerCase();
    if (text.includes("probe") || text.includes("stimmprobe")) {
      return { cardBg: "bg-white", border: "border-slate-100 hover:border-emerald-300 hover:shadow-md", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200/60", indicator: "bg-emerald-500", label: "Probe" };
    }
    if (text.includes("konzert") || text.includes("auftritt") || text.includes("chorwochenende")) {
      return { cardBg: "bg-white", border: "border-slate-100 hover:border-indigo-300 hover:shadow-md", badge: "bg-indigo-50 text-indigo-700 border border-indigo-200/60", indicator: "bg-indigo-600", label: "Konzert / Event" };
    }
    if (text.includes("vorstand") || text.includes("sitzung") || text.includes("besprechung")) {
      return { cardBg: "bg-white", border: "border-slate-100 hover:border-amber-300 hover:shadow-md", badge: "bg-amber-50 text-amber-700 border border-amber-200/60", indicator: "bg-amber-500", label: "Organisation" };
    }
    return { cardBg: "bg-white", border: "border-slate-100 hover:border-slate-300 hover:shadow-md", badge: "bg-slate-100 text-slate-700 border border-slate-200", indicator: "bg-slate-400", label: "Termin" };
  };

  const filteredEvents = events.filter((event) => {
    if (!event.start) return false;
    const matchesSearch =
      event.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    const eventDate = new Date(event.start);
    const now = new Date();
    
    if (selectedTimeRange === "7days") {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + 7);
      return eventDate >= now && eventDate <= targetDate;
    } 
    if (selectedTimeRange === "30days") {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + 30);
      return eventDate >= now && eventDate <= targetDate;
    } 
    if (selectedTimeRange === "3months") {
      const targetDate = new Date();
      targetDate.setMonth(now.getMonth() + 3);
      return eventDate >= now && eventDate <= targetDate;
    }
    if (selectedTimeRange === "thisyear") {
      return eventDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* FILTER-LEISTE */}
      <div className="p-4 bg-slate-50/85 backdrop-blur-sm border border-slate-200/80 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="🔍 Nach Termin oder Ort suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Zeitraum:</span>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          >
            <option value="all">Alle kommenden Termine</option>
            <option value="7days">Nächste 7 Tage</option>
            <option value="30days">Nächste 30 Tage</option>
            <option value="3months">Nächste 3 Monate</option>
            <option value="thisyear">Gesamtes Jahr</option>
          </select>
        </div>
      </div>

      {/* ERGEBNISSE */}
      {filteredEvents.length === 0 ? (
        <div className="p-8 bg-slate-50 border border-slate-200 text-sm text-slate-500 text-center font-medium">
          Keine Termine gefunden, die zu deinen Filterkriterien passen.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredEvents.map((event) => {
            const style = getEventStyleByTitle(event.summary);
            const counts = event.attendanceCounts || { yes: 0, maybe: 0, no: 0 };
            const respondedTotal = counts.yes + counts.maybe + counts.no;
            const totalMembers = event.attendeesList?.length || 38;

            const yesPercent = (counts.yes / totalMembers) * 100;
            const maybePercent = (counts.maybe / totalMembers) * 100;
            const noPercent = (counts.no / totalMembers) * 100;
            const isLoading = loadingEventId === event.id;
            const isExpanded = !!expandedMap[event.id];
            const attendees = event.attendeesList || [];

            return (
              <div 
                key={event.id} 
                className={`p-6 border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs ${style.cardBg} ${style.border} relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${style.indicator}`} />

                <div className="space-y-3 pl-1">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-base font-bold text-slate-900 leading-snug">{event.summary}</h4>
                    <span className={`text-[11px] font-bold px-2.5 py-1 whitespace-nowrap tracking-wide uppercase ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100/70 px-3 py-1 rounded-sm">
                    <span>📅</span> {formatDate(event.start)}
                  </div>
                </div>

                <div className="space-y-2 pl-1 pt-1">
                  {event.location && (
                    <p className="text-xs text-slate-600 flex items-center gap-2 font-medium">
                      <span className="text-sm">📍</span> {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line line-clamp-2 pt-0.5">
                      {event.description}
                    </p>
                  )}
                </div>

                {/* INTERAKTIVE RÜCKMELDUNGS-BUTTONS */}
                <div className="pt-3 pl-1 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Deine Rückmeldung:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAttendance(event.id, 'yes')}
                      disabled={isLoading}
                      className={`py-2 px-3 text-xs font-bold border transition-all cursor-pointer ${
                        event.userStatus === 'yes'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-600/30'
                          : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      ✓ Zusage
                    </button>
                    <button
                      onClick={() => handleAttendance(event.id, 'maybe')}
                      disabled={isLoading}
                      className={`py-2 px-3 text-xs font-bold border transition-all cursor-pointer ${
                        event.userStatus === 'maybe'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm ring-2 ring-amber-500/30'
                          : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      ? Unsicher
                    </button>
                    <button
                      onClick={() => handleAttendance(event.id, 'no')}
                      disabled={isLoading}
                      className={`py-2 px-3 text-xs font-bold border transition-all cursor-pointer ${
                        event.userStatus === 'no'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-600/30'
                          : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      ✕ Absage
                    </button>
                  </div>
                </div>

                {/* RÜCKMELDUNGS-BALKEN & STATISTIK */}
                <div className="pt-3 border-t border-slate-100 space-y-2 pl-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">Chor-Statistik</span>
                    <button
                      onClick={() => toggleDetails(event.id)}
                      className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>{respondedTotal} / {totalMembers} gemeldet</span>
                      <span className="text-[10px]">{isExpanded ? "▲ Details" : "▼ Details"}</span>
                    </button>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex p-0.5 gap-0.5">
                    <div style={{ width: `${yesPercent}%` }} className="bg-emerald-500 rounded-full transition-all" title={`Zusagen: ${counts.yes}`} />
                    <div style={{ width: `${maybePercent}%` }} className="bg-amber-400 rounded-full transition-all" title={`Unsicher: ${counts.maybe}`} />
                    <div style={{ width: `${noPercent}%` }} className="bg-rose-500 rounded-full transition-all" title={`Absagen: ${counts.no}`} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-0.5">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Zusage ({counts.yes})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>Unsicher ({counts.maybe})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>Absage ({counts.no})</span>
                    </div>
                  </div>

                  {/* DETAILS NACH REGISTERN (ALLE MITGLIEDER) */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 bg-slate-50 p-3.5 text-xs">
                      <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Alle Mitglieder nach Registern:</h5>
                      
                      {attendees.length === 0 ? (
                        <p className="text-slate-500 italic">Keine Mitglieder gefunden.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {[
                            'Sopran 1', 
                            'Sopran 2', 
                            'Alt 1', 
                            'Alt 2', 
                            'Tenor 1', 
                            'Tenor 2', 
                            'Bass 1', 
                            'Bass 2', 
                            'Dirigent',
                            'Unbekannt'
                          ].map((registerName) => {
                            const registerAttendees = attendees.filter(a => (a.registerShort || 'Unbekannt') === registerName);
                            if (registerAttendees.length === 0) return null;

                            return (
                              <div key={registerName} className="space-y-1">
                                <span className="font-bold text-slate-700 block text-[11px] border-b border-slate-200 pb-0.5">{registerName}:</span>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {registerAttendees.map((attendee, idx) => {
                                    let badgeColor = "bg-slate-100 text-slate-500 border-slate-200 border-dashed";
                                    let statusIcon = "⏳";

                                    if (attendee.status === 'yes') {
                                      badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                                      statusIcon = "✓";
                                    } else if (attendee.status === 'maybe') {
                                      badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
                                      statusIcon = "?";
                                    } else if (attendee.status === 'no') {
                                      badgeColor = "bg-rose-50 text-rose-800 border-rose-200";
                                      statusIcon = "✕";
                                    }

                                    let formattedTime = "";
                                    if (attendee.updatedAt && attendee.status) {
                                      const d = new Date(attendee.updatedAt);
                                      formattedTime = d.toLocaleDateString("de-DE", { day: "numeric", month: "short" }) + ", " + 
                                                      d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
                                    }

                                    return (
                                      <span key={idx} className={`px-2 py-1 rounded-sm border text-[10px] font-semibold flex items-center justify-between gap-2 ${badgeColor}`}>
                                        <span className="font-bold">{attendee.vorname} {attendee.nachname}</span>
                                        <span className="flex items-center gap-1 text-[9px] opacity-80">
                                          {formattedTime && <span className="font-normal text-slate-400">({formattedTime})</span>}
                                          <span className="font-bold">{statusIcon}</span>
                                        </span>
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}