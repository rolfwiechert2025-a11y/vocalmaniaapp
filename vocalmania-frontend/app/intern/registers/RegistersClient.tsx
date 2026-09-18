"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegisterItem {
  id: string; // UUID
  description_short: string;
  description_long?: string;
}

interface RegistersClientProps {
  initialRegisters: RegisterItem[];
}

export default function RegistersClient({ initialRegisters }: RegistersClientProps) {
  const router = useRouter();
  const [registers, setRegisters] = useState<RegisterItem[]>(initialRegisters);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegisterId, setEditingRegisterId] = useState<string | null>(null);

  const [form, setForm] = useState({
    description_short: "",
    description_long: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const openCreateModal = () => {
    setEditingRegisterId(null);
    setForm({
      description_short: "",
      description_long: "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (reg: RegisterItem) => {
    setEditingRegisterId(reg.id);
    setForm({
      description_short: reg.description_short || "",
      description_long: reg.description_long || "",
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const payload = {
      id: editingRegisterId,
      description_short: form.description_short ? form.description_short.trim() : "",
      description_long: form.description_long ? form.description_long.trim() : "",
    };

    if (!payload.description_short) {
      setErrorMessage("Validierungsfehler: Kurzbeschreibung ist ein Pflichtfeld.");
      setLoading(false);
      return;
    }

    try {
      const url = "/api/intern/registers";
      const method = editingRegisterId ? "PUT" : "POST";

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

  const handleDelete = async (id: string) => {
    if (!confirm("Bist du sicher, dass du dieses Stimmregister löschen möchtest?")) return;

    try {
      const res = await fetch(`/api/intern/registers?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setRegisters(prev => prev.filter(r => r.id !== id));
        router.refresh();
      } else {
        alert(data.error || "Fehler beim Löschen.");
      }
    } catch {
      alert("Netzwerkfehler beim Löschen.");
    }
  };

  const filteredRegisters = registers.filter(r => 
    `${r.description_short} ${r.description_long || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* SUCHLEISTE & NEU-BUTTON */}
      <div className="p-4 bg-black/30 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xl">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="🔍 Register suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-full text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all shadow-inner"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-lg border border-indigo-400/30 whitespace-nowrap"
        >
          + Neues Register anlegen
        </button>
      </div>

      {/* REGISTER LISTE (IM GLAS-LOOK) */}
      <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden divide-y divide-white/10">
        {filteredRegisters.length === 0 ? (
          <p className="p-6 text-xs text-indigo-200/60 italic text-center">Keine Register gefunden.</p>
        ) : (
          filteredRegisters.map(reg => (
            <div key={reg.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-white/5 transition-colors group">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">{reg.description_short}</h4>
                {reg.description_long && (
                  <p className="text-xs text-indigo-200/70">{reg.description_long}</p>
                )}
                <p className="text-[10px] text-indigo-300/40 font-mono">ID: {reg.id}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(reg)}
                  className="text-indigo-300 hover:text-white text-xs font-semibold px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDelete(reg.id)}
                  className="text-rose-300 hover:text-white text-xs font-semibold px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  Löschen
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL (ERSTELLEN / BEARBEITEN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1e1b4b] w-full max-w-md p-6 sm:p-8 border border-white/15 rounded-3xl shadow-2xl space-y-5 text-white">
            <h3 className="font-bold text-lg text-white">
              {editingRegisterId ? "Register bearbeiten" : "Neues Register anlegen"}
            </h3>

            {errorMessage && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium rounded-xl">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-200/80 mb-1">Kurzbeschreibung (z.B. Sopran 1) *</label>
                <input
                  type="text"
                  name="description_short"
                  required
                  value={form.description_short}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-200/80 mb-1">Langbeschreibung (optional)</label>
                <input
                  type="text"
                  name="description_long"
                  value={form.description_long}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-black/40 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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