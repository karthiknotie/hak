"use client";
import { useState } from "react";
import type { Submission } from "@/lib/db";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function fieldLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MessagesClient({ initialSubmissions }: { initialSubmissions: Submission[] }) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = submissions.find((s) => s.id === selectedId) || null;

  const select = async (s: Submission) => {
    setSelectedId(s.id);
    if (!s.read) {
      setSubmissions((prev) => prev.map((m) => (m.id === s.id ? { ...m, read: true } : m)));
      fetch(`/api/admin/submissions/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      }).catch(() => {});
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this message? This cannot be undone.")) return;
    setSubmissions((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
    fetch(`/api/admin/submissions/${id}`, { method: "DELETE" }).catch(() => {});
  };

  return (
    <div className="grid lg:grid-cols-5 gap-6 min-h-[500px]">
      {/* List */}
      <div className="lg:col-span-2 rounded-xl border border-white/8 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
        {submissions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 py-16">
            <i className="fa-solid fa-inbox text-3xl mb-4" />
            <p className="text-sm font-mono">No submissions yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {submissions.map((msg) => (
              <button
                key={msg.id}
                className={`w-full text-left p-4 transition-colors duration-200 cursor-pointer ${
                  selectedId === msg.id ? "bg-ember-500/8 border-l-2 border-l-ember-400" : "hover:bg-white/3 border-l-2 border-l-transparent"
                }`}
                onClick={() => select(msg)}
              >
                <div className="flex items-center gap-3 mb-1">
                  {!msg.read && <div className="w-2 h-2 rounded-full bg-ember-400 shrink-0" />}
                  <span className={`text-sm font-medium truncate ${msg.read ? "text-zinc-400" : "text-white"}`}>{msg.name}</span>
                  <span className="ml-auto text-[10px] font-mono text-zinc-600 shrink-0">{timeAgo(msg.created_at)}</span>
                </div>
                <p className={`text-xs truncate capitalize ${msg.read ? "text-zinc-600" : "text-zinc-400"}`}>{msg.category}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail */}
      <div className="lg:col-span-3 rounded-xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
        {selected ? (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1 capitalize">{selected.category} inquiry</h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-zinc-500">
                  <span>{selected.name}</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="break-all">{selected.email}</span>
                  <span>·</span>
                  <span>{timeAgo(selected.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(selected.email)}&su=${encodeURIComponent(`Re: Your BLAKASH collaboration inquiry`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-ember-400 hover:border-ember-500/30 transition-colors"
                  title="Reply via email"
                >
                  <i className="fa-solid fa-reply text-xs" />
                </a>
                <button
                  onClick={() => remove(selected.id)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <i className="fa-solid fa-trash text-xs" />
                </button>
              </div>
            </div>
            <div className="border-t border-white/8 pt-5 space-y-4">
              {Object.entries(selected.data)
                .filter(([, v]) => v)
                .map(([key, value]) => (
                  <div key={key}>
                    <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-wider mb-1">{fieldLabel(key)}</p>
                    <p className="text-zinc-300 leading-7 whitespace-pre-wrap">{value}</p>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600">
            <i className="fa-solid fa-envelope-open text-4xl mb-4" />
            <p className="text-sm font-mono">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
}
