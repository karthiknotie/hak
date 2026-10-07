"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Fires a lightweight pageview beacon on every route change, so the admin
// Analytics page reflects real traffic instead of hardcoded numbers. Skips
// /admin routes themselves so browsing the dashboard doesn't inflate the
// visitor count.
export default function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const full = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    if (lastTracked.current === full) return;
    lastTracked.current = full;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer || null }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
