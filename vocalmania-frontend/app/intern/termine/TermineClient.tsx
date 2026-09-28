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

  const handleAttendance = async (eventId: string, status: 'yes' | 'maybe' | 'no', mode: 'planning' | 'attendance' = 'planning') => {
    setLoadingEventId(eventId);
    try {
      const res = await fetch("/api/intern/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, status, mode }),
      });

      if (res.ok) {
        const data = await res.json();

        setEvents(prevEvents =>
          prevEvents.map(event => {
            if (event.id !== eventId) return event;

            return {
              ...event,
              ...(mode === 'planning' ? { userStatus: status } : { userAttendanceStatus: status }),
              attendanceCounts: data.attendanceCounts || event.attendanceCounts,
              attendeesList: data.attendeesList || event.attendeesList,
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

  const formatDate = (startObj?: { dateTime?: string | null; date?: string | null }) => {
    if (!startObj) return "";
    const dateString = startObj.dateTime || startObj.date || "";
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
      return { cardBg: "bg-black/30 backdrop-blur-md", border: "border-white/10 hover:border-emerald-400/50 shadow-xl", badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30", indicator: "bg-emerald-500", label: "Probe" };
    }
    if (text.includes("konzert") || text.includes("auftritt") || text.includes("chorwochenende")) {
      return { cardBg: "bg-black/30 backdrop-blur-md", border: "border-white/10 hover:border-indigo-400/50 shadow-xl", badge: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30", indicator: "bg-indigo-500", label: "Konzert / Event" };
    }
    if (text.includes("vorstand") || text.includes("sitzung") || text.includes("besprechung")) {
      return { cardBg: "bg-black/30 backdrop-blur-md", border: "border-white/10 hover:border-amber-400/50 shadow-xl", badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30", indicator: "bg-amber-500", label: "Organisation" };
    }
    return { cardBg: "bg-black/30 backdrop-blur-md", border: "border-white/10 hover:border-white/30 shadow-xl", badge: "bg-white/10 text-slate-300 border border-white/10", indicator: "bg-slate-400", label: "Termin" };
  };

  const filteredEvents = events.filter((event) => {
    if (!event.start) return false;
    const matchesSearch =
      event.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    const dateString = event.start?.dateTime || event.start?.date || "";
    if (!dateString) return false;

    const eventDate = new Date(dateString);
    const now = new Date();
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    if (selectedTimeRange === "all") {
      return eventDate >= threeDaysAgo;
    }
    if (selectedTimeRange === "7days") {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + 7);
      return eventDate >= threeDaysAgo && eventDate <= targetDate;
    } 
    if (selectedTimeRange === "30days") {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + 30);
      return eventDate >= threeDaysAgo && eventDate <= targetDate;
    } 
    if (selectedTimeRange === "3months") {
      const targetDate = new Date();
      targetDate.setMonth(now.getMonth() + 3);
      return eventDate >= threeDaysAgo && eventDate <= targetDate;
    }
    if (selectedTimeRange === "thisyear") {
      return eventDate >= threeDaysAgo && eventDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Sortiere Events chronologisch
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.start?.dateTime || a.start?.date || "").getTime();
    const dateB = new Date(b.start?.dateTime || b.start?.date || "").getTime();
    return dateA - dateB;
  });

  return (
    <div className="space-y-6">
      
      {/* FILTER-LEISTE */}
      <div className="p-4 bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="🔍 Nach Termin oder Ort suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-full text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-inner"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-200/70 uppercase tracking-wider whitespace-nowrap">Zeitraum:</span>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-black/40 border border-white/15 rounded-full text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">Alle kommenden Termine</option>
            <option value="7days" className="bg-slate-900 text-white">Nächste 7 Tage</option>
            <option value="30days" className="bg-slate-900 text-white">Nächste 30 Tage</option>
            <option value="3months" className="bg-slate-900 text-white">Nächste 3 Monate</option>
            <option value="thisyear" className="bg-slate-900 text-white">Gesamtes Jahr</option>
          </select>
        </div>
      </div>

      {/* ERGEBNISSE */}
      {sortedEvents.length === 0 ? (
        <div className="p-8 bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 text-sm text-indigo-200/70 text-center font-medium shadow-xl">
          Keine Termine gefunden, die zu deinen Filterkriterien passen.
        </div>
      ) : (
        <div className="space-y-8">
          {sortedEvents.map((event, index) => {
            const dateString = event.start?.dateTime || event.start?.date || "";
            const eventDate = new Date(dateString);
            const now = new Date();

            // Prüfen, ob der Termin in der Zukunft liegt (ab heute 00:00 Uhr)
            const eventDayStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const isFutureEvent = eventDayStart > todayStart;

            const currentMonthYear = !isNaN(eventDate.getTime()) 
              ? eventDate.toLocaleDateString("de-DE", { month: 'long', year: 'numeric' })
              : "";

            let showMonthHeader = false;
            if (currentMonthYear) {
              if (index === 0) {
                showMonthHeader = true;
              } else {
                const prevEvent = sortedEvents[index - 1];
                const prevDateString = prevEvent.start?.dateTime || prevEvent.start?.date || "";
                const prevDate = new Date(prevDateString);
                const prevMonthYear = !isNaN(prevDate.getTime()) 
                  ? prevDate.toLocaleDateString("de-DE", { month: 'long', year: 'numeric' })
                  : "";
                
                if (currentMonthYear !== prevMonthYear) {
                  showMonthHeader = true;
                }
              }
            }

            const style = getEventStyleByTitle(event.summary);
            const counts = event.attendanceCounts || { yes: 0, maybe: 0, no: 0 };
            const attendees = event.attendeesList || [];
            const totalMembers = attendees.length > 0 ? attendees.length : 38;
            
            const isLoading = loadingEventId === event.id;
            const isExpanded = !!expandedMap[event.id];

            return (
              <div key={event.id} className="space-y-3">
                {/* STICKY MONATS-HEADER BEIM SCROLLEN */}
                {showMonthHeader && (
                  <div className="sticky top-4 z-20 flex justify-center my-4">
                    <div className="px-5 py-1.5 bg-indigo-950/90 backdrop-blur-xl border border-indigo-500/30 rounded-full text-xs font-extrabold text-indigo-200 uppercase tracking-widest shadow-2xl shadow-indigo-950/50">
                      📅 {currentMonthYear}
                    </div>
                  </div>
                )}

                <div 
                  className={`p-6 border transition-all duration-200 flex flex-col justify-between space-y-4 rounded-3xl ${style.cardBg} ${style.border} relative overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${style.indicator}`} />

                  <div className="space-y-3 pl-1">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-base font-bold text-white leading-snug">{event.summary}</h4>
                      <span className={`text-[11px] font-bold px-2.5 py-1 whitespace-nowrap tracking-wide uppercase rounded-full ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-200 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <span>📅</span> {formatDate(event.start)}
                    </div>
                  </div>

                  <div className="space-y-2 pl-1 pt-1">
                    {event.location && (
                      <p className="text-xs text-indigo-200/80 flex items-center gap-2 font-medium">
                        <span className="text-sm">📍</span> {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-xs text-indigo-100/80 leading-relaxed whitespace-pre-line line-clamp-2 pt-0.5">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* 1. VORAB-PLANUNGS-BUTTONS */}
                  <div className="pt-3 pl-1 space-y-2">
                    <span className="text-xs font-bold text-indigo-200/90 block">Deine Vorab-Rückmeldung:</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        onClick={() => handleAttendance(event.id, 'yes', 'planning')}
                        disabled={isLoading}
                        className={`h-10 px-3 text-xs font-bold rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                          event.userStatus === 'yes'
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/50 ring-2 ring-emerald-500/30 scale-[1.02]'
                            : 'bg-black/40 text-emerald-300 border-white/15 hover:bg-emerald-500/10 hover:border-emerald-500/40'
                        }`}
                      >
                        <span>✓</span> Zusage
                      </button>
                      <button
                        onClick={() => handleAttendance(event.id, 'maybe', 'planning')}
                        disabled={isLoading}
                        className={`h-10 px-3 text-xs font-bold rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                          event.userStatus === 'maybe'
                            ? 'bg-amber-600 text-white border-amber-500 shadow-amber-900/50 ring-2 ring-amber-500/30 scale-[1.02]'
                            : 'bg-black/40 text-amber-300 border-white/15 hover:bg-amber-500/10 hover:border-amber-500/40'
                        }`}
                      >
                        <span>?</span> Unsicher
                      </button>
                      <button
                        onClick={() => handleAttendance(event.id, 'no', 'planning')}
                        disabled={isLoading}
                        className={`h-10 px-3 text-xs font-bold rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                          event.userStatus === 'no'
                            ? 'bg-rose-600 text-white border-rose-500 shadow-rose-900/50 ring-2 ring-rose-500/30 scale-[1.02]'
                            : 'bg-black/40 text-rose-300 border-white/15 hover:bg-rose-500/10 hover:border-rose-500/40'
                        }`}
                      >
                        <span>✕</span> Absage
                      </button>
                    </div>
                  </div>

                  {/* RÜCKMELDUNGS-BALKEN & STATISTIK */}
                  <div className="pt-3 border-t border-white/10 space-y-4 pl-1">
                    
                    {/* 1. BALKEN: VORAB-PLANUNG (Hier sitzt jetzt auch der Details-Button bei zukünftigen Terminen) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-indigo-200">1. Vorab-Planung (RSVP)</span>
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-300 text-[11px] font-medium">
                            {(counts.yes || 0) + (counts.maybe || 0) + (counts.no || 0)} / {totalMembers} gemeldet
                          </span>
                          {isFutureEvent && (
                            <button
                              onClick={() => toggleDetails(event.id)}
                              className="text-indigo-300 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-2.5 py-0.5 font-bold text-[10px] rounded-full transition-colors cursor-pointer flex items-center gap-1 border border-white/10 shadow-sm"
                            >
                              <span>Details</span>
                              <span>{isExpanded ? "▲" : "▼"}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-white/10">
                        <div style={{ width: `${totalMembers > 0 ? ((counts.yes || 0) / totalMembers) * 100 : 0}%` }} className="bg-emerald-500 rounded-full transition-all" title={`Zusagen: ${counts.yes || 0}`} />
                        <div style={{ width: `${totalMembers > 0 ? ((counts.maybe || 0) / totalMembers) * 100 : 0}%` }} className="bg-amber-400 rounded-full transition-all" title={`Unsicher: ${counts.maybe || 0}`} />
                        <div style={{ width: `${totalMembers > 0 ? ((counts.no || 0) / totalMembers) * 100 : 0}%` }} className="bg-rose-500 rounded-full transition-all" title={`Absagen: ${counts.no || 0}`} />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-medium text-indigo-200/70">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>Zusage ({counts.yes || 0})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          <span>Unsicher ({counts.maybe || 0})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <span>Absage ({counts.no || 0})</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. BEREICH: NUR BEI HEUTIGEN / VERGANGENEN TERMINEN (ANWESENHEIT) */}
                    {!isFutureEvent && (
                      <>
                        {/* ZEITGESTEUERTE ANWESENHEITS-ERFASSUNG */}
                        {(() => {
                          const eventDateStr = event.start?.dateTime || event.start?.date || "";
                          if (!eventDateStr) return null;

                          const eventDate = new Date(eventDateStr);
                          const startDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
                          const endDate = new Date(startDate);
                          endDate.setDate(endDate.getDate() + 3);

                          const isReportingActive = now >= startDate && now <= endDate;
                          if (!isReportingActive) return null;

                          return (
                            <div className="pt-2 space-y-2 border-t border-white/10 bg-indigo-950/30 p-3.5 rounded-2xl border border-indigo-500/20 shadow-inner">
                              <span className="text-xs font-bold text-indigo-300 block">Anwesenheits-Nachbereitung (Aktiv):</span>
                              <div className="grid grid-cols-3 gap-2.5">
                                <button
                                  onClick={() => handleAttendance(event.id, 'yes', 'attendance')}
                                  disabled={isLoading}
                                  className={`h-10 px-2 text-xs font-bold rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                                    event.userAttendanceStatus === 'yes'
                                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/50 ring-2 ring-emerald-500/30 scale-[1.02]'
                                      : 'bg-black/40 text-emerald-300 border-white/15 hover:bg-emerald-500/10 hover:border-emerald-500/40'
                                  }`}
                                >
                                  <span>✓</span> Anwesend
                                </button>
                                <button
                                  onClick={() => handleAttendance(event.id, 'maybe', 'attendance')}
                                  disabled={isLoading}
                                  className={`h-10 px-2 text-xs font-bold rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                                    event.userAttendanceStatus === 'maybe'
                                      ? 'bg-amber-600 text-white border-amber-500 shadow-amber-900/50 ring-2 ring-amber-500/30 scale-[1.02]'
                                      : 'bg-black/40 text-amber-300 border-white/15 hover:bg-amber-500/10 hover:border-amber-500/40'
                                  }`}
                                >
                                  <span>⚠</span> Entschuldigt
                                </button>
                                <button
                                  onClick={() => handleAttendance(event.id, 'no', 'attendance')}
                                  disabled={isLoading}
                                  className={`h-10 px-2 text-xs font-bold rounded-xl border transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
                                    event.userAttendanceStatus === 'no' || !event.userAttendanceStatus
                                      ? 'bg-rose-600 text-white border-rose-500 shadow-rose-900/50 ring-2 ring-rose-500/30 scale-[1.02]'
                                      : 'bg-black/40 text-rose-300 border-white/15 hover:bg-rose-500/10 hover:border-rose-500/40'
                                  }`}
                                >
                                  <span>✕</span> Unentsch.
                                </button>
                              </div>
                            </div>
                          );
                        })()}

                        {/* 2. BALKEN: FINALE ANWESENHEIT */}
                        {(() => {
                          const attYes = attendees.filter(a => a.attendanceStatus === 'yes').length;
                          const attMaybe = attendees.filter(a => a.attendanceStatus === 'maybe').length;
                          const attNo = attendees.filter(a => a.attendanceStatus === 'no' || !a.attendanceStatus).length;
                          const hasRealAttendance = attYes > 0 || attMaybe > 0;

                          return (
                            <div className="space-y-1.5 pt-2 border-t border-white/5">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-indigo-200">2. Finale Anwesenheit</span>
                                <button
                                  onClick={() => toggleDetails(event.id)}
                                  className="text-indigo-300 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1 font-bold text-[11px] rounded-full transition-colors cursor-pointer flex items-center gap-1 border border-white/10 shadow-sm"
                                >
                                  <span>{attYes} anwesend</span>
                                  <span className="text-[10px]">{isExpanded ? "▲ Details" : "▼ Details"}</span>
                                </button>
                              </div>

                              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-white/10">
                                <div style={{ width: `${totalMembers > 0 ? (attYes / totalMembers) * 100 : 0}%` }} className="bg-emerald-500 rounded-full transition-all" title={`Anwesend: ${attYes}`} />
                                <div style={{ width: `${totalMembers > 0 ? (attMaybe / totalMembers) * 100 : 0}%` }} className="bg-amber-400 rounded-full transition-all" title={`Entschuldigt: ${attMaybe}`} />
                                <div style={{ width: `${totalMembers > 0 && hasRealAttendance ? (attNo / totalMembers) * 100 : 0}%` }} className="bg-rose-950/60 rounded-full transition-all" title={`Unentschuldigt: ${attNo}`} />
                              </div>

                              <div className="flex items-center justify-between text-[11px] font-medium text-indigo-200/70">
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                  <span>Anwesend ({attYes})</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                  <span>Entschuldigt ({attMaybe})</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                  <span>Unentsch./Offen ({hasRealAttendance ? attNo : totalMembers})</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    )}

                    {/* DETAILS NACH REGISTERN (Gemeinsam genutzt für Planung bzw. Anwesenheit) */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-3 bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs shadow-inner">
                        <h5 className="font-bold text-white uppercase tracking-wider text-[10px]">Alle Mitglieder nach Registern:</h5>
                        
                        {attendees.length === 0 ? (
                          <p className="text-indigo-200/60 italic">Keine Mitglieder gefunden.</p>
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
                                  <span className="font-bold text-indigo-300 block text-[11px] border-b border-white/10 pb-0.5">{registerName}:</span>
                                  <div className="flex flex-col gap-1.5 pt-1">
                                    {registerAttendees.map((attendee, idx) => {
                                      let planIcon = "⏳ (Offen)";
                                      let planColor = "text-slate-400";
                                      if (attendee.status === 'yes') {
                                        planIcon = "✓ Zusage";
                                        planColor = "text-emerald-400";
                                      } else if (attendee.status === 'maybe') {
                                        planIcon = "? Unsicher";
                                        planColor = "text-amber-400";
                                      } else if (attendee.status === 'no') {
                                        planIcon = "✕ Absage";
                                        planColor = "text-rose-400";
                                      }

                                      return (
                                        <div key={idx} className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px]">
                                          <span className="font-bold text-white">{attendee.vorname} {attendee.nachname}</span>
                                          <div className="flex items-center gap-3 text-[10px]">
                                            <span className="text-indigo-200/70">Planung: <span className={planColor}>{planIcon}</span></span>
                                            {!isFutureEvent && (
                                              (() => {
                                                let attIcon = "⏳ (Offen)";
                                                let attColor = "text-slate-400";
                                                if (attendee.attendanceStatus === 'yes') {
                                                  attIcon = "✓ Anwesend";
                                                  attColor = "text-emerald-400 font-bold";
                                                } else if (attendee.attendanceStatus === 'maybe') {
                                                  attIcon = "⚠ Entschuldigt";
                                                  attColor = "text-amber-400 font-bold";
                                                } else if (attendee.attendanceStatus === 'no') {
                                                  attIcon = "✕ Unentschuldigt";
                                                  attColor = "text-rose-400";
                                                }
                                                return <span className="text-indigo-200/70">Anwesenheit: <span className={attColor}>{attIcon}</span></span>;
                                              })()
                                            )}
                                          </div>
                                        </div>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}