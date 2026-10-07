import { NextRequest, NextResponse } from "next/server";
import { markSubmissionRead, deleteSubmission } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const read = body?.read !== false;
  await markSubmissionRead(numId, read);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }
  await deleteSubmission(numId);
  return NextResponse.json({ ok: true });
}
