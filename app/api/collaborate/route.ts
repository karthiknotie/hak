import { NextRequest, NextResponse } from "next/server";
import { insertSubmission, isDbConfigured } from "@/lib/db";
import { sendCollaborationEmail, isEmailConfigured } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { category, name, email, data } = body as {
    category?: string;
    name?: string;
    email?: string;
    data?: Record<string, string>;
  };

  if (!category || !name || !email) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "The database isn't configured yet. Set DATABASE_URL in your environment." },
      { status: 503 }
    );
  }

  try {
    await insertSubmission({ category, name, email, data: data || {} });
  } catch (err) {
    console.error("Failed to save submission:", err);
    return NextResponse.json({ error: "Failed to save your submission. Please try again." }, { status: 500 });
  }

  let emailResult: { sent: boolean; reason?: string } = { sent: false, reason: "not attempted" };
  if (isEmailConfigured()) {
    emailResult = await sendCollaborationEmail({ category, name, email, data: data || {} });
  }

  return NextResponse.json({ ok: true, emailSent: emailResult.sent });
}
