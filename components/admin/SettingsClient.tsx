"use client";
import { useState } from "react";
import type { AdminSettings } from "@/lib/db";

const SOCIAL_KEYS = [
  { key: "instagram", icon: "fa-brands fa-instagram", label: "Instagram" },
  { key: "twitter", icon: "fa-brands fa-x-twitter", label: "X / Twitter" },
  { key: "youtube", icon: "fa-brands fa-youtube", label: "YouTube" },
  { key: "artstation", icon: "fa-brands fa-artstation", label: "ArtStation" },
];

const PREFERENCE_KEYS = [
  { key: "analytics_tracking", label: "Enable analytics tracking" },
  { key: "show_portfolio", label: "Show portfolio section" },
  { key: "contact_form", label: "Enable contact form" },
  { key: "maintenance_mode", label: "Maintenance mode" },
];

const NOTIFICATION_KEYS = [
  { key: "new_submissions", label: "New contact form submissions", desc: "Get notified when someone submits the contact form" },
  { key: "weekly_report", label: "Weekly analytics report", desc: "Receive a summary of site performance every Monday" },
  { key: "build_alerts", label: "Build notifications", desc: "Get alerts for build successes and failures" },
  { key: "security_alerts", label: "Security alerts", desc: "Important security notifications" },
];

const inputClass =
  "w-full bg-white/3 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-ember-500/40 transition-colors";
const labelClass = "text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="relative">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div
        onClick={() => onChange(!checked)}
        className="w-10 h-5 rounded-full bg-zinc-700 peer-checked:bg-ember-500/60 transition-colors cursor-pointer"
      />
      <div
        onClick={() => onChange(!checked)}
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform cursor-pointer ${checked ? "translate-x-5" : ""}`}
      />
    </div>
  );
}

export default function SettingsClient({ initialSettings }: { initialSettings: AdminSettings }) {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const setSocial = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, social_links: { ...prev.social_links, [key]: value } }));
  const setPref = (key: string, value: boolean) =>
    setSettings((prev) => ({ ...prev, preferences: { ...prev.preferences, [key]: value } }));
  const setNotif = (key: string, value: boolean) =>
    setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }));

  const tabs = [
    { id: "general", label: "General", icon: "fa-solid fa-gear" },
    { id: "profile", label: "Profile", icon: "fa-solid fa-user" },
    { id: "site", label: "Site", icon: "fa-solid fa-globe" },
    { id: "notifications", label: "Notifications", icon: "fa-solid fa-bell" },
  ];

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Failed to save settings.");
      const { settings: updated } = await res.json();
      setSettings(updated);
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-space">Settings</h1>
        <p className="text-zinc-500 text-sm font-mono mt-1">Manage your admin panel and site configuration.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-white/8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "bg-ember-500/15 text-ash-400 border border-ash-500/25"
                : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`${tab.icon} text-xs`} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
        {activeTab === "general" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold mb-4">Studio Information</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Studio Name</label>
                  <input className={inputClass} value={settings.studio_name} onChange={(e) => set("studio_name", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Tagline</label>
                  <input className={inputClass} value={settings.tagline} onChange={(e) => set("tagline", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    className={`${inputClass} h-24 resize-none`}
                    value={settings.description}
                    onChange={(e) => set("description", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/8 pt-6">
              <h3 className="text-sm font-bold mb-4">Preferences</h3>
              <div className="space-y-3">
                {PREFERENCE_KEYS.map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/3 transition-colors">
                    <span className="text-sm text-zinc-300">{pref.label}</span>
                    <Toggle checked={settings.preferences[pref.key] ?? false} onChange={(v) => setPref(pref.key, v)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-ash-400 to-ash-600 flex items-center justify-center text-2xl font-bold overflow-hidden">
                {settings.profile_avatar ? (
                  <img src={settings.profile_avatar} alt={settings.profile_name} className="w-full h-full object-cover" />
                ) : (
                  settings.profile_name.charAt(0).toUpperCase() || "A"
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{settings.profile_name}</h3>
                <p className="text-sm text-zinc-500 font-mono">{settings.profile_role}</p>
              </div>
            </div>
            <div className="space-y-4 border-t border-white/8 pt-6">
              <div>
                <label className={labelClass}>Full Name</label>
                <input className={inputClass} value={settings.profile_name} onChange={(e) => set("profile_name", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" className={inputClass} value={settings.profile_email} onChange={(e) => set("profile_email", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <input className={inputClass} value={settings.profile_role} onChange={(e) => set("profile_role", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Avatar image path / URL</label>
                <input
                  className={inputClass}
                  placeholder="/admin/avatar.png"
                  value={settings.profile_avatar}
                  onChange={(e) => set("profile_avatar", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "site" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Page Title</label>
                  <input className={inputClass} value={settings.seo_title} onChange={(e) => set("seo_title", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Meta Description</label>
                  <textarea
                    className={`${inputClass} h-20 resize-none`}
                    value={settings.seo_description}
                    onChange={(e) => set("seo_description", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-white/8 pt-6">
              <h3 className="text-sm font-bold mb-4">Social Links</h3>
              <div className="space-y-3">
                {SOCIAL_KEYS.map((social) => (
                  <div key={social.key} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <i className={`${social.icon} text-sm text-zinc-400`} />
                    </div>
                    <input
                      type="url"
                      placeholder={`${social.label} URL`}
                      className="flex-1 bg-white/3 border border-white/10 rounded-lg px-4 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-ember-500/40 transition-colors"
                      value={settings.social_links[social.key] ?? ""}
                      onChange={(e) => setSocial(social.key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                {NOTIFICATION_KEYS.map((notif) => (
                  <div key={notif.key} className="flex items-start justify-between gap-4 p-4 rounded-lg hover:bg-white/3 transition-colors border border-white/5">
                    <div>
                      <span className="text-sm text-zinc-300 block">{notif.label}</span>
                      <span className="text-xs text-zinc-600 mt-0.5 block">{notif.desc}</span>
                    </div>
                    <div className="shrink-0 mt-0.5">
                      <Toggle checked={settings.notifications[notif.key] ?? false} onChange={(v) => setNotif(notif.key, v)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/8 mt-6">
          {error && <p className="text-sm text-red-400 font-mono">{error}</p>}
          {!error && savedAt && <p className="text-sm text-green-400 font-mono">Saved.</p>}
          <button
            disabled={saving}
            onClick={save}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-ash-300 hover:text-bone border border-ash-500/40 hover:border-ember-400/70 bg-black/40 disabled:opacity-50 transition-all duration-300 cursor-pointer"
            style={{ clipPath: "polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%)" }}
          >
            <i className="fa-solid fa-check text-[10px]" />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
