"use client";
import { useEffect, useState } from "react";
import type { AnalyticsSummary } from "@/lib/db";

export default function AnalyticsClient({ summary }: { summary: AnalyticsSummary }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const maxDaily = Math.max(...summary.last7Days.map((d) => d.views), 1);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-space">Analytics</h1>
        <p className="text-zinc-500 text-sm font-mono mt-1">Real, live website traffic.</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total Page Views", value: summary.totalViews.toLocaleString(), icon: "fa-solid fa-eye" },
          { label: "Pages Tracked", value: String(summary.uniquePaths), icon: "fa-solid fa-file" },
          { label: "Views (Last 7 Days)", value: summary.last7Days.reduce((a, d) => a + d.views, 0).toLocaleString(), icon: "fa-solid fa-calendar-week" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/8 p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-center gap-2 mb-3">
              <i className={`${stat.icon} text-ash-400 text-sm`} />
              <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly chart */}
        <div className="rounded-xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
          <h2 className="text-lg font-bold font-space mb-1">Traffic — Last 7 Days</h2>
          <p className="text-xs text-zinc-500 font-mono mb-6">Real pageviews, by day</p>
          {summary.last7Days.length === 0 ? (
            <p className="text-zinc-600 text-sm font-mono py-10 text-center">No traffic recorded yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {summary.last7Days.map((d, i) => {
                const height = (d.views / maxDaily) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-600">{d.views}</span>
                    <div className="w-full relative rounded-t-sm overflow-hidden bg-white/5 flex-1">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-1000 ease-out"
                        style={{
                          height: animated ? `${height}%` : "0%",
                          background: "linear-gradient(to top, rgba(196,199,200,0.5), rgba(196,199,200,0.15))",
                          transitionDelay: `${i * 80}ms`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600">{d.day}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top pages */}
        <div className="rounded-xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
          <h2 className="text-lg font-bold font-space mb-1">Top Pages</h2>
          <p className="text-xs text-zinc-500 font-mono mb-6">By total views, all time</p>
          {summary.topPages.length === 0 ? (
            <p className="text-zinc-600 text-sm font-mono py-10 text-center">No page data yet.</p>
          ) : (
            <div className="space-y-4">
              {summary.topPages.map((p) => (
                <div key={p.path}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-300 truncate">{p.path}</span>
                    <span className="text-zinc-400 font-mono shrink-0 ml-2">{p.views.toLocaleString()} · {p.percentage}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-ash-600 to-ash-400"
                      style={{ width: animated ? `${p.percentage}%` : "0%", transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
