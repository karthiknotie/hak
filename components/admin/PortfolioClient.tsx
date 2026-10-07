"use client";
import { useState } from "react";
import type { PortfolioItem, PortfolioItemInput } from "@/lib/db";

const emptyForm: PortfolioItemInput = {
  title: "",
  category: "",
  status: "Published",
  image: "",
  description: "",
  link: "",
};

function PortfolioForm({
  initial,
  onCancel,
  onSave,
  saving,
}: {
  initial: PortfolioItemInput;
  onCancel: () => void;
  onSave: (input: PortfolioItemInput) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<PortfolioItemInput>(initial);
  const set = <K extends keyof PortfolioItemInput>(key: K, value: PortfolioItemInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const inputClass =
    "w-full bg-white/3 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-ember-500/40 transition-colors";
  const labelClass = "text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5";

  return (
    <div className="p-4 space-y-3">
      <div>
        <label className={labelClass}>Title *</label>
        <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <input className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Image path / URL</label>
        <input className={inputClass} placeholder="/portfolio/example.webp" value={form.image} onChange={(e) => set("image", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Link</label>
        <input className={inputClass} value={form.link} onChange={(e) => set("link", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea className={`${inputClass} h-16 resize-none`} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          disabled={saving || !form.title.trim()}
          onClick={() => onSave(form)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono border border-ash-500/30 text-ash-400 hover:bg-ember-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg cursor-pointer"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono border border-white/10 text-zinc-400 hover:bg-white/5 transition-colors rounded-lg cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function PortfolioClient({ initialItems }: { initialItems: PortfolioItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (input: PortfolioItemInput) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Failed to create item.");
      const { item } = await res.json();
      setItems((prev) => [...prev, item]);
      setCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item.");
    } finally {
      setSaving(false);
    }
  };

  const save = async (id: number, input: PortfolioItemInput) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/portfolio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Failed to save item.");
      const { item } = await res.json();
      setItems((prev) => prev.map((p) => (p.id === id ? item : p)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this portfolio piece? This cannot be undone.")) return;
    setItems((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) setEditingId(null);
    try {
      await fetch(`/api/admin/portfolio/${id}`, { method: "DELETE" });
    } catch {
      // best-effort; UI already reflects the removal
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-space">Portfolio</h1>
          <p className="text-zinc-500 text-sm font-mono mt-1">Manage your portfolio pieces and gallery.</p>
        </div>
        <button
          onClick={() => {
            setCreating((v) => !v);
            setEditingId(null);
          }}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-ash-300 hover:text-bone border border-ash-500/40 hover:border-ember-400/70 bg-black/40 transition-all duration-300 cursor-pointer"
          style={{ clipPath: "polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)" }}
        >
          <i className="fa-solid fa-plus text-[10px]" />
          Add Piece
        </button>
      </div>

      {error && <p className="text-sm text-red-400 font-mono">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {creating && (
          <div className="rounded-xl border border-ember-500/30 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
            <PortfolioForm initial={emptyForm} saving={saving} onCancel={() => setCreating(false)} onSave={create} />
          </div>
        )}

        {items.map((item) =>
          editingId === item.id ? (
            <div key={item.id} className="rounded-xl border border-ember-500/30 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
              <PortfolioForm initial={item} saving={saving} onCancel={() => setEditingId(null)} onSave={(input) => save(item.id, input)} />
            </div>
          ) : (
            <div
              key={item.id}
              className="group rounded-xl border border-white/8 overflow-hidden hover:border-ember-400/30 transition-all duration-300"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div className="relative aspect-video overflow-hidden bg-black/40">
                {item.image && (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(item.id);
                      setCreating(false);
                    }}
                    className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white text-xs hover:bg-ember-500/30 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-pen" />
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white text-xs hover:bg-red-500/30 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider">{item.status}</span>
                </div>
                <span className="text-xs font-mono text-zinc-500">{item.category}</span>
              </div>
            </div>
          )
        )}

        {items.length === 0 && !creating && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 min-h-[240px] hover:border-ember-400/30 hover:bg-ember-500/3 transition-all duration-300 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <i className="fa-solid fa-plus text-zinc-500" />
            </div>
            <span className="text-sm font-mono text-zinc-500">Add New Piece</span>
          </button>
        )}
      </div>
    </div>
  );
}
