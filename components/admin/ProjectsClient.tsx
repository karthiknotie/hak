"use client";
import { useState } from "react";
import type { Project, ProjectInput } from "@/lib/db";

const emptyForm: ProjectInput = {
  name: "",
  status: "In Development",
  progress: 0,
  engine: "",
  genre: "",
  platform: "",
  description: "",
  color: "purple",
  image: "",
  link: "",
};

function ProjectForm({
  initial,
  onCancel,
  onSave,
  saving,
}: {
  initial: ProjectInput;
  onCancel: () => void;
  onSave: (input: ProjectInput) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ProjectInput>(initial);
  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const inputClass =
    "w-full bg-white/3 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-ember-500/40 transition-colors";
  const labelClass = "text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2";

  return (
    <div className="space-y-4 border-t border-white/5 pt-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Title *</label>
          <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <input className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Category / Genre</label>
          <input className={inputClass} value={form.genre} onChange={(e) => set("genre", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Progress %</label>
          <input
            type="number"
            min={0}
            max={100}
            className={inputClass}
            value={form.progress}
            onChange={(e) => set("progress", Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Engine</label>
          <input className={inputClass} value={form.engine} onChange={(e) => set("engine", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Platform</label>
          <input className={inputClass} value={form.platform} onChange={(e) => set("platform", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Image path / URL</label>
          <input
            className={inputClass}
            placeholder="/projects/example.png"
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Link</label>
          <input
            className={inputClass}
            placeholder="https:// or /collaborate"
            value={form.link}
            onChange={(e) => set("link", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          className={`${inputClass} h-24 resize-none`}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          disabled={saving || !form.name.trim()}
          onClick={() => onSave(form)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono border border-ash-500/30 text-ash-400 hover:bg-ember-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-lg cursor-pointer"
        >
          <i className="fa-solid fa-check" />
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono border border-white/10 text-zinc-400 hover:bg-white/5 transition-colors rounded-lg cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (input: ProjectInput) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Failed to create project.");
      const { project } = await res.json();
      setProjects((prev) => [...prev, project]);
      setCreating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project.");
    } finally {
      setSaving(false);
    }
  };

  const save = async (id: number, input: ProjectInput) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Failed to save project.");
      const { project } = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === id ? project : p)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (expandedId === id) setExpandedId(null);
    if (editingId === id) setEditingId(null);
    try {
      await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    } catch {
      // best-effort; UI already reflects the removal
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-space">Projects</h1>
          <p className="text-zinc-500 text-sm font-mono mt-1">Manage your game projects and track development progress.</p>
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
          New Project
        </button>
      </div>

      {error && <p className="text-sm text-red-400 font-mono">{error}</p>}

      {creating && (
        <div className="rounded-xl border border-ember-500/30 p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
          <h3 className="font-bold font-cinzel tracking-wide mb-2">New Project</h3>
          <ProjectForm initial={emptyForm} saving={saving} onCancel={() => setCreating(false)} onSave={create} />
        </div>
      )}

      {projects.length === 0 && !creating && (
        <div className="rounded-xl border border-white/8 p-10 text-center text-zinc-500 text-sm font-mono">
          No projects yet. Click &quot;New Project&quot; to add one.
        </div>
      )}

      <div className="space-y-4">
        {projects.map((project) => {
          const isOpen = expandedId === project.id;
          const isEditing = editingId === project.id;
          const borderColor = project.color === "green" ? "border-green-500/20 hover:border-green-400/40" : "border-ash-500/20 hover:border-ash-400/40";
          const textColor = project.color === "green" ? "text-green-400" : "text-ash-400";
          const barColor = project.color === "green" ? "from-green-600 to-green-400" : "from-ash-600 to-ash-400";

          return (
            <div key={project.id} className={`rounded-xl border transition-all duration-300 overflow-hidden ${borderColor}`} style={{ background: "rgba(255,255,255,0.02)" }}>
              <button
                className="w-full p-5 flex items-center gap-5 text-left cursor-pointer"
                onClick={() => setExpandedId(isOpen ? null : project.id)}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black/40">
                  {project.image && <img src={project.image} alt={project.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold font-cinzel tracking-wide">{project.name}</h3>
                    <span className={`text-[10px] font-mono ${textColor} uppercase tracking-wider border border-ash-500/25 px-2 py-0.5 rounded`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-zinc-600">
                    <span>{project.engine}</span>
                    <span className="hidden sm:inline">·</span>
                    <span>{project.genre}</span>
                    <span className="hidden sm:inline">·</span>
                    <span>{project.platform}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex items-center gap-3 w-32">
                    <div className="flex-1 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${barColor}`} style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className={`text-xs font-mono font-bold ${textColor}`}>{project.progress}%</span>
                  </div>
                  <i className={`fa-solid fa-chevron-down text-zinc-500 text-xs transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5">
                  {isEditing ? (
                    <ProjectForm
                      initial={project}
                      saving={saving}
                      onCancel={() => setEditingId(null)}
                      onSave={(input) => save(project.id, input)}
                    />
                  ) : (
                    <div className="border-t border-white/5 pt-4">
                      <p className="text-zinc-400 text-sm leading-7 mb-5">{project.description}</p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setEditingId(project.id)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-mono border border-ash-500/30 text-ash-400 hover:bg-ember-500/10 transition-colors rounded-lg cursor-pointer"
                        >
                          <i className="fa-solid fa-pen-to-square" />
                          Edit Project
                        </button>
                        <button
                          onClick={() => remove(project.id)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-mono border border-white/10 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-lg cursor-pointer"
                        >
                          <i className="fa-solid fa-trash" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
