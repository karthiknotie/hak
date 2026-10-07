"use client";
import { useState, useEffect, useRef, useCallback } from "react";

type Stat = {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "neutral" | "down";
  icon: string;
  accent: "cyan" | "purple";
};

type Project = {
  id: string;
  name: string;
  status: string;
  progress: number;
  engine: string;
  genre: string;
  color: "cyan" | "green" | "purple";
};

type Activity = {
  id: string;
  action: string;
  time: string;
  type: "code" | "asset" | "message" | "publish" | "update";
};

type SystemStatus = {
  id: string;
  label: string;
  status: string;
  ok: boolean;
};

const STORAGE_KEY = "hak-admin-dashboard";

const defaultStats: Stat[] = [
  { id: "s1", label: "Total Visitors", value: "12,847", change: "+18.2%", trend: "up", icon: "fa-solid fa-eye", accent: "purple" },
  { id: "s2", label: "Projects", value: "3", change: "Active", trend: "neutral", icon: "fa-solid fa-gamepad", accent: "purple" },
  { id: "s3", label: "Assets Created", value: "524", change: "+12", trend: "up", icon: "fa-solid fa-cube", accent: "cyan" },
  { id: "s4", label: "Messages", value: "38", change: "5 unread", trend: "neutral", icon: "fa-solid fa-envelope", accent: "purple" },
];

const defaultProjects: Project[] = [
  { id: "p1", name: "PRIMEVAL", status: "In Development", progress: 40, engine: "Unreal Engine 5", genre: "Action RPG", color: "purple" },
  { id: "p2", name: "Zombie Survival", status: "Pre-Production", progress: 22, engine: "Unreal Engine 5", genre: "Survival Horror", color: "green" },
  { id: "p3", name: "Space Project", status: "Concept Phase", progress: 10, engine: "Unreal Engine 5", genre: "Sci-Fi Adventure", color: "purple" },
];

const defaultActivity: Activity[] = [
  { id: "a1", action: "Pushed update to PRIMEVAL creature AI system", time: "2 hours ago", type: "code" },
  { id: "a2", action: "Uploaded 12 new character textures", time: "5 hours ago", type: "asset" },
  { id: "a3", action: "New contact form submission from Studio XYZ", time: "1 day ago", type: "message" },
  { id: "a4", action: "Published portfolio piece: Delta Force", time: "2 days ago", type: "publish" },
  { id: "a5", action: "Updated site hero section with new background", time: "3 days ago", type: "update" },
];

const defaultTraffic = [35, 42, 58, 47, 63, 55, 72, 68, 80, 75, 92, 88];

const defaultSystems: SystemStatus[] = [
  { id: "sys1", label: "Website", status: "Online", ok: true },
  { id: "sys2", label: "Database", status: "Connected", ok: true },
  { id: "sys3", label: "CDN", status: "Active", ok: true },
  { id: "sys4", label: "Build", status: "Passing", ok: true },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const iconOptions = [
  "fa-solid fa-eye", "fa-solid fa-gamepad", "fa-solid fa-cube", "fa-solid fa-envelope",
  "fa-solid fa-users", "fa-solid fa-star", "fa-solid fa-bolt", "fa-solid fa-chart-line",
  "fa-solid fa-rocket", "fa-solid fa-code", "fa-solid fa-image", "fa-solid fa-globe",
];

const activityTypes: Activity["type"][] = ["code", "asset", "message", "publish", "update"];
const colorOptions: Project["color"][] = ["cyan", "green", "purple"];

function activityIcon(type: string) {
  switch (type) {
    case "code": return "fa-solid fa-code";
    case "asset": return "fa-solid fa-image";
    case "message": return "fa-solid fa-envelope";
    case "publish": return "fa-solid fa-rocket";
    case "update": return "fa-solid fa-pen";
    default: return "fa-solid fa-circle";
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function EditableText({
  value,
  onChange,
  editing,
  className,
  inputClassName,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  className?: string;
  inputClassName?: string;
  type?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  if (!editing) return <span className={className}>{value}</span>;

  return (
    <input
      ref={ref}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-white/5 border border-ash-500/30 rounded px-2 py-0.5 outline-none focus:border-ember-400/60 transition-colors ${inputClassName ?? className ?? ""}`}
    />
  );
}

export default function AdminDashboard() {
  const [editing, setEditing] = useState(false);
  const [animated, setAnimated] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  const [stats, setStats] = useState<Stat[]>(defaultStats);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [activity, setActivity] = useState<Activity[]>(defaultActivity);
  const [traffic, setTraffic] = useState<number[]>(defaultTraffic);
  const [systems, setSystems] = useState<SystemStatus[]>(defaultSystems);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.stats) setStats(data.stats);
        if (data.projects) setProjects(data.projects);
        if (data.activity) setActivity(data.activity);
        if (data.traffic) setTraffic(data.traffic);
        if (data.systems) setSystems(data.systems);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, projects, activity, traffic, systems }));
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  }, [stats, projects, activity, traffic, systems]);

  const resetAll = () => {
    setStats(defaultStats);
    setProjects(defaultProjects);
    setActivity(defaultActivity);
    setTraffic(defaultTraffic);
    setSystems(defaultSystems);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateStat = (id: string, field: keyof Stat, value: string) => {
    setStats((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addStat = () => {
    setStats((prev) => [
      ...prev,
      { id: uid(), label: "New Stat", value: "0", change: "+0%", trend: "up", icon: "fa-solid fa-star", accent: "cyan" },
    ]);
  };

  const removeStat = (id: string) => {
    setStats((prev) => prev.filter((s) => s.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: string | number) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const addProject = () => {
    setProjects((prev) => [
      ...prev,
      { id: uid(), name: "New Project", status: "Concept", progress: 0, engine: "Unreal Engine 5", genre: "TBD", color: "cyan" },
    ]);
  };

  const removeProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const updateActivity = (id: string, field: keyof Activity, value: string) => {
    setActivity((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const addActivity = () => {
    setActivity((prev) => [
      { id: uid(), action: "New activity entry", time: "just now", type: "update" },
      ...prev,
    ]);
  };

  const removeActivity = (id: string) => {
    setActivity((prev) => prev.filter((a) => a.id !== id));
  };

  const updateTraffic = (i: number, value: number) => {
    setTraffic((prev) => {
      const next = [...prev];
      next[i] = Math.max(0, Math.min(999, value));
      return next;
    });
  };

  const updateSystem = (id: string, field: keyof SystemStatus, value: string | boolean) => {
    setSystems((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const maxTraffic = Math.max(...traffic, 1);

  if (!loaded) return null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-space">Dashboard</h1>
          <p className="text-zinc-500 text-sm font-mono mt-1">
            Welcome back, Arun. Here&apos;s your studio overview.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {editing && (
            <>
              <button
                onClick={resetAll}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-mono hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-rotate-left text-[10px]" />
                Reset
              </button>
              <button
                onClick={save}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  saveFlash
                    ? "bg-green-500/20 text-green-400 border border-green-500/40"
                    : "bg-ash-500/15 text-ash-300 border border-ash-500/30 hover:bg-ember-500/15 hover:border-ember-400/40"
                }`}
              >
                <i className={`${saveFlash ? "fa-solid fa-check" : "fa-solid fa-floppy-disk"} text-[10px]`} />
                {saveFlash ? "Saved!" : "Save"}
              </button>
            </>
          )}
          <button
            onClick={() => setEditing(!editing)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              editing
                ? "bg-ash-500/15 text-ash-400 border border-ash-500/30 hover:bg-ash-500/25"
                : "bg-white/5 text-zinc-400 border border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            <i className={`${editing ? "fa-solid fa-xmark" : "fa-solid fa-pen-to-square"} text-[10px]`} />
            {editing ? "Done" : "Edit"}
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono text-zinc-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            System Online
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`group relative rounded-xl p-5 border backdrop-blur-sm overflow-hidden transition-all duration-300
              ${editing ? "ring-1 ring-ember-500/20" : "hover:-translate-y-1"}
              ${stat.accent === "cyan"
                ? "border-ash-500/15 hover:border-ember-400/40 hover:shadow-[0_4px_30px_rgba(217,74,30,0.08)]"
                : "border-ash-500/15 hover:border-ash-400/40 hover:shadow-[0_4px_30px_rgba(142,147,149,0.08)]"
              }`}
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
              ${stat.accent === "cyan" ? "bg-ember-500/5" : "bg-ash-500/5"}`} />

            {editing && (
              <button
                onClick={() => removeStat(stat.id)}
                className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] hover:bg-red-500/40 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}

            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1 min-w-0">
                <EditableText
                  value={stat.label}
                  onChange={(v) => updateStat(stat.id, "label", v)}
                  editing={editing}
                  className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-2 block"
                  inputClassName="text-xs text-zinc-300 font-mono uppercase tracking-wider mb-2 block w-full"
                />
                <EditableText
                  value={stat.value}
                  onChange={(v) => updateStat(stat.id, "value", v)}
                  editing={editing}
                  className="text-2xl sm:text-3xl font-bold block"
                  inputClassName="text-2xl font-bold block w-full"
                />
                <div className="flex items-center gap-2 mt-1">
                  {editing && (
                    <select
                      value={stat.trend}
                      onChange={(e) => updateStat(stat.id, "trend", e.target.value)}
                      className="bg-white/5 border border-ash-500/30 rounded text-[10px] text-zinc-300 font-mono px-1 py-0.5 outline-none cursor-pointer"
                    >
                      <option value="up">Up</option>
                      <option value="neutral">Neutral</option>
                      <option value="down">Down</option>
                    </select>
                  )}
                  <EditableText
                    value={stat.change}
                    onChange={(v) => updateStat(stat.id, "change", v)}
                    editing={editing}
                    className={`text-xs font-mono ${stat.trend === "up" ? "text-green-400" : stat.trend === "down" ? "text-red-400" : "text-zinc-500"}`}
                    inputClassName="text-xs font-mono text-zinc-300 w-full"
                  />
                </div>
                {editing && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <select
                      value={stat.icon}
                      onChange={(e) => updateStat(stat.id, "icon", e.target.value)}
                      className="bg-white/5 border border-ash-500/30 rounded text-[10px] text-zinc-300 font-mono px-1 py-0.5 outline-none cursor-pointer"
                    >
                      {iconOptions.map((ic) => (
                        <option key={ic} value={ic}>{ic.replace("fa-solid fa-", "")}</option>
                      ))}
                    </select>
                    <select
                      value={stat.accent}
                      onChange={(e) => updateStat(stat.id, "accent", e.target.value)}
                      className="bg-white/5 border border-ash-500/30 rounded text-[10px] text-zinc-300 font-mono px-1 py-0.5 outline-none cursor-pointer"
                    >
                      <option value="cyan">Cyan</option>
                      <option value="purple">Purple</option>
                    </select>
                  </div>
                )}
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                ${stat.accent === "cyan" ? "bg-ember-500/10 text-ash-400" : "bg-ash-500/10 text-ash-400"}`}>
                <i className={stat.icon} />
              </div>
            </div>
          </div>
        ))}

        {editing && (
          <button
            onClick={addStat}
            className="rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 min-h-30 hover:border-ember-400/30 hover:bg-ember-500/3 transition-all duration-300 cursor-pointer"
          >
            <i className="fa-solid fa-plus text-zinc-500" />
            <span className="text-xs font-mono text-zinc-500">Add Stat</span>
          </button>
        )}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Traffic chart */}
        <div
          className={`lg:col-span-2 rounded-xl border border-white/8 p-6 ${editing ? "ring-1 ring-ember-500/20" : ""}`}
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold font-space">Site Traffic</h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Monthly visitors · 2026 {editing && <span className="text-ash-400/60">· click values to edit</span>}
              </p>
            </div>
            <div className="flex gap-1">
              {["6M", "1Y", "ALL"].map((range) => (
                <button
                  key={range}
                  className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                    range === "1Y"
                      ? "bg-ember-500/15 text-ash-400 border border-ash-500/25"
                      : "text-zinc-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-2 sm:gap-3 h-48">
            {traffic.map((val, i) => {
              const height = (val / maxTraffic) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  {editing ? (
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => updateTraffic(i, parseInt(e.target.value) || 0)}
                      className="w-full text-center text-[10px] font-mono text-zinc-300 bg-white/5 border border-ash-500/30 rounded px-0.5 py-0.5 outline-none focus:border-ember-400/60"
                    />
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-600">{val}</span>
                  )}
                  <div className="w-full relative rounded-t-sm overflow-hidden bg-white/5 flex-1">
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-1000 ease-out"
                      style={{
                        height: animated ? `${height}%` : "0%",
                        background: i % 2 === 0
                          ? "linear-gradient(to top, rgba(196,199,200,0.4), rgba(196,199,200,0.12))"
                          : "linear-gradient(to top, rgba(142,147,149,0.4), rgba(142,147,149,0.15))",
                        transitionDelay: `${i * 60}ms`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600">{months[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick actions + System status */}
        <div
          className={`rounded-xl border border-white/8 p-6 ${editing ? "ring-1 ring-ember-500/20" : ""}`}
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <h2 className="text-lg font-bold font-space mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "New Project", icon: "fa-solid fa-plus", color: "cyan" as const },
              { label: "Upload Asset", icon: "fa-solid fa-cloud-arrow-up", color: "purple" as const },
              { label: "View Site", icon: "fa-solid fa-arrow-up-right-from-square", color: "cyan" as const },
              { label: "Export Data", icon: "fa-solid fa-download", color: "purple" as const },
            ].map((action) => (
              <button
                key={action.label}
                className={`group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300
                  hover:-translate-y-0.5 cursor-pointer
                  ${action.color === "cyan"
                    ? "border-ash-500/15 hover:border-ember-400/40 hover:bg-ember-500/5"
                    : "border-ash-500/15 hover:border-ash-400/40 hover:bg-ash-500/5"
                  }`}
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <i className={`${action.icon} text-lg ${action.color === "cyan" ? "text-ash-400" : "text-ash-400"}`} />
                <span className="text-xs font-mono text-zinc-400 group-hover:text-white transition-colors">{action.label}</span>
              </button>
            ))}
          </div>

          {/* System status */}
          <div className="mt-6 pt-5 border-t border-white/8">
            <h3 className="text-sm font-bold font-space mb-3">System Status</h3>
            <div className="space-y-3">
              {systems.map((sys) => (
                <div key={sys.id} className="flex items-center justify-between text-xs font-mono gap-2">
                  {editing ? (
                    <>
                      <input
                        value={sys.label}
                        onChange={(e) => updateSystem(sys.id, "label", e.target.value)}
                        className="flex-1 bg-white/5 border border-ash-500/30 rounded px-2 py-0.5 text-zinc-300 outline-none focus:border-ember-400/60"
                      />
                      <input
                        value={sys.status}
                        onChange={(e) => updateSystem(sys.id, "status", e.target.value)}
                        className="w-24 bg-white/5 border border-ash-500/30 rounded px-2 py-0.5 text-zinc-300 outline-none focus:border-ember-400/60 text-right"
                      />
                      <button
                        onClick={() => updateSystem(sys.id, "ok", !sys.ok)}
                        className={`w-5 h-5 rounded-full shrink-0 cursor-pointer ${sys.ok ? "bg-green-400" : "bg-red-400"}`}
                        title="Toggle status"
                      />
                    </>
                  ) : (
                    <>
                      <span className="text-zinc-400">{sys.label}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${sys.ok ? "bg-green-400" : "bg-red-400"} animate-pulse`} />
                        <span className={sys.ok ? "text-green-400" : "text-red-400"}>{sys.status}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Projects + Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Projects */}
        <div
          className={`rounded-xl border border-white/8 p-6 ${editing ? "ring-1 ring-ember-500/20" : ""}`}
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold font-space">Active Projects</h2>
            <div className="flex items-center gap-2">
              {editing && (
                <button
                  onClick={addProject}
                  className="text-xs font-mono text-ash-400 border border-ash-500/25 px-2 py-0.5 rounded hover:bg-ember-500/10 transition-colors cursor-pointer"
                >
                  + Add
                </button>
              )}
              <span className="text-xs font-mono text-ash-400 border border-ash-500/25 px-2 py-0.5 rounded">
                {projects.length} ACTIVE
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {projects.map((project) => {
              const barColor =
                project.color === "cyan" ? "from-ember-600 to-ember-400"
                : project.color === "green" ? "from-green-600 to-green-400"
                : "from-ash-600 to-ash-400";
              const textColor =
                project.color === "cyan" ? "text-ash-400"
                : project.color === "green" ? "text-green-400"
                : "text-ash-400";
              return (
                <div
                  key={project.id}
                  className="group p-4 rounded-lg border border-white/5 hover:border-white/15 transition-all duration-300 relative"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  {editing && (
                    <button
                      onClick={() => removeProject(project.id)}
                      className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] hover:bg-red-500/40 transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  )}

                  <div className="flex items-center justify-between mb-2 pr-6">
                    <EditableText
                      value={project.name}
                      onChange={(v) => updateProject(project.id, "name", v)}
                      editing={editing}
                      className="font-bold font-cinzel text-sm tracking-wide"
                      inputClassName="font-bold font-cinzel text-sm tracking-wide text-zinc-200"
                    />
                    <EditableText
                      value={project.status}
                      onChange={(v) => updateProject(project.id, "status", v)}
                      editing={editing}
                      className={`text-[10px] font-mono ${textColor} uppercase tracking-wider`}
                      inputClassName="text-[10px] font-mono text-zinc-300 uppercase tracking-wider w-28 text-right"
                    />
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-600 mb-3">
                    <EditableText
                      value={project.engine}
                      onChange={(v) => updateProject(project.id, "engine", v)}
                      editing={editing}
                      className="text-[11px] font-mono text-zinc-600"
                      inputClassName="text-[11px] font-mono text-zinc-300 w-32"
                    />
                    <span className="text-zinc-700">·</span>
                    <EditableText
                      value={project.genre}
                      onChange={(v) => updateProject(project.id, "genre", v)}
                      editing={editing}
                      className="text-[11px] font-mono text-zinc-600"
                      inputClassName="text-[11px] font-mono text-zinc-300 w-28"
                    />
                    {editing && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <select
                          value={project.color}
                          onChange={(e) => updateProject(project.id, "color", e.target.value)}
                          className="bg-white/5 border border-ash-500/30 rounded text-[10px] text-zinc-300 font-mono px-1 py-0.5 outline-none cursor-pointer"
                        >
                          {colorOptions.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                        style={{
                          width: animated ? `${project.progress}%` : "0%",
                          transition: "width 1.5s cubic-bezier(0.4,0,0.2,1) 0.3s",
                        }}
                      />
                    </div>
                    {editing ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={project.progress}
                        onChange={(e) => updateProject(project.id, "progress", Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-14 text-right text-xs font-mono font-bold bg-white/5 border border-ash-500/30 rounded px-1 py-0.5 text-zinc-300 outline-none focus:border-ember-400/60"
                      />
                    ) : (
                      <span className={`text-xs font-mono font-bold ${textColor}`}>
                        {project.progress}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {projects.length === 0 && (
              <div className="text-center py-8 text-zinc-600 font-mono text-sm">
                No projects yet. Click &quot;+ Add&quot; to create one.
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div
          className={`rounded-xl border border-white/8 p-6 ${editing ? "ring-1 ring-ember-500/20" : ""}`}
          style={{ background: "rgba(255,255,255,0.02)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold font-space">Recent Activity</h2>
            <div className="flex items-center gap-2">
              {editing && (
                <button
                  onClick={addActivity}
                  className="text-xs font-mono text-ash-400 border border-ash-500/25 px-2 py-0.5 rounded hover:bg-ember-500/10 transition-colors cursor-pointer"
                >
                  + Add
                </button>
              )}
              <button className="text-xs font-mono text-ash-400 hover:text-ember-300 transition-colors">
                View all →
              </button>
            </div>
          </div>
          <div className="space-y-1">
            {activity.map((item) => (
              <div
                key={item.id}
                className="group flex items-start gap-4 p-3 rounded-lg hover:bg-white/3 transition-colors duration-200 relative"
              >
                {editing && (
                  <button
                    onClick={() => removeActivity(item.id)}
                    className="absolute top-1 right-1 z-20 w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-[9px] hover:bg-red-500/40 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                )}

                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0 mt-0.5">
                  {editing ? (
                    <select
                      value={item.type}
                      onChange={(e) => updateActivity(item.id, "type", e.target.value)}
                      className="w-full h-full bg-transparent text-[9px] text-ash-400 outline-none cursor-pointer text-center"
                      title="Activity type"
                    >
                      {activityTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  ) : (
                    <i className={`${activityIcon(item.type)} text-xs text-zinc-400 group-hover:text-ember-400 transition-colors`} />
                  )}
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  {editing ? (
                    <>
                      <input
                        value={item.action}
                        onChange={(e) => updateActivity(item.id, "action", e.target.value)}
                        className="w-full text-sm text-zinc-300 bg-white/5 border border-ash-500/30 rounded px-2 py-1 outline-none focus:border-ember-400/60 mb-1"
                      />
                      <input
                        value={item.time}
                        onChange={(e) => updateActivity(item.id, "time", e.target.value)}
                        className="w-full text-[11px] text-zinc-400 font-mono bg-white/5 border border-ash-500/30 rounded px-2 py-0.5 outline-none focus:border-ember-400/60"
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-zinc-300 leading-relaxed">{item.action}</p>
                      <p className="text-[11px] text-zinc-600 font-mono mt-1">{item.time}</p>
                    </>
                  )}
                </div>
              </div>
            ))}

            {activity.length === 0 && (
              <div className="text-center py-8 text-zinc-600 font-mono text-sm">
                No activity yet. Click &quot;+ Add&quot; to create one.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between py-4 border-t border-white/5 text-[11px] font-mono text-zinc-700">
        <span>BLAKASH Admin · v1.0.0</span>
        <span>© 2026 BLAKASH</span>
      </div>
    </div>
  );
}
