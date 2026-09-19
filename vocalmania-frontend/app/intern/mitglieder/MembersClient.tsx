"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: number | string;
  vorname: string;
  nachname: string;
  gmail: string;
  register_id: string; // UUID
  register_name: string;
  mobil_number?: string;
  street_name_and_house_number?: string;
  town?: string;
  plz?: string;
  birthday?: string | Date;
  part_of_since_year?: number | string;
}

interface Register {
  id: string; // UUID
  description_short: string;
  description_long?: string;
}

interface MembersClientProps {
  initialMembers: Member[];
  registers: Register[];
}

export default function MembersClient({ initialMembers, registers }: MembersClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<number | string | null>(null);

  const defaultRegId = registers[0]?.id ? String(registers[0].id) : "";
  
  const [form, setForm] = useState({
    vorname: "",
    nachname: "",
    gmail: "",
    mobil_number: "",
    street_name_and_house_number: "",
    town: "",
    plz: "",
    birthday: "",
    part_of_since_year: "",
    register_id: defaultRegId,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const openCreateModal = () => {
    setEditingMemberId(null);
    setForm({
      vorname: "",
      nachname: "",
      gmail: "",
      mobil_number: "",
      street_name_and_house_number: "",
      town: "",
      plz: "",
      birthday: "",
      part_of_since_year: "",
      register_id: defaultRegId,
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMemberId(member.id);
    
    let formattedBirthday = "";
    if (member.birthday) {
      if (typeof member.birthday === "string") {
        formattedBirthday = member.birthday.split("T")[0];
      } else if (member.birthday instanceof Date) {
        const year = member.birthday.getFullYear();
        const month = String(member.birthday.getMonth() + 1).padStart(2, '0');
        const day = String(member.birthday.getDate()).padStart(2, '0');
        formattedBirthday = `${year}-${month}-${day}`;
      }
    }

    setForm({
      vorname: member.vorname || "",
      nachname: member.nachname || "",
      gmail: member.gmail || "",
      mobil_number: member.mobil_number || "",
      street_name_and_house_number: member.street_name_and_house_number || "",
      town: member.town || "",
      plz: member.plz || "",
      birthday: formattedBirthday,
      part_of_since_year: member.part_of_since_year ? String(member.part_of_since_year) : "",
      register_id: member.register_id ? String(member.register_id) : defaultRegId,
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    let formattedBirthday = form.birthday || null;
    if (formattedBirthday && typeof formattedBirthday === "string" && formattedBirthday.includes("T")) {
      formattedBirthday = formattedBirthday.split("T")[0];
    }

    const payload = {
      id: editingMemberId,
      vorname: form.vorname ? form.vorname.trim() : "",
      nachname: form.nachname ? form.nachname.trim() : "",
      gmail: form.gmail ? form.gmail.trim() : "",
      mobil_number: form.mobil_number ? form.mobil_number.trim() : "",
      street_name_and_house_number: form.street_name_and_house_number ? form.street_name_and_house_number.trim() : "",
      town: form.town ? form.town.trim() : "",
      plz: form.plz ? form.plz.trim() : "",
      birthday: formattedBirthday,
      part_of_since_year: form.part_of_since_year ? Number(form.part_of_since_year) : null,
      register_id: form.register_id,
    };

    if (!payload.vorname) {
      setErrorMessage("Validierungsfehler: Vorname fehlt oder ist leer.");
      setLoading(false);
      return;
    }
    if (!payload.nachname) {
      setErrorMessage("Validierungsfehler: Nachname fehlt oder ist leer.");
      setLoading(false);
      return;
    }
    if (!payload.register_id) {
      setErrorMessage("Validierungsfehler: Bitte ein Stimmregister auswählen.");
      setLoading(false);
      return;
    }

    try {
      const url = "/api/intern/members";
      const method = editingMemberId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        router.refresh();
        window.location.reload();
      } else {
        setErrorMessage(`Server-Fehler: ${data.error || "Unbekannter Fehler"}`);
      }
    } catch {
      setErrorMessage("Netzwerkfehler beim Speichern.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Bist du sicher, dass du dieses Mitglied löschen möchtest?")) return;

    try {
      const res = await fetch(`/api/intern/members?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id));
        router.refresh();
      } else {
        alert("Fehler beim Löschen.");
      }
    } catch {
      alert("Netzwerkfehler beim Löschen.");
    }
  };

  const filteredMembers = members.filter(m => 
    `${m.vorname} ${m.nachname} ${m.gmail}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* SUCHLEISTE & NEU-BUTTON */}
      <div className="p-4 bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="🔍 Mitglied suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-full text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-inner"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-lg border border-indigo-400/30 whitespace-nowrap"
        >
          + Neues Mitglied anlegen
        </button>
      </div>

      {/* REGISTER-LISTE */}
      <div className="space-y-6">
        {registers.map(reg => {
          const regMembers = filteredMembers.filter(m => m.register_id === reg.id);
          if (regMembers.length === 0 && searchTerm) return null;

          return (
            <div key={reg.id} className="bg-black/30 backdrop-blur-md border border-white/10 p-5 sm:p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="font-bold text-base text-white uppercase tracking-wider">{reg.description_short}</h3>
                <span className="text-xs bg-white/10 backdrop-blur-md text-indigo-200 px-3 py-1 rounded-full font-semibold border border-white/10">
                  {regMembers.length} {regMembers.length === 1 ? "Mitglied" : "Mitglieder"}
                </span>
              </div>

              {regMembers.length === 0 ? (
                <p className="text-xs text-indigo-200/60 italic">Keine Mitglieder in diesem Register.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {regMembers.map(member => (
                    <div key={member.id} className="p-4 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col justify-between space-y-3 shadow-md hover:border-indigo-400/50 transition-all">
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm">{member.vorname} {member.nachname}</h4>
                        <p className="text-xs text-indigo-200/70 truncate" title={member.gmail}>{member.gmail || "Keine E-Mail"}</p>
                        {member.mobil_number && <p className="text-[11px] text-indigo-200/50">📱 {member.mobil_number}</p>}
                        {member.part_of_since_year && <p className="text-[11px] text-indigo-200/50">⏳ Dabei seit: {member.part_of_since_year}</p>}
                      </div>
                      
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => openEditModal(member)}
                          className="text-indigo-300 hover:text-white text-xs font-semibold px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl cursor-pointer transition-colors"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-rose-300 hover:text-white text-xs font-semibold px-3 py-1 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 rounded-xl cursor-pointer transition-colors"
                        >
                          Löschen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL (ERSTELLEN / BEARBEITEN) - Ohne doppelte Scrollbar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-start justify-center pt-24 sm:pt-28 pb-12 px-4 overflow-hidden">
          <div className="bg-[#1e1b4b] w-full max-w-lg p-6 sm:p-8 border border-white/15 rounded-3xl shadow-2xl space-y-5 max-h-[80vh] overflow-y-auto text-white">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white">
                {editingMemberId ? "Mitglied bearbeiten" : "Neues Mitglied anlegen"}
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium rounded-xl">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-indigo-200/80 mb-1">Vorname *</label>
                  <input
                    type="text"
                    name="vorname"
                    required
                    value={form.vorname}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-200/80 mb-1">Nachname *</label>
                  <input
                    type="text"
                    name="nachname"
                    required
                    value={form.nachname}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200/80 mb-1">Stimmregister *</label>
                <select
                  name="register_id"
                  value={form.register_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                >
                  {registers && registers.length > 0 ? (
                    registers.map(reg => (
                      <option key={reg.id} value={reg.id} className="bg-slate-900 text-white">
                        {reg.description_short} {reg.description_long ? `(${reg.description_long})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" className="bg-slate-900 text-white">Lade Register...</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200/80 mb-1">Google E-Mail (Login-Adresse)</label>
                <input
                  type="email"
                  name="gmail"
                  value={form.gmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200/80 mb-1">Mobilnummer</label>
                <input
                  type="text"
                  name="mobil_number"
                  value={form.mobil_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200/80 mb-1">Straße & Hausnummer</label>
                <input
                  type="text"
                  name="street_name_and_house_number"
                  value={form.street_name_and_house_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-indigo-200/80 mb-1">PLZ</label>
                  <input
                    type="text"
                    name="plz"
                    value={form.plz}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-indigo-200/80 mb-1">Ort</label>
                  <input
                    type="text"
                    name="town"
                    value={form.town}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-indigo-200/80 mb-1">Geburtstag</label>
                  <input
                    type="date"
                    name="birthday"
                    value={form.birthday}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-200/80 mb-1">Mitglied seit (Jahr)</label>
                  <input
                    type="number"
                    name="part_of_since_year"
                    placeholder="z.B. 2020"
                    value={form.part_of_since_year}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 sticky bottom-0 bg-[#1e1b4b] pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-indigo-200 hover:text-white transition-colors cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg border border-indigo-400/30"
                >
                  {loading ? "Wird gespeichert..." : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}