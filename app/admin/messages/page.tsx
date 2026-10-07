import { getSubmissions, isDbConfigured } from "@/lib/db";
import MessagesClient from "@/components/admin/MessagesClient";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  if (!isDbConfigured()) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-space">Messages</h1>
        <div className="rounded-xl border border-ember-500/30 p-8 text-center" style={{ background: "rgba(217,74,30,0.05)" }}>
          <i className="fa-solid fa-database text-3xl text-ember-400 mb-4" />
          <p className="text-zinc-300 mb-2">No database connected yet.</p>
          <p className="text-zinc-500 text-sm font-mono">Set DATABASE_URL in your environment to start receiving real submissions here.</p>
        </div>
      </div>
    );
  }

  const submissions = await getSubmissions();
  const unreadCount = submissions.filter((m) => !m.read).length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-space">Messages</h1>
          <p className="text-zinc-500 text-sm font-mono mt-1">
            {unreadCount} unread · {submissions.length} total submissions
          </p>
        </div>
      </div>
      <MessagesClient initialSubmissions={submissions} />
    </div>
  );
}
