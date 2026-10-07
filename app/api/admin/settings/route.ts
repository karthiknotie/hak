import { NextRequest, NextResponse } from "next/server";
import { getSettings, isDbConfigured, updateSettings } from "@/lib/db";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const input: Record<string, unknown> = {};
  for (const key of ["studio_name", "tagline", "description", "seo_title", "seo_description", "profile_name", "profile_email", "profile_role", "profile_avatar"]) {
    if (body[key] !== undefined) input[key] = String(body[key]);
  }
  for (const key of ["social_links", "preferences", "notifications"]) {
    if (body[key] !== undefined && typeof body[key] === "object") input[key] = body[key];
  }
  const settings = await updateSettings(input);
  return NextResponse.json({ settings });
}
