import { getSettings, isDbConfigured } from "@/lib/db";
import SettingsClient from "@/components/admin/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!isDbConfigured()) {
    return (
      <div className="max-w-[1000px] mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-space">Settings</h1>
        <div className="rounded-xl border border-ember-500/30 p-8 text-center" style={{ background: "rgba(217,74,30,0.05)" }}>
          <i className="fa-solid fa-database text-3xl text-ember-400 mb-4" />
          <p className="text-zinc-300 mb-2">No database connected yet.</p>
          <p className="text-zinc-500 text-sm font-mono">Set DATABASE_URL in your environment to manage settings.</p>
        </div>
      </div>
    );
  }

  const settings = await getSettings();
  return <SettingsClient initialSettings={settings} />;
}
