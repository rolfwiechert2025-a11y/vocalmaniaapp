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
    } catch (err) {
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
    } catch (err) {
      alert("Netzwerkfehler beim Löschen.");
    }
  };

  const filteredRegisters = registers.filter(r => 
    `${r.description_short} ${r.description_long || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stimmregister-Verwaltung</h1>
          <p className="text-xs text-slate-500">Übersicht aller Chorregister (Sopran, Alt, Tenor, Bass etc.).</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold transition-colors cursor-pointer shadow-sm"
        >
          + Neues Register anlegen
        </button>
      </div>

      <div className="w-full sm:w-80">
        <input
          type="text"
          placeholder="🔍 Register suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3.5 py-2 bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        />
      </div>

      <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        {filteredRegisters.length === 0 ? (
          <p className="p-5 text-xs text-slate-400 italic">Keine Register gefunden.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRegisters.map(reg => (
              <div key={reg.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">{reg.description_short}</h4>
                  {reg.description_long && (
                    <p className="text-xs text-slate-500">{reg.description_long}</p>
                  )}
                  <p className="text-[10px] text-slate-400 font-mono">ID: {reg.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(reg)}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 cursor-pointer shadow-xs"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDelete(reg.id)}
                    className="text-rose-600 hover:text-rose-800 text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 cursor-pointer shadow-xs"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              {editingRegisterId ? "Register bearbeiten" : "Neues Register anlegen"}
            </h3>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kurzbeschreibung (z.B. Sopran 1) *</label>
                <input
                  type="text"
                  name="description_short"
                  required
                  value={form.description_short}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Langbeschreibung (optional)</label>
                <input
                  type="text"
                  name="description_long"
                  value={form.description_long}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
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