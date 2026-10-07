import { getAnalyticsSummary, isDbConfigured } from "@/lib/db";
import AnalyticsClient from "@/components/admin/AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  if (!isDbConfigured()) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-space">Analytics</h1>
        <div className="rounded-xl border border-ember-500/30 p-8 text-center" style={{ background: "rgba(217,74,30,0.05)" }}>
          <i className="fa-solid fa-database text-3xl text-ember-400 mb-4" />
          <p className="text-zinc-300 mb-2">No database connected yet.</p>
          <p className="text-zinc-500 text-sm font-mono">Set DATABASE_URL in your environment to start tracking real traffic.</p>
        </div>
      </div>
    );
  }

  const summary = await getAnalyticsSummary();
  return <AnalyticsClient summary={summary} />;
}
