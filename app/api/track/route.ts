import { NextRequest, NextResponse } from "next/server";
import { trackPageview, isDbConfigured } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (!isDbConfigured()) {
    // Silently no-op — analytics shouldn't break the site if the DB isn't set up yet.
    return NextResponse.json({ ok: false, reason: "db not configured" });
  }

  const body = await req.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path.slice(0, 300) : "/";
  const referrer = typeof body?.referrer === "string" ? body.referrer.slice(0, 300) : null;

  try {
    await trackPageview(path, referrer);
  } catch (err) {
    console.error("Failed to track pageview:", err);
  }

  return NextResponse.json({ ok: true });
}
